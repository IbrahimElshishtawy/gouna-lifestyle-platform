<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>GouNow Platform &middot; Core API Engine</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #140E0C;
            --surface-dark: #1E1715;
            --surface-card: #281F1C;
            --brand-terracotta: #B35438;
            --brand-gold: #E5C39C;
            --text-light: #FAF8F5;
            --text-muted: #D1C4B9;
            --border-glass: rgba(255, 255, 255, 0.12);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-light);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background-image: 
                radial-gradient(circle at 50% 20%, rgba(179, 84, 56, 0.15) 0%, transparent 60%),
                radial-gradient(circle at 80% 80%, rgba(229, 195, 156, 0.08) 0%, transparent 50%);
        }
        .container {
            width: 100%;
            max-width: 820px;
            background: var(--surface-dark);
            border: 1px solid var(--border-glass);
            border-radius: 28px;
            padding: 40px 32px;
            box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.8);
            text-align: center;
            backdrop-filter: blur(16px);
        }
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 16px;
            border-radius: 9999px;
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #34D399;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 24px;
        }
        .pulse-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10B981;
            box-shadow: 0 0 10px #10B981;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
        }
        h1 {
            font-family: 'Playfair Display', serif;
            font-size: 38px;
            color: var(--text-light);
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }
        h1 span {
            color: var(--brand-gold);
            font-style: italic;
        }
        p.subtitle {
            font-size: 15px;
            color: var(--text-muted);
            line-height: 1.8;
            max-width: 600px;
            margin: 0 auto 32px;
            font-weight: 300;
        }
        .action-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        .btn-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: right;
            padding: 20px;
            border-radius: 18px;
            background: var(--surface-card);
            border: 1px solid var(--border-glass);
            text-decoration: none;
            color: var(--text-light);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-card:hover {
            transform: translateY(-3px);
            border-color: var(--brand-terracotta);
            box-shadow: 0 12px 30px -10px rgba(179, 84, 56, 0.3);
            background: #332724;
        }
        .btn-card .icon {
            font-size: 24px;
            margin-bottom: 12px;
        }
        .btn-card .title {
            font-size: 15px;
            font-weight: 700;
            color: var(--text-light);
            margin-bottom: 4px;
        }
        .btn-card .desc {
            font-size: 12px;
            color: var(--text-muted);
            line-height: 1.5;
        }
        .btn-primary {
            background: linear-gradient(135deg, var(--brand-terracotta), #933C24);
            border-color: rgba(255, 255, 255, 0.2);
        }
        .btn-primary:hover {
            background: linear-gradient(135deg, #C25E41, #9E4229);
        }
        .kpi-strip {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 12px;
            padding-top: 24px;
            border-top: 1px solid var(--border-glass);
        }
        .kpi-item {
            padding: 12px;
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.2);
        }
        .kpi-val {
            font-size: 20px;
            font-weight: 800;
            color: var(--brand-gold);
            font-family: monospace;
        }
        .kpi-lbl {
            font-size: 11px;
            color: var(--text-muted);
            margin-top: 2px;
        }
        .footer-note {
            margin-top: 24px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.4);
        }
        .footer-note a {
            color: var(--brand-gold);
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status-badge">
            <span class="pulse-dot"></span>
            <span>خادم واجهات برمجة التطبيقات (API Server) &middot; نشط ويعمل بكفاءة</span>
        </div>

        <h1>GouNow <span>El Gouna</span></h1>
        <p class="subtitle">
            خادم الباك إند المركزي لمنصة جو ناو لإدارة الفلل الفاخرة، واليخوت الخاصة، والفعاليات في الجونة.
            تطبيق الويب وتجربة المستخدم تعمل على تطبيق Next.js المنفصل.
        </p>

        <div class="action-grid">
            <a href="http://localhost:3000/ar" class="btn-card btn-primary">
                <span class="icon">🌐</span>
                <span class="title">فتح تطبيق الويب الرئيسي</span>
                <span class="desc">الواجهة الأمامية التفاعلية (Next.js Port 3000)</span>
            </a>

            <a href="http://localhost:3000/ar/admin" class="btn-card">
                <span class="icon">🛠️</span>
                <span class="title">لوحة تحكم المشرف (Admin)</span>
                <span class="desc">إدارة الحجوزات، الفلل، وتصدير البيانات</span>
            </a>

            <a href="/api/v1/stays" class="btn-card">
                <span class="icon">📡</span>
                <span class="title">واجهة الفلل والإقامات (API)</span>
                <span class="desc">استعلام مباشر لكتالوج العقارات في الجونة</span>
            </a>

            <a href="/api/v1/experiences" class="btn-card">
                <span class="icon">🛥️</span>
                <span class="title">واجهة التجارب واليخوت (API)</span>
                <span class="desc">استعلام رحلات جزر الطويلة والأنشطة البحرية</span>
            </a>
        </div>

        <div class="kpi-strip">
            <div class="kpi-item">
                <div class="kpi-val">{{ count($featuredRentals ?? []) + count($featuredSales ?? []) }}</div>
                <div class="kpi-lbl">فلل وعقارات معتمدة</div>
            </div>
            <div class="kpi-item">
                <div class="kpi-val">{{ count($featuredExperiences ?? []) }}</div>
                <div class="kpi-lbl">تجارب ويخوت نشطة</div>
            </div>
            <div class="kpi-item">
                <div class="kpi-val">{{ count($upcomingEvents ?? []) }}</div>
                <div class="kpi-lbl">فعاليات هذا الموسم</div>
            </div>
            <div class="kpi-item">
                <div class="kpi-val">v1.0</div>
                <div class="kpi-lbl">إصدار الـ API</div>
            </div>
        </div>

        <div class="footer-note">
            &copy; {{ date('Y') }} GouNow Lifestyle &amp; Real Estate Management Ltd. Red Sea, El Gouna.
        </div>
    </div>
</body>
</html>
