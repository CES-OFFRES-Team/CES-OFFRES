"use client";
import React, { useState } from 'react';
import './login.css';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { COOKIE_KEYS, USER_ROLES, REDIRECT_PATHS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Réinitialiser les messages
    setErrorMessage('');
    setSuccessMessage('');
    
    // Vérifier les champs
    if (!email || !password) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }
    
    // Activer le chargement
    setIsLoading(true);
    
    try {
      // Effectuer la requête de connexion
      const response = await fetch('http://20.19.36.142:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      // Récupérer les données
      const data = await response.json();
      
      // Log des données reçues
      console.log('Données reçues du serveur:', data);
      console.log('Données utilisateur:', data.user);
      
      // Vérifier la réponse
      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Identifiants incorrects');
      }
      
      // Vérifier que les données nécessaires sont présentes
      if (!data.token || !data.user || !data.user.id_personne) {
        throw new Error('Réponse du serveur incomplète');
      }
      
      // Mettre à jour le contexte d'authentification (qui gère les cookies)
      login(data.user, data.token);
      
      // Afficher le succès
      setSuccessMessage(`Connexion réussie ! Bienvenue ${data.user.prenom}`);
      
      // Déterminer la redirection en fonction du rôle
      const userRole = data.user.role;
      const redirectPath = REDIRECT_PATHS[userRole] || REDIRECT_PATHS[USER_ROLES.ETUDIANT];
      
      console.log('Redirection vers:', redirectPath);
      
      // Rediriger immédiatement
      router.push(redirectPath);
      
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setErrorMessage(error.message || 'Erreur de connexion au serveur');
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {successMessage && <p className="text-center text-sm text-green-600">{successMessage}</p>}
          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errorMessage}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={handleChange}
              />
              <button type="button" className="toggle-password" onClick={togglePasswordVisibility} disabled={isLoading}>
                <EyeIcon showPassword={showPassword} />
              </button>
            </div>
          </div>

          <div className="flex-row">
            <div>
              <label htmlFor="cbx" className="cbx">
                <input type="checkbox" id="cbx" disabled={isLoading} />
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
          
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
          
          <p className="p">Vous n'avez pas de compte ? <a href="/Contact" className="span">Nous contactez</a></p>
        </form>
      </div>
    </div>
  );
}
