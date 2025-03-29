'use client';
import { useState, useEffect } from 'react';
import { getUserData, logout } from '../utils/auth';
import ProtectedRoute from '../components/ProtectedRoute';
import './dashboard.css';

export default function Dashboard() {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const user = getUserData();
        setUserData(user);
    }, []);

    return (
        <ProtectedRoute>
            <div className="dashboard-container">
                <nav className="dashboard-nav">
                    <div className="nav-brand">CES OFFRES</div>
                    <button onClick={logout} className="logout-button">
                        Se déconnecter
                    </button>
                </nav>
                
                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <h1>Tableau de bord</h1>
                        {userData && (
                            <p>Bienvenue, {userData.prenom} {userData.nom}</p>
                        )}
                    </div>
                    
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h3>Mon Profil</h3>
                            <p>Gérer vos informations personnelles</p>
                        </div>
                        <div className="dashboard-card">
                            <h3>Mes Offres</h3>
                            <p>Voir et gérer vos offres</p>
                        </div>
                        <div className="dashboard-card">
                            <h3>Messages</h3>
                            <p>Voir vos messages</p>
                        </div>
                        <div className="dashboard-card">
                            <h3>Paramètres</h3>
                            <p>Gérer vos préférences</p>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
} 