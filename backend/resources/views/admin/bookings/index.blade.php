<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="UTF-8">
    <title>{{ $tabTitle }} - GOUNOW Admin</title>
</head>
<body>
    <h1>{{ $tabTitle }}</h1>
    <p>Total: {{ $totalCount }} | Pending: {{ $pendingCount }} | Revenue: {{ number_format($revenue, 2) }}</p>
    <table>
        @foreach($bookings as $booking)
            <tr>
                <td>{{ $booking->reference }}</td>
                <td>{{ $booking->status }}</td>
                <td>{{ $booking->total_amount }}</td>
            </tr>
        @endforeach
    </table>
</body>
</html>
