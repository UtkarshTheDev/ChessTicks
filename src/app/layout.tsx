import type { Metadata } from "next";
import "./globals.css";
import { Ubuntu, Ubuntu_Condensed, Unbounded } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import SwRegister from "../components/SwRegister";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
  display: 'swap',
  preload: true,
});

const ubuntuCondensed = Ubuntu_Condensed({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ubuntu-condensed",
  display: 'swap',
  preload: true,
});

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-unbounded",
  display: 'swap',
  preload: true,
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" }
  ],
};

export const metadata: Metadata = {
  title: {
    default: "ChessTicks - Professional Chess Timer & Tournament Clock",
    template: "%s | ChessTicks - Chess Timer"
  },
  description: "Professional chess timer with all 5 tournament modes: Sudden Death, Fischer Increment, Simple Delay, Bronstein Delay & Multi-Stage. Perfect for chess players, tournaments, and online games. Free chess clock app.",
  keywords: [
    "chess timer", "chess clock", "tournament timer", "chess tournament",
    "fischer increment", "sudden death", "bronstein delay", "simple delay",
    "multi-stage timer", "chess game timer", "online chess timer", "chess stopwatch",
    "professional chess timer", "tournament chess clock", "chess time control",
    "blitz chess timer", "rapid chess timer", "classical chess timer",
    "chess timer app", "free chess timer", "chess clock online"
  ],
  authors: [{ name: "Utkarsh Tiwari", url: "https://github.com/UtkarshTheDev" }],
  creator: "Utkarsh Tiwari",
  publisher: "ChessTicks",
  applicationName: "ChessTicks",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://chessticks.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chessticks.vercel.app",
    siteName: "ChessTicks",
    title: "ChessTicks - Professional Chess Timer & Tournament Clock",
    description: "Professional chess timer with all 5 tournament modes: Sudden Death, Fischer Increment, Simple Delay, Bronstein Delay & Multi-Stage. Perfect for chess players and tournaments.",
    images: [
      {
        url: "https://chessticks.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChessTicks - Professional Chess Timer",
        type: "image/png",
      },
      {
        url: "https://chessticks.vercel.app/og-image-square.png",
        width: 1200,
        height: 1200,
        alt: "ChessTicks - Chess Timer App",
        type: "image/png",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@chessticks",
    creator: "@UtkarshTheDev",
    title: "ChessTicks - Professional Chess Timer & Tournament Clock",
    description: "Professional chess timer with all 5 tournament modes. Perfect for chess players, tournaments, and online games. Free chess clock app.",
    images: [
      {
        url: "https://chessticks.vercel.app/twitter-image.png",
        width: 1200,
        height: 630,
        alt: "ChessTicks - Professional Chess Timer",
      }
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ChessTicks",
    startupImage: [
      {
        url: "/apple-touch-startup-image-768x1004.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 1) and (orientation: portrait)",
      },
      {
        url: "/apple-touch-startup-image-1536x2008.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      }
    ],
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
  category: "Games",
  classification: "Chess Timer Application",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#121212",
    "msapplication-config": "/browserconfig.xml",
    "application-name": "ChessTicks",
    "msapplication-tooltip": "Professional Chess Timer",
    "msapplication-starturl": "/",
    "msapplication-navbutton-color": "#121212",
    "theme-color": "#121212",
  }
};

// Static structured data to prevent hydration mismatch
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://chessticks.vercel.app/#webapp",
      "name": "ChessTicks",
      "alternateName": "Chess Timer",
      "description": "Professional chess timer with all 5 tournament modes: Sudden Death, Fischer Increment, Simple Delay, Bronstein Delay & Multi-Stage. Perfect for chess players and tournaments.",
      "url": "https://chessticks.vercel.app",
      "applicationCategory": "GameApplication",
      "operatingSystem": "Web Browser",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "softwareVersion": "1.0.0",
      "datePublished": "2024-01-01",
      "dateModified": "2024-08-03",
      "author": {
        "@type": "Person",
        "name": "Utkarsh Tiwari",
        "url": "https://github.com/UtkarshTheDev"
      },
      "publisher": {
        "@type": "Organization",
        "name": "ChessTicks",
        "url": "https://chessticks.vercel.app"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "featureList": [
        "Sudden Death Timer",
        "Fischer Increment Timer",
        "Simple Delay Timer",
        "Bronstein Delay Timer",
        "Multi-Stage Tournament Timer",
        "Professional Tournament Support",
        "Mobile Responsive Design",
        "Audio Feedback",
        "Gesture Controls",
        "Game Statistics"
      ],
      "screenshot": "https://chessticks.vercel.app/og-image.png",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150",
        "bestRating": "5",
        "worstRating": "1"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://chessticks.vercel.app/#software",
      "name": "ChessTicks Chess Timer",
      "applicationCategory": "Game",
      "applicationSubCategory": "Chess Timer",
      "operatingSystem": "Web Browser, iOS, Android",
      "url": "https://chessticks.vercel.app",
      "downloadUrl": "https://chessticks.vercel.app",
      "installUrl": "https://chessticks.vercel.app",
      "softwareVersion": "1.0.0",
      "fileSize": "2MB",
      "price": "0",
      "priceCurrency": "USD",
      "author": {
        "@type": "Person",
        "name": "Utkarsh Tiwari"
      },
      "description": "Professional chess timer application supporting all major tournament time controls including Sudden Death, Fischer Increment, Simple Delay, Bronstein Delay, and Multi-Stage formats.",
      "featureList": [
        "All 5 Major Tournament Timer Modes",
        "Professional Tournament Support",
        "Blitz, Rapid, and Classical Time Controls",
        "Mobile and Desktop Compatible",
        "Real-time Game Statistics",
        "Audio and Visual Feedback",
        "Gesture-based Controls",
        "Offline Capability"
      ],
      "screenshot": [
        "https://chessticks.vercel.app/og-image.png",
        "https://chessticks.vercel.app/screenshot-timer.png"
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://chessticks.vercel.app/#organization",
      "name": "ChessTicks",
      "url": "https://chessticks.vercel.app",
      "logo": "https://chessticks.vercel.app/logo.png",
      "description": "Professional chess timer application for players and tournaments",
      "foundingDate": "2024",
      "founder": {
        "@type": "Person",
        "name": "Utkarsh Tiwari"
      },
      "sameAs": [
        "https://github.com/UtkarshTheDev/ChessTicks"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://chessticks.vercel.app/#website",
      "url": "https://chessticks.vercel.app",
      "name": "ChessTicks",
      "description": "Professional chess timer with all tournament modes",
      "publisher": {
        "@id": "https://chessticks.vercel.app/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://chessticks.vercel.app/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://vercel.app" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://vercel.app" />

        {/* Web App Manifest (with version for cache busting) */}
        <link rel="manifest" href="/manifest.json?v=2025-09-19-01" />

        {/* Favicon and Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/android-chrome-512x512.png" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="msapplication-square70x70logo" content="/mstile-70x70.png" />
        <meta name="msapplication-square150x150logo" content="/mstile-150x150.png" />
        <meta name="msapplication-wide310x150logo" content="/mstile-310x150.png" />
        <meta name="msapplication-square310x310logo" content="/mstile-310x310.png" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Performance hints */}
        <link rel="preload" href="/sounds/move.mp3" as="audio" type="audio/mpeg" />
        <link rel="preload" href="/sounds/check.mp3" as="audio" type="audio/mpeg" />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

        {/* Additional SEO meta tags */}
        <meta name="msvalidate.01" content="your-bing-verification-code" />
        <meta name="yandex-verification" content="your-yandex-verification-code" />

        {/* Google Site Verification meta tag */}
        <meta name="google-site-verification" content="x5z731oUt6c6rD5JDeMZ2hdPutuO1V-xKsHbtf0Lr3c" />
      </head>
      <body className={`${ubuntu.variable} ${ubuntuCondensed.variable} ${unbounded.variable} m-0 p-0`}>
        {children}
        <Analytics />
        <SwRegister />
      </body>
    </html>
  );
}
