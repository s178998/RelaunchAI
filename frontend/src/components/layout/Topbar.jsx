"use client";
// components/layout/Topbar.jsx
import { useState, useEffect, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import authContext from "../../context/AuthContext";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useContext(authContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Load user data
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
    
    // Load notifications
    const savedNotifications = localStorage.getItem('job_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, [user]);

  const getTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/layoff-risk":
        return "Layoff Risk";
      case "/transition-hub":
        return "Transition Hub";
      case "/job-matching":
        return "Job Matching";
      case "/skills-learning":
        return "Skills & Learning";
      case "/community":
        return "Community";
      case "/profile":
        return "Profile";
      case "/settings":
        return "Settings";
      case "/resume":
        return "Resume Builder";
      default:
        return "Dashboard";
    }
  };

  const getUserInitials = () => {
    if (currentUser?.firstname && currentUser?.lastname) {
      return `${currentUser.firstname[0]}${currentUser.lastname[0]}`.toUpperCase();
    }
    if (currentUser?.firstname) {
      return currentUser.firstname[0].toUpperCase();
    }
    return "U";
  };

  const getUserName = () => {
    if (currentUser?.firstname && currentUser?.lastname) {
      return `${currentUser.firstname} ${currentUser.lastname[0]}.`;
    }
    if (currentUser?.firstname) {
      return currentUser.firstname;
    }
    return "User";
  };

  const getUserRole = () => {
    const userId = currentUser?.id;
    if (userId) {
      const profile = localStorage.getItem(`user_profile_${userId}`);
      if (profile) {
        const parsedProfile = JSON.parse(profile);
        return parsedProfile.role || "Professional";
      }
    }
    return "Professional";
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const markNotificationAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('job_notifications', JSON.stringify(updated));
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case "application": return "📧";
      case "interview": return "🎉";
      case "rejection": return "📫";
      case "offer": return "🎊";
      default: return "🔔";
    }
  };

  return (
    <header className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40">
      {/* LEFT - Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          {getTitle()}
        </h2>
      </div>

      {/* RIGHT - Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* SEARCH BAR */}
        <div className="relative hidden lg:block">
          <input
            type="text"
            placeholder="Search..."
            className="
              w-72
              bg-gray-50
              border border-gray-200
              rounded-full
              pl-10 pr-4 py-2
              text-sm
              text-gray-900
              placeholder:text-gray-400
              focus:outline-none
              focus:bg-white
              focus:border-gray-300
              focus:ring-1
              focus:ring-blue-500
              transition-all
            "
          />
          <div className="absolute left-3.5 top-2.5 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* NOTIFICATIONS DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="
              relative
              h-9 w-9
              rounded-full
              bg-gray-50
              border border-gray-200
              hover:bg-gray-100
              transition-all
              flex items-center justify-center
              text-gray-600
            "
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200 font-semibold text-gray-900 sticky top-0 bg-white">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs text-gray-500">{unreadCount} unread</span>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    <span className="text-3xl mb-2 block">🔔</span>
                    No notifications yet
                    <p className="text-xs mt-1">Apply to jobs to get updates</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${!notif.read ? 'bg-blue-50' : ''}`}
                      onClick={() => markNotificationAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{notif.subject}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* USER MENU DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-gray-50 transition-all cursor-pointer group"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-semibold text-sm text-white shadow-sm">
              {getUserInitials()}
            </div>
            <div className="hidden sm:block leading-tight text-left">
              <p className="text-sm font-semibold text-gray-900">{getUserName()}</p>
              <p className="text-xs text-gray-500">{getUserRole()}</p>
            </div>
            <svg className="hidden sm:block w-4 h-4 text-gray-400 group-hover:text-gray-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">{getUserName()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{currentUser?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">{getUserRole()}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push('/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Profile
                  </button>
                  
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}