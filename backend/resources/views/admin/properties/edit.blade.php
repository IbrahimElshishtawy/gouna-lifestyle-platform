<!DOCTYPE html>
<html>
<head><title>Admin - Edit Property</title></head>
<body>
    <h1>Edit Property</h1>
    <h2>{{ $property->title_en }}</h2>
    <form method="POST" action="{{ route('admin.properties.update', $property) }}">
        @csrf
        @method('PUT')
        <input type="text" name="title_en" value="{{ $property->title_en }}">
    </form>
</body>
</html>
