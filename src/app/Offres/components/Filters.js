import React, { useMemo } from 'react';
import styles from '../Offres.module.css';

const Filters = ({ offres = [], entreprises = [], onFilterChange, filtres }) => {
    // Extract cities from enterprises that have offers
    const villesDisponibles = React.useMemo(() => {
        // If an enterprise is selected, only show its city
        if (filtres.entreprise) {
            const selectedEntreprise = entreprises.find(
                e => e.nom_entreprise === filtres.entreprise
            );
            return selectedEntreprise?.ville ? [selectedEntreprise.ville] : [];
        }

        // Otherwise show all cities from enterprises with offers
        const entrepriseIdsAvecOffres = new Set(
            offres.map(offre => offre.id_entreprise)
        );

        const villes = entreprises
            .filter(e => entrepriseIdsAvecOffres.has(e.id_entreprise))
            .map(e => e.ville)
            .filter(Boolean);

        return [...new Set(villes)].sort();
    }, [offres, entreprises, filtres.entreprise]);

    // Extract enterprise names
    const entreprisesDisponibles = React.useMemo(() => {
        // If a city is selected, only show enterprises from that city
        if (filtres.ville) {
            const entreprisesInCity = entreprises
                .filter(e => e.ville === filtres.ville)
                .map(e => e.nom_entreprise);
            return [...new Set(entreprisesInCity)].sort();
        }

        // Otherwise show all enterprises with offers
        const noms = offres
            .map(offre => offre.nom_entreprise)
            .filter(Boolean);
        return [...new Set(noms)].sort();
    }, [offres, entreprises, filtres.ville]);

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.filtersGrid}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Entreprise</label>
                    <select 
                        className={styles.filterSelect}
                        value={filtres?.entreprise || ''}
                        onChange={(e) => {
                            const newEntreprise = e.target.value;
                            if (!newEntreprise) {
                                // If clearing enterprise, keep current city
                                onFilterChange({ 
                                    ...filtres, 
                                    entreprise: '' 
                                });
                            } else {
                                // If selecting enterprise, update city if needed
                                const selectedEntreprise = entreprises.find(
                                    e => e.nom_entreprise === newEntreprise
                                );
                                onFilterChange({ 
                                    entreprise: newEntreprise,
                                    ville: selectedEntreprise?.ville || filtres.ville
                                });
                            }
                        }}
                    >
                        <option value="">Toutes les entreprises</option>
                        {entreprisesDisponibles.map((entreprise) => (
                            <option key={entreprise} value={entreprise}>
                                {entreprise}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Ville</label>
                    <select 
                        className={styles.filterSelect}
                        value={filtres?.ville || ''}
                        onChange={(e) => {
                            const newVille = e.target.value;
                            if (!newVille) {
                                // If clearing city, keep current enterprise
                                onFilterChange({ 
                                    ...filtres, 
                                    ville: '' 
                                });
                            } else {
                                // If selecting city, keep enterprise if it matches
                                const enterpriseInCity = entreprises.find(
                                    e => e.nom_entreprise === filtres.entreprise && e.ville === newVille
                                );
                                onFilterChange({ 
                                    ville: newVille,
                                    entreprise: enterpriseInCity ? filtres.entreprise : ''
                                });
                            }
                        }}
                    >
                        <option value="">Toutes les villes</option>
                        {villesDisponibles.map((ville) => (
                            <option key={ville} value={ville}>
                                {ville}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.filterActions}>
                <button 
                    className={styles.resetButton}
                    onClick={() => onFilterChange({ 
                        entreprise: '', 
                        ville: '' 
                    })}
                >
                    Réinitialiser
                </button>
            </div>
        </div>
    );
};

export default Filters;