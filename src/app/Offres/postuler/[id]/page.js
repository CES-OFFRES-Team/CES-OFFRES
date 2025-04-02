"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import './PostulerForm.css';
import { getUserData } from '../../../utils/auth';

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
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [offre, setOffre] = useState(null);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        cv: null,
        lettreMotivation: '',
    });

    useEffect(() => {
        // Récupérer les informations de l'utilisateur
        const userData = getUserData();
        console.log('Données utilisateur récupérées:', userData);
        
        if (!userData) {
            setError("Vous devez être connecté pour postuler");
            return;
        }
        if (!userData.id_personne) {
            setError("Erreur: ID utilisateur non trouvé");
            return;
        }
        setUser(userData);

        // Récupérer les détails de l'offre
        const fetchOffre = async () => {
            try {
                const response = await fetch(`${API_URL}/offres/${params.id}`);
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
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchOffre();
        }
    }, [params.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Log les données utilisateur au début
        console.log('Données utilisateur complètes:', user);
        console.log('ID personne:', user?.id_personne, 'Type:', typeof user?.id_personne);

        if (!user) {
            setError("Vous devez être connecté pour postuler");
            setLoading(false);
            return;
        }

        if (!user.id_personne) {
            setError("Erreur: ID utilisateur non trouvé");
            setLoading(false);
            return;
        }

        // Vérification du fichier CV
        if (!formData.cv) {
            setError("Le CV est requis");
            setLoading(false);
            return;
        }

        // Vérification du type de fichier
        if (formData.cv.type !== 'application/pdf') {
            setError("Le CV doit être au format PDF");
            setLoading(false);
            return;
        }

        // Vérification de la taille du fichier (max 5MB)
        if (formData.cv.size > 5 * 1024 * 1024) {
            setError("Le CV ne doit pas dépasser 5MB");
            setLoading(false);
            return;
        }

        // Conversion explicite en nombre
        const personneId = parseInt(user.id_personne, 10);
        if (isNaN(personneId)) {
            setError("Erreur: ID utilisateur invalide");
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            
            formDataToSend.append('id_stage', params.id);
            formDataToSend.append('id_personne', personneId);
            formDataToSend.append('lettre_motivation', formData.lettreMotivation);
            
            // Ajout du CV avec vérification
            if (formData.cv) {
                console.log('Informations du fichier CV:', {
                    nom: formData.cv.name,
                    type: formData.cv.type,
                    taille: formData.cv.size,
                    lastModified: formData.cv.lastModified
                });
                formDataToSend.append('cv', formData.cv);
            }

            // Log le contenu complet du FormData
            console.log('Contenu du FormData:');
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0] + ': ' + (pair[0] === 'cv' ? 'Fichier PDF' : pair[1]));
            }

            console.log('Envoi de la requête à:', `${API_URL}/candidatures.php`);
            const response = await fetch(`${API_URL}/candidatures.php`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors',
                credentials: 'include',
                body: formDataToSend,
            });

            // Log de la réponse brute
            const responseText = await response.text();
            console.log('Réponse brute du serveur:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Erreur de parsing JSON:', e);
                console.error('Réponse brute reçue:', responseText);
                throw new Error('Réponse invalide du serveur');
            }

            console.log('Réponse parsée du serveur:', data);

            // Afficher les logs du serveur
            if (data.logs) {
                console.log('Logs du serveur:');
                data.logs.forEach(log => console.log(log));
            }

            if (data.status === 'success') {
                router.push('/Offres/confirmation');
            } else {
                throw new Error(data.message || 'Erreur lors de l\'envoi de la candidature');
            }
        } catch (error) {
            console.error('Erreur complète:', error);
            if (error.message === 'Failed to fetch') {
                setError("Impossible de contacter le serveur. Veuillez vérifier votre connexion internet ou réessayer plus tard.");
            } else {
                setError(error.message);
            }
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
                        <small>Format accepté : PDF</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="lettreMotivation">Lettre de motivation</label>
                        <textarea
                            id="lettreMotivation"
                            value={formData.lettreMotivation}
                            onChange={(e) => setFormData({...formData, lettreMotivation: e.target.value})}
                            placeholder="Votre lettre de motivation"
                            rows="6"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Envoi en cours...' : 'Postuler'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}