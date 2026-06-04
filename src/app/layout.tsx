import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/UserHeader";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BookIndoor | Premium Arena Booking",
  description: "Discover, book, and compete in the city's finest private arenas.",
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen w-full flex flex-col overflow-x-hidden font-sans bg-slate-50 selection:bg-emerald-500/30">
        {/* Header (fixed optional) */}
        <Header />

        {/* Full-width, full-height main content */}
        <main className="flex-1 w-full pt-20">
          {children}
          {modal}
        </main>

        {/* Premium Footer */}
        <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-400 mt-auto">
          <div className="container mx-auto px-6 py-12 lg:px-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Brand */}
              <div className="flex flex-col space-y-4">
                <span className="text-2xl font-black font-outfit text-white tracking-tighter flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="text-white text-lg">B</span>
                  </div>
                  BookIndoor
                </span>
                <p className="text-sm text-slate-500 max-w-sm">
                  The ultimate platform for discovering and booking premium indoor sports arenas. Elevate your game today.
                </p>
              </div>

              {/* Quick Links */}
              <div className="flex flex-col space-y-4">
                <h4 className="text-white font-bold font-outfit uppercase tracking-widest text-xs">Explore</h4>
                <div className="flex flex-col space-y-2 text-sm">
                  <Link href="/user" className="hover:text-emerald-400 transition-colors">Find Arenas</Link>
                  <Link href="/booking" className="hover:text-emerald-400 transition-colors">My Bookings</Link>
                  <Link href="#" className="hover:text-emerald-400 transition-colors">Partnerships</Link>
                </div>
              </div>

              {/* Legal & Support */}
              <div className="flex flex-col space-y-4">
                <h4 className="text-white font-bold font-outfit uppercase tracking-widest text-xs">Support</h4>
                <div className="flex flex-col space-y-2 text-sm">
                  <Link href="#" className="hover:text-emerald-400 transition-colors">Help Center</Link>
                  <Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
                  <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
              <p>© {new Date().getFullYear()} BookIndoor. All rights reserved.</p>
              <div className="flex space-x-6">
                <Link href="#" className="hover:text-emerald-400 transition-colors">Twitter</Link>
                <Link href="#" className="hover:text-emerald-400 transition-colors">Instagram</Link>
                <Link href="#" className="hover:text-emerald-400 transition-colors">LinkedIn</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
