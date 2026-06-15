// components/layout/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-12">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Left side - Copyright */}
          <div className="text-xs text-gray-400">
            © 2026 RelaunchAI. All rights reserved.
          </div>
          
          {/* Center - Status indicator (optional) */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">All systems operational</span>
          </div>
          
          {/* Right side - Links */}
          <div className="flex gap-8">
            <a 
              href="#" 
              className="text-xs text-gray-400 hover:text-gray-700 transition-all duration-200 hover:underline underline-offset-4"
            >
              About
            </a>
            <a 
              href="#" 
              className="text-xs text-gray-400 hover:text-gray-700 transition-all duration-200 hover:underline underline-offset-4"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="text-xs text-gray-400 hover:text-gray-700 transition-all duration-200 hover:underline underline-offset-4"
            >
              Terms
            </a>
            <a 
              href="#" 
              className="text-xs text-gray-400 hover:text-gray-700 transition-all duration-200 hover:underline underline-offset-4"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}