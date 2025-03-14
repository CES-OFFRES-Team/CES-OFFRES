"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import './PostulerForm.css';

export default function PostulerForm({ params }) {
  const router = useRouter();
  const id = params.id;
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    cv: null,
    lettreMotivation: '',
  });

  // Offre statique pour le test
  const offre = {
    id: id,
    titre: "Stage de développement web",
    entreprise: "Entreprise Test",
    description: "Description du stage"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Créer un FormData pour envoyer le fichier et les données
      const formDataToSend = new FormData();
      
      // Ajouter toutes les données du formulaire
      formDataToSend.append('offre_id', id);
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('prenom', formData.prenom);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('telephone', formData.telephone);
      formDataToSend.append('lettre_motivation', formData.lettreMotivation);
      
      // Ajouter le fichier CV
      if (formData.cv) {
        formDataToSend.append('cv', formData.cv);
      }

      // Log des données envoyées
      console.log('Données envoyées:', {
        offre_id: id,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        cv: formData.cv ? formData.cv.name : null,
        lettre_motivation: formData.lettreMotivation
      });

      const response = await fetch('http://localhost:8000/api/candidatures', {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('Status de la réponse:', response.status);
      const responseText = await response.text();
      console.log('Réponse brute:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Réponse non-JSON: ' + responseText);
      }

      if (data.status === 'success') {
        router.push('/Offres/confirmation');
      } else {
        setError(data.message || 'Erreur lors de l\'envoi de la candidature');
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      setError('Erreur lors de l\'envoi de la candidature: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={handleGoBack}>Retour</button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="postuler-container">
      <button className="back-button" onClick={handleGoBack}>
        ← Retour aux offres
      </button>
      <h1>Postuler pour : {offre.titre}</h1>
      <form onSubmit={handleSubmit} className="postuler-form">
        <div className="form-group">
          <label htmlFor="nom">Nom</label>
          <input
            type="text"
            id="nom"
            required
            value={formData.nom}
            onChange={(e) => setFormData({...formData, nom: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="prenom">Prénom</label>
          <input
            type="text"
            id="prenom"
            required
            value={formData.prenom}
            onChange={(e) => setFormData({...formData, prenom: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label htmlFor="telephone">Téléphone</label>
          <input
            type="tel"
            id="telephone"
            required
            value={formData.telephone}
            onChange={(e) => setFormData({...formData, telephone: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cv">CV (PDF)</label>
          <input
            type="file"
            id="cv"
            accept=".pdf"
            required
            onChange={(e) => setFormData({...formData, cv: e.target.files[0]})}
          />
        </div>

        <div className="form-group">
          <label htmlFor="lettreMotivation">Lettre de motivation</label>
          <textarea
            id="lettreMotivation"
            required
            value={formData.lettreMotivation}
            onChange={(e) => setFormData({...formData, lettreMotivation: e.target.value})}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
        </button>
      </form>
    </div>
  );
}