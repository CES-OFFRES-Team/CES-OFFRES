"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import './PostulerForm.css';

const API_URL = 'http://20.19.36.142:8000/api';

const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

export default function PostulerForm({ params }) {
  const router = useRouter();
  const id = params.id;
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offre, setOffre] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    cv: null,
    lettreMotivation: '',
  });

  useEffect(() => {
    // Récupérer les informations de l'utilisateur connecté
    const fetchUser = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          throw new Error('Vous devez être connecté pour postuler');
        }
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
      }
    };

    // Récupérer les détails de l'offre
    const fetchOffre = async () => {
      try {
        const response = await fetch(`${API_URL}/offres/${id}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des détails de l\'offre');
        }
        const result = await response.json();
        if (result.status === 'success' && result.data) {
          setOffre(result.data);
        } else {
          throw new Error('Offre non trouvée');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
      }
    };

    fetchUser();
    fetchOffre();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('Vous devez être connecté pour postuler');
      }

      const formDataToSend = new FormData();
      
      formDataToSend.append('id_personne', user.id_personne);
      formDataToSend.append('id_stage', id);
      formDataToSend.append('lettre_motivation', formData.lettreMotivation);
      
      if (formData.cv) {
        formDataToSend.append('cv', formData.cv);
      }

      console.log('Envoi de la candidature:', {
        id_personne: user.id_personne,
        id_stage: id,
        cv: formData.cv ? formData.cv.name : null
      });

      const response = await fetch(`${API_URL}/candidatures.php`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.status === 'success') {
        router.push('/Offres/confirmation');
      } else {
        throw new Error(data.message || 'Erreur lors de l\'envoi de la candidature');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading && !offre) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Chargement des détails de l'offre...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={handleGoBack} className="btn btn-primary">Retour</button>
      </div>
    );
  }

  if (!offre) {
    return (
      <div className="error-container">
        <p className="error-message">Offre non trouvée</p>
        <button onClick={handleGoBack} className="btn btn-primary">Retour</button>
      </div>
    );
  }

  return (
    <div className="postuler-container">
      <button className="back-button" onClick={handleGoBack}>
        ← Retour aux offres
      </button>

      <div className="offre-details">
        <h1>{offre.titre}</h1>
        <div className="offre-info">
          <p className="entreprise"><strong>Entreprise :</strong> {offre.nom_entreprise}</p>
          <p className="dates">
            <strong>Période :</strong> Du {formatDate(offre.date_debut)} au {formatDate(offre.date_fin)}
          </p>
          <p className="remuneration"><strong>Rémunération :</strong> {offre.remuneration}€</p>
          <div className="description">
            <strong>Description :</strong>
            <p>{offre.description}</p>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Formulaire de candidature</h2>
        <form onSubmit={handleSubmit} className="postuler-form">
          <div className="form-group">
            <label htmlFor="cv">CV (PDF) *</label>
            <input
              type="file"
              id="cv"
              accept=".pdf"
              required
              onChange={(e) => setFormData({...formData, cv: e.target.files[0]})}
            />
            <small>Format accepté : PDF uniquement</small>
          </div>

          <div className="form-group">
            <label htmlFor="lettreMotivation">Lettre de motivation *</label>
            <textarea
              id="lettreMotivation"
              required
              value={formData.lettreMotivation}
              onChange={(e) => setFormData({...formData, lettreMotivation: e.target.value})}
              placeholder="Expliquez pourquoi vous êtes intéressé(e) par ce stage et ce que vous pouvez apporter à l'entreprise..."
              rows="6"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={handleGoBack}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}