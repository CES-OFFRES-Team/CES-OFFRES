"use client";

import React, { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import './Offres.css';

// Composant memoïsé pour chaque offre
const OffreCard = memo(({ offre, onToggleWishlist }) => {
  const router = useRouter();

  const handlePostuler = () => {
    // Sauvegarder les offres dans le localStorage pour y accéder dans la page de postulation
    localStorage.setItem('offresDeStages', JSON.stringify(offresDeStages));
    router.push(`/Offres/postuler/${offre.id}`);
  };

  return (
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
      <button className="postuler-button" onClick={handlePostuler}>
        Postuler
      </button>
      <span
        className="wishlist-star in-wishlist"
        onClick={() => onToggleWishlist(offre.id)}
        role="button"
        aria-label="Retirer de la Wishlist"
      >
        ★
      </span>
    </div>
  );
});

// Exemple de données d'offres de stages
const offresDeStages = [
  {
    id: 1,
    titre: 'Stage Développement Web',
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
];

export default function Offres() {
  const [wishlist, setWishlist] = useState([1, 2]); // IDs des offres dans la wishlist

  const toggleWishlist = (id) => {
    setWishlist((prevWishlist) =>
      prevWishlist.includes(id)
        ? prevWishlist.filter((offreId) => offreId !== id)
        : [...prevWishlist, id]
    );
  };

  const wishlistOffres = offresDeStages.filter((offre) => wishlist.includes(offre.id));

  return (
    <div className="center-container">
      <div className="wishlist-container">
        <h1 className="page-title">Ma Wishlist</h1>
        {wishlistOffres.length > 0 ? (
          <div className="offres-grid">
            {wishlistOffres.map((offre) => (
              <OffreCard
                key={offre.id}
                offre={offre}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          <p>Aucune offre dans la wishlist.</p>
        )}
      </div>
    </div>
  );
}