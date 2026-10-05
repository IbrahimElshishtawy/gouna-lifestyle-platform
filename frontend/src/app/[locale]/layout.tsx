import type { Metadata } from "next";
import "../globals.css";
import Script from "next/script";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing, Locale } from "@/i18n/routing";
import { LanguageProvider } from "@/context/LanguageContext";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  const title = isAr
    ? "جو ناو | فلل فاخرة، عقارات وتجارب ويخوت حصرية في الجونة"
    : "GouNow | Luxury Stays, Real Estate & Bespoke Experiences in El Gouna";
  const description = isAr
    ? "اكتشف أرقى فلل العطلات، شاليهات البحيرات المائية، رحلات اليخوت الخاصة، ومغامرات صحراء الجونة بالبحر الأحمر، مصر."
    : "Discover curated luxury vacation rentals, waterfront lagoon chalets, yacht charters, and desert adventures in El Gouna, Red Sea, Egypt.";

  return {
    title,
    description,
    metadataBase: new URL("https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ar: "/ar",
        "x-default": "/en",
      },
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      siteName: isAr ? "جو ناو لايف ستايل - الجونة" : "GouNow Lifestyle - El Gouna",
      title,
      description,
      url: `https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform/${locale}`,
      images: [
        {
          url: "/assets/images/logo.jpg",
          width: 800,
          height: 600,
          alt: isAr ? "جو ناو لايف ستايل" : "GouNow Lifestyle",
        },
      ],
      locale: isAr ? "ar_EG" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.png", type: "image/png", sizes: "32x32" },
        { url: "/assets/images/official-elgouna-icon.png", type: "image/png", sizes: "192x192" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering in next-intl
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontClass = locale === "ar" ? "font-arabic" : "font-sans";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: locale === "ar" ? "جو ناو لايف ستايل" : "GouNow Lifestyle",
    url: `https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform/${locale}`,
    logo: "https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform/assets/images/logo.jpg",
    description:
      locale === "ar"
        ? "فلل عطلات فاخرة، بيع عقارات، ورحلات يخوت خاصة في الجونة، البحر الأحمر."
        : "Bespoke vacation villa rentals, real estate sales, and yacht charters in El Gouna, Red Sea.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "El Gouna",
      addressRegion: "Red Sea",
      addressCountry: "EG",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+201000000000",
      contactType: "customer service",
      areaServed: "EG",
      availableLanguage: ["English", "Arabic"],
    },
  };

  return (
    <html lang={locale} dir={dir} className="h-full bg-[#FAF8F5] scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Tajawal:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`min-h-full flex flex-col text-brand-brown bg-[#FAF8F5] antialiased selection:bg-brand-terracotta/20 selection:text-brand-terracotta ${fontClass}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LanguageProvider initialLocale={locale as Locale}>
            {children}
          </LanguageProvider>
        </NextIntlClientProvider>

        {/* Global Google Analytics 4 DataLayer Listener */}
        <Script id="ga-datalayer-setup" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            document.addEventListener('click', function(e) {
              var target = e.target.closest('[data-ga-event]');
              if (target) {
                var eventName = target.getAttribute('data-ga-event');
                var item = target.getAttribute('data-ga-item') || '';
                var category = target.getAttribute('data-ga-category') || 'interaction';
                var href = target.getAttribute('href') || '';
                window.dataLayer.push({
                  event: eventName,
                  timestamp: new Date().toISOString(),
                  item_name: item,
                  category: category,
                  href: href
                });
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
