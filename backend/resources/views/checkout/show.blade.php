<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Checkout - {{ $property->title_en ?? 'Property' }}</title>
    <style>
        body { font-family: sans-serif; background: #f8fafc; margin: 0; padding: 2rem; color: #1e293b; }
        .container { max-width: 800px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
        .card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .btn { display: inline-block; width: 100%; padding: 0.75rem; background: #0f766e; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Checkout</h1>
            <h2>{{ $property->title_en }}</h2>
            <p>Dates: {{ $checkIn }} to {{ $checkOut }} ({{ $guests }} Guests)</p>

            <form method="POST" action="{{ route('checkout.process') }}">
                @csrf
                <input type="hidden" name="property_id" value="{{ $property->id }}">
                <input type="hidden" name="check_in" value="{{ $checkIn }}">
                <input type="hidden" name="check_out" value="{{ $checkOut }}">
                <input type="hidden" name="guests" value="{{ $guests }}">

                <h3>Payment Method</h3>
                <div class="payment-methods">
                    <label>
                        <input type="radio" name="payment_method_code" value="card" checked>
                        Credit / Debit Card
                    </label>
                    <br>
                    <label>
                        <input type="radio" name="payment_method_code" value="paypal">
                        PayPal
                    </label>
                    <br>
                    <label>
                        <input type="radio" name="payment_method_code" value="cash">
                        Cash on Arrival
                    </label>
                </div>

                <div style="margin-top: 1.5rem;">
                    <button type="submit" class="btn">Proceed to Payment</button>
                </div>
            </form>
        </div>

        <div class="card">
            <h3>Price Summary</h3>
            <p>Total: <strong>{{ number_format($quote['total'] ?? 0, 2) }} {{ $quote['currency'] ?? 'EGP' }}</strong></p>
        </div>
    </div>
</body>
</html>
