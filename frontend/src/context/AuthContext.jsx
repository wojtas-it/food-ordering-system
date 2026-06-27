import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sprawdź czy użytkownik jest zalogowany (przy montowaniu)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Pobierz dane użytkownika z backendu
      authAPI.getMe()
        .then((response) => {
          setUser(response.data.user);
        })
        .catch(() => {
          // Token nieprawidłowy - wyloguj
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Logowanie
  const login = async (username, password) => {
    const response = await authAPI.login({ username, password });
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    setUser(user);

    return response.data;
  };

  // Rejestracja
  const register = async (username, password) => {
    const response = await authAPI.register({ username, password });
    return response.data;
  };

  // Wylogowanie
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Sprawdź czy użytkownik jest adminem
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Sprawdź czy użytkownik jest kucharzem
  const isKucharz = () => {
    return user?.role === 'kucharz';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isKucharz,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
