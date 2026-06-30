// src/hooks/useSessionTimeout.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useSessionTimeout = () => {
  const navigate = useNavigate();
  const checkInterval = 3600000; // Check every minute
  useEffect(() => {
    const checkSession = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/check-session`, { credentials: 'include' });
      if (response.status === 401) {
        alert("Your session has expired. You will be logged out.");
        sessionStorage.clear(); // Clear session data
        navigate("/login"); // Redirect to login page
      }
    };
    const interval = setInterval(checkSession, checkInterval);
    return () => clearInterval(interval);
  }, [navigate]);
};

export default useSessionTimeout;
