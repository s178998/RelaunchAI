// components/layout/Sidebar.jsx
import { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import authContext from "../../context/AuthContext";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useContext(authContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({
    insight: true,
    action: true,
    growth: true,
    profile: true,
    system: true,
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      if (user && user.id) {
        setCurrentUser(user);
      } else {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      }
    };
    loadUser();
  }, [user]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdown = (dropdown) => {
    if (!isCollapsed) {
      setOpenDropdowns(prev => ({
        ...prev,
        [dropdown]: !prev[dropdown]
      }));
    }
  };

  const handleLogout = () => {
    // Clear all auth data
    logout();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    // Optional: Clear onboarding data if you want fresh start on next login
    // But usually you want to keep profile data
    // localStorage.removeItem('user_profile');
    // if (currentUser?.id) {
    //   localStorage.removeItem(`onboarding_complete_${currentUser.id}`);
    //   localStorage.removeItem(`user_profile_${currentUser.id}`);
    // }
    
    // Redirect to landing page (public homepage)
    navigate('/');
  };

  const getUserInitials = () => {
    if (currentUser?.firstname && currentUser?.lastname) {
      return `${currentUser.firstname[0]}${currentUser.lastname[0]}`.toUpperCase();
    }
    if (currentUser?.firstname) {
      return currentUser.firstname[0].toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (currentUser?.firstname && currentUser?.lastname) {
      return `${currentUser.firstname} ${currentUser.lastname[0]}.`;
    }
    if (currentUser?.firstname) {
      return currentUser.firstname;
    }
    return 'User';
  };

  // Navigation items configuration
  const navItems = {
    insight: {
      title: 'INSIGHT',
      icon: '🔍',
      items: [
        { path: '/dashboard', name: 'Dashboard', icon: '📊' },
        { path: '/layoff-risk', name: 'Layoff Risk', icon: '⚠️' }
      ]
    },
    action: {
      title: 'ACTION',
      icon: '⚡',
      items: [
        { path: '/transition-hub', name: 'Transition Hub', icon: '🔄' },
        { path: '/job-matching', name: 'Job Matching', icon: '💼' }
      ]
    },
    growth: {
      title: 'GROWTH',
      icon: '🌱',
      items: [
        { path: '/skills-learning', name: 'Skills & Learning', icon: '📚' },
        { path: '/community', name: 'Community', icon: '👥' }
      ]
    },
    profile: {
      title: 'PROFILE',
      icon: '👤',
      items: [
        { path: '/profile', name: 'My Profile', icon: '👤' },
        { path: '/resume', name: 'Resume Builder', icon: '📄' }
      ]
    },
    system: {
      title: 'SYSTEM',
      icon: '⚙️',
      items: []
    }
  };

  return (
    <aside 
      className={`bg-[#0d0d0d] text-gray-400 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      
      {/* Logo Section */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} h-16 border-b border-gray-800`}>
        {!isCollapsed && (
          <div className="text-lg font-semibold tracking-tight">
            <span className="text-white">Relaunch</span>
            <span className="text-blue-500">AI</span>
          </div>
        )}
        {isCollapsed && (
          <div className="text-xl font-bold text-white">
            R
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-500 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* User Profile Section */}
      <div className={`${isCollapsed ? 'px-2 py-4' : 'px-4 py-4'} border-b border-gray-800`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium text-sm shadow-sm">
              {getUserInitials()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0d0d0d]"></div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {getUserName()}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser?.email?.split('@')[0] || 'user'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-800">
        <div className={`${isCollapsed ? 'px-2' : 'px-3'} space-y-4`}>
          
          {Object.entries(navItems).map(([key, section]) => (
            <div key={key} className="space-y-1">
              {/* Section Header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleDropdown(key)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
                >
                  <span>{section.title}</span>
                  <svg 
                    className={`w-3 h-3 transition-transform duration-200 ${openDropdowns[key] ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
              
              {/* Section Items */}
              <div className={`space-y-0.5 ${!isCollapsed && !openDropdowns[key] ? 'hidden' : ''}`}>
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg transition-all duration-200 text-sm group ${
                      isActive(item.path)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <span className={`${isCollapsed ? 'text-xl' : 'text-base'} ${isActive(item.path) ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <div className="pt-4 border-t border-gray-800">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'} w-full py-2 rounded-lg transition-all duration-200 text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 group`}
              title={isCollapsed ? "Logout" : ""}
            >
              <span className={`${isCollapsed ? 'text-xl' : 'text-base'} opacity-70 group-hover:opacity-100`}>
                ←
              </span>
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className={`${isCollapsed ? 'px-2 py-3' : 'px-4 py-3'} border-t border-gray-800 text-xs text-gray-600`}>
        <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <>
              <span>v1.0.0</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Online
              </span>
            </>
          )}
          {isCollapsed && (
            <span className="text-center">v1</span>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] rounded-xl p-5 max-w-sm w-full mx-4 border border-gray-800 shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="text-xl">←</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Logout</h3>
              <p className="text-gray-400 text-sm mb-5">
                Are you sure you want to logout?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;