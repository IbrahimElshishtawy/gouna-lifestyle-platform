<!DOCTYPE html>
<html>
<head><title>Admin - Create Property</title></head>
<body>
    <h1>Create Property</h1>
    <h2>Section 20 Payment Architecture</h2>
    <h2>Section 21 Booking Mode</h2>
    <form method="POST" action="{{ route('admin.properties.store') }}">
        @csrf
        <input type="text" name="title_en">
    </form>
</body>
</html>
