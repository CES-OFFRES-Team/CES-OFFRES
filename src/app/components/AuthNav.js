'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../utils/constants';

export default function AuthNav({ onNavigate }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/Login';
    
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return '/admin';
      case USER_ROLES.PILOTE:
        return '/pilote/dashboard';
      case USER_ROLES.ETUDIANT:
        return '/etudiant/dashboard';
      case USER_ROLES.ENTREPRISE:
        return '/entreprise/dashboard';
      default:
        return '/Login';
    }
  };

  const handleLogout = async () => {
    console.log('Déconnexion en cours...');
    await logout();
    console.log('Redirection vers la page de connexion...');
    router.push('/Login');
    router.refresh();
    if (onNavigate) onNavigate();
  };

  const handleNavigation = (path) => {
    router.push(path);
    if (onNavigate) onNavigate();
  };

  return (
    <div className="auth-nav-container">
      {user ? (
        <>
          <div className="user-info">
            <span className="user-name">{user.prenom} {user.nom}</span>
            <span className="user-role">{user.role}</span>
          </div>
          
          <Link 
            href={getDashboardPath()} 
            className="mon-compte-button"
            onClick={() => handleNavigation(getDashboardPath())}
          >
            <i className="fas fa-user-circle"></i>
            Mon Compte
          </Link>
          
          {user.role === USER_ROLES.ADMIN && (
            <Link 
              href="/admin" 
              className="admin-panel-button"
              onClick={() => handleNavigation('/admin')}
            >
              <i className="fas fa-cogs"></i>
              Panneau Admin
            </Link>
          )}
          
          {user.role === USER_ROLES.ETUDIANT && (
            <Link 
              href="/etudiant/dashboard" 
              className="student-dashboard-button"
              onClick={() => handleNavigation('/etudiant/dashboard')}
            >
              <i className="fas fa-graduation-cap"></i>
              Espace Étudiant
            </Link>
          )}

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
          onClick={() => handleNavigation('/Login')}
        >
          <i className="fas fa-sign-in-alt"></i>
          Connexion
        </Link>
      )}
    </div>
  );
} 