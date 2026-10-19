<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - GOUNOW Management</title>
    <style>
        body { font-family: sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 1rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .card { background: #1e293b; padding: 1.5rem; border-radius: 8px; border: 1px solid #334155; }
    </style>
</head>
<body @if(app()->getLocale() === 'ar') dir="rtl" @else dir="ltr" @endif>
    <div class="header">
        <div>
            <h1>{{ app()->getLocale() === 'ar' ? 'لوحة التحكم' : 'Dashboard' }}</h1>
            <p>Welcome back, {{ auth()->user()->name ?? 'Administrator' }}</p>
        </div>
        <div>
            <span>Executive Overview</span> | <span>Operations Dashboard</span>
        </div>
    </div>
    <div class="grid">
        <div class="card">
            <h3>Executive Overview</h3>
            <p>Summary of bookings, properties, and revenue analytics.</p>
        </div>
        <div class="card">
            <h3>Operations Dashboard</h3>
            <p>Active guest check-ins, tasks, and property availability.</p>
        </div>
    </div>
</body>
</html>
