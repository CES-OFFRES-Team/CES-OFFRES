'use client';

import React, { useState, useEffect } from 'react';
import { HiPhone, HiMail, HiTrash } from 'react-icons/hi';
import '../AdminPages.css';
import Cookies from 'js-cookie';

const ModalModifier = ({ pilote, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nom_personne: pilote.nom_personne,
        prenom_personne: pilote.prenom_personne,
        téléphone_personne: pilote.téléphone_personne,
        email_personne: pilote.email_personne
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(pilote.id_personne, formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Modifier le pilote</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nom_personne">Nom</label>
                        <input
                            type="text"
                            id="nom_personne"
                            name="nom_personne"
                            value={formData.nom_personne}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="prenom_personne">Prénom</label>
                        <input
                            type="text"
                            id="prenom_personne"
                            name="prenom_personne"
                            value={formData.prenom_personne}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="téléphone_personne">Téléphone</label>
                        <input
                            type="tel"
                            id="téléphone_personne"
                            name="téléphone_personne"
                            value={formData.téléphone_personne}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email_personne">Email</label>
                        <input
                            type="email"
                            id="email_personne"
                            name="email_personne"
                            value={formData.email_personne}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Annuler</button>
                        <button type="submit" className="btn btn-primary">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PiloteCard = ({ pilote, onModifier, onSupprimer }) => {
    return (
        <div className="offre-card">
            <div className="offre-header">
                <h2 className="offre-title">{pilote.prenom_personne} {pilote.nom_personne}</h2>
                <div className="offre-company">{pilote.email_personne}</div>
            </div>
            <div className="offre-content">
                <div className="offre-details">
                    <div className="detail-item">
                        <HiPhone />
                        <span>{pilote.téléphone_personne}</span>
                    </div>
                    <div className="detail-item">
                        <HiMail />
                        <span>{pilote.email_personne}</span>
                    </div>
                </div>
            </div>
            <div className="offre-actions">
                <button className="btn btn-outline" onClick={() => onModifier(pilote)}>Modifier</button>
                <button className="btn btn-outline" onClick={() => onSupprimer(pilote.id_personne)}>
                    <HiTrash className="trash-icon" />
                </button>
            </div>
        </div>
    );
};

export default function AdminPilotesPage() {
    const [pilotes, setPilotes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPilote, setSelectedPilote] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchPilotes();
    }, []);

    const fetchPilotes = async () => {
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await fetch('http://20.19.36.142:8000/api/users/pilotes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des pilotes');
            }

            const data = await response.json();
            setPilotes(data.data);
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleModifier = (pilote) => {
        setSelectedPilote(pilote);
        setShowModal(true);
    };

    const handleSaveModification = async (id, formData) => {
        try {
            const token = Cookies.get('authToken');
            const response = await fetch(`http://20.19.36.142:8000/api/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la modification');
            }

            // Mettre à jour la liste des pilotes
            setPilotes(pilotes.map(p => 
                p.id_personne === id ? { ...p, ...formData } : p
            ));

            setShowModal(false);
            setSelectedPilote(null);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la modification du pilote');
        }
    };

    const handleSupprimer = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce pilote ?')) {
            return;
        }

        try {
            const token = Cookies.get('authToken');
            const response = await fetch(`http://20.19.36.142:8000/api/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            // Mettre à jour la liste des pilotes
            setPilotes(pilotes.filter(p => p.id_personne !== id));
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression du pilote');
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const pilotesFiltres = pilotes.filter((p) =>
        `${p.prenom_personne} ${p.nom_personne}`.toLowerCase().includes(search.toLowerCase()) ||
        p.email_personne.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="offres-container">
                <div className="loading">Chargement des pilotes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="offres-container">
                <div className="error-message">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="offres-container">
            <div className="offres-header">
                <h1>Gestion des Pilotes</h1>
                <p>Consultez, modifiez ou supprimez les profils pilotes</p>
                <input
                    type="text"
                    placeholder="Rechercher un pilote..."
                    value={search}
                    onChange={handleSearchChange}
                    className="filter-input"
                    style={{ maxWidth: '400px', margin: '1rem auto', display: 'block' }}
                />
            </div>

            <div className="offres-grid">
                {pilotesFiltres.map((pilote) => (
                    <PiloteCard 
                        key={pilote.id_personne} 
                        pilote={pilote}
                        onModifier={handleModifier}
                        onSupprimer={handleSupprimer}
                    />
                ))}
            </div>

            {showModal && selectedPilote && (
                <ModalModifier
                    pilote={selectedPilote}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedPilote(null);
                    }}
                    onSave={handleSaveModification}
                />
            )}
        </div>
    );
}
