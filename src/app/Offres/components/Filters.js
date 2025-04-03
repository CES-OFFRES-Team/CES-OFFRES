import React, { useState, useMemo } from 'react';
import styles from '../Offres.module.css';
import ThemeInput from './ThemeInput';

const FilterInput = ({ label, value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const handleSelect = (option) => {
        onChange(option);
        setSearchValue('');
        setIsOpen(false);
    };

    return (
        <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{label}</label>
            <div className={styles.filterInputContainer}>
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder={value || placeholder}
                    className={styles.filterInput}
                />
                {isOpen && (
                    <div className={styles.optionsList}>
                        <div 
                            className={styles.optionItem}
                            onClick={() => handleSelect('')}
                        >
                            Tout afficher
                        </div>
                        {options
                            .filter(option => 
                                option.toLowerCase().includes(searchValue.toLowerCase())
                            )
                            .map((option) => (
                                <div
                                    key={option}
                                    className={styles.optionItem}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option}
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
            {value && (
                <div className={styles.selectedValue}>
                    <span className={styles.themeTag}>
                        {value}
                        <button
                            onClick={() => onChange('')}
                            className={styles.removeTheme}
                        >
                            ×
                        </button>
                    </span>
                </div>
            )}
        </div>
    );
};

const Filters = ({ offres = [], entreprises = [], onFilterChange, filtres }) => {
    const villesDisponibles = useMemo(() => {
        const villes = entreprises
            .map(e => e.ville)
            .filter(Boolean);
        return [...new Set(villes)].sort();
    }, [entreprises]);

    const entreprisesDisponibles = useMemo(() => {
        const noms = offres
            .map(offre => offre.nom_entreprise)
            .filter(Boolean);
        return [...new Set(noms)].sort();
    }, [offres]);

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.filtersGrid}>
                <FilterInput
                    label="Entreprise"
                    value={filtres.entreprise}
                    onChange={(value) => onFilterChange({
                        ...filtres,
                        entreprise: value
                    })}
                    options={entreprisesDisponibles}
                    placeholder="Rechercher une entreprise"
                />

                <FilterInput
                    label="Ville"
                    value={filtres.ville}
                    onChange={(value) => onFilterChange({
                        ...filtres,
                        ville: value
                    })}
                    options={villesDisponibles}
                    placeholder="Rechercher une ville"
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
                        entreprise: '', 
                        ville: '', 
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