'use client';

import React, { useState, useEffect } from 'react';
import { HiBuildingOffice, HiPhone, HiMail, HiTrash, HiPlus, HiRefresh } from 'react-icons/hi';
import EntrepriseModal from './EntrepriseModal';
import './Entreprises.css';

const API_URL = 'http://20.19.36.142:8000/api';

// Données fictives pour les entreprises
const entreprisesDeTest = [
    {
        id_entreprise: 1,
        nom_entreprise: 'TechCorp',
        adresse: 'Paris, France',
        téléphone: '0123456789',
        email: 'contact@techcorp.com',
        description: 'Entreprise spécialisée dans le développement informatique',
        moyenne_eval: 4.5
    },
    {
        id_entreprise: 2,
        nom_entreprise: 'EcoSolutions',
        adresse: 'Lyon, France',
        téléphone: '0987654321',
        email: 'info@ecosolutions.fr',
        description: 'Solutions écologiques innovantes',
        moyenne_eval: 4.2
    },
];

const EntrepriseCard = ({ entreprise, onModifier, onSupprimer }) => {
    console.log('Rendu de la carte entreprise avec les données:', JSON.stringify(entreprise, null, 2));
    return (
        <div className="entreprise-card">
            <div className="entreprise-header">
                <h2 className="entreprise-title">{entreprise.nom_entreprise || 'Nom non disponible'}</h2>
                <div className="entreprise-secteur">{entreprise.adresse || 'Adresse non disponible'}</div>
            </div>
            <div className="entreprise-content">
                <div className="entreprise-details">
                    <div className="detail-item">
                        <HiPhone />
                        <span>{entreprise.téléphone || 'Téléphone non disponible'}</span>
                    </div>
                    <div className="detail-item">
                        <HiMail />
                        <span>{entreprise.email || 'Email non disponible'}</span>
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
    const [loading, setLoading] = useState(true);
    const [cacheInfo, setCacheInfo] = useState({ used: false, timestamp: null });

    useEffect(() => {
        fetchEntreprises();
    }, []);

    const fetchEntreprises = async () => {
        try {
            setLoading(true);
            console.log('Tentative de connexion à:', `${API_URL}/entreprises`);
            
            const response = await fetch(`${API_URL}/entreprises`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors'
            });
            
            console.log('Réponse reçue:', response.status, response.statusText);
            console.log('Headers de la réponse:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get("content-type");
            console.log('Type de contenu reçu:', contentType);
            
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("La réponse n'est pas au format JSON");
            }
            
            const data = await response.json();
            console.log('Données brutes reçues:', JSON.stringify(data, null, 2));
            
            let entreprisesData = [];
            
            // Gestion de différents formats possibles
            if (data.status === 'success' && data.data) {
                console.log('Format 1 - Nombre d\'entreprises reçues:', data.data.length);
                entreprisesData = data.data;
            } else if (data.records) {
                console.log('Format 2 - Nombre d\'entreprises:', data.records.length);
                entreprisesData = data.records;
            } else if (Array.isArray(data)) {
                console.log('Format 3 - Les données sont directement un tableau:', data.length);
                entreprisesData = data;
            } else {
                console.log('Format non reconnu, données reçues:', data);
                throw new Error('Format de données non reconnu: ' + JSON.stringify(data).substring(0, 100));
            }
            
            console.log('Données finales à afficher:', JSON.stringify(entreprisesData, null, 2));
            
            // Mise à jour de l'état
            setEntreprises(entreprisesData);
            setError(null);
            
        } catch (error) {
            console.error('Erreur détaillée:', error);
            if (error.message === 'Failed to fetch') {
                setError('Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d\'exécution.');
            } else {
                setError(`Erreur: ${error.message}`);
            }
            setEntreprises([]);
        } finally {
            setLoading(false);
        }
    };

    const forceRefresh = () => {
        fetchEntreprises();
        setSuccess('Actualisation des données en cours...');
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

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.status === 'success') {
                    setSuccess('Entreprise supprimée avec succès');
                    fetchEntreprises();
                } else {
                    setError(data.message || 'Erreur lors de la suppression de l\'entreprise');
                }
            } catch (error) {
                console.error('Erreur détaillée:', error);
                setError(`Erreur lors de la suppression: ${error.message}`);
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
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
            setError(`Erreur: ${error.message}`);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const entreprisesFiltrees = entreprises.filter((e) => {
        const nomMatch = (e.nom_entreprise?.toLowerCase() || '').includes(search.toLowerCase());
        const adresseMatch = (e.adresse?.toLowerCase() || '').includes(search.toLowerCase());
        console.log(`Filtrage entreprise: ${e.nom_entreprise} - Nom match: ${nomMatch}, Adresse match: ${adresseMatch}`);
        return nomMatch || adresseMatch;
    });

    console.log('Nombre total d\'entreprises:', entreprises.length);
    console.log('Nombre d\'entreprises filtrées:', entreprisesFiltrees.length);
    console.log('Terme de recherche:', search);

    return (
        <div className="entreprises-container">
            <div className="entreprises-header">
                <h1>Gestion des Entreprises</h1>
                <div className="actions-container">
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <HiPlus /> Nouvelle Entreprise
                    </button>
                    <button className="btn btn-secondary" onClick={forceRefresh} title="Rafraîchir les données">
                        <HiRefresh /> Actualiser
                    </button>
                </div>
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

            {loading ? (
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Chargement des entreprises...</p>
                </div>
            ) : (
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
            )}

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
