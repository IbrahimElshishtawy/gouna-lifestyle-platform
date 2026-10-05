<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $totalBookings = Booking::count();
        $confirmedBookings = Booking::whereIn('status', ['confirmed', 'paid'])->count();
        $pendingBookings = Booking::whereIn('status', ['pending', 'awaiting_payment', 'payment_processing'])->count();

        $totalProperties = Property::count();
        $rentProperties = Property::whereIn('listing_type', ['rent', 'both'])->count();
        $saleProperties = Property::whereIn('listing_type', ['sale', 'both'])->count();

        $totalRevenueCents = (int) Booking::whereIn('status', ['confirmed', 'paid'])->sum('total_cents');
        $formattedRevenue = number_format($totalRevenueCents / 100, 2).' EGP';

        $activeLeads = Lead::whereIn('status', ['new', 'contacted', 'in_progress'])->count();
        $activeStaff = User::where('is_admin', true)->where('is_active', true)->count();

        // Recent Bookings (Normalized)
        $recentBookings = Booking::with(['customer', 'bookable'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($b) {
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
                        'title' => $b->bookable?->title ?? 'Luxury Unit',
                        'title_ar' => $b->bookable?->title_ar ?? null,
                        'slug' => $b->bookable?->slug ?? '',
                        'type' => 'property',
                    ],
                    'check_in' => $b->check_in ? $b->check_in->toDateString() : '',
                    'check_out' => $b->check_out ? $b->check_out->toDateString() : '',
                    'nights' => $b->nights ?? 1,
                    'guests' => $b->guests ?? 1,
                    'total_cents' => (int) $b->total_cents,
                    'formatted_total' => number_format(((int) $b->total_cents) / 100, 2).' '.($b->currency ?? 'EGP'),
                    'amount_paid_cents' => (int) $b->amount_paid_cents,
                    'formatted_paid' => number_format(((int) $b->amount_paid_cents) / 100, 2).' '.($b->currency ?? 'EGP'),
                    'currency' => $b->currency ?? 'EGP',
                    'status' => $b->status ?? 'pending',
                    'payment_status' => $b->payment_status ?? 'pending',
                    'created_at' => $b->created_at ? $b->created_at->toIso8601String() : '',
                ];
            });

        // Recent Activities
        $recentActivities = ActivityLog::with('user')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(function ($act) {
                return [
                    'id' => $act->id,
                    'user_id' => $act->user_id,
                    'user_name' => $act->user?->name ?? 'System',
                    'action' => $act->action,
                    'entity_type' => $act->entity_type,
                    'entity_id' => $act->entity_id,
                    'description' => $act->description,
                    'ip_address' => $act->ip_address,
                    'created_at' => $act->created_at ? $act->created_at->toIso8601String() : '',
                ];
            });

        return response()->json([
            'data' => [
                'kpis' => [
                    'totalBookings' => $totalBookings,
                    'confirmedBookings' => $confirmedBookings,
                    'pendingBookings' => $pendingBookings,
                    'totalProperties' => $totalProperties,
                    'rentProperties' => $rentProperties,
                    'saleProperties' => $saleProperties,
                    'totalRevenueCents' => $totalRevenueCents,
                    'formattedRevenue' => $formattedRevenue,
                    'activeLeads' => $activeLeads,
                    'activeStaff' => $activeStaff,
                ],
                'recentBookings' => $recentBookings,
                'recentActivities' => $recentActivities,
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }
}
