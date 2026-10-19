<!DOCTYPE html>
<html>
<head><title>Admin - Create Event</title></head>
<body>
    <h1>Create Event</h1>
    <form method="POST" action="{{ route('admin.events.store') }}">
        @csrf
        <input type="text" name="title_en">
    </form>
</body>
</html>
