<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="UTF-8">
    <title>GOUNOW Management - Login</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #0f172a; color: white; margin: 0; }
        .card { background: #1e293b; padding: 2.5rem; border-radius: 12px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
        .input-group { margin-bottom: 1rem; }
        .input-group label { display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.875rem; }
        .input-group input { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: white; }
        .btn { width: 100%; padding: 0.75rem; background: #0ea5e9; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
    </style>
</head>
<body>
    <div class="card">
        <h1>GOUNOW Management</h1>
        <p>Demo: admin@gounow.com</p>
        <form method="POST" action="{{ route('admin.login.submit') }}">
            @csrf
            <div class="input-group">
                <label>Email</label>
                <input type="email" name="email" value="admin@gounow.com" required>
            </div>
            <div class="input-group">
                <label>Password</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit" class="btn">Sign In</button>
        </form>
    </div>
</body>
</html>
