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
    const checkAuth = () => {
      const userData = getUserData();
      const token = getAuthToken();
      
      if (userData && token) {
        console.log('Données utilisateur chargées:', userData);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);
  
  const login = async (userData, token) => {
    try {
      setLoading(true);
      console.log('Données à stocker:', userData);
      console.log('Token à stocker:', token);
      
      const userDataWithId = {
        ...userData,
        id_personne: userData.id_personne || userData.id || null
      };
      
      const cookieOptions = { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      };
      
      Cookies.set(COOKIE_KEYS.AUTH_TOKEN, token, cookieOptions);
      Cookies.set(COOKIE_KEYS.USER_DATA, JSON.stringify(userDataWithId), cookieOptions);
      Cookies.set(COOKIE_KEYS.USER_ROLE, userData.role, cookieOptions);
      
      setUser(userDataWithId);
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setLoading(true);
      console.log('Déconnexion depuis le contexte...');
      
      // Supprimer les cookies
      Cookies.remove(COOKIE_KEYS.AUTH_TOKEN, { path: '/' });
      Cookies.remove(COOKIE_KEYS.USER_DATA, { path: '/' });
      Cookies.remove(COOKIE_KEYS.USER_ROLE, { path: '/' });
      
      // Réinitialiser l'état utilisateur
      setUser(null);
      
      // Appeler la fonction de déconnexion de auth.js
      authLogout();
      
      // Rediriger vers la page de connexion
      router.push('/Login');
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setLoading(false);
    }
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