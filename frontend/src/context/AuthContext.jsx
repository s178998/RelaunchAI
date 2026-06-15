// context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

const authContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      // Decode JWT token to check expiration
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        
        if (Date.now() >= exp) {
          // Token expired
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setUser(null);
          window.location.href = '/login';
        }
      } catch (e) {
        console.error('Invalid token', e);
      }
    };
    
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      checkTokenExpiration();
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      console.log("AuthProvider: User loaded from localStorage", parsedUser);
    }
    
    // Check token expiration every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, []);

  function login(userData) {
    console.log("AuthProvider login called with:", userData);
    
    let userObject = null;
    
    if (userData.user) {
      userObject = userData.user;
    } else if (userData.id) {
      userObject = userData;
    } else if (userData.access_token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        userObject = JSON.parse(savedUser);
      }
    }
    
    if (userObject) {
      setUser(userObject);
      localStorage.setItem('user', JSON.stringify(userObject));
      console.log("User saved to localStorage:", userObject);
    }
    
    if (userData.access_token) {
      localStorage.setItem('access_token', userData.access_token);
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return (
    <authContext.Provider value={{ user, login, logout }}>
      {children}
    </authContext.Provider>
  );
}

export default authContext;