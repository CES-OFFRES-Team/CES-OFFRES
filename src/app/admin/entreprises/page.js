'use client';

import React, { useState, useEffect } from 'react';
import { HiBuildingOffice, HiPhone, HiMail, HiTrash, HiPlus, HiRefresh } from 'react-icons/hi';
import EntrepriseModal from './EntrepriseModal';
import './Entreprises.css';

const API_URL = 'http://20.19.36.124:8000/api';

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
    console.log('Rendu de la carte entreprise:', entreprise);
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
    const [loading, setLoading] = useState(true);
    const [cacheInfo, setCacheInfo] = useState({ used: false, timestamp: null });

    useEffect(() => {
        fetchEntreprises();
    }, []);

    const fetchEntreprises = async () => {
        try {
            setLoading(true);
            console.log("Vérification du cache...");
            
            // Vérifier si des données sont en cache
            const cachedData = localStorage.getItem('adminEntreprisesCache');
            const cacheTimestamp = localStorage.getItem('adminEntreprisesCacheTimestamp');
            
            // Si des données sont en cache et le cache a moins de 10 minutes
            if (cachedData && cacheTimestamp) {
                const parsedData = JSON.parse(cachedData);
                const timestamp = parseInt(cacheTimestamp);
                const now = new Date().getTime();
                const cacheAge = now - timestamp;
                const cacheMaxAge = 10 * 60 * 1000; // 10 minutes en millisecondes
                
                if (cacheAge < cacheMaxAge && parsedData.length > 0) {
                    console.log("Utilisation des données en cache");
                    setEntreprises(parsedData);
                    setCacheInfo({ 
                        used: true, 
                        timestamp: new Date(timestamp).toLocaleString(),
                        age: Math.round(cacheAge / 1000 / 60) + " minutes"
                    });
                    setError(null);
                    setLoading(false);
                    return;
                } else {
                    console.log("Cache expiré ou vide, nouvelle requête à l'API");
                }
            } else {
                console.log("Pas de cache disponible, première requête à l'API");
            }
            
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
            
            // Enregistrement du temps de réponse
            console.log('Réponse reçue:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("La réponse n'est pas au format JSON");
            }
            
            const data = await response.json();
            console.log('Données reçues:', data);
            
            let entreprisesData = [];
            
            // Gestion de différents formats possibles
            if (data.status === 'success' && data.data) {
                console.log('Nombre d\'entreprises reçues:', data.data.length);
                entreprisesData = data.data;
            } else if (data.records) {
                console.log('Format alternatif - Nombre d\'entreprises:', data.records.length);
                entreprisesData = data.records;
            } else if (Array.isArray(data)) {
                console.log('Les données sont directement un tableau:', data.length);
                entreprisesData = data;
            } else {
                throw new Error('Format de données non reconnu: ' + JSON.stringify(data).substring(0, 100));
            }
            
            // Mise à jour de l'état
            setEntreprises(entreprisesData);
            setError(null);
            
            // Mise en cache des données
            localStorage.setItem('adminEntreprisesCache', JSON.stringify(entreprisesData));
            const timestamp = new Date().getTime();
            localStorage.setItem('adminEntreprisesCacheTimestamp', timestamp);
            setCacheInfo({ 
                used: false, 
                timestamp: new Date(timestamp).toLocaleString(),
                fresh: true
            });
            
        } catch (error) {
            console.error('Erreur détaillée:', error);
            
            // Essayer de récupérer les données du cache en cas d'erreur
            const cachedData = localStorage.getItem('adminEntreprisesCache');
            if (cachedData) {
                console.log("Utilisation du cache suite à une erreur");
                const parsedData = JSON.parse(cachedData);
                const cacheTimestamp = localStorage.getItem('adminEntreprisesCacheTimestamp');
                
                setEntreprises(parsedData);
                setError(`Erreur API: ${error.message}. Affichage des données en cache.`);
                setCacheInfo({ 
                    used: true, 
                    timestamp: cacheTimestamp ? new Date(parseInt(cacheTimestamp)).toLocaleString() : "inconnu",
                    fromError: true
                });
            } else {
                // En dernier recours, utiliser les données de test
                if (error.message === 'Failed to fetch') {
                    setError('Impossible de se connecter au serveur. Affichage des données de test.');
                } else {
                    setError(`Erreur: ${error.message}. Affichage des données de test.`);
                }
                setEntreprises(entreprisesDeTest);
            }
        } finally {
            setLoading(false);
        }
    };

    const forceRefresh = () => {
        // Supprimer le cache
        localStorage.removeItem('adminEntreprisesCache');
        localStorage.removeItem('adminEntreprisesCacheTimestamp');
        // Lancer une nouvelle recherche
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
                    // Supprimer du cache aussi
                    localStorage.removeItem('adminEntreprisesCache');
                    localStorage.removeItem('adminEntreprisesCacheTimestamp');
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
                // Supprimer le cache pour recharger les données fraîches
                localStorage.removeItem('adminEntreprisesCache');
                localStorage.removeItem('adminEntreprisesCacheTimestamp');
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

    const entreprisesFiltrees = entreprises.filter((e) =>
        (e.nom_entreprise?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (e.adresse?.toLowerCase() || '').includes(search.toLowerCase())
    );

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

            {/* Informations sur le cache */}
            {cacheInfo.used && (
                <div className="alert alert-info">
                    <p>
                        <strong>Données en cache</strong> - Chargées le {cacheInfo.timestamp} 
                        {cacheInfo.age && <span> (il y a {cacheInfo.age})</span>}
                        {cacheInfo.fromError && <span> suite à une erreur API</span>}
                    </p>
                </div>
            )}

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
