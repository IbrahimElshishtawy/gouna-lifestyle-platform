<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Paymob 3DS Sandbox Simulation</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f4f5f7; margin: 0; }
        .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 420px; width: 100%; text-align: center; }
        .btn { display: block; width: 100%; padding: 0.75rem; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; margin-top: 1rem; }
        .btn-success { background: #0070ba; color: white; }
        .btn-danger { background: #e02424; color: white; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Paymob 3DS Payment Authorization</h2>
        <p>Reference: <strong>{{ $booking->reference }}</strong></p>
        <p>Amount: <strong>{{ number_format(($transaction->amount_cents ?? 0) / 100, 2) }} {{ $transaction->currency ?? 'EGP' }}</strong></p>
        <form method="POST" action="{{ route('checkout.card-mock.complete', $booking->reference) }}">
            @csrf
            <button type="submit" class="btn btn-success">Authorize Payment</button>
        </form>
        <form method="POST" action="{{ route('checkout.card-mock.decline', $booking->reference) }}">
            @csrf
            <button type="submit" class="btn btn-danger">Decline Payment</button>
        </form>
    </div>
</body>
</html>
