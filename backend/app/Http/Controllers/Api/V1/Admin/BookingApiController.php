<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\AvailabilityBlock;
use App\Models\Booking;
use App\Models\PaymentTransaction;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingApiController extends Controller
{
    /**
     * Display a paginated listing of bookings with operational filters and summary statistics.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['customer', 'bookable'])->orderByDesc('created_at');

        // Status filter
        if ($status = $request->query('status')) {
            if ($status === 'pending') {
                $query->whereIn('status', ['pending', 'awaiting_payment', 'payment_processing']);
            } elseif ($status === 'confirmed') {
                $query->whereIn('status', ['confirmed', 'paid']);
            } elseif ($status === 'active') {
                $today = now()->toDateString();
                $query->whereIn('status', ['confirmed', 'paid', 'completed'])
                    ->where('check_in', '<=', $today)
                    ->where('check_out', '>=', $today);
            } elseif ($status === 'cancelled') {
                $query->whereIn('status', ['cancelled', 'refunded']);
            } else {
                $query->where('status', $status);
            }
        }

        // Payment status filter
        if ($paymentStatus = $request->query('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        // Property / Unit filter
        if ($propertyId = $request->query('property_id')) {
            $query->where('bookable_id', $propertyId);
        }

        // Date range filter
        if ($dateFrom = $request->query('check_in_from')) {
            $query->where('check_in', '>=', $dateFrom);
        }
        if ($dateTo = $request->query('check_in_to')) {
            $query->where('check_in', '<=', $dateTo);
        }

        // Search query
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($cq) use ($search) {
                        $cq->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    })
                    ->orWhereHasMorph('bookable', [Property::class], function ($pq) use ($search) {
                        $pq->where('title_en', 'like', "%{$search}%")
                            ->orWhere('title_ar', 'like', "%{$search}%")
                            ->orWhere('reference_number', 'like', "%{$search}%");
                    });
            });
        }

        // Summary metrics for administrative header
        $today = now()->toDateString();
        $totalCount = Booking::count();
        $pendingCount = Booking::whereIn('status', ['pending', 'awaiting_payment', 'payment_processing'])->count();
        $confirmedCount = Booking::whereIn('status', ['confirmed', 'paid'])->count();
        $activeStaysCount = Booking::whereIn('status', ['confirmed', 'paid', 'completed'])
            ->where('check_in', '<=', $today)
            ->where('check_out', '>=', $today)
            ->count();
        $completedCount = Booking::where('status', 'completed')->count();
        $cancelledCount = Booking::whereIn('status', ['cancelled', 'refunded'])->count();

        $perPage = (int) $request->query('per_page', 15);
        $paginator = $query->paginate($perPage);

        $items = collect($paginator->items())->map(function ($b) use ($today) {
            $checkInStr = $b->check_in ? $b->check_in->toDateString() : '';
            $checkOutStr = $b->check_out ? $b->check_out->toDateString() : '';

            // Compute stay status
            $stayStatus = 'expected';
            if ($b->status === 'cancelled' || $b->status === 'refunded') {
                $stayStatus = 'cancelled';
            } elseif ($b->status === 'completed' || ($checkOutStr && $checkOutStr < $today)) {
                $stayStatus = 'checked_out';
            } elseif ($checkInStr && $checkOutStr && $checkInStr <= $today && $checkOutStr >= $today) {
                $stayStatus = 'in_house';
            }

            return [
                'id' => $b->id,
                'reference' => $b->reference,
                'customer' => [
                    'id' => $b->customer?->id ?? 0,
                    'name' => $b->customer ? $b->customer->full_name : 'Guest User',
                    'email' => $b->customer?->email ?? '',
                    'phone' => $b->customer?->phone ?? null,
                ],
                'bookable' => [
                    'id' => $b->bookable?->id ?? 0,
                    'title' => $b->bookable?->title_en ?? $b->bookable?->title ?? 'Luxury Unit',
                    'title_ar' => $b->bookable?->title_ar ?? null,
                    'slug' => $b->bookable?->slug ?? '',
                    'reference_number' => $b->bookable?->reference_number ?? '',
                    'type' => 'property',
                ],
                'check_in' => $checkInStr,
                'check_out' => $checkOutStr,
                'nights' => $b->nights ?? 1,
                'guests' => $b->guests ?? 1,
                'total_cents' => (int) $b->total_cents,
                'formatted_total' => number_format(((int) $b->total_cents) / 100, 2).' '.($b->currency ?? 'EGP'),
                'amount_paid_cents' => (int) $b->amount_paid_cents,
                'formatted_paid' => number_format(((int) $b->amount_paid_cents) / 100, 2).' '.($b->currency ?? 'EGP'),
                'amount_remaining_cents' => (int) $b->amount_remaining_cents,
                'formatted_remaining' => number_format(((int) $b->amount_remaining_cents) / 100, 2).' '.($b->currency ?? 'EGP'),
                'currency' => $b->currency ?? 'EGP',
                'status' => $b->status ?? 'pending',
                'payment_status' => $b->payment_status ?? 'pending',
                'stay_status' => $stayStatus,
                'created_at' => $b->created_at ? $b->created_at->toIso8601String() : '',
            ];
        });

        return response()->json([
            'data' => $items,
            'summary' => [
                'total' => $totalCount,
                'pending' => $pendingCount,
                'confirmed' => $confirmedCount,
                'active_stays' => $activeStaysCount,
                'completed' => $completedCount,
                'cancelled' => $cancelledCount,
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Show comprehensive booking details for operations staff.
     */
    public function show(int $id): JsonResponse
    {
        $booking = Booking::with([
            'customer',
            'bookable' => function ($morphTo) {
                $morphTo->morphWith([
                    Property::class => ['location', 'category', 'images'],
                ]);
            },
            'paymentTransactions',
            'nightlyPrices',
        ])->findOrFail($id);

        $activityLogs = ActivityLog::where('entity_type', 'Booking')
            ->where('entity_id', $booking->id)
            ->with('user')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'user_name' => $log->user?->name ?? 'System',
                    'created_at' => $log->created_at?->toIso8601String() ?? '',
                ];
            });

        $today = now()->toDateString();
        $checkInStr = $booking->check_in ? $booking->check_in->toDateString() : '';
        $checkOutStr = $booking->check_out ? $booking->check_out->toDateString() : '';

        $stayStatus = 'expected';
        if ($booking->status === 'cancelled' || $booking->status === 'refunded') {
            $stayStatus = 'cancelled';
        } elseif ($booking->status === 'completed' || ($checkOutStr && $checkOutStr < $today)) {
            $stayStatus = 'checked_out';
        } elseif ($checkInStr && $checkOutStr && $checkInStr <= $today && $checkOutStr >= $today) {
            $stayStatus = 'in_house';
        }

        $property = $booking->bookable instanceof Property ? $booking->bookable : null;

        $data = [
            'id' => $booking->id,
            'reference' => $booking->reference,
            'status' => $booking->status,
            'payment_status' => $booking->payment_status,
            'stay_status' => $stayStatus,
            'check_in' => $checkInStr,
            'check_out' => $checkOutStr,
            'nights' => (int) $booking->nights,
            'guests' => (int) $booking->guests,
            'currency' => $booking->currency ?? 'EGP',
            'financials' => [
                'subtotal_cents' => (int) $booking->subtotal_cents,
                'cleaning_fee_cents' => (int) $booking->cleaning_fee_cents,
                'service_fee_cents' => (int) $booking->service_fee_cents,
                'tax_cents' => (int) $booking->tax_cents,
                'discount_cents' => (int) $booking->discount_cents,
                'total_cents' => (int) $booking->total_cents,
                'deposit_cents' => (int) $booking->deposit_cents,
                'amount_paid_cents' => (int) $booking->amount_paid_cents,
                'amount_remaining_cents' => (int) $booking->amount_remaining_cents,
                'refund_amount_cents' => (int) $booking->refund_amount_cents,
                'formatted_subtotal' => number_format(((int) $booking->subtotal_cents) / 100, 2).' '.($booking->currency ?? 'EGP'),
                'formatted_total' => number_format(((int) $booking->total_cents) / 100, 2).' '.($booking->currency ?? 'EGP'),
                'formatted_paid' => number_format(((int) $booking->amount_paid_cents) / 100, 2).' '.($booking->currency ?? 'EGP'),
                'formatted_remaining' => number_format(((int) $booking->amount_remaining_cents) / 100, 2).' '.($booking->currency ?? 'EGP'),
                'formatted_refund' => number_format(((int) $booking->refund_amount_cents) / 100, 2).' '.($booking->currency ?? 'EGP'),
            ],
            'customer' => [
                'id' => $booking->customer?->id ?? 0,
                'name' => $booking->customer?->full_name ?? 'Guest User',
                'first_name' => $booking->customer?->first_name ?? '',
                'last_name' => $booking->customer?->last_name ?? '',
                'email' => $booking->customer?->email ?? '',
                'phone' => $booking->customer?->phone ?? null,
                'nationality' => $booking->customer?->nationality ?? null,
                'country_of_residence' => $booking->customer?->country_of_residence ?? null,
                'bookings_count' => $booking->customer?->bookings()->count() ?? 1,
            ],
            'property' => $property ? [
                'id' => $property->id,
                'reference_number' => $property->reference_number,
                'slug' => $property->slug,
                'title_en' => $property->title_en,
                'title_ar' => $property->title_ar,
                'compound' => $property->compound,
                'address' => $property->address,
                'bedrooms' => $property->bedrooms,
                'bathrooms' => $property->bathrooms,
                'max_guests' => $property->max_guests,
                'area_sqm' => $property->area_sqm,
                'primary_image' => $property->images->first()?->url ?? '/assets/images/bg-sand-texture.jpg',
                'location' => [
                    'id' => $property->location?->id ?? 0,
                    'name_en' => $property->location?->name_en ?? 'El Gouna',
                    'name_ar' => $property->location?->name_ar ?? 'الجونة',
                ],
                'category' => [
                    'id' => $property->category?->id ?? 0,
                    'name_en' => $property->category?->name_en ?? 'Villa',
                    'name_ar' => $property->category?->name_ar ?? 'فيلا',
                ],
            ] : null,
            'internal_notes' => $booking->internal_notes,
            'source' => $booking->source ?? 'direct',
            'promo_code' => $booking->promo_code,
            'cancellation_reason' => $booking->cancellation_reason,
            'cancelled_at' => $booking->cancelled_at ? $booking->cancelled_at->toIso8601String() : null,
            'created_at' => $booking->created_at ? $booking->created_at->toIso8601String() : '',
            'transactions' => $booking->paymentTransactions->map(function ($tx) {
                return [
                    'id' => $tx->id,
                    'type' => $tx->transaction_type,
                    'amount_cents' => (int) $tx->amount_cents,
                    'formatted_amount' => number_format(((int) $tx->amount_cents) / 100, 2).' '.($tx->currency ?? 'EGP'),
                    'currency' => $tx->currency,
                    'gateway' => $tx->gateway,
                    'gateway_reference' => $tx->gateway_reference,
                    'status' => $tx->status,
                    'created_at' => $tx->created_at ? $tx->created_at->toIso8601String() : '',
                ];
            }),
            'timeline' => $activityLogs,
        ];

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * Update booking status.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,cancelled,completed'],
        ]);

        $booking = Booking::findOrFail($id);
        $oldStatus = $booking->status;
        $newStatus = $request->input('status');

        $booking->update([
            'status' => $newStatus,
            'cancelled_at' => $newStatus === 'cancelled' ? now() : $booking->cancelled_at,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'booking_status_updated',
            'entity_type' => 'Booking',
            'entity_id' => $booking->id,
            'description' => "Booking {$booking->reference} status changed from {$oldStatus} to {$newStatus}.",
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $newStatus],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Booking status updated successfully to {$newStatus}.",
            'data' => [
                'id' => $booking->id,
                'status' => $booking->status,
            ],
        ]);
    }

    /**
     * Operational Guest Check-in.
     */
    public function checkin(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);

        if ($booking->status === 'cancelled' || $booking->status === 'refunded') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot check in a cancelled booking.',
            ], 422);
        }

        $notes = $request->input('notes', '');
        $currentNotes = $booking->internal_notes ? $booking->internal_notes . "\n" : '';
        $newNotes = $currentNotes . "[" . now()->toDateTimeString() . "] Guest Checked-in by Admin. " . $notes;

        $booking->update([
            'internal_notes' => trim($newNotes),
            'status' => in_array($booking->status, ['confirmed', 'paid']) ? $booking->status : 'confirmed',
        ]);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'guest_checked_in',
            'entity_type' => 'Booking',
            'entity_id' => $booking->id,
            'description' => "Guest checked-in for booking {$booking->reference} on " . now()->toDateTimeString(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Guest checked in successfully for booking {$booking->reference}.",
            'data' => [
                'id' => $booking->id,
                'reference' => $booking->reference,
                'stay_status' => 'in_house',
            ],
        ]);
    }

    /**
     * Operational Guest Check-out.
     */
    public function checkout(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);

        if ($booking->status === 'cancelled' || $booking->status === 'refunded') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot check out a cancelled booking.',
            ], 422);
        }

        $notes = $request->input('notes', '');
        $currentNotes = $booking->internal_notes ? $booking->internal_notes . "\n" : '';
        $newNotes = $currentNotes . "[" . now()->toDateTimeString() . "] Guest Checked-out by Admin. " . $notes;

        $booking->update([
            'status' => 'completed',
            'internal_notes' => trim($newNotes),
        ]);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'guest_checked_out',
            'entity_type' => 'Booking',
            'entity_id' => $booking->id,
            'description' => "Guest checked-out and booking {$booking->reference} marked as completed on " . now()->toDateTimeString(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Guest checked out successfully for booking {$booking->reference}.",
            'data' => [
                'id' => $booking->id,
                'reference' => $booking->reference,
                'status' => 'completed',
                'stay_status' => 'checked_out',
            ],
        ]);
    }

    /**
     * Extend Guest Stay workflow.
     */
    public function extendStay(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'new_check_out' => ['required', 'date', 'after:check_out'],
        ]);

        $booking = Booking::findOrFail($id);
        $newCheckOut = Carbon::parse($request->input('new_check_out'));
        $oldCheckOut = Carbon::parse($booking->check_out);

        if ($newCheckOut->lte($oldCheckOut)) {
            return response()->json([
                'success' => false,
                'message' => 'New check-out date must be strictly after the current check-out date.',
            ], 422);
        }

        // Validate Property Availability between oldCheckOut and newCheckOut
        if ($booking->bookable_type === Property::class && $booking->bookable_id) {
            $hasConflictBooking = Booking::where('bookable_type', Property::class)
                ->where('bookable_id', $booking->bookable_id)
                ->where('id', '!=', $booking->id)
                ->whereIn('status', ['confirmed', 'paid', 'pending'])
                ->where(function ($q) use ($oldCheckOut, $newCheckOut) {
                    $q->whereBetween('check_in', [$oldCheckOut->toDateString(), $newCheckOut->copy()->subDay()->toDateString()])
                        ->orWhereBetween('check_out', [$oldCheckOut->copy()->addDay()->toDateString(), $newCheckOut->toDateString()])
                        ->orWhere(function ($sub) use ($oldCheckOut, $newCheckOut) {
                            $sub->where('check_in', '<=', $oldCheckOut->toDateString())
                                ->where('check_out', '>=', $newCheckOut->toDateString());
                        });
                })->exists();

            if ($hasConflictBooking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot extend stay: The requested dates conflict with another confirmed booking on this property.',
                ], 422);
            }

            $hasBlockedDates = AvailabilityBlock::where('property_id', $booking->bookable_id)
                ->where(function ($q) use ($oldCheckOut, $newCheckOut) {
                    $q->whereBetween('start_date', [$oldCheckOut->toDateString(), $newCheckOut->toDateString()])
                        ->orWhereBetween('end_date', [$oldCheckOut->toDateString(), $newCheckOut->toDateString()])
                        ->orWhere(function ($sub) use ($oldCheckOut, $newCheckOut) {
                            $sub->where('start_date', '<=', $oldCheckOut->toDateString())
                                ->where('end_date', '>=', $newCheckOut->toDateString());
                        });
                })->exists();

            if ($hasBlockedDates) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot extend stay: The requested dates contain a blocked availability period.',
                ], 422);
            }
        }

        // Calculate additional nights and rate
        $additionalNights = $oldCheckOut->diffInDays($newCheckOut);
        $totalNights = Carbon::parse($booking->check_in)->diffInDays($newCheckOut);

        // Calculate nightly rate from booking or property
        $avgNightlyPriceCents = $booking->nights > 0
            ? (int) round($booking->subtotal_cents / $booking->nights)
            : ($booking->bookable?->base_price_cents ?? 0);

        $addedCostCents = $avgNightlyPriceCents * $additionalNights;
        $newSubtotalCents = $booking->subtotal_cents + $addedCostCents;
        $newTotalCents = $booking->total_cents + $addedCostCents;
        $newRemainingCents = max(0, $newTotalCents - $booking->amount_paid_cents);

        $booking->update([
            'check_out' => $newCheckOut->toDateString(),
            'nights' => $totalNights,
            'subtotal_cents' => $newSubtotalCents,
            'total_cents' => $newTotalCents,
            'amount_remaining_cents' => $newRemainingCents,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'stay_extended',
            'entity_type' => 'Booking',
            'entity_id' => $booking->id,
            'description' => "Stay extended by {$additionalNights} nights to {$newCheckOut->toDateString()}. New Total: " . number_format($newTotalCents / 100, 2) . " {$booking->currency}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Stay extended successfully by {$additionalNights} night(s).",
            'data' => [
                'id' => $booking->id,
                'check_out' => $booking->check_out->toDateString(),
                'nights' => $booking->nights,
                'formatted_total' => number_format($booking->total_cents / 100, 2) . ' ' . $booking->currency,
            ],
        ]);
    }

    /**
     * Operational Stay Management View ("Who is physically staying now?")
     */
    public function stays(Request $request): JsonResponse
    {
        $today = now()->toDateString();
        $next7Days = now()->addDays(7)->toDateString();

        $activeStays = Booking::with(['customer', 'bookable'])
            ->whereIn('status', ['confirmed', 'paid', 'completed'])
            ->where('check_in', '<=', $today)
            ->where('check_out', '>=', $today)
            ->orderBy('check_out')
            ->get();

        $todayCheckIns = Booking::with(['customer', 'bookable'])
            ->whereIn('status', ['confirmed', 'paid', 'pending'])
            ->where('check_in', $today)
            ->orderByDesc('created_at')
            ->get();

        $todayCheckOuts = Booking::with(['customer', 'bookable'])
            ->whereIn('status', ['confirmed', 'paid', 'completed'])
            ->where('check_out', $today)
            ->orderByDesc('created_at')
            ->get();

        $upcomingArrivals = Booking::with(['customer', 'bookable'])
            ->whereIn('status', ['confirmed', 'paid'])
            ->where('check_in', '>', $today)
            ->where('check_in', '<=', $next7Days)
            ->orderBy('check_in')
            ->get();

        $upcomingDepartures = Booking::with(['customer', 'bookable'])
            ->whereIn('status', ['confirmed', 'paid', 'completed'])
            ->where('check_out', '>', $today)
            ->where('check_out', '<=', $next7Days)
            ->orderBy('check_out')
            ->get();

        $mapBookingItem = function ($b) use ($today) {
            $checkInStr = $b->check_in ? $b->check_in->toDateString() : '';
            $checkOutStr = $b->check_out ? $b->check_out->toDateString() : '';

            $stayStatus = 'expected';
            if ($b->status === 'completed' || ($checkOutStr && $checkOutStr < $today)) {
                $stayStatus = 'checked_out';
            } elseif ($checkInStr && $checkOutStr && $checkInStr <= $today && $checkOutStr >= $today) {
                $stayStatus = 'in_house';
            }

            return [
                'id' => $b->id,
                'reference' => $b->reference,
                'customer' => [
                    'id' => $b->customer?->id ?? 0,
                    'name' => $b->customer ? $b->customer->full_name : 'Guest User',
                    'email' => $b->customer?->email ?? '',
                    'phone' => $b->customer?->phone ?? null,
                ],
                'bookable' => [
                    'id' => $b->bookable?->id ?? 0,
                    'title' => $b->bookable?->title_en ?? $b->bookable?->title ?? 'Luxury Unit',
                    'title_ar' => $b->bookable?->title_ar ?? null,
                    'reference_number' => $b->bookable?->reference_number ?? '',
                    'slug' => $b->bookable?->slug ?? '',
                ],
                'check_in' => $checkInStr,
                'check_out' => $checkOutStr,
                'nights' => $b->nights ?? 1,
                'guests' => $b->guests ?? 1,
                'status' => $b->status,
                'payment_status' => $b->payment_status,
                'stay_status' => $stayStatus,
                'total_cents' => (int) $b->total_cents,
                'formatted_total' => number_format(((int) $b->total_cents) / 100, 2).' '.($b->currency ?? 'EGP'),
                'amount_paid_cents' => (int) $b->amount_paid_cents,
                'formatted_paid' => number_format(((int) $b->amount_paid_cents) / 100, 2).' '.($b->currency ?? 'EGP'),
                'amount_remaining_cents' => (int) $b->amount_remaining_cents,
                'formatted_remaining' => number_format(((int) $b->amount_remaining_cents) / 100, 2).' '.($b->currency ?? 'EGP'),
            ];
        };

        return response()->json([
            'summary' => [
                'active_stays_count' => $activeStays->count(),
                'today_checkins_count' => $todayCheckIns->count(),
                'today_checkouts_count' => $todayCheckOuts->count(),
                'upcoming_arrivals_count' => $upcomingArrivals->count(),
                'upcoming_departures_count' => $upcomingDepartures->count(),
            ],
            'data' => [
                'active_stays' => $activeStays->map($mapBookingItem),
                'today_checkins' => $todayCheckIns->map($mapBookingItem),
                'today_checkouts' => $todayCheckOuts->map($mapBookingItem),
                'upcoming_arrivals' => $upcomingArrivals->map($mapBookingItem),
                'upcoming_departures' => $upcomingDepartures->map($mapBookingItem),
            ],
        ]);
    }

    /**
     * Process Booking Refund.
     */
    public function refund(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $refundAmountCents = $request->input('amount_cents', $booking->amount_paid_cents);

        $booking->update([
            'payment_status' => 'refunded',
            'status' => 'cancelled',
            'refund_amount_cents' => $refundAmountCents,
            'cancelled_at' => now(),
            'cancellation_reason' => $request->input('reason', 'Administrative refund processed'),
        ]);

        PaymentTransaction::create([
            'booking_id' => $booking->id,
            'customer_id' => $booking->customer_id,
            'payment_method_id' => $booking->payment_method_id,
            'transaction_type' => 'refund',
            'amount_cents' => $refundAmountCents,
            'currency' => $booking->currency ?? 'EGP',
            'status' => 'successful',
            'gateway' => 'manual_admin',
            'gateway_reference' => 'REF-'.strtoupper(uniqid()),
        ]);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'booking_refund_issued',
            'entity_type' => 'Booking',
            'entity_id' => $booking->id,
            'description' => "Refund of {$refundAmountCents} cents processed for booking {$booking->reference}.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Refund processed successfully.',
        ]);
    }
}
