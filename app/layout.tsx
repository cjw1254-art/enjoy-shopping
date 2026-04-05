import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enjoy your shopping! | AI 이너뷰티 도우미",
  description: "35~50 여성분들을 위한 AI 이너뷰티 쇼핑 도우미",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased bg-white">
        {children}
      </body>
    </html>
  );
}