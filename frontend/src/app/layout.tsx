import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "GouNow | Luxury Stays, Real Estate & Bespoke Experiences in El Gouna",
  description:
    "Discover curated luxury vacation rentals, waterfront lagoon chalets, yacht charters, and desert adventures in El Gouna, Red Sea, Egypt.",
  metadataBase: new URL("https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "GouNow Lifestyle - El Gouna",
    title: "GouNow | Luxury Stays, Real Estate & Bespoke Experiences in El Gouna",
    description:
      "Discover curated luxury vacation rentals, waterfront lagoon chalets, yacht charters, and desert adventures in El Gouna, Red Sea, Egypt.",
    url: "https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform",
    images: [
      {
        url: "/assets/images/logo.jpg",
        width: 800,
        height: 600,
        alt: "GouNow Lifestyle",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GouNow | Luxury Stays, Real Estate & Bespoke Experiences in El Gouna",
    description:
      "Discover curated luxury vacation rentals, waterfront lagoon chalets, yacht charters, and desert adventures in El Gouna, Red Sea, Egypt.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/assets/images/official-elgouna-icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GouNow Lifestyle",
    url: "https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform",
    logo: "https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform/assets/images/logo.jpg",
    description:
      "Bespoke vacation villa rentals, real estate sales, and yacht charters in El Gouna, Red Sea.",
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
    <html lang="en" dir="ltr" className="h-full bg-[#FAF8F5] scroll-smooth">
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
      <body className="min-h-full flex flex-col text-brand-brown bg-[#FAF8F5] antialiased selection:bg-brand-terracotta/20 selection:text-brand-terracotta font-sans">
        <LanguageProvider>{children}</LanguageProvider>

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
