"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiLocationMarker, HiCalendar, HiClock, HiBriefcase, HiHeart } from 'react-icons/hi';
import Filters from './components/Filters';
import styles from './Offres.module.css';

const API_URL = 'http://20.19.36.142/api';  // Vérifiez que cette URL est correcte

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
        <div className={styles.offreCard}>
            <div className={styles.offreHeader}>
                <h2 className={styles.offreTitle}>{offre.titre}</h2>
                <div className={styles.offreCompany}>{offre.nom_entreprise}</div>
            </div>
            <div className={styles.offreContent}>
                <div className={styles.offreDetails}>
                    <div className={styles.detailItem}>
                        <HiCalendar />
                        <span>Début : {formatDate(offre.date_debut)}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <HiCalendar />
                        <span>Fin : {formatDate(offre.date_fin)}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <HiBriefcase />
                        <span>Rémunération : {offre.remuneration}€</span>
                    </div>
                    <div className={`${styles.detailItem} ${styles.description}`}>
                        <span>{offre.description}</span>
                    </div>
                </div>
            </div>
            <div className={styles.offreActions}>
                <button 
                    className={styles.secondaryButton}
                    onClick={() => onFavorite(offre.id_stage)}
                >
                    <HiHeart className={isFavorite ? styles.favorite : ''} />
                </button>
                <button className={styles.primaryButton} onClick={handlePostuler}>
                    Postuler
                </button>
            </div>
        </div>
    );
};

export default function Offres() {
    const [offres, setOffres] = useState([]);
    const [entreprises, setEntreprises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtres, setFiltres] = useState({
        entreprise: '',
        ville: ''
    });
    const [favoris, setFavoris] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Récupérer les offres et les entreprises en parallèle
                const [offresResponse, entreprisesResponse] = await Promise.all([
                    fetch('http://20.19.36.142/api/offres'),
                    fetch('http://20.19.36.142/api/entreprises')
                ]);

                if (!offresResponse.ok || !entreprisesResponse.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }

                const offresResult = await offresResponse.json();
                const entreprisesResult = await entreprisesResponse.json();

                // Debug logs
                console.log('Données offres brutes:', offresResult);
                console.log('Données entreprises brutes:', entreprisesResult);

                // S'assurer que nous avons des tableaux
                const offresArray = Array.isArray(offresResult) ? offresResult : offresResult.data || [];
                const entreprisesArray = Array.isArray(entreprisesResult) ? entreprisesResult : entreprisesResult.data || [];

                // Créer un map des entreprises pour un accès rapide
                const entreprisesMap = new Map();
                entreprisesArray.forEach(entreprise => {
                    if (entreprise && entreprise.id_entreprise) {
                        entreprisesMap.set(entreprise.id_entreprise, entreprise);
                    }
                });

                // Enrichir les offres avec les données d'entreprise
                const offresEnrichies = offresArray.map(offre => {
                    const entrepriseDetails = entreprisesMap.get(offre.id_entreprise) || {};
                    return {
                        ...offre,
                        entrepriseDetails
                    };
                });

                setOffres(offresEnrichies);
                setEntreprises(entreprisesArray);
                setError(null);

            } catch (err) {
                console.error('Erreur détaillée:', err);
                setError('Erreur lors du chargement des données');
                setOffres([]);
                setEntreprises([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleFiltreChange = (newFiltres) => {
        setFiltres(newFiltres);
    };

    const filtrerOffres = () => {
        return offres.filter(offre => {
            const entreprise = offre.entrepriseDetails;
            
            const matchEntreprise = !filtres.entreprise || 
                offre.nom_entreprise === filtres.entreprise;
                
            const matchVille = !filtres.ville || 
                (entreprise && entreprise.ville === filtres.ville);

            return matchEntreprise && matchVille;
        });
    };

    const toggleFavori = (offreId) => {
        const newFavoris = favoris.includes(offreId)
            ? favoris.filter(id => id !== offreId)
            : [...favoris, offreId];
        
        setFavoris(newFavoris);
        localStorage.setItem('favoris', JSON.stringify(newFavoris));
    };

    const offresFiltered = filtrerOffres();

    return (
        <div className={styles.offresContainer}>
            <div className={styles.offresHeader}>
                <h1>Offres de Stage</h1>
                <p>Trouvez le stage qui correspond à vos attentes</p>
            </div>

            {!isLoading && !error && (
                <Filters 
                    offres={offres}
                    entreprises={entreprises}
                    onFilterChange={setFiltres}
                    filtres={filtres}
                />
            )}

            <div className={styles.offresGrid}>
                {isLoading ? (
                    <div className={styles.loadingContainer}>Chargement...</div>
                ) : error ? (
                    <div className={styles.errorContainer}>{error}</div>
                ) : offres.length === 0 ? (
                    <div className={styles.noResults}>Aucune offre disponible</div>
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