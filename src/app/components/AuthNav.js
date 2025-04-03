'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout, getUserData } from '../utils/auth';

export default function AuthNav() {
  const router = useRouter();
  const user = getUserData();

  const getDashboardPath = () => {
    if (!user) return '/Login';
    
    switch (user.role) {
      case 'Admin':
        return '/admin';
      case 'Pilote':
        return '/pilote/dashboard';
      case 'Etudiant':
        return '/dashboard';
      case 'Entreprise':
        return '/entreprise/dashboard';
      default:
        return '/Login';
    }
  };

  const handleLogout = () => {
    // Utiliser la fonction logout de auth.js
    logout();
  };

  return (
    <div className="auth-nav-container">
      {user ? (
        <>
          <Link 
            href={getDashboardPath()} 
            className="mon-compte-button"
          >
            <i className="fas fa-user-circle"></i>
            Mon Compte
          </Link>
          <button 
            className="deconnexion-button"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i>
            Déconnexion
          </button>
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