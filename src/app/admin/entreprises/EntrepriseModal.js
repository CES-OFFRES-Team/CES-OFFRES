'use client';
import React, { useState } from 'react';

export default function EntrepriseModal({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        nom_entreprise: '',
        adresse: '',
        email: '',
        téléphone: '',
        description: '',
        moyenne_eval: 0
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
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Ajouter une entreprise</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nom_entreprise">Nom de l'entreprise *</label>
                        <input
                            type="text"
                            id="nom_entreprise"
                            name="nom_entreprise"
                            value={formData.nom_entreprise}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="adresse">Adresse *</label>
                        <input
                            type="text"
                            id="adresse"
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="téléphone">Téléphone *</label>
                        <input
                            type="tel"
                            id="téléphone"
                            name="téléphone"
                            value={formData.téléphone}
                            onChange={handleChange}
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
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-submit">
                            Créer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}