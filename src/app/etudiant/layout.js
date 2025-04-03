'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { logout, getUserData, getUserRole } from '../utils/auth';
import ProtectedRoute from '../components/ProtectedRoute';
import './etudiant.css';

export default function EtudiantLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const user = getUserData();
    const userRole = getUserRole();

    const handleLogout = () => {
        console.log('Déconnexion en cours...');
        logout();
    };

    return (
        <ProtectedRoute requiredRole="Etudiant">
            <div className="dashboard-layout">
                <nav className="dashboard-sidebar">
                    <div className="dashboard-logo">
                        <h2>CES OFFRES</h2>
                    </div>
                    
                    <div className="user-profile">
                        <div className="user-avatar">
                            <img src="/placeholder-avatar.png" alt="Avatar" onError={(e) => e.target.src = '/placeholder-avatar.png'} />
                        </div>
                        <div className="user-info">
                            <p className="user-name">{user?.prenom} {user?.nom}</p>
                            <p className="user-role">{user?.role}</p>
                        </div>
                    </div>
                    
                    <ul className="dashboard-menu">
                        <li>
                            <Link href="/etudiant/dashboard">
                                <i className="fas fa-home"></i> Tableau de bord
                            </Link>
                        </li>
                        <li>
                            <Link href="/Offres">
                                <i className="fas fa-briefcase"></i> Offres de stage
                            </Link>
                        </li>
                        <li>
                            <Link href="/etudiant/candidatures">
                                <i className="fas fa-file-alt"></i> Mes candidatures
                            </Link>
                        </li>
                        <li>
                            <Link href="/etudiant/profile">
                                <i className="fas fa-user"></i> Mon profil
                            </Link>
                        </li>
                        
                        {userRole === 'Admin' && (
                            <li className="admin-access">
                                <Link href="/admin">
                                    <i className="fas fa-cogs"></i> Accès Admin
                                </Link>
                            </li>
                        )}
                    </ul>
                    
                    <div className="logout-container">
                        <button className="logout-button" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i> Déconnexion
                        </button>
                    </div>
                </nav>
                
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
} 