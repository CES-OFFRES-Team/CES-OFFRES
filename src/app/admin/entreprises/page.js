'use client';

import React, { useState, useEffect } from 'react';
import { HiBuildingOffice, HiPhone, HiMail, HiTrash, HiPlus } from 'react-icons/hi';
import EntrepriseModal from './EntrepriseModal';
import './Entreprises.css';

const API_URL = 'http://20.19.36.124:8000/api';

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
                <h2 className="entreprise-title">{entreprise.nom_entreprise}</h2>
                <div className="entreprise-secteur">{entreprise.adresse}</div>
            </div>
            <div className="entreprise-content">
                <div className="entreprise-details">
                    <div className="detail-item">
                        <HiPhone />
                        <span>{entreprise.téléphone}</span>
                    </div>
                    <div className="detail-item">
                        <HiMail />
                        <span>{entreprise.email}</span>
                    </div>
                </div>
            </div>
            <div className="entreprise-actions">
                <button className="btn btn-outline" onClick={() => onModifier(entreprise)}>
                    Modifier
                </button>
                <button className="btn btn-outline" onClick={() => onSupprimer(entreprise.id_entreprise)}>
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
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchEntreprises();
    }, []);

    const fetchEntreprises = async () => {
        try {
            const response = await fetch(`${API_URL}/entreprises`);
            const data = await response.json();
            
            if (data.status === 'success') {
                setEntreprises(data.data);
            } else {
                setError('Erreur lors de la récupération des entreprises');
            }
        } catch (error) {
            setError('Erreur de connexion au serveur');
            console.error('Erreur:', error);
        }
    };

    const handleCreate = () => {
        setSelectedEntreprise(null);
        setModalOpen(true);
    };

    const handleModifier = (entreprise) => {
        setSelectedEntreprise(entreprise);
        setModalOpen(true);
    };

    const handleSupprimer = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
            try {
                const response = await fetch(`${API_URL}/entreprises/${id}`, {
                    method: 'DELETE',
                });

                const data = await response.json();

                if (data.status === 'success') {
                    setSuccess('Entreprise supprimée avec succès');
                    fetchEntreprises();
                } else {
                    setError(data.message || 'Erreur lors de la suppression de l\'entreprise');
                }
            } catch (error) {
                setError('Erreur de connexion au serveur');
                console.error('Erreur:', error);
            }
        }
    };

    const handleModalSubmit = async (formData) => {
        try {
            const url = selectedEntreprise 
                ? `${API_URL}/entreprises/${selectedEntreprise.id_entreprise}`
                : `${API_URL}/entreprises`;
            
            const method = selectedEntreprise ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setSuccess(selectedEntreprise ? 'Entreprise modifiée avec succès' : 'Entreprise créée avec succès');
                setModalOpen(false);
                fetchEntreprises();
            } else {
                setError(data.message || `Erreur lors de ${selectedEntreprise ? 'la modification' : 'la création'} de l'entreprise`);
            }
        } catch (error) {
            setError('Erreur de connexion au serveur');
            console.error('Erreur:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const entreprisesFiltrees = entreprises.filter((e) =>
        e.nom_entreprise.toLowerCase().includes(search.toLowerCase()) ||
        e.adresse.toLowerCase().includes(search.toLowerCase())
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

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            <div className="entreprises-grid">
                {entreprisesFiltrees.map((entreprise) => (
                    <EntrepriseCard 
                        key={entreprise.id_entreprise} 
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
