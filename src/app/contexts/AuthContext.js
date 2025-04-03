'use client';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserData, getAuthToken, logout } from '../utils/auth';
import Cookies from 'js-cookie';
import { COOKIE_KEYS } from '../utils/constants';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const userData = getUserData();
    const token = getAuthToken();
    
    if (userData && token) {
      setUser(userData);
    }
    
    setLoading(false);
  }, []);
  
  const login = (userData, token) => {
    // Définir les cookies
    const cookieOptions = { 
      expires: 7, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    };
    
    Cookies.set(COOKIE_KEYS.AUTH_TOKEN, token, cookieOptions);
    Cookies.set(COOKIE_KEYS.USER_DATA, JSON.stringify(userData), cookieOptions);
    Cookies.set(COOKIE_KEYS.USER_ROLE, userData.role, cookieOptions);
    
    // Mettre à jour l'état
    setUser(userData);
  };
  
  const handleLogout = () => {
    logout();
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 