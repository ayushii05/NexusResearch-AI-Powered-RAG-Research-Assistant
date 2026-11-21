import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

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

        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setToken(storedToken);
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Login failed. Please check your credentials.');
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed. Please try again.');
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
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Guest login failed.');
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
  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = {
        ...options.headers,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return fetch(url, { ...options, headers });
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
