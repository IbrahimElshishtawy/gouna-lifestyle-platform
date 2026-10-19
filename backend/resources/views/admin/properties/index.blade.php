<!DOCTYPE html>
<html>
<head><title>Admin - Properties</title></head>
<body>
    <h1>Property Inventory &amp; Stays</h1>
    <table>
        @foreach($properties as $property)
            <tr>
                <td>{{ $property->title_en }}</td>
                <td><a href="{{ route('admin.properties.edit', $property) }}">Edit</a></td>
            </tr>
        @endforeach
    </table>
</body>
</html>
