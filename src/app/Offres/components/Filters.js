import React, { useState } from 'react';
import { HiX } from 'react-icons/hi';

export default function Filters({ onFilterChange }) {
    const [villes, setVilles] = useState([]);
    const [villeInput, setVilleInput] = useState('');
    const [duree, setDuree] = useState({ min: '', max: '' });
    const [moisDebut, setMoisDebut] = useState('');

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const handleVilleAdd = (e) => {
        if (e.key === 'Enter' && villeInput.trim()) {
            if (!villes.includes(villeInput.trim())) {
                const newVilles = [...villes, villeInput.trim()];
                setVilles(newVilles);
                setVilleInput('');
                onFilterChange('villes', newVilles);
            }
        }
    };

    const handleVilleRemove = (ville) => {
        const newVilles = villes.filter(v => v !== ville);
        setVilles(newVilles);
        onFilterChange('villes', newVilles);
    };

    const handleDureeChange = (type, value) => {
        const newDuree = { ...duree, [type]: value };
        setDuree(newDuree);
        onFilterChange('duree', newDuree);
    };

    const handleMoisChange = (e) => {
        setMoisDebut(e.target.value);
        onFilterChange('moisDebut', e.target.value);
    };

    return (
        <div className="offres-filters">
            <div className="filters-grid">
                <div className="filter-item">
                    <label>Localisation</label>
                    <input
                        type="text"
                        className="filter-input"
                        value={villeInput}
                        onChange={(e) => setVilleInput(e.target.value)}
                        onKeyPress={handleVilleAdd}
                        placeholder="Entrez une ville et appuyez sur Entrée"
                    />
                    <div className="filter-chips">
                        {villes.map(ville => (
                            <span key={ville} className="filter-chip">
                                {ville}
                                <button onClick={() => handleVilleRemove(ville)}>
                                    <HiX />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="filter-item">
                    <label>Durée (en mois)</label>
                    <div className="duration-inputs">
                        <input
                            type="number"
                            className="filter-input"
                            placeholder="Min"
                            value={duree.min}
                            onChange={(e) => handleDureeChange('min', e.target.value)}
                            min="1"
                        />
                        <span>à</span>
                        <input
                            type="number"
                            className="filter-input"
                            placeholder="Max"
                            value={duree.max}
                            onChange={(e) => handleDureeChange('max', e.target.value)}
                            min={duree.min || "1"}
                        />
                    </div>
                </div>

                <div className="filter-item">
                    <label>Mois de début</label>
                    <select 
                        className="month-select"
                        value={moisDebut}
                        onChange={handleMoisChange}
                    >
                        <option value="">Tous les mois</option>
                        {months.map((month, index) => (
                            <option key={month} value={index + 1}>
                                {month}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}