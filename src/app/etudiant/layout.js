'use client';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { USER_ROLES } from '../utils/constants';
import './etudiant.css';

export default function EtudiantLayout({ children }) {
    const { user, logout, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                console.log('Utilisateur non connecté, redirection vers login');
                router.push('/Login');
                router.refresh();
            } else if (user.role !== USER_ROLES.ETUDIANT) {
                console.log('Utilisateur non étudiant, redirection vers login');
                router.push('/Login');
                router.refresh();
            }
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        try {
            console.log('Déconnexion en cours...');
            await logout();
            console.log('Déconnexion réussie');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="dashboard-layout">
            <header className="dashboard-sidebar">
                <div className="dashboard-logo">
                    <h2>CES OFFRES</h2>
                </div>

                <nav>
                    <ul className="dashboard-menu">
                        <li>
                            <Link href="/etudiant/dashboard" className={router.pathname === '/etudiant/dashboard' ? 'active' : ''}>
                                <i className="fas fa-home"></i>
                                Tableau de bord
                            </Link>
                        </li>
                        <li>
                            <Link href="/Offres" className={router.pathname === '/Offres' ? 'active' : ''}>
                                <i className="fas fa-briefcase"></i>
                                Offres de stage
                            </Link>
                        </li>
                        <li>
                            <Link href="/etudiant/profile" className={router.pathname === '/etudiant/profile' ? 'active' : ''}>
                                <i className="fas fa-user"></i>
                                Mon profil
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="user-profile">
                    <div className="user-avatar">
                        <i className="fas fa-user"></i>
                    </div>
                    <div className="user-info">
                        <h3 className="user-name">{user.prenom} {user.nom}</h3>
                        <p className="user-role">Étudiant</p>
                    </div>
                </div>

                <div className="logout-container">
                    <button onClick={handleLogout} className="logout-button">
                        <i className="fas fa-sign-out-alt"></i>
                        Déconnexion
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                {children}
            </main>
        </div>
    );
} 