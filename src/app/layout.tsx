import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// @ts-ignore
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lyr.AI",
  description: "An AI-powered lyrics and music analyzer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script id="spotify-sdk-ready" strategy="beforeInteractive">
          {`window.onSpotifyWebPlaybackSDKReady = window.onSpotifyWebPlaybackSDKReady || function() {};
          // Ensure a minimal handler exists before the Spotify SDK executes.`}
        </Script>
        <Script src="https://sdk.scdn.co/spotify-player.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
