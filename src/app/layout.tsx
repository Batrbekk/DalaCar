import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { BottomNav } from "@/components/client/BottomNav";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "DalaCar - Автомобили в Казахстане",
  description: "Покупка автомобилей в кредит и за наличные",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <BottomNav />
        </SessionProvider>
      </body>
    </html>
  );
}
