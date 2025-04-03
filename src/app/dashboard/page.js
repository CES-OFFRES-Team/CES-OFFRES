'use client';
import { useState, useEffect } from 'react';
import { getUserData, logout } from '../utils/auth';
import ProtectedRoute from '../components/ProtectedRoute';
import { HiUser, HiBriefcase, HiMail, HiCog, HiSearch, HiClock, HiCheck, HiX } from 'react-icons/hi';
import './dashboard.css';

const API_URL = 'http://20.19.36.142:8000/api';

export default function Dashboard() {
    const [userData, setUserData] = useState(null);
    const [candidatures, setCandidatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        offresVues: 45,
        candidatures: 0,
        offresEnregistrees: 8,
        messagesNonLus: 3
    });

    useEffect(() => {
        const user = getUserData();
        setUserData(user);
        if (user) {
            fetchCandidatures(user.id_personne);
        }
    }, []);

    const fetchCandidatures = async (idPersonne) => {
        try {
            const response = await fetch(`${API_URL}/candidatures.php?id_personne=${idPersonne}`);
            
            // Vérifier si la réponse est vide
            const responseText = await response.text();
            if (!responseText) {
                throw new Error("La réponse du serveur est vide");
            }

            // Essayer de parser le JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Erreur de parsing JSON:', responseText);
                throw new Error("Format de réponse invalide du serveur");
            }

            if (!response.ok) {
                throw new Error(data.message || "Erreur lors de la récupération des candidatures");
            }

            if (data.status === 'success') {
                setCandidatures(data.data);
                setStats(prev => ({ ...prev, candidatures: data.data.length }));
            } else {
                throw new Error(data.message || "Erreur lors de la récupération des candidatures");
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des candidatures:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (statut) => {
        switch (statut.toLowerCase()) {
            case 'en attente':
                return <HiClock className="status-icon pending" />;
            case 'acceptée':
                return <HiCheck className="status-icon accepted" />;
            case 'refusée':
                return <HiX className="status-icon rejected" />;
            default:
                return <HiClock className="status-icon pending" />;
        }
    };

    return (
        <ProtectedRoute requiredRole="Etudiant">
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

                    <div className="candidatures-section">
                        <h2>Mes Candidatures</h2>
                        {loading ? (
                            <div className="loading">Chargement des candidatures...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : candidatures.length === 0 ? (
                            <div className="no-data">Aucune candidature envoyée</div>
                        ) : (
                            <div className="candidatures-grid">
                                {candidatures.map((candidature) => (
                                    <div key={candidature.id_candidature} className="candidature-card">
                                        <div className="candidature-header">
                                            <h3>{candidature.titre}</h3>
                                            <div className="status-badge">
                                                {getStatusIcon(candidature.statut)}
                                                <span>{candidature.statut}</span>
                                            </div>
                                        </div>
                                        <div className="candidature-info">
                                            <p><strong>Entreprise :</strong> {candidature.nom_entreprise}</p>
                                            <p><strong>Date de candidature :</strong> {new Date(candidature.date_candidature).toLocaleDateString('fr-FR')}</p>
                                            <p><strong>Statut :</strong> {candidature.statut}</p>
                                        </div>
                                        <div className="candidature-actions">
                                            {candidature.cv_path && (
                                                <button className="btn btn-outline" onClick={() => window.open(`${API_URL}/${candidature.cv_path}`, '_blank')}>
                                                    Voir mon CV
                                                </button>
                                            )}
                                            {candidature.lettre_path && (
                                                <button className="btn btn-outline" onClick={() => window.open(`${API_URL}/${candidature.lettre_path}`, '_blank')}>
                                                    Voir ma lettre
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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