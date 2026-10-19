<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Booking Confirmation - {{ $booking->reference }}</title>
    <style>
        body { font-family: sans-serif; background: #f8fafc; margin: 0; padding: 2rem; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { text-align: center; margin-bottom: 2rem; }
        .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; background: #dcfce7; color: #15803d; }
        .row { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="badge">{{ strtoupper($booking->status) }}</span>
            <h1>Booking Confirmed</h1>
            <p>Reference: <strong>{{ $booking->reference }}</strong></p>
        </div>
        <div class="details">
            <div class="row"><span>Item</span><strong>{{ $booking->bookable->title_en ?? 'Reservation' }}</strong></div>
            <div class="row"><span>Check-in</span><strong>{{ $booking->check_in }}</strong></div>
            <div class="row"><span>Check-out</span><strong>{{ $booking->check_out }}</strong></div>
            <div class="row"><span>Total Amount</span><strong>{{ number_format($booking->total_amount, 2) }} {{ $booking->currency }}</strong></div>
        </div>
    </div>
</body>
</html>
