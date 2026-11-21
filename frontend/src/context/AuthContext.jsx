import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const rawApiUrl = import.meta.env.VITE_API_URL;

console.log("VITE_API_URL:", rawApiUrl);

export const API_BASE_URL = (
  rawApiUrl || ''
).replace(/\/$/, '');

console.log("API_BASE_URL:", API_BASE_URL);

const AuthContext = createContext(null);

const safeParseJson = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      // ignore JSON parse error
    }
  }
  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and restore session from storage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem('nexus_auth_token') || sessionStorage.getItem('nexus_auth_token');
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        const url = `${API_BASE_URL}/api/auth/me`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const userData = await safeParseJson(res);
          if (userData) {
            setUser(userData);
            setToken(storedToken);
          }
        } else {
          // Token invalid or expired
          localStorage.removeItem('nexus_auth_token');
          sessionStorage.removeItem('nexus_auth_token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    setAuthError(null);
    try {
      const url = `${API_BASE_URL}/api/auth/login`;
      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      } catch (networkErr) {
        throw new Error('Unable to connect to server. Please check your internet connection or verify the backend is running.');
      }

      const data = await safeParseJson(res);

      if (!res.ok) {
        throw new Error(data?.detail || `Login failed (${res.status}). Please check your credentials.`);
      }

      if (!data) {
        throw new Error('Server returned an unexpected response. Please try again.');
      }

      const { token: receivedToken, user: receivedUser } = data;
      setToken(receivedToken);
      setUser(receivedUser);

      if (rememberMe) {
        localStorage.setItem('nexus_auth_token', receivedToken);
        sessionStorage.removeItem('nexus_auth_token');
      } else {
        sessionStorage.setItem('nexus_auth_token', receivedToken);
        localStorage.removeItem('nexus_auth_token');
      }

      return receivedUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const url = `${API_BASE_URL}/api/auth/register`;
      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
      } catch (networkErr) {
        throw new Error('Unable to connect to server. Please check your internet connection or verify the backend is running.');
      }

      const data = await safeParseJson(res);

      if (!res.ok) {
        throw new Error(data?.detail || `Registration failed (${res.status}). Please try again.`);
      }

      if (!data) {
        throw new Error('Server returned an unexpected response. Please try again.');
      }

      const { token: receivedToken, user: receivedUser } = data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('nexus_auth_token', receivedToken);

      return receivedUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const loginAsGuest = async () => {
    setAuthError(null);
    try {
      const url = `${API_BASE_URL}/api/auth/guest`;
      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
        });
      } catch (networkErr) {
        throw new Error('Unable to connect to server. Please check your internet connection or verify the backend is running.');
      }

      const data = await safeParseJson(res);

      if (!res.ok) {
        throw new Error(data?.detail || `Guest login failed (${res.status}).`);
      }

      if (!data) {
        throw new Error('Server returned an unexpected response. Please try again.');
      }

      const { token: receivedToken, user: receivedUser } = data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('nexus_auth_token', receivedToken);

      return receivedUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('nexus_auth_token');
    sessionStorage.removeItem('nexus_auth_token');
    setUser(null);
    setToken(null);
    setAuthError(null);
  }, []);

  const clearError = () => setAuthError(null);

  // Authenticated fetch helper
  // Authenticated fetch helper
  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = {
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const requestUrl = url.startsWith('http')
        ? url
        : `${API_BASE_URL}${url}`;

      return fetch(requestUrl, {
        ...options,
        headers,
      });
    },
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        authError,
        login,
        register,
        loginAsGuest,
        logout,
        clearError,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
