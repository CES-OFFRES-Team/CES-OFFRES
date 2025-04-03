'use client';

import React, { useState, useEffect } from 'react';
import { HiLocationMarker, HiCalendar, HiClock, HiBriefcase, HiTrash, HiPlus, HiRefresh, HiSearch, HiCurrencyEuro } from 'react-icons/hi';
import OffreModal from './OffreModal';
import './Offres.module.css';

const API_URL = 'http://20.19.36.142:8000/api';

// Données fictives pour les offres
const offresDeTest = [
    {
        id_offre: 1,
        titre: 'Développeur Full Stack',
        entreprise: 'TechCorp',
        localisation: 'Paris',
        dateDebut: '2024-06-01',
        duree: 6,
        description: 'Stage en développement web full stack',
        remuneration: '800€/mois'
    },
    {
        id_offre: 2,
        titre: 'Data Analyst',
        entreprise: 'EcoSolutions',
        localisation: 'Lyon',
        dateDebut: '2024-07-01',
        duree: 4,
        description: 'Stage en analyse de données',
        remuneration: '700€/mois'
    }
];

const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric'
    });
};

const OffreCard = ({ offre, onModify, onDelete }) => {
    console.log('Rendu de la carte offre avec les données:', JSON.stringify(offre, null, 2));
    return (
        <div className="offre-card">
            <div className="offre-header">
                <h3 className="offre-title">{offre.titre || 'Titre non disponible'}</h3>
                <p className="offre-company">{offre.nom_entreprise || 'Entreprise non disponible'}</p>
            </div>
            <div className="offre-content">
                <div className="offre-details">
                    <div className="detail-item">
                        <HiCalendar />
                        <span>Du {formatDate(offre.date_debut)} au {formatDate(offre.date_fin)}</span>
                    </div>
                    <div className="detail-item">
                        <HiCurrencyEuro />
                        <span>{offre.remuneration || 'Rémunération non disponible'}€</span>
                    </div>
                </div>
                <p className="offre-description">{offre.description || 'Description non disponible'}</p>
            </div>
            <div className="offre-actions">
                <button className="btn btn-outline" onClick={() => onModify(offre)}>
                    Modifier
                </button>
                <button className="btn btn-outline" onClick={() => onDelete(offre.id_stage)}>
                    <HiTrash className="trash-icon" />
                </button>
            </div>
        </div>
    );
};

export default function AdminOffresPage() {
    const [offres, setOffres] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOffre, setSelectedOffre] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchOffres = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/offres`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des offres');
            }
            const result = await response.json();
            console.log('Données reçues de l\'API:', result);
            
            if (result.status === 'success' && Array.isArray(result.data)) {
                setOffres(result.data);
                setError('');
            } else {
                throw new Error('Format de données invalide');
            }
        } catch (err) {
            setError(err.message);
            console.error('Erreur:', err);
            setOffres([]); // Initialiser avec un tableau vide en cas d'erreur
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOffres();
    }, []);

    const handleCreate = () => {
        setSelectedOffre(null);
        setIsModalOpen(true);
    };

    const handleModify = (offre) => {
        setSelectedOffre(offre);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/offres/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de l\'offre');
            }

            setOffres(offres.filter(offre => offre.id_stage !== id));
            setSuccess('Offre supprimée avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
            console.error('Erreur:', err);
        }
    };

    const handleSubmit = async (formData) => {
        try {
            const url = selectedOffre 
                ? `${API_URL}/offres/${selectedOffre.id_stage}`
                : `${API_URL}/offres`;
            
            const method = selectedOffre ? 'PUT' : 'POST';

            console.log('Envoi de la requête:', {
                url,
                method,
                formData
            });

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            console.log('Réponse reçue:', result);

            if (!response.ok || result.status === 'error') {
                throw new Error(result.message || 'Erreur lors de l\'enregistrement de l\'offre');
            }
            
            if (result.status === 'success') {
                if (selectedOffre) {
                    setOffres(offres.map(offre => 
                        offre.id_stage === selectedOffre.id_stage ? { ...offre, ...result.data } : offre
                    ));
                } else {
                    setOffres([...offres, result.data]);
                }

                setIsModalOpen(false);
                setSuccess(selectedOffre ? 'Offre modifiée avec succès' : 'Offre créée avec succès');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                throw new Error(result.message || 'Erreur lors de l\'enregistrement');
            }
        } catch (err) {
            setError(err.message);
            console.error('Erreur:', err);
        }
    };

    // Vérifier que offres est un tableau avant d'appliquer filter
    const filteredOffres = Array.isArray(offres) ? offres.filter(offre =>
        (offre.titre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (offre.nom_entreprise?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (offre.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="offres-container">
            <div className="offres-header">
                <h1>Gestion des Offres</h1>
                <div className="actions-container">
                    <div className="search-container">
                        <HiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher une offre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="filter-input"
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <HiPlus />
                        Nouvelle Offre
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {isLoading ? (
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Chargement des offres...</p>
                </div>
            ) : (
                <div className="offres-grid">
                    {filteredOffres.length === 0 ? (
                        <div className="no-data-message">
                            {searchTerm ? 'Aucune offre ne correspond à votre recherche' : 'Aucune offre disponible'}
                        </div>
                    ) : (
                        filteredOffres.map(offre => (
                            <OffreCard
                                key={offre.id_stage}
                                offre={offre}
                                onModify={handleModify}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            )}

            {isModalOpen && (
                <OffreModal
                    offre={selectedOffre}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}
