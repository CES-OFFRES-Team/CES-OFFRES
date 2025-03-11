"use client";

import React, { useState, memo } from 'react';
import './Offres.css';

// Composant memoïsé pour chaque offre
const OffreCard = memo(({ offre }) => (
  <div className="offre">
    <h2>{offre.titre}</h2>
    <div className="offre-details">
      {Object.entries(offre)
        .filter(([key]) => key !== 'id' && key !== 'titre')
        .map(([key, value]) => (
          <p key={key}>
            <strong>{key.charAt(0).toUpperCase() + key.slice(1)} :</strong> {value}
          </p>
        ))}
    </div>
    <button className="submit-button">Postuler</button>
  </div>
));

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
    },
    {
        id: 3,
        titre: 'Stage Marketing Digital',
        entreprise: 'Entreprise C',
        description: 'Gestion des campagnes marketing en ligne.',
        localisation: 'Marseille, France',
        dateDebut: '01/04/2025',
        duree: '5 mois'
    },
    {
        id: 4,
        titre: 'Stage Ingénieur Logiciel',
        entreprise: 'Entreprise D',
        description: 'Développement de logiciels embarqués.',
        localisation: 'Toulouse, France',
        dateDebut: '01/05/2025',
        duree: '6 mois'
    },
    {
        id: 5,
        titre: 'Stage Consultant IT',
        entreprise: 'Entreprise E',
        description: 'Consulting en technologies de l\'information.',
        localisation: 'Nantes, France',
        dateDebut: '15/05/2025',
        duree: '3 mois'
    }
];

export default function Offres() {
    return (
        <div className="center-container">
            <div className="offres-container">
                <h1 className="page-title">Offres de Stage</h1>
                <div className="offres-grid">
                    {offresDeStages.map((offre) => (
                        <OffreCard key={offre.id} offre={offre} />
                    ))}
                </div>
            </div>
        </div>
    );
}