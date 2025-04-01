import React from 'react';

const EntrepriseModal = ({ entreprise, onClose, onSubmit }) => {
    const [formData, setFormData] = React.useState({
        nom: entreprise?.nom || '',
        secteur: entreprise?.secteur || '',
        telephone: entreprise?.telephone || '',
        mail: entreprise?.mail || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{entreprise ? 'Modifier' : 'Créer'} une entreprise</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nom</label>
                        <input
                            type="text"
                            value={formData.nom}
                            onChange={(e) => setFormData({...formData, nom: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Secteur</label>
                        <input
                            type="text"
                            value={formData.secteur}
                            onChange={(e) => setFormData({...formData, secteur: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Téléphone</label>
                        <input
                            type="tel"
                            value={formData.telephone}
                            onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.mail}
                            onChange={(e) => setFormData({...formData, mail: e.target.value})}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {entreprise ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntrepriseModal;