import React from 'react';
import './Offres.css';

// Exemple de données d'offres de stages
const offresDeStages = [
    {
        id: 1,
        titre: 'Stage Développeur Web',
        entreprise: 'Entreprise A',
        description: 'Développement de fonctionnalités web.',
        localisation: 'Paris, France',
        dateDebut: '01/03/2025',
        duree: '6 mois'
    },
    {
        id: 2,
        titre: 'Stage Data Analyst',
        entreprise: 'Entreprise B',
        description: 'Analyse de données et création de rapports.',
        localisation: 'Lyon, France',
        dateDebut: '15/03/2025',
        duree: '4 mois'
    }
    // Ajoutez d'autres offres de stages ici
];

const OffresPage = () => {
    return (
        <div className="container">
            <h1>Offres de Stages</h1>
            <ul>
                {offresDeStages.map(offre => (
                    <li key={offre.id} className="offre">
                        <h2>{offre.titre}</h2>
                        <p><strong>Entreprise:</strong> {offre.entreprise}</p>
                        <p><strong>Description:</strong> {offre.description}</p>
                        <p><strong>Localisation:</strong> {offre.localisation}</p>
                        <p><strong>Date de début:</strong> {offre.dateDebut}</p>
                        <p><strong>Durée:</strong> {offre.duree}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OffresPage;

