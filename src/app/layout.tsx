import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import Header from "./_components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "猫の健康ノート",
  description: "猫の健康記録を管理するアプリ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  return (
    <html lang="ja">
      <body>
        <div className="pawBg">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="paw">🐾</span>
          ))}
        </div>
        <div className="appWrapper">
          {session && <Header />}
          {children}
        </div>
      </body>
    </html>
  );
}
