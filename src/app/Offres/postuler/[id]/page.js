"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import './PostulerForm.css';

export default function PostulerForm({ params }) {
  const router = useRouter();
  const id = React.use(params).id;
  const [offre, setOffre] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    cv: null,
    lettreMotivation: '',
  });

  useEffect(() => {
    // Récupérer l'offre depuis le localStorage
    const offres = JSON.parse(localStorage.getItem('offresDeStages') || '[]');
    const currentOffre = offres.find(o => o.id === parseInt(id));
    setOffre(currentOffre);
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Sauvegarder la candidature dans le localStorage
    const candidatures = JSON.parse(localStorage.getItem('candidatures') || '[]');
    candidatures.push({
      ...formData,
      offreId: params.id,
      datePostulation: new Date().toISOString(),
    });
    localStorage.setItem('candidatures', JSON.stringify(candidatures));
    
    // Rediriger vers une page de confirmation
    router.push('/Offres/confirmation');
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!offre) return <div>Chargement...</div>;

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

        <button type="submit" className="submit-button">Envoyer ma candidature</button>
      </form>
    </div>
  );
}