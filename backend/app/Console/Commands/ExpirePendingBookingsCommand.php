<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Domain\Services\BookingStateMachine;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpirePendingBookingsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bookings:expire-pending';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Release expired pending booking holds and transition them to expired status';

    /**
     * Execute the console command.
     */
    public function handle(BookingStateMachine $stateMachine): int
    {
        $expiredCount = 0;

        Booking::whereIn('status', [BookingStatus::PENDING->value, BookingStatus::AWAITING_PAYMENT->value])
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->chunkById(100, function ($bookings) use ($stateMachine, &$expiredCount) {
                foreach ($bookings as $booking) {
                    try {
                        $stateMachine->transition(
                            booking: $booking,
                            targetStatus: BookingStatus::EXPIRED,
                            context: [
                                'reason' => 'Pending checkout hold expired automatically.',
                                'expired_at' => now()->toIso8601String(),
                            ]
                        );
                        $expiredCount++;
                    } catch (\Throwable $e) {
                        Log::error("Failed to expire booking {$booking->reference}: {$e->getMessage()}", [
                            'booking_id' => $booking->id,
                            'reference' => $booking->reference,
                        ]);
                    }
                }
            });

        $this->info("Released {$expiredCount} expired booking hold(s).");

        return Command::SUCCESS;
    }
}
