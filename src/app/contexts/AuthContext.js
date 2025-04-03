'use client';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserData, getAuthToken, logout as authLogout } from '../utils/auth';
import Cookies from 'js-cookie';
import { COOKIE_KEYS } from '../utils/constants';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const userData = getUserData();
    const token = getAuthToken();
    
    if (userData && token) {
      // Log des données utilisateur au chargement
      console.log('Données utilisateur chargées:', userData);
      setUser(userData);
    }
    
    setLoading(false);
  }, []);
  
  const login = async (userData, token) => {
    // Log des données avant stockage
    console.log('Données à stocker:', userData);
    console.log('Token à stocker:', token);
    
    // S'assurer que l'ID est présent d'une manière ou d'une autre
    const userDataWithId = {
      ...userData,
      id_personne: userData.id_personne || userData.id || null
    };
    
    // Définir les cookies
    const cookieOptions = { 
      expires: 7, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    };
    
    Cookies.set(COOKIE_KEYS.AUTH_TOKEN, token, cookieOptions);
    Cookies.set(COOKIE_KEYS.USER_DATA, JSON.stringify(userDataWithId), cookieOptions);
    Cookies.set(COOKIE_KEYS.USER_ROLE, userData.role, cookieOptions);
    
    // Mettre à jour l'état
    setUser(userDataWithId);
    
    // Forcer le rafraîchissement
    router.refresh();
  };
  
  const logout = async () => {
    console.log('Déconnexion depuis le contexte...');
    // Appeler la fonction de déconnexion de auth.js
    authLogout();
    // Mettre à jour l'état local
    setUser(null);
    // Forcer le rafraîchissement
    router.refresh();
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 