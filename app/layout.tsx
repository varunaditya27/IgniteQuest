import type { Metadata } from "next";
import { bodoni, anton, montserrat, archivo } from "./fonts";
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
    <html lang="en" className={`${bodoni.variable} ${anton.variable} ${montserrat.variable} ${archivo.variable}`}>
      <body className="antialiased bg-stage-black text-champagne font-archivo">
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
