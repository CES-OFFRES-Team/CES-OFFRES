'use client';

import React, { useState, useEffect } from 'react';
import './wishlist.css';
import { HiPhone, HiMail, HiTrash, HiGlobeAlt, HiLocationMarker } from 'react-icons/hi';
import { getUserData, getAuthToken, isAuthenticated } from '../../utils/auth';

export default function WishList() {
    const [favoris, setFavoris] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const favorisParPage = 6;

    useEffect(() => {
        fetchWishList();
    }, []);

    const fetchWishList = async () => {
        try {
            setLoading(true);
            
            // Vérification complète de l'authentification
            const isAuth = isAuthenticated();
            console.log('Est authentifié:', isAuth);
            
            const userData = getUserData();
            const token = getAuthToken();
            
            // Logs détaillés
            console.log('=== Début des logs de débogage ===');
            console.log('Token brut:', token);
            console.log('Token tronqué:', token ? `${token.substring(0, 20)}...` : 'aucun');
            console.log('Données utilisateur:', userData);
            console.log('ID personne:', userData?.id_personne);
            console.log('=== Fin des logs de débogage ===');

            if (!isAuth) {
                setError('Utilisateur non authentifié');
                return;
            }

            if (!token) {
                setError('Token d\'authentification manquant');
                return;
            }

            // Log de la requête complète
            const requestInfo = {
                url: 'http://20.19.36.142:8000/api/wishlist/list',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            console.log('Détails de la requête:', requestInfo);

            const response = await fetch(requestInfo.url, {
                method: 'GET',
                headers: requestInfo.headers
            });

            // Log de la réponse complète
            console.log('=== Réponse du serveur ===');
            console.log('Status:', response.status);
            console.log('Headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Corps de la réponse d\'erreur:', errorText);
                throw new Error(`Erreur lors de la récupération de la wishlist (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            console.log('Données reçues:', data); // Log pour déboguer

            if (!data || !data.stages) {
                throw new Error('Format de données invalide');
            }

            const stagesFormates = data.stages.map(item => ({
                id_stage: item.id_stage,
                titre: item.titre || item.titre_stage || 'Sans titre',
                nom_entreprise: item.nom_entreprise || 'Entreprise non spécifiée',
                localisation: item.localisation || 'Non spécifiée',
                telephone: item.telephone || 'Non spécifié',
                email: item.email || 'Non spécifié',
                site_web: item.site_web || '',
                description: item.description || 'Aucune description disponible',
                salaire: item.salaire || 'Non spécifié',
                type_stage: item.type_stage || 'Non spécifié',
                niveau_etude: item.niveau_etude || 'Non spécifié',
                date_ajout: item.date_ajout
            }));

            setFavoris(stagesFormates);
            setError(null);
        } catch (err) {
            setError(`Erreur: ${err.message}`);
            console.error('Erreur détaillée:', err);
        } finally {
            setLoading(false);
        }
    };

    const retirerFavori = async (idStage) => {
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const response = await fetch(`http://20.19.36.142:8000/api/wishlist/remove/${idStage}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            // Mettre à jour l'état local
            setFavoris(favoris.filter(stage => stage.id_stage !== idStage));
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            alert('Erreur lors de la suppression de l\'offre');
        }
    };

    const totalPages = Math.ceil(favoris.length / favorisParPage);
    const favorisAffiches = favoris.slice((page - 1) * favorisParPage, page * favorisParPage);

    if (loading) {
        return <div className="loading">Chargement de votre wishlist...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="wishlist-container">
            <h1>Mes offres favorites</h1>
            {favoris.length === 0 ? (
                <div className="empty-wishlist">
                    <p>Vous n'avez pas encore d'offres favorites.</p>
                </div>
            ) : (
                <>
                    <div className="wishlist-grid">
                        {favorisAffiches.map((stage) => (
                            <div className="offre-card" key={stage.id_stage}>
                                <div className="offre-header">
                                    <h2 className="offre-title">{stage.titre}</h2>
                                    <div className="offre-company">{stage.nom_entreprise}</div>
                                </div>
                                <div className="offre-content">
                                    <div className="offre-details">
                                        <div className="detail-item">
                                            <HiLocationMarker />
                                            <span>{stage.localisation}</span>
                                        </div>
                                        <div className="detail-item">
                                            <HiPhone />
                                            <span>{stage.telephone}</span>
                                        </div>
                                        <div className="detail-item">
                                            <HiMail />
                                            <span>{stage.email}</span>
                                        </div>
                                        {stage.site_web && (
                                            <div className="detail-item">
                                                <HiGlobeAlt />
                                                <a href={stage.site_web} target="_blank" rel="noopener noreferrer">
                                                    {stage.site_web}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div className="offre-description">
                                        <p>{stage.description}</p>
                                    </div>
                                    <div className="offre-info">
                                        <span className="info-item">Salaire: {stage.salaire}€</span>
                                        <span className="info-item">Type: {stage.type_stage}</span>
                                        <span className="info-item">Niveau: {stage.niveau_etude}</span>
                                    </div>
                                </div>
                                <div className="offre-actions">
                                    <button 
                                        className="btn btn-outline" 
                                        onClick={() => retirerFavori(stage.id_stage)}
                                    >
                                        <HiTrash /> Retirer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={page === i + 1 ? 'active' : ''}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
