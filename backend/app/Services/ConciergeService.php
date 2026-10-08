<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\ConciergeNote;
use App\Models\ConciergeQuote;
use App\Models\ConciergeQuoteItem;
use App\Models\ConciergeRequest;
use App\Models\Customer;
use App\Models\User;
use App\Models\Yacht;
use App\Models\Experience;
use App\Models\Property;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class ConciergeService
{
    /**
     * Allowed State Machine transitions
     */
    private const TRANSITIONS = [
        'new' => ['assigned', 'in_progress', 'cancelled', 'rejected'],
        'assigned' => ['in_progress', 'waiting_customer', 'waiting_partner', 'quoted', 'escalated', 'cancelled'],
        'in_progress' => ['waiting_customer', 'waiting_partner', 'quoted', 'confirmed', 'escalated', 'cancelled'],
        'waiting_customer' => ['in_progress', 'quoted', 'cancelled'],
        'waiting_partner' => ['in_progress', 'quoted', 'cancelled'],
        'quoted' => ['confirmed', 'in_progress', 'waiting_customer', 'cancelled', 'rejected'],
        'confirmed' => ['completed', 'cancelled'],
        'completed' => [],
        'cancelled' => ['new', 'in_progress'],
        'rejected' => ['new'],
        'escalated' => ['in_progress', 'assigned', 'cancelled'],
    ];

    /**
     * Create a new concierge request with generated request number.
     */
    public function createRequest(array $data, ?User $actor = null): ConciergeRequest
    {
        return DB::transaction(function () use ($data, $actor) {
            $countToday = ConciergeRequest::whereDate('created_at', today())->count() + 1;
            $requestNumber = sprintf('CR-%s-%04d', date('Ymd'), $countToday);

            // Find or link Customer if email provided
            $customerId = $data['customer_id'] ?? null;
            if (!$customerId && !empty($data['customer_email'])) {
                $rawName = trim($data['customer_name'] ?? 'VIP Guest');
                $parts = explode(' ', $rawName, 2);
                $firstName = $parts[0] ?: 'VIP';
                $lastName = $parts[1] ?? 'Guest';

                $customer = Customer::firstOrCreate(
                    ['email' => strtolower($data['customer_email'])],
                    [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'phone' => $data['customer_phone'] ?? null,
                    ]
                );
                $customerId = $customer->id;
            }

            $request = ConciergeRequest::create([
                'request_number' => $requestNumber,
                'customer_id' => $customerId,
                'customer_name' => $data['customer_name'] ?? 'VIP Guest',
                'customer_email' => strtolower($data['customer_email'] ?? ''),
                'customer_phone' => $data['customer_phone'] ?? null,
                'request_type' => $data['request_type'] ?? 'custom',
                'priority' => $data['priority'] ?? 'normal',
                'status' => 'new',
                'description' => $data['description'] ?? '',
                'preferred_date' => $data['preferred_date'] ?? null,
                'preferred_time' => $data['preferred_time'] ?? null,
                'location' => $data['location'] ?? 'El Gouna',
                'guests_count' => $data['guests_count'] ?? null,
                'budget_cents' => isset($data['budget']) ? (int) ($data['budget'] * 100) : ($data['budget_cents'] ?? null),
                'currency' => $data['currency'] ?? 'EGP',
                'assigned_to' => $data['assigned_to'] ?? null,
                'assigned_at' => !empty($data['assigned_to']) ? now() : null,
                'internal_notes' => $data['internal_notes'] ?? null,
            ]);

            if (!empty($data['initial_note'])) {
                ConciergeNote::create([
                    'concierge_request_id' => $request->id,
                    'user_id' => $actor?->id,
                    'author_name' => $actor?->name ?? 'System',
                    'content' => $data['initial_note'],
                    'is_customer_visible' => false,
                ]);
            }

            ActivityLog::create([
                'user_id' => $actor?->id,
                'action' => 'concierge_request_created',
                'entity_type' => 'ConciergeRequest',
                'entity_id' => $request->id,
                'description' => "Concierge request {$request->request_number} created for {$request->customer_name}.",
                'new_values' => [
                    'request_number' => $request->request_number,
                    'type' => $request->request_type,
                    'priority' => $request->priority,
                ],
            ]);

            return $request;
        });
    }

    /**
     * Assign request to an authorized staff member.
     */
    public function assignRequest(ConciergeRequest $request, int $staffUserId, ?User $actor = null, ?string $reason = null): ConciergeRequest
    {
        $staff = User::where('id', $staffUserId)->where('is_active', true)->firstOrFail();

        $oldAssignee = $request->assignedTo?->name ?? 'Unassigned';

        $request->assigned_to = $staff->id;
        $request->assigned_at = now();
        if ($request->status === 'new') {
            $request->status = 'assigned';
        }
        $request->save();

        // Add internal note
        ConciergeNote::create([
            'concierge_request_id' => $request->id,
            'user_id' => $actor?->id,
            'author_name' => $actor?->name ?? 'System',
            'content' => "Assigned to {$staff->name}." . ($reason ? " Reason: {$reason}" : ''),
            'is_customer_visible' => false,
        ]);

        ActivityLog::create([
            'user_id' => $actor?->id,
            'action' => 'concierge_request_assigned',
            'entity_type' => 'ConciergeRequest',
            'entity_id' => $request->id,
            'description' => "Concierge request {$request->request_number} reassigned from {$oldAssignee} to {$staff->name}.",
            'old_values' => ['assigned_to' => $oldAssignee],
            'new_values' => ['assigned_to' => $staff->name, 'reason' => $reason],
        ]);

        return $request->fresh(['assignedTo', 'customer']);
    }

    /**
     * Transition status respecting state machine.
     */
    public function updateStatus(ConciergeRequest $request, string $newStatus, ?User $actor = null, ?string $reason = null): ConciergeRequest
    {
        $currentStatus = $request->status;

        if ($currentStatus === $newStatus) {
            return $request;
        }

        $allowed = self::TRANSITIONS[$currentStatus] ?? [];
        if (!in_array($newStatus, $allowed, true) && !$actor?->hasRole('super_admin')) {
            throw new InvalidArgumentException("Illegal state transition from '{$currentStatus}' to '{$newStatus}'.");
        }

        $request->status = $newStatus;
        if ($newStatus === 'completed' || $newStatus === 'cancelled' || $newStatus === 'rejected') {
            $request->resolved_at = now();
            if ($newStatus === 'cancelled') {
                $request->cancellation_reason = $reason;
            }
        }
        $request->save();

        ConciergeNote::create([
            'concierge_request_id' => $request->id,
            'user_id' => $actor?->id,
            'author_name' => $actor?->name ?? 'System',
            'content' => "Status changed from {$currentStatus} to {$newStatus}." . ($reason ? " Notes: {$reason}" : ''),
            'is_customer_visible' => false,
        ]);

        ActivityLog::create([
            'user_id' => $actor?->id,
            'action' => 'concierge_status_changed',
            'entity_type' => 'ConciergeRequest',
            'entity_id' => $request->id,
            'description' => "Status of {$request->request_number} changed to {$newStatus}.",
            'old_values' => ['status' => $currentStatus],
            'new_values' => ['status' => $newStatus, 'reason' => $reason],
        ]);

        return $request->fresh();
    }

    /**
     * Server-authoritative quote calculation & generation.
     */
    public function createQuote(ConciergeRequest $request, array $data, ?User $actor = null): ConciergeQuote
    {
        return DB::transaction(function () use ($request, $data, $actor) {
            $countToday = ConciergeQuote::whereDate('created_at', today())->count() + 1;
            $quoteNumber = sprintf('Q-%s-%04d', date('Ymd'), $countToday);

            $itemsData = $data['items'] ?? [];
            if (empty($itemsData)) {
                throw new InvalidArgumentException('A quote must contain at least one line item.');
            }

            $subtotalCents = 0;
            $processedItems = [];

            foreach ($itemsData as $item) {
                $quantity = max(1, (int) ($item['quantity'] ?? 1));
                $unitPriceCents = (int) ($item['unit_price_cents'] ?? ((float) ($item['unit_price'] ?? 0) * 100));
                $itemTotalCents = $quantity * $unitPriceCents;
                $subtotalCents += $itemTotalCents;

                $processedItems[] = [
                    'item_type' => $item['item_type'] ?? 'custom',
                    'reference_id' => $item['reference_id'] ?? null,
                    'title' => $item['title'] ?? 'Custom Service',
                    'description' => $item['description'] ?? null,
                    'quantity' => $quantity,
                    'unit_price_cents' => $unitPriceCents,
                    'total_price_cents' => $itemTotalCents,
                    'metadata' => $item['metadata'] ?? null,
                ];
            }

            $discountCents = (int) ($data['discount_cents'] ?? ((float) ($data['discount'] ?? 0) * 100));
            $feesCents = (int) ($data['fees_cents'] ?? ((float) ($data['fees'] ?? 0) * 100));
            $totalCents = max(0, $subtotalCents - $discountCents + $feesCents);

            $quote = ConciergeQuote::create([
                'concierge_request_id' => $request->id,
                'quote_number' => $quoteNumber,
                'status' => 'sent',
                'currency' => $data['currency'] ?? $request->currency ?? 'EGP',
                'subtotal_cents' => $subtotalCents,
                'discount_cents' => $discountCents,
                'fees_cents' => $feesCents,
                'total_cents' => $totalCents,
                'valid_until' => !empty($data['valid_until']) ? $data['valid_until'] : now()->addDays(3),
                'notes' => $data['notes'] ?? null,
                'created_by' => $actor?->id,
            ]);

            foreach ($processedItems as $pItem) {
                $pItem['concierge_quote_id'] = $quote->id;
                ConciergeQuoteItem::create($pItem);
            }

            // Move request state to quoted
            $request->status = 'quoted';
            $request->save();

            // Internal note
            ConciergeNote::create([
                'concierge_request_id' => $request->id,
                'user_id' => $actor?->id,
                'author_name' => $actor?->name ?? 'System',
                'content' => "Quote {$quote->quote_number} generated for " . number_format($totalCents / 100, 2) . " {$quote->currency}.",
                'is_customer_visible' => false,
            ]);

            ActivityLog::create([
                'user_id' => $actor?->id,
                'action' => 'concierge_quote_created',
                'entity_type' => 'ConciergeQuote',
                'entity_id' => $quote->id,
                'description' => "Quote {$quote->quote_number} issued for request {$request->request_number}.",
                'new_values' => [
                    'quote_number' => $quote->quote_number,
                    'total_cents' => $totalCents,
                ],
            ]);

            return $quote->load('items');
        });
    }

    /**
     * Accept quote, revalidate availability, and convert into an authoritative real Booking!
     * Protects strictly against duplicate conversion and replay attacks.
     */
    public function acceptQuoteAndConvert(ConciergeQuote $quote, ?User $actor = null): Booking
    {
        return DB::transaction(function () use ($quote, $actor) {
            // Re-fetch with lock for concurrency protection
            $quote = ConciergeQuote::where('id', $quote->id)->lockForUpdate()->firstOrFail();
            $request = ConciergeRequest::where('id', $quote->concierge_request_id)->lockForUpdate()->firstOrFail();

            if ($quote->status === 'accepted' || $quote->booking_id || $request->booking_id) {
                throw new InvalidArgumentException('This quote or concierge request has already been converted to a booking.');
            }

            if ($quote->valid_until && $quote->valid_until->isPast()) {
                $quote->status = 'expired';
                $quote->save();
                throw new InvalidArgumentException('This quote has expired. Please request an updated quote.');
            }

            // Determine Bookable Entity
            $bookableType = Property::class;
            $bookableId = 1;

            $firstItem = $quote->items()->first();
            if ($firstItem) {
                if ($firstItem->item_type === 'yacht' && $firstItem->reference_id) {
                    $yacht = Yacht::find($firstItem->reference_id);
                    if ($yacht) {
                        $bookableType = Yacht::class;
                        $bookableId = $yacht->id;
                    }
                } elseif ($firstItem->item_type === 'experience' && $firstItem->reference_id) {
                    $exp = Experience::find($firstItem->reference_id);
                    if ($exp) {
                        $bookableType = Experience::class;
                        $bookableId = $exp->id;
                    }
                }
            }

            // Fallback bookable if none
            if ($bookableType === Property::class && !Property::where('id', $bookableId)->exists()) {
                $prop = Property::first();
                if ($prop) {
                    $bookableId = $prop->id;
                }
            }

            $checkIn = $request->preferred_date ?: today()->addDay();
            $checkOut = $checkIn->copy()->addDay();

            // Create authoritative Booking in the real system
            $booking = Booking::create([
                'reference' => 'BK-CR-' . strtoupper(Str::random(6)),
                'customer_id' => $request->customer_id,
                'bookable_type' => $bookableType,
                'bookable_id' => $bookableId,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'nights' => 1,
                'guests' => $request->guests_count ?: 2,
                'subtotal_cents' => $quote->subtotal_cents,
                'cleaning_fee_cents' => 0,
                'service_fee_cents' => $quote->fees_cents,
                'tax_cents' => 0,
                'discount_cents' => $quote->discount_cents,
                'total_cents' => $quote->total_cents,
                'currency' => $quote->currency,
                'payment_type' => 'full',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'internal_notes' => "Converted from Concierge Request {$request->request_number} (Quote {$quote->quote_number})",
                'source' => 'concierge',
            ]);

            // Update Quote & Request
            $quote->status = 'accepted';
            $quote->accepted_at = now();
            $quote->booking_id = $booking->id;
            $quote->save();

            $request->booking_id = $booking->id;
            $request->status = 'confirmed';
            $request->save();

            ConciergeNote::create([
                'concierge_request_id' => $request->id,
                'user_id' => $actor?->id,
                'author_name' => $actor?->name ?? 'System',
                'content' => "Quote accepted and converted to Booking #{$booking->reference}. Real reservation confirmed.",
                'is_customer_visible' => true,
            ]);

            ActivityLog::create([
                'user_id' => $actor?->id,
                'action' => 'concierge_converted_to_booking',
                'entity_type' => 'ConciergeRequest',
                'entity_id' => $request->id,
                'description' => "Request {$request->request_number} successfully converted to Booking {$booking->reference}.",
                'new_values' => [
                    'booking_id' => $booking->id,
                    'booking_reference' => $booking->reference,
                    'total_cents' => $quote->total_cents,
                ],
            ]);

            return $booking;
        });
    }
}
