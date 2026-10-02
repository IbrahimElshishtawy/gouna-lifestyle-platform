<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BookingResource;
use App\Models\Booking;
use App\Support\Traits\AppliesListingStandard;
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
                $q->where('email', $user->email);
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
     * Display a single customer booking ensuring ownership.
     */
    public function show(Request $request, string $reference): BookingResource
    {
        $user = $request->user();

        $booking = Booking::where('reference', $reference)
            ->whereHas('customer', function ($q) use ($user) {
                $q->where('email', $user->email);
            })
            ->with(['bookable', 'customer'])
            ->firstOrFail();

        return new BookingResource($booking);
    }
}
