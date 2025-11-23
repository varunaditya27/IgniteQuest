import type { Metadata } from "next";
import { playfair, montserrat, sourceSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "IgniteQuest",
  description: "The Interactive Quiz Arena",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable} ${sourceSans.variable}`}>
      <body className="antialiased bg-royal-black text-ivory-white font-source-sans">
        {children}
      </body>
    </html>
  );
}
