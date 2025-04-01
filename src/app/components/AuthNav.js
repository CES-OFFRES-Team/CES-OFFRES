'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AuthNav() {
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);
  const userData = Cookies.get('userData');
  let user = null;

  if (userData) {
    try {
      user = JSON.parse(userData);
    } catch (e) {
      console.error('Erreur lors du parsing des données utilisateur:', e);
    }
  }

  const getDashboardPath = () => {
    if (!user) return '/Login';
    
    switch (user.role) {
      case 'Admin':
        return '/admin/dashboard';
      case 'Pilote':
        return '/pilote/dashboard';
      case 'Etudiant':
        return '/dashboard';
      default:
        return '/Login';
    }
  };

  const handleLogout = () => {
    // Supprimer les cookies
    Cookies.remove('authToken');
    Cookies.remove('userData');
    
    // Rediriger vers la page de connexion
    router.push('/Login');
  };

  return (
    <div className="auth-nav-container">
      {user ? (
        <>
          <Link 
            href={getDashboardPath()} 
            className="mon-compte-button"
            onMouseEnter={() => setShowLogout(true)}
            onMouseLeave={() => setShowLogout(false)}
          >
            <i className="fas fa-user-circle"></i>
            Mon Compte
          </Link>
          {showLogout && (
            <button 
              className="deconnexion-button"
              onClick={handleLogout}
              onMouseEnter={() => setShowLogout(true)}
              onMouseLeave={() => setShowLogout(false)}
            >
              <i className="fas fa-sign-out-alt"></i>
              Déconnexion
            </button>
          )}
        </>
      ) : (
        <Link 
          href="/Login" 
          className="connexion-button"
        >
          <i className="fas fa-sign-in-alt"></i>
          Connexion
        </Link>
      )}
    </div>
  );
} 