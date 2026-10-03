<?php

use App\Models\Event;
use App\Models\Experience;
use App\Models\Property;
use App\Models\User;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;

// -------------------------------------------------------------
// GouNow - Complete Static Site Exporter for GitHub Pages
// -------------------------------------------------------------

require __DIR__.'/../vendor/autoload.php';

$baseUrl = 'https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform';

putenv('APP_ENV=production');
putenv('APP_DEBUG=false');
putenv("APP_URL=$baseUrl");
$_ENV['APP_URL'] = $baseUrl;
$_SERVER['APP_URL'] = $baseUrl;

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$distDir = dirname(__DIR__, 2).'/dist-static';
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

// Ensure database is seeded with admin
$admin = User::where('email', 'admin@gounow.com')->first();
if (! $admin) {
    Artisan::call('db:seed', ['--force' => true]);
    $admin = User::where('email', 'admin@gounow.com')->first();
}

$routesToExport = [];

// 1. Add all static GET routes from web.php
$allRoutes = Route::getRoutes()->get('GET');
foreach ($allRoutes as $uri => $route) {
    if (str_contains($uri, '{')) {
        continue;
    }
    if (str_starts_with($uri, 'sanctum/')) {
        continue;
    }
    if (str_starts_with($uri, '_ignition/')) {
        continue;
    }
    if ($uri === 'up' || $uri === 'robots.txt' || $uri === 'sitemap.xml') {
        continue;
    }

    $cleanUri = '/'.trim($uri, '/');
    if ($cleanUri === '/') {
        $routesToExport[$cleanUri] = 'index.html';
    } else {
        $routesToExport[$cleanUri] = trim($cleanUri, '/').'/index.html';
    }
}

// 2. Add all Properties (Stays, Properties & Checkout)
$properties = Property::all();
foreach ($properties as $prop) {
    $routesToExport['/stays/'.$prop->slug] = 'stays/'.$prop->slug.'/index.html';
    $routesToExport['/properties/'.$prop->slug] = 'properties/'.$prop->slug.'/index.html';
    $routesToExport['/checkout/'.$prop->slug] = 'checkout/'.$prop->slug.'/index.html';
    $routesToExport['/admin/properties/'.$prop->id.'/edit'] = 'admin/properties/'.$prop->id.'/edit/index.html';
}

// 3. Add all Experiences
$experiences = Experience::all();
foreach ($experiences as $exp) {
    $routesToExport['/experiences/'.$exp->slug] = 'experiences/'.$exp->slug.'/index.html';
    $routesToExport['/admin/experiences/'.$exp->id.'/edit'] = 'admin/experiences/'.$exp->id.'/edit/index.html';
}

// 4. Add all Events
$events = Event::all();
foreach ($events as $event) {
    $routesToExport['/admin/events/'.$event->id.'/edit'] = 'admin/events/'.$event->id.'/edit/index.html';
}

// 5. Ensure admin login and admin root exist explicitly
$routesToExport['/admin/login'] = 'admin/login/index.html';
$routesToExport['/admin'] = 'admin/index.html';

echo 'Total unique routes identified for export: '.count($routesToExport)."\n";

$exportedCount = 0;

foreach ($routesToExport as $uri => $relativePath) {
    $request = Request::create($uri, 'GET');
    $app->instance('request', $request);
    URL::forceRootUrl($baseUrl);
    URL::forceScheme('https');

    // If admin route, authenticate as admin so the full dashboard/CRUD views render
    if (str_starts_with($uri, '/admin') && $uri !== '/admin/login' && $admin) {
        auth()->login($admin);
    } else {
        auth()->logout();
    }

    try {
        $response = $kernel->handle($request);
        $status = $response->getStatusCode();

        // If redirected (e.g. guest redirected to login), follow or export
        if ($status >= 300 && $status < 400) {
            // If redirected to login, render login page
            $targetUrl = $response->headers->get('Location');
            $loginReq = Request::create('/admin/login', 'GET');
            $app->instance('request', $loginReq);
            $response = $kernel->handle($loginReq);
            $status = $response->getStatusCode();
        }

        if ($status >= 400) {
            echo "❌ ERROR: $uri returned HTTP $status! Skipping to avoid saving error page.\n";

            continue;
        }

        $content = $response->getContent();

        // Replace absolute local paths with full GitHub Pages base URL
        $content = str_replace(['http://localhost', 'https://localhost'], $baseUrl, $content);

        // Ensure ALL links to domain include /gouna-lifestyle-platform
        $content = str_replace(
            ['https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform', 'http://ibrahimelshishtawy.github.io/gouna-lifestyle-platform'],
            '___REPO_BASE___',
            $content
        );
        $content = str_replace(
            ['https://ibrahimelshishtawy.github.io', 'http://ibrahimelshishtawy.github.io'],
            '___REPO_BASE___',
            $content
        );
        $content = str_replace('___REPO_BASE___', $baseUrl, $content);

        // Remove any accidental duplicate repository prefix
        $content = str_replace('/gouna-lifestyle-platform/gouna-lifestyle-platform', '/gouna-lifestyle-platform', $content);

        // Fix any relative href="/..." or src="/..." or action="/..." that missing repository name
        $content = preg_replace('/href="\/([^\/"])/', 'href="'.$baseUrl.'/$1', $content);
        $content = preg_replace('/src="\/([^\/"])/', 'src="'.$baseUrl.'/$1', $content);
        $content = preg_replace('/action="\/([^\/"])/', 'action="'.$baseUrl.'/$1', $content);

        // Smart Form Interceptor for GitHub Pages (avoids 405/404 on POST forms)
        $formInterceptor = <<<HTML
<script>
    document.addEventListener('submit', function(e) {
        var form = e.target;
        var method = (form.getAttribute('method') || 'GET').toUpperCase();
        var action = form.getAttribute('action') || '';
        if (method === 'POST') {
            e.preventDefault();
            if (action.includes('inquire') || form.querySelector('[name="message"]')) {
                var name = form.querySelector('[name="name"]')?.value || 'Guest';
                var msg = form.querySelector('[name="message"]')?.value || 'Inquiring about stays and experiences in El Gouna';
                var phone = form.querySelector('[name="phone"]')?.value || '';
                var text = encodeURIComponent("Hello GouNow VIP Concierge, my name is " + name + (phone ? " (" + phone + ")" : "") + ".\n" + msg);
                window.open("https://wa.me/201000000000?text=" + text, "_blank");
                alert("Thank you " + name + "! Connecting you directly to the El Gouna VIP Concierge desk via WhatsApp.");
            } else if (action.includes('checkout') || action.includes('process')) {
                var text = encodeURIComponent("Hello GouNow VIP Concierge, I would like to confirm my booking reservation in El Gouna.");
                window.open("https://wa.me/201000000000?text=" + text, "_blank");
                alert("Connecting you to GouNow Reservations via WhatsApp to confirm your booking dates.");
            } else if (action.includes('logout') || action.includes('login')) {
                window.location.href = '$baseUrl/admin/';
            }
        }
    });
</script>
HTML;
        $content = str_replace('</body>', $formInterceptor."\n</body>", $content);

        // Write index.html
        $targetFile = $distDir.'/'.$relativePath;
        @mkdir(dirname($targetFile), 0755, true);
        file_put_contents($targetFile, $content);

        // Also write .html sibling (e.g. stays.html as well as stays/index.html) for direct URLs
        if ($relativePath !== 'index.html' && str_ends_with($relativePath, '/index.html')) {
            $htmlSibling = $distDir.'/'.substr($relativePath, 0, -11).'.html';
            file_put_contents($htmlSibling, $content);
        }

        $exportedCount++;
        echo "[$exportedCount] Exported: $uri -> $relativePath\n";
    } catch (Throwable $e) {
        echo "⚠️ Skipping $uri due to exception: ".$e->getMessage()."\n";
    }
}

// 404 page with intelligent client-side redirect for GitHub Pages
$fallbackContent = file_get_contents($distDir.'/index.html');
$spaRedirectScript = <<<'HTML'
<script>
    (function() {
        var path = window.location.pathname;
        var search = window.location.search;
        var hash = window.location.hash;
        var repoPrefix = '/gouna-lifestyle-platform';
        
        // 1. If accessed without repository prefix (e.g. ibrahimelshishtawy.github.io/stays)
        if (!path.startsWith(repoPrefix)) {
            window.location.replace(repoPrefix + (path === '/' ? '' : path) + search + hash);
            return;
        }
        
        // 2. If accessed with query params on a folder without trailing slash (e.g. /gouna-lifestyle-platform/stays?listing_type=rent)
        var subPath = path.substring(repoPrefix.length);
        if (subPath && !subPath.endsWith('/') && !subPath.endsWith('.html')) {
            window.location.replace(repoPrefix + subPath + '/' + search + hash);
            return;
        }
    })();
</script>
HTML;

$fallbackContent = str_replace('</head>', $spaRedirectScript."\n</head>", $fallbackContent);
file_put_contents($distDir.'/404.html', $fallbackContent);

// Admin dashboard alias
if (file_exists($distDir.'/admin/index.html')) {
    @mkdir($distDir.'/admin/dashboard', 0755, true);
    copy($distDir.'/admin/index.html', $distDir.'/admin/dashboard/index.html');
    copy($distDir.'/admin/index.html', $distDir.'/admin/dashboard.html');
}

// Copy public assets
$publicDir = __DIR__.'/../public';

function copyDir($src, $dst)
{
    if (! is_dir($src)) {
        return;
    }
    @mkdir($dst, 0755, true);
    $dir = opendir($src);
    while (false !== ($file = readdir($dir))) {
        if (($file != '.') && ($file != '..')) {
            if (is_dir($src.'/'.$file)) {
                copyDir($src.'/'.$file, $dst.'/'.$file);
            } else {
                copy($src.'/'.$file, $dst.'/'.$file);
            }
        }
    }
    closedir($dir);
}

copyDir($publicDir.'/assets', $distDir.'/assets');
copyDir($publicDir.'/build', $distDir.'/build');
if (file_exists($publicDir.'/robots.txt')) {
    copy($publicDir.'/robots.txt', $distDir.'/robots.txt');
}
if (file_exists($publicDir.'/favicon.ico')) {
    copy($publicDir.'/favicon.ico', $distDir.'/favicon.ico');
}
try {
    $sitemapReq = Request::create('/sitemap.xml', 'GET');
    $sitemapRes = $kernel->handle($sitemapReq);
    file_put_contents($distDir.'/sitemap.xml', $sitemapRes->getContent());
} catch (Throwable $e) {
}

// Add .nojekyll
file_put_contents($distDir.'/.nojekyll', '');

echo "\n🎉 Export finished! Successfully exported $exportedCount pages with full assets.\n";
