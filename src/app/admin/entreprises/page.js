'use client';

import React, { useState, useEffect } from 'react';
import { HiBuildingOffice, HiPhone, HiMail, HiTrash, HiPlus } from 'react-icons/hi';
import EntrepriseModal from './EntrepriseModal';
import './Entreprises.css';

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

const EntrepriseCard = ({ entreprise, onModifier, onSupprimer }) => {
    return (
        <div className="entreprise-card">
            <div className="entreprise-header">
                <h2 className="entreprise-title">{entreprise.nom}</h2>
                <div className="entreprise-secteur">{entreprise.secteur}</div>
            </div>
            <div className="entreprise-content">
                <div className="entreprise-details">
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
            <div className="entreprise-actions">
                <button className="btn btn-outline" onClick={() => onModifier(entreprise)}>
                    Modifier
                </button>
                <button className="btn btn-outline" onClick={() => onSupprimer(entreprise.id)}>
                    <HiTrash className="trash-icon" />
                </button>
            </div>
        </div>
    );
};

export default function AdminEntreprisesPage() {
    const [entreprises, setEntreprises] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEntreprise, setSelectedEntreprise] = useState(null);

    useEffect(() => {
        setEntreprises(entreprisesDeTest);
    }, []);

    const handleCreate = () => {
        setSelectedEntreprise(null);
        setModalOpen(true);
    };

    const handleModifier = (entreprise) => {
        setSelectedEntreprise(entreprise);
        setModalOpen(true);
    };

    const handleSupprimer = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
            setEntreprises(entreprises.filter(e => e.id !== id));
        }
    };

    const handleModalSubmit = (formData) => {
        if (selectedEntreprise) {
            // Modification
            setEntreprises(entreprises.map(e => 
                e.id === selectedEntreprise.id ? { ...formData, id: e.id } : e
            ));
        } else {
            // Création
            setEntreprises([
                ...entreprises,
                { ...formData, id: Math.max(...entreprises.map(e => e.id)) + 1 }
            ]);
        }
        setModalOpen(false);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const entreprisesFiltrees = entreprises.filter((e) =>
        e.nom.toLowerCase().includes(search.toLowerCase()) ||
        e.secteur.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="entreprises-container">
            <div className="entreprises-header">
                <h1>Gestion des Entreprises</h1>
                <button className="btn btn-primary" onClick={handleCreate}>
                    <HiPlus /> Nouvelle Entreprise
                </button>
                <input
                    type="text"
                    placeholder="Rechercher une entreprise..."
                    value={search}
                    onChange={handleSearchChange}
                    className="filter-input"
                />
            </div>

            <div className="entreprises-grid">
                {entreprisesFiltrees.map((entreprise) => (
                    <EntrepriseCard 
                        key={entreprise.id} 
                        entreprise={entreprise}
                        onModifier={handleModifier}
                        onSupprimer={handleSupprimer}
                    />
                ))}
            </div>

            {modalOpen && (
                <EntrepriseModal
                    entreprise={selectedEntreprise}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleModalSubmit}
                />
            )}
        </div>
    );
}
