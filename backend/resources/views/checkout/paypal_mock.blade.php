<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PayPal Sandbox Simulation</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #003087; margin: 0; }
        .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); max-width: 420px; width: 100%; text-align: center; }
        .btn { display: block; width: 100%; padding: 0.75rem; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; margin-top: 1rem; }
        .btn-paypal { background: #ffc439; color: #111; }
        .btn-cancel { background: #e2e8f0; color: #475569; }
    </style>
</head>
<body>
    <div class="card">
        <h2>PayPal Sandbox</h2>
        <p>Reference: <strong>{{ $booking->reference }}</strong></p>
        <p>Order ID: <strong>{{ $orderId }}</strong></p>
        <form method="POST" action="{{ route('checkout.paypal-mock.complete', $booking->reference) }}">
            @csrf
            <button type="submit" class="btn btn-paypal">Pay with PayPal</button>
        </form>
    </div>
</body>
</html>
