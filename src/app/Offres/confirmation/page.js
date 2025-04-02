"use client";
import { useRouter } from 'next/navigation';
import React from 'react';
import './confirmation.css';

export default function ConfirmationPage() {
  const router = useRouter();

  const handleGoToOffres = () => {
    router.push('/Offres');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-content">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
        
        <h1>Candidature envoyée avec succès !</h1>
        
        <p className="confirmation-message">
          Votre candidature a bien été enregistrée. L'entreprise recevra votre dossier et vous contactera si votre profil correspond à leurs attentes.
        </p>

        <div className="confirmation-actions">
          <button onClick={handleGoToOffres} className="btn btn-primary">
            Voir d'autres offres
          </button>
          <button onClick={handleGoToDashboard} className="btn btn-outline">
            Voir mes candidatures
          </button>
        </div>
      </div>
    </div>
  );
} 