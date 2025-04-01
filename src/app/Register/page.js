"use client";
import React, { useState } from 'react';
import './register.css';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom_personne: '',
    prenom_personne: '',
    téléphone_personne: '',
    email_personne: '',
    password_personne: '',
    role: 'Etudiant'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!formData.nom_personne.trim()) {
      setError('Le nom est requis');
      return false;
    }
    if (!formData.prenom_personne.trim()) {
      setError('Le prénom est requis');
      return false;
    }
    if (!formData.téléphone_personne.trim()) {
      setError('Le numéro de téléphone est requis');
      return false;
    }
    if (!formData.email_personne.trim()) {
      setError('L\'email est requis');
      return false;
    }
    if (!formData.password_personne.trim()) {
      setError('Le mot de passe est requis');
      return false;
    }
    
    // Validation du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email_personne)) {
      setError('Format d\'email invalide');
      return false;
    }

    // Validation du format du téléphone (format français)
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    if (!phoneRegex.test(formData.téléphone_personne)) {
      setError('Format de téléphone invalide (format français requis)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Normalisation du numéro de téléphone
      const normalizedPhone = formData.téléphone_personne.replace(/[\s.-]/g, '');
      
      const dataToSend = {
        ...formData,
        téléphone_personne: normalizedPhone
      };

      console.log('Tentative d\'envoi des données:', dataToSend);
      
      const response = await fetch('http://20.19.36.142:8000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataToSend),
      });

      console.log('Status de la réponse:', response.status);
      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);
      console.log('En-têtes de la réponse:', Object.fromEntries(response.headers));

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Données parsées:', data);
      } catch (e) {
        console.error('Erreur lors du parsing JSON:', e);
        setError('Le serveur a renvoyé une réponse invalide. Détails: ' + responseText);
        return;
      }

      if (response.ok) {
        setMessage('Inscription réussie ! Redirection vers la page de connexion...');
        setTimeout(() => {
          router.push('/Login');
        }, 2000);
      } else {
        if (response.status === 400) {
          setError(data.message || 'Données invalides. Veuillez vérifier vos informations.');
        } else if (response.status === 409) {
          setError('Cet email est déjà utilisé.');
        } else if (response.status === 500) {
          setError('Erreur serveur. Veuillez réessayer plus tard.');
        } else {
          setError(data.message || 'Une erreur est survenue. Veuillez réessayer.');
        }
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      setError('Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Créer un compte</h2>
        
        <div className="form-group">
          <label>Nom</label>
          <div className="input-wrapper">
            <i className="fas fa-user"></i>
            <input 
              type="text" 
              name="nom_personne"
              value={formData.nom_personne}
              onChange={handleChange}
              placeholder="Entrez votre nom" 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Prénom</label>
          <div className="input-wrapper">
            <i className="fas fa-user"></i>
            <input 
              type="text" 
              name="prenom_personne"
              value={formData.prenom_personne}
              onChange={handleChange}
              placeholder="Entrez votre prénom" 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Téléphone</label>
          <div className="input-wrapper">
            <i className="fas fa-phone"></i>
            <input 
              type="tel" 
              name="téléphone_personne"
              value={formData.téléphone_personne}
              onChange={handleChange}
              placeholder="Ex: 06 12 34 56 78" 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <div className="input-wrapper">
            <i className="fas fa-envelope"></i>
            <input 
              type="email" 
              name="email_personne"
              value={formData.email_personne}
              onChange={handleChange}
              placeholder="Entrez votre email" 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <div className="input-wrapper">
            <i className="fas fa-lock"></i>
            <input 
              type="password" 
              name="password_personne"
              value={formData.password_personne}
              onChange={handleChange}
              placeholder="Entrez votre mot de passe" 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Rôle</label>
          <div className="input-wrapper">
            <i className="fas fa-user-tag"></i>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
              required
            >
              <option value="Etudiant">Étudiant</option>
              <option value="Pilote">Pilote</option>
              <option value="Admin">Administrateur</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <button 
          type="submit" 
          className="register-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
        
        <div className="login-link">
          Déjà un compte ? <a href="/Login">Se connecter</a>
        </div>
      </form>
    </div>
  );
} 