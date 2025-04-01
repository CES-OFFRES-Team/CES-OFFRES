'use client';

import React, { useState, useEffect } from 'react';
import {
    HiLocationMarker,
    HiCalendar,
    HiClock,
    HiBriefcase,
    HiHeart,
    HiTrash
} from 'react-icons/hi';
import { offresDeStages } from '@/data/offresData';
import '../../Offres/Offres.css';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric'
    });
};

const OffreAdminCard = ({ offre }) => {
    const handleModifier = () => { };
    const handleSupprimer = () => { };
    const handlePostuler = () => { };
    const handleFavori = () => { };

    return (
        <div className="offre-card">
            <div className="offre-header">
                <h2 className="offre-title">{offre.titre}</h2>
                <div className="offre-company">{offre.entreprise}</div>
            </div>
            <div className="offre-content">
                <div className="offre-details">
                    <div className="detail-item">
                        <HiLocationMarker />
                        <span>{offre.localisation}</span>
                    </div>
                    <div className="detail-item">
                        <HiCalendar />
                        <span>Début : {formatDate(offre.dateDebut)}</span>
                    </div>
                    <div className="detail-item">
                        <HiClock />
                        <span>Durée : {offre.duree} mois</span>
                    </div>
                    <div className="detail-item">
                        <HiBriefcase />
                        <span>{offre.description}</span>
                    </div>
                </div>
            </div>
            <div className="offre-actions">
                <button className="btn btn-outline" onClick={handleModifier}>Modifier</button>
                <button className="btn btn-outline" onClick={handleSupprimer}><HiTrash /></button>
                <button className="btn btn-outline" onClick={handleFavori}>
                    <HiHeart />
                </button>
                <button className="btn btn-primary" onClick={handlePostuler}>
                    Postuler
                </button>
            </div>
        </div>
    );
};

export default function AdminOffresPage() {
    const [offres, setOffres] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setOffres(offresDeStages);
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const offresFiltrées = offres.filter((offre) =>
        offre.titre.toLowerCase().includes(search.toLowerCase()) ||
        offre.entreprise.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="offres-container">
            <div className="offres-header">
                <h1>Gestion des Offres</h1>
                <p>Consultez, modifiez ou supprimez les offres de stage</p>
                <input
                    type="text"
                    placeholder="Rechercher une offre..."
                    value={search}
                    onChange={handleSearchChange}
                    className="filter-input"
                    style={{ maxWidth: '400px', margin: '1rem auto', display: 'block' }}
                />
            </div>

            <div className="offres-grid">
                {offresFiltrées.map((offre) => (
                    <OffreAdminCard key={offre.id} offre={offre} />
                ))}
            </div>
        </div>
    );
}
