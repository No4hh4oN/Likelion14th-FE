// app/(public)/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "LIKELION SYU",
  description: "멋쟁이사자처럼 14기 사이트",
};

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
});

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
