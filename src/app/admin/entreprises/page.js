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
    console.log('Rendu de la carte entreprise:', entreprise);
    return (
        <div className="entreprise-card">
            <div className="entreprise-header">
                <h2 className="entreprise-title">{entreprise.nom || entreprise.nom_entreprise}</h2>
                <div className="entreprise-secteur">{entreprise.secteur || entreprise.adresse}</div>
            </div>
            <div className="entreprise-content">
                <div className="entreprise-details">
                    <div className="detail-item">
                        <HiPhone />
                        <span>{entreprise.telephone || entreprise.téléphone}</span>
                    </div>
                    <div className="detail-item">
                        <HiMail />
                        <span>{entreprise.mail || entreprise.email}</span>
                    </div>
                </div>
            </div>
            <div className="entreprise-actions">
                <button className="btn btn-outline" onClick={() => onModifier(entreprise)}>
                    Modifier
                </button>
                <button className="btn btn-outline" onClick={() => onSupprimer(entreprise.id || entreprise.id_entreprise)}>
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
            console.log('Tentative de connexion à:', `${API_URL}/entreprises`);
            const response = await fetch(`${API_URL}/entreprises`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'omit'
            });
            
            console.log('Réponse reçue:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Données reçues:', data);
            
            if (data.status === 'success') {
                console.log('Nombre d\'entreprises reçues:', data.data.length);
                console.log('Données des entreprises:', data.data);
                setEntreprises(data.data);
            } else {
                setError('Erreur lors de la récupération des entreprises: ' + (data.message || 'Erreur inconnue'));
            }
        } catch (error) {
            console.error('Erreur détaillée:', error);
            if (error.message === 'Failed to fetch') {
                setError('Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d\'exécution et accessible.');
            } else {
                setError(`Erreur de connexion au serveur: ${error.message}`);
            }
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
            console.log('Données du formulaire:', formData);
            const url = selectedEntreprise 
                ? `${API_URL}/entreprises/${selectedEntreprise.id_entreprise}`
                : `${API_URL}/entreprises`;
            
            console.log('URL de la requête:', url);
            const method = selectedEntreprise ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            console.log('Réponse reçue:', response.status, response.statusText);
            const data = await response.json();
            console.log('Données reçues:', data);

            if (data.status === 'success') {
                setSuccess(selectedEntreprise ? 'Entreprise modifiée avec succès' : 'Entreprise créée avec succès');
                setModalOpen(false);
                fetchEntreprises();
            } else {
                setError(data.message || `Erreur lors de ${selectedEntreprise ? 'la modification' : 'la création'} de l'entreprise`);
            }
        } catch (error) {
            console.error('Erreur détaillée:', error);
            setError(`Erreur de connexion au serveur: ${error.message}`);
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
                {entreprises.length === 0 ? (
                    <div className="no-data-message">
                        Aucune entreprise trouvée
                    </div>
                ) : (
                    entreprisesFiltrees.map((entreprise) => (
                        <EntrepriseCard 
                            key={entreprise.id_entreprise} 
                            entreprise={entreprise}
                            onModifier={handleModifier}
                            onSupprimer={handleSupprimer}
                        />
                    ))
                )}
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
