'use client';

import React, { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';

const API_URL = 'http://20.19.36.142:8000/api';

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

    useEffect(() => {
        if (offre) {
            setFormData({
                titre: offre.titre,
                id_entreprise: offre.id_entreprise,
                description: offre.description,
                remuneration: offre.remuneration,
                date_debut: offre.date_début.split('T')[0],
                date_fin: offre.date_fin.split('T')[0],
            });
        }

        // Charger la liste des entreprises
        const fetchEntreprises = async () => {
            try {
                console.log('Début de la requête API entreprises');
                const response = await fetch(`${API_URL}/entreprises`);
                console.log('Réponse reçue:', response);
                
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des entreprises');
                }
                
                const data = await response.json();
                console.log('Données reçues:', data);
                console.log('Type de data:', typeof data);
                console.log('Est-ce un tableau?', Array.isArray(data));
                
                // Vérifier si data est un tableau ou si les données sont dans data.data
                const entreprisesData = Array.isArray(data) ? data : (data.data || []);
                console.log('Données traitées:', entreprisesData);
                
                if (!Array.isArray(entreprisesData)) {
                    throw new Error('Format de données invalide');
                }
                
                setEntreprises(entreprisesData);
            } catch (err) {
                console.error('Erreur détaillée:', err);
                setError('Impossible de charger la liste des entreprises');
                setEntreprises([]); // S'assurer que entreprises est toujours un tableau
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
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation des dates
        const dateDebut = new Date(formData.date_debut);
        const dateFin = new Date(formData.date_fin);
        
        if (dateDebut > dateFin) {
            setError('La date de début doit être antérieure à la date de fin');
            return;
        }

        // Validation de la rémunération
        if (isNaN(formData.remuneration) || formData.remuneration < 0) {
            setError('La rémunération doit être un nombre positif');
            return;
        }

        onSubmit(formData);
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

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="titre">Titre de l'offre</label>
                        <input
                            type="text"
                            id="titre"
                            name="titre"
                            value={formData.titre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="id_entreprise">Entreprise</label>
                        <select
                            id="id_entreprise"
                            name="id_entreprise"
                            value={formData.id_entreprise}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Sélectionnez une entreprise</option>
                            {Array.isArray(entreprises) && entreprises.map(entreprise => (
                                <option key={entreprise.id_entreprise} value={entreprise.id_entreprise}>
                                    {entreprise.nom_entreprise}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="date_debut">Date de début</label>
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
                        <label htmlFor="date_fin">Date de fin</label>
                        <input
                            type="date"
                            id="date_fin"
                            name="date_fin"
                            value={formData.date_fin}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="remuneration">Rémunération (€)</label>
                        <input
                            type="number"
                            id="remuneration"
                            name="remuneration"
                            value={formData.remuneration}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            required
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