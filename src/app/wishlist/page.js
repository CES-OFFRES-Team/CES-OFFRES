'use client';

import React, { useState, useEffect } from 'react';
import './wishlist.css';
import { HiPhone, HiMail, HiTrash } from 'react-icons/hi';

// Génère 20 fausses entreprises
const entreprisesDeTest = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    nom: `Entreprise ${i + 1}`,
    secteur: ['Informatique', 'Santé', 'Énergie', 'Finance'][i % 4],
    telephone: `01 23 45 67 ${String(i).padStart(2, '0')}`,
    mail: `contact${i + 1}@entreprise.com`,
}));

export default function AdminWishlist() {
    const [favoris, setFavoris] = useState([]);
    const [page, setPage] = useState(1);
    const favorisParPage = 6;

    useEffect(() => {
        setFavoris(entreprisesDeTest); // simulation des favoris existants
    }, []);

    const retirerFavori = (id) => {
        const maj = favoris.filter((e) => e.id !== id);
        setFavoris(maj);
    };

    const totalPages = Math.ceil(favoris.length / favorisParPage);
    const favorisAffiches = favoris.slice((page - 1) * favorisParPage, page * favorisParPage);

    return (
        <div className="wishlist-container">
            <h1>Mes entreprises favorites</h1>
            <div className="wishlist-grid">
                {favorisAffiches.map((entreprise) => (
                    <div className="offre-card" key={entreprise.id}>
                        <div className="offre-header">
                            <h2 className="offre-title">{entreprise.nom}</h2>
                            <div className="offre-company">{entreprise.secteur}</div>
                        </div>
                        <div className="offre-content">
                            <div className="offre-details">
                                <div className="detail-item">
                                    <HiPhone />
                                    <span>{entreprise.telephone}</span>
                                </div>
                                <div className="detail-item">
                                    <HiMail />
                                    <span>{entreprise.mail}</span>
                                </div>
                            </div>
                        </div>
                        <div className="offre-actions">
                            <button className="btn btn-outline" onClick={() => retirerFavori(entreprise.id)}>
                                <HiTrash /> Retirer
                            </button>
                        </div>
                    </div>
                ))}
            </div>

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
        </div>
    );
}
