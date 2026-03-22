import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import DragBlocker from "@/components/layout/DragBlocker";

export const metadata: Metadata = {
  title: "LIKELION SYU",
  description: "멋쟁이사자처럼 14기 사이트",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
  },
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
        <DragBlocker />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
