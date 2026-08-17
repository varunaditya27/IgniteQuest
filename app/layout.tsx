import type { Metadata } from "next";
import { bodoniModa, anton, montserrat, archivo, jetbrainsMono } from "@/app/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "IgniteQuest — Python Arena",
  description: "A live, host-controlled Python game-show quiz.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${anton.variable} ${montserrat.variable} ${archivo.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
