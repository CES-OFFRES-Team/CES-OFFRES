import React from 'react';
import styles from '../Offres.module.css';

const Filters = ({ offres = [], entreprises = [], onFilterChange, filtres }) => {
    // Extraire les entreprises uniques
    const nomsEntreprises = [...new Set(offres.map(offre => offre.nom_entreprise))].filter(Boolean);
    
    // Extraire les villes uniques des entreprises
    const villes = [...new Set(entreprises.map(e => e.ville))].filter(Boolean);

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.filtersGrid}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Entreprise</label>
                    <select 
                        className={styles.filterSelect}
                        value={filtres?.entreprise || ''}
                        onChange={(e) => onFilterChange({ 
                            ...filtres, 
                            entreprise: e.target.value 
                        })}
                    >
                        <option key="all-entreprises" value="">
                            Toutes les entreprises
                        </option>
                        {nomsEntreprises.map((entreprise, index) => (
                            <option 
                                key={`entreprise-${index}-${entreprise}`} 
                                value={entreprise}
                            >
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
                        onChange={(e) => onFilterChange({ 
                            ...filtres, 
                            ville: e.target.value 
                        })}
                    >
                        <option key="all-villes" value="">
                            Toutes les villes
                        </option>
                        {villes.map((ville, index) => (
                            <option 
                                key={`ville-${index}-${ville}`} 
                                value={ville}
                            >
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