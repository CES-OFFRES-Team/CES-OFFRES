import React, { useState } from 'react';

const OffreModal = ({ offre, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        titre: offre?.titre || '',
        entreprise: offre?.entreprise || '',
        localisation: offre?.localisation || '',
        dateDebut: offre?.dateDebut || '',
        description: offre?.description || '',
        competences: offre?.competences?.join(', ') || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const competencesArray = formData.competences
            .split(',')
            .map(comp => comp.trim())
            .filter(comp => comp !== '');

        onSubmit({
            ...formData,
            competences: competencesArray
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{offre ? 'Modifier' : 'Créer'} une offre</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Titre</label>
                        <input
                            type="text"
                            value={formData.titre}
                            onChange={(e) => setFormData({...formData, titre: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Entreprise</label>
                        <input
                            type="text"
                            value={formData.entreprise}
                            onChange={(e) => setFormData({...formData, entreprise: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Localisation</label>
                        <input
                            type="text"
                            value={formData.localisation}
                            onChange={(e) => setFormData({...formData, localisation: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Date de début</label>
                        <input
                            type="date"
                            value={formData.dateDebut}
                            onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Compétences (séparées par des virgules)</label>
                        <input
                            type="text"
                            value={formData.competences}
                            onChange={(e) => setFormData({...formData, competences: e.target.value})}
                            placeholder="React, Node.js, TypeScript"
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
};

export default OffreModal;