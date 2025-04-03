"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiLocationMarker, HiCalendar, HiClock, HiBriefcase, HiHeart, HiOutlineEmojiSad } from 'react-icons/hi';
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
        entreprises: [], // Changed from string to array
        villes: [],     // Changed from string to array
        themes: []
    });
    const [favoris, setFavoris] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                const [offresResponse, entreprisesResponse] = await Promise.all([
                    fetch('http://20.19.36.142/api/offres'),
                    fetch('http://20.19.36.142/api/entreprises')
                ]);

                if (!offresResponse.ok || !entreprisesResponse.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }

                const offresResult = await offresResponse.json();
                const entreprisesResult = await entreprisesResponse.json();

                // Extract city from address
                const extractCity = (address) => {
                    if (!address) return null;
                    const match = address.match(/(\d{5})\s+([^,]+)$/);
                    return match ? match[2].trim() : null;
                };

                // Access the data property and process enterprises
                const entreprisesArray = entreprisesResult.data || [];
                const processedEntreprises = entreprisesArray.map(entreprise => ({
                    ...entreprise,
                    ville: extractCity(entreprise.adresse)
                }));

                // Create enterprises map
                const entreprisesMap = new Map(
                    processedEntreprises.map(e => [e.id_entreprise, e])
                );

                // Access the data property for offers and enrich them
                const offresArray = offresResult.data || [];
                const offresEnrichies = offresArray.map(offre => ({
                    ...offre,
                    entrepriseDetails: {
                        ...entreprisesMap.get(offre.id_entreprise),
                        ville: entreprisesMap.get(offre.id_entreprise)?.ville
                    }
                }));

                console.log('Processed enterprises:', processedEntreprises);
                console.log('Enriched offers:', offresEnrichies);

                setOffres(offresEnrichies);
                setEntreprises(processedEntreprises);

            } catch (err) {
                console.error('Erreur détaillée:', err);
                setError('Erreur lors du chargement des données');
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
            const matchEntreprise = filtres.entreprises.length === 0 || 
                filtres.entreprises.includes(offre.nom_entreprise);
                
            const matchVille = filtres.villes.length === 0 || 
                filtres.villes.includes(offre.entrepriseDetails?.ville);
                
            const matchThemes = filtres.themes.length === 0 || 
                filtres.themes.some(theme => 
                    offre.description.toLowerCase().includes(theme) ||
                    offre.titre.toLowerCase().includes(theme)
                );

            return matchEntreprise && matchVille && matchThemes;
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

            <Filters 
                offres={offres}
                entreprises={entreprises}
                onFilterChange={setFiltres}
                filtres={filtres}
            />

            <div className={styles.offresGrid}>
                {isLoading ? (
                    <div className={styles.loadingContainer}>Chargement...</div>
                ) : error ? (
                    <div className={styles.errorContainer}>{error}</div>
                ) : offresFiltered.length === 0 ? (
                    <div className={styles.noResults}>
                        <div className={styles.noResultsIcon}>
                            <HiOutlineEmojiSad />
                        </div>
                        <h2>Oups ! Aucune offre trouvée</h2>
                        <p>
                            Nous n'avons pas trouvé d'offres correspondant à vos critères.
                            <br />
                            Essayez de modifier vos filtres ou revenez plus tard !
                        </p>
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