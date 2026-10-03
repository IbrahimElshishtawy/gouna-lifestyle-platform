<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BookingResource;
use App\Models\Booking;
use App\Modules\Booking\Application\Actions\CancelBookingAction;
use App\Support\Traits\AppliesListingStandard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BookingController extends Controller
{
    use AppliesListingStandard;

    /**
     * Display a listing of bookings belonging to the authenticated customer.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        // Customer records can be linked by email or user_id
        $query = Booking::query()
            ->whereHas('customer', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('email', $user->email);
            })
            ->with(['bookable', 'customer']);

        $paginated = $this->paginateWithListingStandard(
            query: $query,
            request: $request,
            allowedSorts: ['id', 'created_at', 'check_in', 'total_cents'],
            allowedFilters: ['status', 'payment_status'],
            allowedIncludes: ['bookable', 'customer'],
            defaultSort: '-created_at',
            defaultPerPage: 10,
            maxPerPage: 50
        );

        return BookingResource::collection($paginated);
    }

    /**
     * Display a single customer booking ensuring ownership (P5-T08, P5-T10).
     */
    public function show(Request $request, string $reference): BookingResource
    {
        $user = $request->user();

        $booking = Booking::where('reference', $reference)
            ->whereHas('customer', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('email', $user->email);
            })
            ->with(['bookable', 'customer', 'nightlyPrices', 'transactions'])
            ->firstOrFail();

        return new BookingResource($booking);
    }

    /**
     * Cancel customer's own booking (P5-T09).
     */
    public function cancel(Request $request, string $reference, CancelBookingAction $cancelAction): JsonResponse
    {
        $user = $request->user();

        $booking = Booking::where('reference', $reference)
            ->whereHas('customer', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('email', $user->email);
            })
            ->firstOrFail();

        $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $reason = $request->input('reason', 'Cancelled by guest via customer portal');

        $cancelAction->execute(
            booking: $booking,
            reason: $reason,
            refundAmountCents: 0,
            actor: $user
        );

        $booking->refresh();

        return response()->json([
            'data' => new BookingResource($booking),
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }
}
