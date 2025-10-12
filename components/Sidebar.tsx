"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // ✅ Close sidebar if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("button[aria-label='Toggle Navigation']")
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* ☰ Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition"
        aria-label="Toggle Navigation"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 📂 Sticky Sidebar */}
      <div
         ref={sidebarRef}
            className={`fixed top-0 left-0 h-screen bg-background shadow-lg z-40 w-64 p-6 flex flex-col space-y-6 transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >

        <h2 className="text-xl font-bold mb-4 text-foreground">📁 Navigation</h2>

        <nav className="flex flex-col space-y-4">
          <Link
            href="/"
            className="text-foreground hover:text-primary transition"
            onClick={() => setIsOpen(false)}
          >
            🏠 Dashboard
          </Link>

          <Link
            href="/admin/archives"
            className="text-foreground hover:text-primary transition"
            onClick={() => setIsOpen(false)}
          >
            📜 Archives
          </Link>
        </nav>

        <div className="mt-auto text-xs text-muted-foreground">
          © {new Date().getFullYear()} Issue Tracker
        </div>
      </div>

      {/* ✨ Overlay (click to close) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
