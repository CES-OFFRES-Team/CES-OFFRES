'use client';

import React, { useState, useEffect } from 'react';
import { HiBuildingOffice, HiPhone, HiMail, HiTrash } from 'react-icons/hi';
import '../../Offres/Offres.css';

// Données fictives pour les entreprises
const entreprisesDeTest = [
    {
        id: 1,
        nom: 'TechCorp',
        secteur: 'Informatique',
        telephone: '0123456789',
        mail: 'contact@techcorp.com',
    },
    {
        id: 2,
        nom: 'EcoSolutions',
        secteur: 'Énergie',
        telephone: '0987654321',
        mail: 'info@ecosolutions.fr',
    },
];

const EntrepriseCard = ({ entreprise }) => {
    const handleModifier = () => { };
    const handleSupprimer = () => { };
    const handlePostuler = () => { };

    return (
        <div className="offre-card">
            <div className="offre-header">
                <h2 className="offre-title">{entreprise.nom}</h2>
                <div className="offre-company">{entreprise.secteur}</div>
            </div>
            <div className="offre-content">
                <div className="offre-details">
                    <div className="detail-item">
                        <HiPhone />
                        <span>{entreprise.telephone}</span>
                    </div>
                    <div className="detail-item">
                        <HiMail />
                        <span>{entreprise.mail}</span>
                    </div>
                </div>
            </div>
            <div className="offre-actions">
                <button className="btn btn-outline" onClick={handleModifier}>Modifier</button>
                <button className="btn btn-outline" onClick={handleSupprimer}>
                    <HiTrash className="trash-icon" />
                </button>
                <button className="btn btn-primary" onClick={handlePostuler}>
                    Postuler
                </button>
            </div>
        </div>
    );
};

export default function AdminEntreprisesPage() {
    const [entreprises, setEntreprises] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setEntreprises(entreprisesDeTest);
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const entreprisesFiltrees = entreprises.filter((e) =>
        e.nom.toLowerCase().includes(search.toLowerCase()) ||
        e.secteur.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="offres-container">
            <div className="offres-header">
                <h1>Gestion des Entreprises</h1>
                <p>Consultez, modifiez ou supprimez les profils d'entreprise</p>
                <input
                    type="text"
                    placeholder="Rechercher une entreprise..."
                    value={search}
                    onChange={handleSearchChange}
                    className="filter-input"
                    style={{ maxWidth: '400px', margin: '1rem auto', display: 'block' }}
                />
            </div>

            <div className="offres-grid">
                {entreprisesFiltrees.map((entreprise) => (
                    <EntrepriseCard key={entreprise.id} entreprise={entreprise} />
                ))}
            </div>
        </div>
    );
}
