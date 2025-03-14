"use client";
import { useRouter } from 'next/navigation';
import React from 'react';
import './confirmation.css';

export default function ConfirmationPage() {
  const router = useRouter();

  const handleRetourOffres = () => {
    router.push('/Offres');
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-icon">✓</div>
        <h1>Candidature envoyée avec succès !</h1>
        <p>Nous avons bien reçu votre candidature. Nous vous contacterons prochainement.</p>
        <button onClick={handleRetourOffres} className="retour-button">
          Retour aux offres
        </button>
      </div>
    </div>
  );
} 