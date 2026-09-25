<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-900">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>3D Secure Sandbox Simulator - GouNow Pay</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="h-full flex items-center justify-center p-4">

    <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <!-- Gateway Brand Header -->
        <div class="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center relative">
            <span class="inline-block px-3 py-0.5 bg-yellow-400 text-yellow-950 font-bold text-[10px] rounded-full uppercase tracking-wider mb-2">
                Sandbox Test Mode
            </span>
            <h1 class="text-xl font-bold tracking-tight">Verified by 3D Secure</h1>
            <p class="text-xs text-blue-100 mt-0.5">Simulated Payment Gateway Authorization</p>
        </div>

        <div class="p-6 space-y-6">
            <!-- Order Details -->
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div class="flex justify-between">
                    <span class="text-slate-500">Merchant</span>
                    <span class="font-bold text-slate-800">GouNow Lifestyle El Gouna</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-500">Booking Ref</span>
                    <span class="font-mono font-bold text-slate-800">{{ $booking->reference }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-500">Property</span>
                    <span class="font-medium text-slate-800 truncate max-w-[200px]">{{ $booking->bookable?->title ?? 'El Gouna Stay' }}</span>
                </div>
                <div class="flex justify-between border-t border-slate-200 pt-2 text-sm">
                    <span class="font-bold text-slate-700">Amount Due</span>
                    <span class="font-bold text-blue-700">{{ number_format($transaction->amount_cents / 100, 2) }} {{ $transaction->currency }}</span>
                </div>
            </div>

            <!-- Simulated Card / 3DS Challenge -->
            <div class="space-y-3">
                <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-600 font-medium">Card Ending In: <strong class="text-slate-900">•••• 4242</strong></span>
                    <span class="text-emerald-600 font-semibold flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                        SSL 256-Bit
                    </span>
                </div>

                <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                    <p class="font-semibold mb-1">Testing Mode Simulation:</p>
                    <p>In production, this modal authenticates via your bank's SMS/Push OTP. Click below to simulate an approved charge or a declined card.</p>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3 pt-2">
                <form method="POST" action="{{ route('checkout.card-mock.complete', $booking->reference) }}">
                    @csrf
                    <input type="hidden" name="session_id" value="{{ $sessionId }}">
                    <button type="submit" 
                            class="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>Approve & Complete Payment (Test)</span>
                    </button>
                </form>

                <form method="POST" action="{{ route('checkout.card-mock.decline', $booking->reference) }}">
                    @csrf
                    <input type="hidden" name="session_id" value="{{ $sessionId }}">
                    <button type="submit" 
                            class="w-full py-2.5 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold text-xs rounded-xl transition border border-slate-200 cursor-pointer">
                        Simulate Card Decline / Failure
                    </button>
                </form>
            </div>
        </div>

        <div class="bg-slate-100 px-6 py-3 text-center text-[10px] text-slate-400 border-t border-slate-200">
            Session: {{ $sessionId }} &bull; Gateway: Mock Card Adapter
        </div>
    </div>

</body>
</html>
