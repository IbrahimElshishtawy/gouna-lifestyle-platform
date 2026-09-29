<?php

// -------------------------------------------------------------
// GouNow - Static Site Exporter for GitHub Pages
// -------------------------------------------------------------

require __DIR__ . '/../vendor/autoload.php';

// Force environment variables for GitHub Pages
putenv('APP_ENV=production');
putenv('APP_DEBUG=false');
putenv('APP_URL=https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform');
$_ENV['APP_URL'] = 'https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform';
$_SERVER['APP_URL'] = 'https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

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
];

$baseUrl = 'https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform';

foreach ($routesToExport as $uri => $relativePath) {
    echo "Rendering route: $uri -> $relativePath\n";
    $request = Illuminate\Http\Request::create($uri, 'GET');
    $request->headers->set('HOST', 'ibrahimelshishtawy.github.io');
    $response = $kernel->handle($request);
    
    $content = $response->getContent();
    
    // Replace localhost occurrences with GitHub Pages base URL
    $content = str_replace('http://localhost', $baseUrl, $content);
    $content = str_replace('https://localhost', $baseUrl, $content);

    $targetFile = $distDir . '/' . $relativePath;
    @mkdir(dirname($targetFile), 0755, true);
    file_put_contents($targetFile, $content);
}

// 404 page (fallback to homepage)
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

echo "✅ Static export completed successfully in: $distDir\n";
