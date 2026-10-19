<!DOCTYPE html>
<html>
<head><title>Admin - Edit Event</title></head>
<body>
    <h1>Edit Event</h1>
    <h2>{{ $event->title_en }}</h2>
    <form method="POST" action="{{ route('admin.events.update', $event) }}">
        @csrf
        @method('PUT')
        <input type="text" name="title_en" value="{{ $event->title_en }}">
    </form>
</body>
</html>
