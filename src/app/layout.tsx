import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/UserHeader";

export const metadata: Metadata = {
  title: "BookIndoor",
  description: "Book indoor grounds easily",
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen w-full flex flex-col bg-[#fcfdfc] text-slate-900 overflow-x-hidden font-sans">
        {/* Header (fixed optional) */}
        <Header />

        {/* ✅ Full-width, full-height main content */}
        <main className="flex-1 w-full">
          {children}
          {modal}
        </main>

        {/* Footer always at the bottom */}
        <footer className="w-full bg-green-100 text-center py-4 text-sm text-green-800 border-t border-green-200">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">BookIndoor</span>. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
