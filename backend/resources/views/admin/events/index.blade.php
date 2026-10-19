<!DOCTYPE html>
<html>
<head><title>Admin - Events</title></head>
<body>
    <h1>Admin Events</h1>
    <table>
        @if(isset($events))
            @foreach($events as $event)
                <tr><td>{{ $event->title_en }}</td></tr>
            @endforeach
        @endif
    </table>
</body>
</html>
