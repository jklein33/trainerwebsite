import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Nav } from "@/components/nav";

const GOOGLE_TAG_ID = "AW-18311040389";

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
