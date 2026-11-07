import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Nav } from "@/components/nav";

import { GOOGLE_TAG_ID } from "@/lib/analytics";

// Optional Google Tag Manager container (e.g. GTM-XXXXXXX). When set, GTM loads
// on every page and can trigger tags off the dataLayer events in lib/analytics.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

const fkGrotesk = localFont({
  src: [
    {
      path: "../fonts/FK Grotesk Trial/FKGroteskTrial-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/FK Grotesk Trial/FKGroteskTrial-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/FK Grotesk Trial/FKGroteskTrial-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/FK Grotesk Trial/FKGroteskTrial-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/FK Grotesk Trial/FKGroteskTrial-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/FK Grotesk Trial/FKGroteskTrial-Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../fonts/FK Grotesk Trial/FKGroteskTrial-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/FK Grotesk Trial/FKGroteskTrial-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-fk-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DAWG STRENGTH - Find the Dawg in You",
  description: "Become the excellent man you were born to be.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_TAG_ID}');
          `}
        </Script>
        {GTM_ID && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `}
          </Script>
        )}
        <Script id="mouseflow-loader" strategy="afterInteractive">
          {`
            window._mfq = window._mfq || [];
            (function() {
              var mf = document.createElement("script");
              mf.type = "text/javascript"; mf.defer = true;
              mf.src = "//cdn.mouseflow.com/projects/3c0f05ad-75b6-4ba0-9516-57f39c535337.js";
              document.getElementsByTagName("head")[0].appendChild(mf);
            })();
          `}
        </Script>
      </head>
      <body
        className={`${fkGrotesk.variable} font-sans antialiased`}
      >
        <Nav />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
