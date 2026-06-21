// frontend/src/components/AuthGuard.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthGuard({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user')
      if (!token || !user) {
        navigate('/login', { replace: true });
      }
    };
    
    checkAuth();
    
    // Optional: Check token expiration periodically
    const interval = setInterval(checkAuth, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [navigate]);

  return children;
}