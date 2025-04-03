import React from 'react';
import styles from '../Offres.module.css';
import ThemeInput from './ThemeInput';
import TagInput from './TagInput';

const Filters = ({ offres = [], entreprises = [], onFilterChange, filtres }) => {
    const villesDisponibles = React.useMemo(() => {
        const villes = entreprises
            .map(e => e.ville)
            .filter(Boolean);
        return [...new Set(villes)].sort();
    }, [entreprises]);

    const entreprisesDisponibles = React.useMemo(() => {
        const noms = offres
            .map(offre => offre.nom_entreprise)
            .filter(Boolean);
        return [...new Set(noms)].sort();
    }, [offres]);

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.filtersGrid}>
                <TagInput
                    label="Entreprises"
                    values={filtres.entreprises}
                    onChange={(newValues) => onFilterChange({
                        ...filtres,
                        entreprises: newValues
                    })}
                    options={entreprisesDisponibles}
                    placeholder="Rechercher des entreprises"
                />

                <TagInput
                    label="Villes"
                    values={filtres.villes}
                    onChange={(newValues) => onFilterChange({
                        ...filtres,
                        villes: newValues
                    })}
                    options={villesDisponibles}
                    placeholder="Rechercher des villes"
                />

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Thèmes</label>
                    <ThemeInput
                        themes={filtres.themes || []}
                        onThemesChange={(newThemes) => {
                            onFilterChange({
                                ...filtres,
                                themes: newThemes
                            });
                        }}
                    />
                </div>
            </div>

            <div className={styles.filterActions}>
                <button 
                    className={styles.resetButton}
                    onClick={() => onFilterChange({ 
                        entreprises: [], 
                        villes: [], 
                        themes: [] 
                    })}
                >
                    Réinitialiser
                </button>
            </div>
        </div>
    );
};

export default Filters;