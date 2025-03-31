'use client';
import { useState, useEffect } from 'react';
import { getUserData, logout } from '../utils/auth';
import ProtectedRoute from '../components/ProtectedRoute';
import { HiUser, HiBriefcase, HiMail, HiCog, HiSearch } from 'react-icons/hi';
import './dashboard.css';

export default function Dashboard() {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({
        offresVues: 45,
        candidatures: 12,
        offresEnregistrees: 8,
        messagesNonLus: 3
    });

    useEffect(() => {
        const user = getUserData();
        setUserData(user);
    }, []);

    return (
        <ProtectedRoute>
            <div className="dashboard-container">
                <nav className="dashboard-nav">
                    <div className="nav-brand">CES OFFRES</div>
                    <div className="nav-actions">
                        <button onClick={logout} className="logout-button">
                            Se déconnecter
                        </button>
                    </div>
                </nav>
                
                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <h1>Tableau de bord</h1>
                        {userData && (
                            <p>Bienvenue sur votre espace personnel, {userData.prenom} {userData.nom}</p>
                        )}
                    </div>

                    <div className="stats-container">
                        <div className="stat-card">
                            <div className="stat-number">{stats.offresVues}</div>
                            <div className="stat-label">Offres consultées</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{stats.candidatures}</div>
                            <div className="stat-label">Candidatures envoyées</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{stats.offresEnregistrees}</div>
                            <div className="stat-label">Offres sauvegardées</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{stats.messagesNonLus}</div>
                            <div className="stat-label">Messages non lus</div>
                        </div>
                    </div>
                    
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h3><HiUser className="card-icon" /> Mon Profil</h3>
                            <p>Gérer votre CV, vos compétences et informations personnelles</p>
                            <div className="card-stats">
                                <div className="card-stat">
                                    <div className="card-stat-number">85%</div>
                                    <div className="card-stat-label">Profil complété</div>
                                </div>
                            </div>
                        </div>
                        <div className="dashboard-card">
                            <h3><HiBriefcase className="card-icon" /> Mes Candidatures</h3>
                            <p>Suivez l'état de vos candidatures et gérez vos offres</p>
                            <div className="card-stats">
                                <div className="card-stat">
                                    <div className="card-stat-number">{stats.candidatures}</div>
                                    <div className="card-stat-label">En cours</div>
                                </div>
                            </div>
                        </div>
                        <div className="dashboard-card">
                            <h3><HiMail className="card-icon" /> Messages</h3>
                            <p>Consultez vos messages et échanges avec les recruteurs</p>
                            <div className="card-stats">
                                <div className="card-stat">
                                    <div className="card-stat-number">{stats.messagesNonLus}</div>
                                    <div className="card-stat-label">Non lus</div>
                                </div>
                            </div>
                        </div>
                        <div className="dashboard-card">
                            <h3><HiSearch className="card-icon" /> Recherche d'offres</h3>
                            <p>Trouvez de nouvelles opportunités correspondant à votre profil</p>
                            <div className="card-stats">
                                <div className="card-stat">
                                    <div className="card-stat-number">150+</div>
                                    <div className="card-stat-label">Offres disponibles</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}