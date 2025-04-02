"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiLocationMarker, HiCalendar, HiClock, HiBriefcase, HiHeart } from 'react-icons/hi';
import Filters from './components/Filters';
import { offresDeStages } from '@/data/offresData';
import './Offres.css';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric'
    });
};

const OffreCard = ({ offre, onFavorite, isFavorite }) => {
    const router = useRouter();

    const handlePostuler = () => {
        router.push(`/Offres/postuler/${offre.id}`);
    };

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
                <button
                    className={`btn btn-outline ${isFavorite ? 'favorite' : ''}`}
                    onClick={() => onFavorite(offre.id)}
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
    const [filtres, setFiltres] = useState({
        villes: [],
        duree: { min: '', max: '' },
        moisDebut: ''
    });
    const [favoris, setFavoris] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const offresParPage = 3;

    useEffect(() => {
        // Génération de 25 fausses offres
        const faussesOffres = Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            titre: `Stage ${i + 1}`,
            entreprise: `Entreprise ${i + 1}`,
            localisation: 'Lyon',
            dateDebut: '2025-05-01',
            duree: ((i % 6) + 1),
            description: 'Une excellente opportunité pour développer vos compétences.'
        }));
        setOffres(faussesOffres);

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
        return offres.filter(offre => {
            const matchVilles = filtres.villes.length === 0 ||
                filtres.villes.some(ville =>
                    offre.localisation.toLowerCase().includes(ville.toLowerCase())
                );
            const dureeMois = parseInt(offre.duree);
            const matchDuree = (!filtres.duree.min || dureeMois >= parseInt(filtres.duree.min)) &&
                (!filtres.duree.max || dureeMois <= parseInt(filtres.duree.max));
            const moisOffre = new Date(offre.dateDebut).getMonth() + 1;
            const matchMois = !filtres.moisDebut || moisOffre === parseInt(filtres.moisDebut);
            return matchVilles && matchDuree && matchMois;
        });
    };

    const toggleFavori = (offreId) => {
        const newFavoris = favoris.includes(offreId)
            ? favoris.filter(id => id !== offreId)
            : [...favoris, offreId];
        setFavoris(newFavoris);
        localStorage.setItem('favoris', JSON.stringify(newFavoris));
    };

    const offresFiltrees = filtrerOffres();
    const indexOfLast = currentPage * offresParPage;
    const indexOfFirst = indexOfLast - offresParPage;
    const currentOffres = offresFiltrees.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(offresFiltrees.length / offresParPage);

    return (
        <div className="offres-container">
            <div className="offres-header">
                <h1>Offres de Stage</h1>
                <p>Trouvez le stage qui correspond à vos attentes</p>
            </div>

            <Filters onFilterChange={handleFiltreChange} />

            <div className="offres-grid">
                {currentOffres.map((offre) => (
                    <OffreCard
                        key={offre.id}
                        offre={offre}
                        onFavorite={toggleFavori}
                        isFavorite={favoris.includes(offre.id)}
                    />
                ))}
            </div>

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}
