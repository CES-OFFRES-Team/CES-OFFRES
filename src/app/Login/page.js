"use client";
import React, { useState } from 'react';
import './login.css';
import Cookies from 'js-cookie';

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 32 32" height="20">
    <g data-name="Layer 3" id="Layer_3">
      <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
    </g>
  </svg>
);

const PasswordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="-64 0 512 512" height="20">
    <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
    <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
  </svg>
);

const EyeIcon = ({ showPassword }) => (
  showPassword ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
      <path d="M12 4.5c-4.97 0-9.27 3.11-11 7.5 1.73 4.39 6.03 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6.03-7.5-11-7.5zm0 13c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
      <path d="M12 4.5c-4.97 0-9.27 3.11-11 7.5 1.73 4.39 6.03 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6.03-7.5-11-7.5zm0 13c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke="black" strokeWidth="2"/>
    </svg>
  )
);

const loginUser = async (email, password) => {
    try {
        console.log('Tentative de connexion avec:', { email });
        
        const response = await fetch('http://20.19.36.142:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        console.log('Status de la réponse:', response.status);
        
        // Vérifier si la réponse est vide
        const text = await response.text();
        console.log('Réponse brute du serveur:', text);

        if (!text) {
            throw new Error('Réponse vide du serveur');
        }

        // Essayer de parser le JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Erreur de parsing JSON:', e);
            throw new Error('Réponse invalide du serveur');
        }

        console.log('Données parsées:', data);

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Erreur lors de la connexion');
        }

        return data;
    } catch (error) {
        console.error('Erreur complète:', error);
        throw new Error(error.message || 'Erreur de connexion au serveur');
    }
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (email === '' || password === '') {
      setErrorMessage('Veuillez remplir tous les champs.');
    } else {
      try {
        const data = await loginUser(email, password);
        // Afficher le message de succès
        setSuccessMessage(`Connexion réussie ! Bienvenue ${data.user.prenom} ${data.user.nom}`);
        
        // Utiliser les nouvelles fonctions d'authentification
        setAuthToken(data.token);
        setUserData(data.user);
        
        // Attendre un peu pour que l'utilisateur puisse voir le message de succès
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } catch (error) {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <div className="center-container">
      <form className="form" onSubmit={handleSubmit}>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="flex-column">
          <label>Email</label>
        </div>
        <div className="inputForm">
          <EmailIcon />
          <input
            placeholder="Entrez votre Email"
            className="input"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex-column">
          <label>Mot de passe</label>
        </div>
        <div className="inputForm">
          <PasswordIcon />
          <input
            placeholder="Entrez votre mot de passe"
            className="input"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" className="toggle-password" onClick={togglePasswordVisibility}>
            <EyeIcon showPassword={showPassword} />
          </button>
        </div>

        <div className="flex-row">
          <div>
            <label htmlFor="cbx" className="cbx">
              <input type="checkbox" id="cbx" />
              <div className="flip">
                <div className="front"></div>
                <div className="back">
                  <svg viewBox="0 0 16 14" height="14" width="16">
                    <path d="M2 8.5L6 12.5L14 1.5"></path>
                  </svg>
                </div>
              </div>
            </label>
            <span className="remember-me-text">Se souvenir de moi</span>
          </div>
          <span className="span">Mot de passe oublié ?</span>
        </div>
        <button className="button-submit" type="submit">Se connecter</button>
        <p className="p">Vous n'avez pas de compte ? <a href="/Contact" className="span">Nous contactez</a></p>
      </form>
    </div>
  );
}
