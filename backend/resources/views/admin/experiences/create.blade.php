<!DOCTYPE html>
<html>
<head><title>Admin - Create Experience</title></head>
<body>
    <h1>Create Experience</h1>
    <form method="POST" action="{{ route('admin.experiences.store') }}">
        @csrf
        <input type="text" name="title_en">
    </form>
</body>
</html>
