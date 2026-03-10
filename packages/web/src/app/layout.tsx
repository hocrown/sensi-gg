import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'SENSI.GG — PUBG Setup Database',
  description: 'PUBG 감도, 장비, 그래픽, 꿀팁을 공유하고 검색하세요.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-night-indigo text-cloud-white font-sans antialiased">
        <Navbar />
        <main className="px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
