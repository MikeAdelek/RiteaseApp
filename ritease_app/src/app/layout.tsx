import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PDFErrorBoundary } from "@/Components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Document Signer & Annotation Tool",
  description:
    "single-page document signer and annotation tool that allows users to work with PDF documents."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true} data-qb-installed="true">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PDFErrorBoundary>{children}</PDFErrorBoundary>
      </body>
    </html>
  );
}
