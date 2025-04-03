'use client';

import React, { useState, useEffect } from 'react';
import './wishlist.css';
import { HiPhone, HiMail, HiTrash, HiGlobeAlt, HiLocationMarker } from 'react-icons/hi';
import { getUserData } from '../../utils/auth';

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
            const userData = getUserData();
            if (!userData || !userData.id) {
                setError('Utilisateur non authentifié');
                return;
            }

            const response = await fetch('http://20.19.36.142:8000/api/wishlist/list', {
                headers: {
                    'Authorization': `Bearer ${userData.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération de la wishlist');
            }

            const data = await response.json();
            setFavoris(data.stages);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const retirerFavori = async (idStage) => {
        try {
            const userData = getUserData();
            const response = await fetch(`http://20.19.36.142:8000/api/wishlist/remove/${idStage}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userData.token}`
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
