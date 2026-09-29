<?php

// -------------------------------------------------------------
// GouNow - Comprehensive Static Site Exporter for GitHub Pages
// -------------------------------------------------------------

require __DIR__ . '/../vendor/autoload.php';

$baseUrl = 'https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform';

putenv('APP_ENV=production');
putenv('APP_DEBUG=false');
putenv("APP_URL=$baseUrl");
$_ENV['APP_URL'] = $baseUrl;
$_SERVER['APP_URL'] = $baseUrl;

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

$distDir = __DIR__ . '/../dist';
@mkdir($distDir, 0755, true);

// Clean dist directory
$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($distDir, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::CHILD_FIRST
);
foreach ($files as $fileinfo) {
    $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
    $todo($fileinfo->getRealPath());
}

$routesToExport = [
    '/' => 'index.html',
    '/stays' => 'stays/index.html',
    '/experiences' => 'experiences/index.html',
    '/admin/login' => 'admin/login/index.html',
    '/admin/login' => 'admin/index.html', // Also export at /admin/index.html
];

// Add all property pages dynamically
$properties = \App\Models\Property::all();
foreach ($properties as $prop) {
    $routesToExport['/stays/' . $prop->slug] = 'stays/' . $prop->slug . '/index.html';
    $routesToExport['/properties/' . $prop->slug] = 'properties/' . $prop->slug . '/index.html';
}

// Add all experience pages dynamically
$experiences = \App\Models\Experience::all();
foreach ($experiences as $exp) {
    $routesToExport['/experiences/' . $exp->slug] = 'experiences/' . $exp->slug . '/index.html';
}

echo "Starting export of " . count($routesToExport) . " public routes...\n";

foreach ($routesToExport as $uri => $relativePath) {
    echo "Rendering: $uri -> $relativePath\n";
    $request = Illuminate\Http\Request::create($uri, 'GET');
    $request->headers->set('HOST', 'ibrahimelshishtawy.github.io');
    $response = $kernel->handle($request);
    
    $content = $response->getContent();
    
    // Replace any remaining localhost occurrences with GitHub Pages base URL
    $content = str_replace('http://localhost', $baseUrl, $content);
    $content = str_replace('https://localhost', $baseUrl, $content);

    $targetFile = $distDir . '/' . $relativePath;
    @mkdir(dirname($targetFile), 0755, true);
    file_put_contents($targetFile, $content);
}

// Export Admin Dashboard Preview for demo
echo "Rendering Admin Dashboard preview...\n";
$admin = \App\Models\User::where('email', 'admin@gounow.com')->first();
if ($admin) {
    auth()->login($admin);
    $req = Illuminate\Http\Request::create('/admin', 'GET');
    $req->headers->set('HOST', 'ibrahimelshishtawy.github.io');
    $res = $kernel->handle($req);
    $content = $res->getContent();
    $content = str_replace('http://localhost', $baseUrl, $content);
    $content = str_replace('https://localhost', $baseUrl, $content);
    
    @mkdir($distDir . '/admin/dashboard', 0755, true);
    file_put_contents($distDir . '/admin/dashboard/index.html', $content);
}

// 404 page (friendly fallback)
copy($distDir . '/index.html', $distDir . '/404.html');

// Copy public assets
$publicDir = __DIR__ . '/../public';

function copyDir($src, $dst) {
    if (!is_dir($src)) return;
    @mkdir($dst, 0755, true);
    $dir = opendir($src);
    while (false !== ($file = readdir($dir))) {
        if (($file != '.') && ($file != '..')) {
            if (is_dir($src . '/' . $file)) {
                copyDir($src . '/' . $file, $dst . '/' . $file);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

copyDir($publicDir . '/assets', $distDir . '/assets');
copyDir($publicDir . '/build', $distDir . '/build');
if (file_exists($publicDir . '/robots.txt')) {
    copy($publicDir . '/robots.txt', $distDir . '/robots.txt');
}
if (file_exists($publicDir . '/favicon.ico')) {
    copy($publicDir . '/favicon.ico', $distDir . '/favicon.ico');
}

// Add .nojekyll so GitHub Pages does not ignore underscore files
file_put_contents($distDir . '/.nojekyll', '');

echo "✅ Comprehensive export completed! Exported all pages, stays, experiences and admin panels.\n";
