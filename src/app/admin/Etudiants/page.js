'use client';

import React, { useState, useEffect } from 'react';
import { HiPhone, HiMail, HiUser, HiTrash } from 'react-icons/hi';
import '../../Offres/Offres.css';
import Cookies from 'js-cookie';

const ModalModifier = ({ etudiant, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nom_personne: etudiant.nom_personne,
        prenom_personne: etudiant.prenom_personne,
        téléphone_personne: etudiant.téléphone_personne,
        email_personne: etudiant.email_personne
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
        onSave(etudiant.id_personne, formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Modifier l'étudiant</h2>
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

const EtudiantCard = ({ etudiant, onModifier, onSupprimer }) => {
    return (
        <div className="offre-card">
            <div className="offre-header">
                <h2 className="offre-title">{etudiant.prenom_personne} {etudiant.nom_personne}</h2>
                <div className="offre-company">{etudiant.email_personne}</div>
            </div>
            <div className="offre-content">
                <div className="offre-details">
                    <div className="detail-item">
                        <HiPhone />
                        <span>{etudiant.téléphone_personne}</span>
                    </div>
                    <div className="detail-item">
                        <HiMail />
                        <span>{etudiant.email_personne}</span>
                    </div>
                </div>
            </div>
            <div className="offre-actions">
                <button className="btn btn-outline" onClick={() => onModifier(etudiant)}>Modifier</button>
                <button className="btn btn-outline" onClick={() => onSupprimer(etudiant.id_personne)}>
                    <HiTrash className="trash-icon" />
                </button>
            </div>
        </div>
    );
};

export default function AdminEtudiantsPage() {
    const [etudiants, setEtudiants] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEtudiant, setSelectedEtudiant] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchEtudiants();
    }, []);

    const fetchEtudiants = async () => {
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await fetch('http://20.19.36.142:8000/api/users/etudiants', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des étudiants');
            }

            const data = await response.json();
            setEtudiants(data.data);
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleModifier = (etudiant) => {
        setSelectedEtudiant(etudiant);
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

            // Mettre à jour la liste des étudiants
            setEtudiants(etudiants.map(e => 
                e.id_personne === id ? { ...e, ...formData } : e
            ));

            setShowModal(false);
            setSelectedEtudiant(null);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la modification de l\'étudiant');
        }
    };

    const handleSupprimer = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
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

            // Mettre à jour la liste des étudiants
            setEtudiants(etudiants.filter(e => e.id_personne !== id));
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression de l\'étudiant');
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const etudiantsFiltres = etudiants.filter((e) =>
        `${e.prenom_personne} ${e.nom_personne}`.toLowerCase().includes(search.toLowerCase()) ||
        e.email_personne.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="offres-container">
                <div className="loading">Chargement des étudiants...</div>
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
                <h1>Gestion des Étudiants</h1>
                <p>Consultez, modifiez ou supprimez les profils étudiants</p>
                <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    value={search}
                    onChange={handleSearchChange}
                    className="filter-input"
                    style={{ maxWidth: '400px', margin: '1rem auto', display: 'block' }}
                />
            </div>

            <div className="offres-grid">
                {etudiantsFiltres.map((etudiant) => (
                    <EtudiantCard 
                        key={etudiant.id_personne} 
                        etudiant={etudiant}
                        onModifier={handleModifier}
                        onSupprimer={handleSupprimer}
                    />
                ))}
            </div>

            {showModal && selectedEtudiant && (
                <ModalModifier
                    etudiant={selectedEtudiant}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedEtudiant(null);
                    }}
                    onSave={handleSaveModification}
                />
            )}
        </div>
    );
}
