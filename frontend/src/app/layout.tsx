import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@solana/wallet-adapter-react-ui/styles.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Civic Echo — Decentralized Civic Reporting",
    template: "%s | Civic Echo",
  },
  description:
    "Decentralized anonymous civic reporting on Solana — amplify your community's voice across Nepal. Report issues, echo support, and track petitions.",
  keywords: ["civic reporting", "Nepal", "Solana", "blockchain", "anonymous", "whistleblowing", "petition", "community"],
  authors: [{ name: "Civic Echo Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://civicecho.vercel.app",
    siteName: "Civic Echo",
    title: "Civic Echo — Decentralized Civic Reporting on Solana",
    description: "Report civic issues anonymously, echo community support, and escalate petitions on-chain. Built for Nepal on Solana.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Civic Echo — Decentralized Civic Reporting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Civic Echo — Decentralized Civic Reporting",
    description: "Report civic issues anonymously, echo community support, and escalate petitions on-chain.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  metadataBase: new URL("https://civicecho.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
