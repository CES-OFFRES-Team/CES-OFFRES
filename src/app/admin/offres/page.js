'use client';

import React, { useState, useEffect } from 'react';
import { HiLocationMarker, HiCalendar, HiClock, HiBriefcase, HiTrash, HiPlus, HiRefresh, HiSearch, HiCurrencyEuro } from 'react-icons/hi';
import OffreModal from './OffreModal';

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

export default function OffresPage() {
    const [offres, setOffres] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOffre, setSelectedOffre] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOffres();
    }, []);

    const fetchOffres = async () => {
        try {
            const response = await fetch(`${API_URL}/offres`);
            if (!response.ok) throw new Error('Erreur lors de la récupération des offres');
            const data = await response.json();
            setOffres(data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;
        
        try {
            const response = await fetch(`${API_URL}/offres/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Erreur lors de la suppression');
            setOffres(offres.filter(offre => offre.id !== id));
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleEdit = (offre) => {
        setSelectedOffre(offre);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedOffre(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedOffre(null);
    };

    const handleModalSave = async (offreData) => {
        try {
            if (selectedOffre) {
                // Mise à jour
                const response = await fetch(`${API_URL}/offres/${selectedOffre.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(offreData),
                });
                if (!response.ok) throw new Error('Erreur lors de la mise à jour');
                setOffres(offres.map(offre => 
                    offre.id === selectedOffre.id ? { ...offre, ...offreData } : offre
                ));
            } else {
                // Création
                const response = await fetch(`${API_URL}/offres`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(offreData),
                });
                if (!response.ok) throw new Error('Erreur lors de la création');
                const newOffre = await response.json();
                setOffres([...offres, newOffre]);
            }
            handleModalClose();
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const filteredOffres = offres.filter(offre =>
        offre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offre.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offre.entreprise.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestion des Offres</h1>
                <button
                    onClick={handleAdd}
                    className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
                >
                    <HiPlus className="w-5 h-5" />
                    Ajouter une offre
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher une offre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={fetchOffres}
                    className="bg-gray-100 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-200"
                >
                    <HiRefresh className="w-5 h-5" />
                    Actualiser
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOffres.map(offre => (
                    <div key={offre.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold">{offre.titre}</h2>
                            <button
                                onClick={() => handleDelete(offre.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <HiTrash className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-600">
                                <HiLocationMarker className="w-5 h-5" />
                                <span>{offre.localisation}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <HiCalendar className="w-5 h-5" />
                                <span>{offre.date_publication}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <HiClock className="w-5 h-5" />
                                <span>{offre.type_contrat}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <HiBriefcase className="w-5 h-5" />
                                <span>{offre.entreprise}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <HiCurrencyEuro className="w-5 h-5" />
                                <span>{offre.salaire}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <button
                                onClick={() => handleEdit(offre)}
                                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                            >
                                Modifier
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <OffreModal
                    offre={selectedOffre}
                    onClose={handleModalClose}
                    onSave={handleModalSave}
                />
            )}
        </div>
    );
}
