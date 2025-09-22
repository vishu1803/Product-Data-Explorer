'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { SWRConfig } from 'swr';

const inter = Inter({ subsets: ["latin"] });

// ✅ Add fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SWRConfig
          value={{
            fetcher, // ✅ This was missing
            refreshInterval: 300000,
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            shouldRetryOnError: true,
            errorRetryCount: 3,
            errorRetryInterval: 5000,
            dedupingInterval: 2000,
          }}
        >
          <Header />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </SWRConfig>
      </body>
    </html>
  );
}
