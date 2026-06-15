import type { Metadata } from "next";
import { Assistant, Heebo } from "next/font/google";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-assistant",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "מסע אל האופק — הרשמה",
  description:
    "המסע שלך אחרי השחרור, מתחיל כאן. תוכנית לצעירות וצעירים אחרי שירות צבאי ולאומי — שנה של צמיחה, חברּות ומשמעות.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${assistant.variable} ${heebo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
