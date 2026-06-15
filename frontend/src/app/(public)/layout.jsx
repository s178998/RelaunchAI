"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function PublicLayout({ children }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if we should hide the entire header
  const hideHeader = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Pricing", path: "/pricing" },
    { name: "Success Stories", path: "/success-stories" },
  ];

  const footerLinks = {
    Product: ["Features", "Pricing", "How It Works", "Success Stories"],
    Company: ["About", "Blog", "Careers", "Press"],
    Resources: ["Help Center", "Privacy", "Terms", "Contact"],
    Social: ["Twitter", "LinkedIn", "GitHub", "Discord"],
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navbar - Completely hidden on login/register pages */}
      {!hideHeader && (
        <header
          className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled
              ? "bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 shadow-lg"
              : "bg-transparent border-b border-gray-800/30"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="h-16 lg:h-20 flex items-center justify-between">

              {/* Logo */}
              <Link href="/" className="group flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  ReLaunchAI
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className="text-gray-300 hover:text-white transition-all duration-200 text-sm font-medium relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ))}
              </nav>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 rounded-lg hover:bg-white/5"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-800/50 animate-in slide-in-from-top-5 duration-200">
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="flex gap-3 pt-4 mt-2 border-t border-gray-800/50">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 px-4 py-2 text-center text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 px-4 py-2 text-center text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 relative">
        {children}
      </main>

      {/* Footer - Also hidden on login/register pages */}
      {!hideHeader && (
        <footer className="border-t border-gray-800/50 bg-gray-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16">

            {/* Top Section - Brand & Newsletter */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
              <div className="lg:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    ReLaunch
                  </span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Empowering tech professionals to navigate career transitions with confidence and clarity.
                </p>
                <div className="mt-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Subscribe to updates</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Email address"
                      className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    />
                    <button className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition">
                      →
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Links Columns */}
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <p className="text-sm font-semibold text-gray-300 mb-4">{category}</p>
                  <ul className="space-y-2">
                    {links.map((link) => (
                      <li key={link}>
                        <Link
                          href={`/${link.toLowerCase().replace(/ /g, "-")}`}
                          className="text-sm text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-500 text-center md:text-left">
                © 2026 ReLaunch. All rights reserved. Made with ❤️ for the tech community.
              </p>

              <div className="flex gap-6">
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-all duration-200 hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-all duration-200 hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-all duration-200 hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.44-.645 1.44-1.44s-.645-1.44-1.44-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-all duration-200 hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
