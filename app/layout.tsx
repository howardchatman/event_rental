import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lolita Harris Event Rentals – Elegant Wedding & Event Rentals",
  description:
    "Curated wedding and event rentals by Lolita Harris. Browse chairs, tables, linens, arches, and tabletop decor for your perfect celebration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-ivory text-charcoal`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
