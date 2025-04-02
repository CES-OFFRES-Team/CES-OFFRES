"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiLocationMarker, HiCalendar, HiClock, HiBriefcase, HiHeart } from 'react-icons/hi';
import Filters from './components/Filters';
import './Offres.css';

const API_URL = 'http://20.19.36.142:8000/api';

const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric'
    });
};

const OffreCard = ({ offre, onFavorite, isFavorite }) => {
    const router = useRouter();

    const handlePostuler = () => {
        router.push(`/Offres/postuler/${offre.id_stage}`);
    };

    return (
        <div className="offre-card">
            <div className="offre-header">
                <h2 className="offre-title">{offre.titre}</h2>
                <div className="offre-company">{offre.nom_entreprise}</div>
            </div>
            <div className="offre-content">
                <div className="offre-details">
                    <div className="detail-item">
                        <HiCalendar />
                        <span>Début : {formatDate(offre.date_debut)}</span>
                    </div>
                    <div className="detail-item">
                        <HiCalendar />
                        <span>Fin : {formatDate(offre.date_fin)}</span>
                    </div>
                    <div className="detail-item">
                        <HiBriefcase />
                        <span>Rémunération : {offre.remuneration}€</span>
                    </div>
                    <div className="detail-item description">
                        <span>{offre.description}</span>
                    </div>
                </div>
            </div>
            <div className="offre-actions">
                <button 
                    className={`btn btn-outline ${isFavorite ? 'favorite' : ''}`}
                    onClick={() => onFavorite(offre.id_stage)}
                >
                    <HiHeart />
                </button>
                <button className="btn btn-primary" onClick={handlePostuler}>
                    Postuler
                </button>
            </div>
        </div>
    );
};

export default function Offres() {
    const [offres, setOffres] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtres, setFiltres] = useState({
        entreprises: [],
        dateDebut: '',
        dateFin: ''
    });
    const [favoris, setFavoris] = useState([]);

    useEffect(() => {
        const fetchOffres = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_URL}/offres`);
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des offres');
                }
                const result = await response.json();
                if (result.status === 'success' && Array.isArray(result.data)) {
                    setOffres(result.data);
                } else {
                    throw new Error('Format de données invalide');
                }
            } catch (err) {
                console.error('Erreur:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOffres();

        // Charger les favoris
        const savedFavoris = localStorage.getItem('favoris');
        if (savedFavoris) {
            setFavoris(JSON.parse(savedFavoris));
        }
    }, []);

    const handleFiltreChange = (type, value) => {
        setFiltres(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const filtrerOffres = () => {
        if (!Array.isArray(offres)) return [];
        
        return offres.filter(offre => {
            // Filtre par entreprise
            const matchEntreprise = filtres.entreprises.length === 0 || 
                filtres.entreprises.includes(offre.nom_entreprise);

            // Filtre par date de début
            const matchDateDebut = !filtres.dateDebut || 
                new Date(offre.date_debut) >= new Date(filtres.dateDebut);

            // Filtre par date de fin
            const matchDateFin = !filtres.dateFin || 
                new Date(offre.date_fin) <= new Date(filtres.dateFin);

            return matchEntreprise && matchDateDebut && matchDateFin;
        });
    };

    const toggleFavori = (offreId) => {
        const newFavoris = favoris.includes(offreId)
            ? favoris.filter(id => id !== offreId)
            : [...favoris, offreId];
        
        setFavoris(newFavoris);
        localStorage.setItem('favoris', JSON.stringify(newFavoris));
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Chargement des offres...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Erreur : {error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary">
                    Réessayer
                </button>
            </div>
        );
    }

    const offresFiltered = filtrerOffres();

    return (
        <div className="offres-container">
            <div className="offres-header">
                <h1>Offres de Stage</h1>
                <p>Trouvez le stage qui correspond à vos attentes</p>
            </div>

            <Filters 
                onFilterChange={handleFiltreChange}
                entreprises={[...new Set(offres.map(o => o.nom_entreprise))]}
            />

            <div className="offres-grid">
                {offresFiltered.length === 0 ? (
                    <div className="no-results">
                        Aucune offre ne correspond à vos critères de recherche
                    </div>
                ) : (
                    offresFiltered.map((offre) => (
                        <OffreCard
                            key={offre.id_stage}
                            offre={offre}
                            onFavorite={toggleFavori}
                            isFavorite={favoris.includes(offre.id_stage)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}