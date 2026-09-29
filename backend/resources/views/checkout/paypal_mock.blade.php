<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-100">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>PayPal Sandbox Simulation - GouNow Lifestyle</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="h-full flex items-center justify-center p-4">

    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <!-- PayPal Branding Header -->
        <div class="bg-[#003087] p-6 text-white text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
                <span class="font-serif italic text-2xl font-black tracking-wider text-[#0079C1] bg-white px-2 py-0.5 rounded">P</span>
                <span class="text-xl font-bold tracking-tight text-white">PayPal</span>
                <span class="ml-2 px-2 py-0.5 bg-amber-400 text-amber-950 font-bold text-[10px] rounded uppercase">Sandbox</span>
            </div>
            <p class="text-xs text-blue-200">Simulated Express Checkout Approval</p>
        </div>

        <div class="p-6 space-y-6">
            <!-- Order Snapshot -->
            <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs space-y-2">
                <div class="flex justify-between">
                    <span class="text-slate-500">Pay To</span>
                    <span class="font-bold text-slate-800">GouNow Lifestyle LTD</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-500">Booking Ref</span>
                    <span class="font-mono font-bold text-slate-800">{{ $booking->reference }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-500">Order ID</span>
                    <span class="font-mono text-slate-600 truncate max-w-[180px]">{{ $orderId }}</span>
                </div>
                <div class="flex justify-between border-t border-blue-200 pt-2 text-sm">
                    <span class="font-bold text-slate-800">Total Purchase</span>
                    <span class="font-bold text-[#003087]">{{ number_format($transaction->amount_cents / 100, 2) }} {{ $transaction->currency }}</span>
                </div>
            </div>

            <!-- Simulated Buyer Account -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div class="flex items-center justify-between text-slate-600">
                    <span class="font-medium">Sandbox Buyer Account:</span>
                    <span class="text-emerald-600 font-semibold">Active</span>
                </div>
                <div class="font-mono text-slate-800 bg-white p-2 rounded border border-slate-200 text-xs">
                    sb-buyer@gounow-test.com
                </div>
                <p class="text-[11px] text-slate-500">
                    Payment Method: PayPal Wallet Balance (Simulated EGP Balance)
                </p>
            </div>

            <!-- Actions -->
            <div class="space-y-3 pt-2">
                <form method="POST" action="{{ route('checkout.paypal-mock.complete', $booking->reference) }}">
                    @csrf
                    <input type="hidden" name="order_id" value="{{ $orderId }}">
                    <button type="submit" 
                            class="w-full py-3.5 px-4 bg-[#FFC439] hover:bg-[#F2BA36] active:bg-[#E5AF30] text-[#2C2E2F] font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer">
                        <span>Pay with PayPal</span>
                    </button>
                </form>

                <a href="{{ route('checkout.confirmation', $booking->reference) }}" 
                   class="block text-center py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition">
                    Cancel and Return to GouNow
                </a>
            </div>
        </div>

        <div class="bg-slate-100 px-6 py-3 text-center text-[10px] text-slate-400 border-t border-slate-200">
            PayPal Sandbox Mock Driver &bull; Protocol v2
        </div>
    </div>

</body>
</html>
