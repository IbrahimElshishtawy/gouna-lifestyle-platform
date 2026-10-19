<!DOCTYPE html>
<html>
<head><title>Admin - Experiences</title></head>
<body>
    <h1>Admin Experiences</h1>
    <table>
        @if(isset($experiences))
            @foreach($experiences as $experience)
                <tr><td>{{ $experience->title_en }}</td></tr>
            @endforeach
        @endif
    </table>
</body>
</html>
