import React from 'react';
import styles from '../Offres.module.css';

const Filters = ({ offres = [], onFilterChange }) => {  // Adding default empty array
    // Extraire les entreprises uniques
    const entreprises = [...new Set(offres.map(offre => offre.nom_entreprise))];
    
    // Extraire les villes uniques
    const villes = [...new Set(offres.map(offre => offre.ville))];

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.filtersGrid}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Entreprise</label>
                    <select 
                        className={styles.filterSelect}
                        onChange={(e) => onFilterChange({ entreprise: e.target.value, ville: '' })}
                    >
                        <option value="">Toutes les entreprises</option>
                        {entreprises.map(entreprise => (
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
                        onChange={(e) => onFilterChange({ entreprise: '', ville: e.target.value })}
                    >
                        <option value="">Toutes les villes</option>
                        {villes.map(ville => (
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
                    onClick={() => onFilterChange({ entreprise: '', ville: '' })}
                >
                    Réinitialiser
                </button>
            </div>
        </div>
    );
};

export default Filters;