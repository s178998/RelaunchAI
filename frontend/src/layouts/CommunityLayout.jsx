// layouts/CommunityLayout.jsx
import { Outlet, Link } from "react-router-dom";
import { useState } from "react";

export default function CommunityLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* Community Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/community/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-semibold text-gray-900">ReLaunch Community</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/community/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link to="/community/feed" className="text-sm text-gray-600 hover:text-gray-900">Feed</Link>
              <Link to="/community/groups" className="text-sm text-gray-600 hover:text-gray-900">Groups</Link>
              <Link to="/community/events" className="text-sm text-gray-600 hover:text-gray-900">Events</Link>
              <Link to="/community/jobs" className="text-sm text-gray-600 hover:text-gray-900">Job Board</Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                J
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-900">John</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Community Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">
              © 2026 ReLaunch Community. Supporting tech professionals worldwide.
            </p>
            <div className="flex gap-6">
              <Link to="/community/guidelines" className="text-xs text-gray-400 hover:text-gray-600">Guidelines</Link>
              <Link to="/community/safety" className="text-xs text-gray-400 hover:text-gray-600">Safety</Link>
              <Link to="/community/help" className="text-xs text-gray-400 hover:text-gray-600">Help</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}