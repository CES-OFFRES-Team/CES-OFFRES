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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchEntreprises();
    }, []);

    const fetchEntreprises = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/entreprises');
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

    const handleCreateEntreprise = async (entrepriseData) => {
        try {
            const response = await fetch('http://localhost:8000/api/entreprises', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entrepriseData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setSuccess('Entreprise créée avec succès');
                setIsModalOpen(false);
                fetchEntreprises(); // Rafraîchir la liste
            } else {
                setError(data.message || 'Erreur lors de la création de l\'entreprise');
            }
        } catch (error) {
            setError('Erreur de connexion au serveur');
            console.error('Erreur:', error);
        }
    };

    return (
        <div className="admin-entreprises-container">
            <div className="admin-entreprises-header">
                <h1>Gestion des Entreprises</h1>
                <button 
                    className="btn-add"
                    onClick={() => setIsModalOpen(true)}
                >
                    Ajouter une entreprise
                </button>
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

            <div className="entreprises-list">
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Adresse</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Note moyenne</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entreprises.map((entreprise) => (
                            <tr key={entreprise.id_entreprise}>
                                <td>{entreprise.nom_entreprise}</td>
                                <td>{entreprise.adresse}</td>
                                <td>{entreprise.email}</td>
                                <td>{entreprise.téléphone}</td>
                                <td>{entreprise.moyenne_eval || '0'}</td>
                                <td>
                                    <button className="btn-edit">Modifier</button>
                                    <button className="btn-delete">Supprimer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <EntrepriseModal
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateEntreprise}
                />
            )}
        </div>
    );
}
