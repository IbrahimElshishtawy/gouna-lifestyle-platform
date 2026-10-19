<!DOCTYPE html>
<html>
<head><title>Admin - Edit Experience</title></head>
<body>
    <h1>Edit Experience</h1>
    <h2>{{ $experience->title_en }}</h2>
    <form method="POST" action="{{ route('admin.experiences.update', $experience) }}">
        @csrf
        @method('PUT')
        <input type="text" name="title_en" value="{{ $experience->title_en }}">
    </form>
</body>
</html>
