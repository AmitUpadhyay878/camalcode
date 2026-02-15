import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ReactQueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "CamalCode - AI Code Review Platform",
    description: "CamalCode is an AI-powered code review platform that helps developers improve their code quality and productivity. Try it for free today!",
  openGraph: {
    title: "CamalCode - AI Code Review Platform",
    description: "CamalCode is an AI-powered code review platform that helps developers improve their code quality and productivity.",
    url: "https://camalcode.com",
    siteName: "CamalCode",
    images: [
      {
        url: "https://camalcode.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "CamalCode Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CamalCode - AI Code Review Platform",
    description: "CamalCode is an AI-powered code review platform that helps developers improve their code quality and productivity. Try it for free today!",
    images: ["https://camalcode.com/og-image.png"],
  },
  alternates: {
    canonical: "https://camalcode.com",
  },
  icons: {
    icon: "/favicon.ico",
  },
robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  authors: [
    {
      name: "CamalCode Team",
      url: "https://camalcode.com",
    },
  ],
  publisher: "CamalCode",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
