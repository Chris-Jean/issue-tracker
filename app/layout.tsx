"use client";

import localFont from "next/font/local";
import "./globals.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [, setTheme] = useState<string>("light");

  // ✅ Read theme from localStorage after mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, []);

  return (
    <html lang="en">
      <head>
        {/* ✅ Preload theme before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <ConvexProvider client={convex}>
        <Sidebar />
        <main className="pt-16 px-6 mx-auto max-w-[1200px]">{children}</main>
      </ConvexProvider>
      </body>
    </html>
  );
}
