'use client';

import React, { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';

const API_URL = 'http://20.19.36.142:8000/api';

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Si la date contient déjà un T, on prend juste la partie avant
    if (dateString.includes('T')) {
        return dateString.split('T')[0];
    }
    // Sinon, on suppose que c'est une date simple
    return dateString;
};

export default function OffreModal({ offre, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        titre: '',
        id_entreprise: '',
        description: '',
        remuneration: '',
        date_debut: '',
        date_fin: '',
    });
    const [entreprises, setEntreprises] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (offre) {
            setFormData({
                titre: offre.titre || '',
                id_entreprise: offre.id_entreprise || '',
                description: offre.description || '',
                remuneration: offre.remuneration || '',
                date_debut: formatDateForInput(offre.date_debut || offre.date_début),
                date_fin: formatDateForInput(offre.date_fin),
            });
        }

        const fetchEntreprises = async () => {
            setIsLoading(true);
            try {
                console.log('Début de la requête API entreprises');
                const response = await fetch(`${API_URL}/entreprises`);
                
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des entreprises');
                }
                
                const result = await response.json();
                console.log('Données reçues:', result);
                
                if (result.status === 'success' && Array.isArray(result.data)) {
                    setEntreprises(result.data);
                } else {
                    throw new Error('Format de données invalide');
                }
            } catch (err) {
                console.error('Erreur détaillée:', err);
                setError('Impossible de charger la liste des entreprises');
                setEntreprises([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntreprises();
    }, [offre]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Réinitialiser l'erreur quand l'utilisateur modifie un champ
        setError('');
    };

    const validateForm = () => {
        if (!formData.titre.trim()) {
            setError('Le titre est requis');
            return false;
        }

        if (!formData.id_entreprise) {
            setError('Veuillez sélectionner une entreprise');
            return false;
        }

        if (!formData.description.trim()) {
            setError('La description est requise');
            return false;
        }

        const remuneration = parseFloat(formData.remuneration);
        if (isNaN(remuneration) || remuneration < 0) {
            setError('La rémunération doit être un nombre positif');
            return false;
        }

        const dateDebut = new Date(formData.date_debut);
        const dateFin = new Date(formData.date_fin);
        
        if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
            setError('Les dates sont invalides');
            return false;
        }

        if (dateDebut > dateFin) {
            setError('La date de début doit être antérieure à la date de fin');
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Convertir la rémunération en nombre
        const dataToSubmit = {
            ...formData,
            remuneration: parseFloat(formData.remuneration),
            id_entreprise: parseInt(formData.id_entreprise, 10)
        };

        onSubmit(dataToSubmit);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{offre ? 'Modifier l\'offre' : 'Nouvelle offre'}</h2>
                    <button className="close-button" onClick={onClose}>
                        <HiX />
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="offre-form">
                    <div className="form-group">
                        <label htmlFor="titre">Titre de l'offre *</label>
                        <input
                            type="text"
                            id="titre"
                            name="titre"
                            value={formData.titre}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Développeur Full Stack"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="id_entreprise">Entreprise *</label>
                        {isLoading ? (
                            <div>Chargement des entreprises...</div>
                        ) : (
                            <select
                                id="id_entreprise"
                                name="id_entreprise"
                                value={formData.id_entreprise}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionnez une entreprise</option>
                                {entreprises.map(entreprise => (
                                    <option key={entreprise.id_entreprise} value={entreprise.id_entreprise}>
                                        {entreprise.nom_entreprise}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="date_debut">Date de début *</label>
                            <input
                                type="date"
                                id="date_debut"
                                name="date_debut"
                                value={formData.date_debut}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="date_fin">Date de fin *</label>
                            <input
                                type="date"
                                id="date_fin"
                                name="date_fin"
                                value={formData.date_fin}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="remuneration">Rémunération (€) *</label>
                        <input
                            type="number"
                            id="remuneration"
                            name="remuneration"
                            value={formData.remuneration}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                            placeholder="Ex: 800"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            required
                            placeholder="Décrivez le poste, les missions, les compétences requises..."
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {offre ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 