"use client";

import localFont from "next/font/local";
import "./globals.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import DevFAB from "@/components/dev/DevFAB";

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
}: Readonly<{ children: React.ReactNode }>) {
  const [theme, setTheme] = useState("light");

  // ✅ Read theme safely from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) {
        setTheme(stored);
        document.documentElement.classList.toggle("dark", stored === "dark");
      } else {
        // fallback: follow system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const defaultTheme = prefersDark ? "dark" : "light";
        setTheme(defaultTheme);
        document.documentElement.classList.toggle("dark", defaultTheme === "dark");
      }
    } catch (err) {
      console.warn("Theme load error:", err);
    }
  }, []);

  // ✅ Update localStorage whenever theme changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

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
          <DevFAB />
        </ConvexProvider>
      </body>
    </html>
  );
}
