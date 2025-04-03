'use client';
import { useState, useEffect } from 'react';
import { getUserData } from '../../utils/auth';
import Link from 'next/link';
import './dashboard.css';

export default function EtudiantDashboard() {
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

    const fetchCandidatures = async (userId) => {
        try {
            setLoading(true);
            const response = await fetch(`http://20.19.36.142:8000/api/candidatures?id_personne=${userId}`);
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des candidatures');
            }
            
            const data = await response.json();
            
            if (data.status === 'success' && Array.isArray(data.data)) {
                setCandidatures(data.data);
                setStats(prev => ({
                    ...prev,
                    candidatures: data.data.length
                }));
            } else {
                setCandidatures([]);
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'acceptée':
            case 'acceptee':
                return 'status-accepted';
            case 'refusée':
            case 'refusee':
                return 'status-rejected';
            case 'en attente':
                return 'status-pending';
            default:
                return 'status-pending';
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    return (
        <div className="dashboard-main">
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

            <div className="main-content">
                <div className="section-recent">
                    <h2>Candidatures récentes</h2>
                    
                    {loading ? (
                        <div className="loading">Chargement des candidatures...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : candidatures.length > 0 ? (
                        <div className="candidatures-list">
                            {candidatures.slice(0, 5).map((candidature, index) => (
                                <div className="candidature-card" key={index}>
                                    <div className="candidature-header">
                                        <h3>{candidature.titre_stage || "Offre de stage"}</h3>
                                        <span className={`candidature-status ${getStatusClass(candidature.statut)}`}>
                                            {candidature.statut}
                                        </span>
                                    </div>
                                    <div className="candidature-company">
                                        {candidature.nom_entreprise || "Entreprise"}
                                    </div>
                                    <div className="candidature-date">
                                        Postulé le {formatDate(candidature.date_creation)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <p>Vous n'avez pas encore postulé à des offres.</p>
                            <a href="/Offres" className="action-button">Voir les offres disponibles</a>
                        </div>
                    )}
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Compléter mon profil</h3>
                        <p>Ajoutez des informations supplémentaires pour augmenter vos chances</p>
                        <div className="card-stats">
                            <div className="card-stat">
                                <div className="card-stat-number">75%</div>
                                <div className="card-stat-label">Profil complété</div>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <h3>Recherche d'offres</h3>
                        <p>Trouvez de nouvelles opportunités correspondant à votre profil</p>
                        <div className="card-stats">
                            <div className="card-stat">
                                <div className="card-stat-number">150+</div>
                                <div className="card-stat-label">Offres disponibles</div>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card wishlist-card">
                        <h3>Ma Wishlist</h3>
                        <p>Consultez les offres que vous avez sauvegardées pour postuler plus tard</p>
                        <div className="card-stats">
                            <div className="card-stat">
                                <div className="card-stat-number">{stats.offresEnregistrees}</div>
                                <div className="card-stat-label">Offres sauvegardées</div>
                            </div>
                        </div>
                        <Link href="/etudiant/wishlist" className="action-button">
                            Voir ma Wishlist
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}