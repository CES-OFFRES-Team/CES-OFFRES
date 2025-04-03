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
    const [errorDetails, setErrorDetails] = useState(null);

    useEffect(() => {
        // Récupérer les informations de l'utilisateur
        const userData = getUserData();
        
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
                const response = await fetch(`${API_URL}/offres?id=${params.id}`);
                if (!response.ok) {
                    console.error('Erreur HTTP:', response.status);
                    throw new Error('Erreur lors de la récupération des détails de l\'offre');
                }

                const responseText = await response.text();
                console.log('Réponse brute:', responseText);

                if (!responseText) {
                    throw new Error('Réponse vide du serveur');
                }

                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (e) {
                    console.error('Erreur parsing JSON:', e);
                    throw new Error('Format de réponse invalide');
                }

                if (result.status === 'success' && result.data) {
                    console.log('Données de l\'offre:', result.data);
                    setOffre(result.data);
                } else {
                    console.error('Données invalides:', result);
                    throw new Error(result.message || 'Offre non trouvée');
                }
            } catch (err) {
                console.error('Erreur complète:', err);
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
        setErrorDetails(null);

        try {
            // Vérifier si l'utilisateur est connecté
            if (!user) {
                throw new Error("Vous devez être connecté pour postuler");
            }

            // Vérifier le CV
            const cvFile = formData.cv;
            if (!cvFile) {
                throw new Error("Le CV est requis");
            }

            // Vérifier le type de fichier
            if (cvFile.type !== 'application/pdf') {
                throw new Error("Le CV doit être au format PDF");
            }

            // Vérifier la taille du fichier (max 5MB)
            if (cvFile.size > 5 * 1024 * 1024) {
                throw new Error("Le CV ne doit pas dépasser 5MB");
            }

            // Créer un FormData pour l'envoi des fichiers
            const submitData = new FormData();
            submitData.append('cv', cvFile);
            submitData.append('id_personne', user.id_personne);
            submitData.append('id_stage', params.id);
            submitData.append('statut', 'En attente');
            
            // Ajouter la lettre de motivation si présente
            if (formData.lettreMotivation.trim()) {
                submitData.append('lettre_motivation', formData.lettreMotivation);
            }

            // Envoyer la candidature
            const response = await fetch(`${API_URL}/candidatures.php`, {
                method: 'POST',
                body: submitData
            });

            // Vérifier la réponse
            const responseText = await response.text();
            console.log('Réponse brute:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                setErrorDetails({
                    message: "Erreur de parsing JSON",
                    response: responseText,
                    error: e.message
                });
                throw new Error("Format de réponse invalide du serveur");
            }

            if (!response.ok || data.status === 'error') {
                setErrorDetails({
                    message: data.message || "Erreur serveur",
                    status: response.status,
                    response: data
                });
                throw new Error(data.message || "Erreur lors de l'envoi de la candidature");
            }

            if (data.status === 'success') {
                router.push('/dashboard');
            } else {
                throw new Error(data.message || "Erreur lors de l'envoi de la candidature");
            }

        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            setError(error.message || "Une erreur est survenue lors de l'envoi de la candidature");
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
                <h2 className="error-title">Erreur</h2>
                <p className="error-message">{error}</p>
                
                {errorDetails && (
                    <div className="error-details">
                        <h3>Détails techniques :</h3>
                        <pre className="error-technical">
                            {JSON.stringify(errorDetails, null, 2)}
                        </pre>
                    </div>
                )}
                
                <button onClick={handleGoBack} className="btn btn-primary">Retour</button>
                
                <style jsx>{`
                    .error-container {
                        padding: 2rem;
                        max-width: 800px;
                        margin: 2rem auto;
                        background: #fff;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .error-title {
                        color: #dc3545;
                        margin-bottom: 1rem;
                    }
                    .error-message {
                        color: #721c24;
                        background-color: #f8d7da;
                        border: 1px solid #f5c6cb;
                        padding: 1rem;
                        border-radius: 4px;
                        margin-bottom: 1rem;
                    }
                    .error-details {
                        margin-top: 1.5rem;
                        padding: 1rem;
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        border-radius: 4px;
                    }
                    .error-technical {
                        background: #272822;
                        color: #f8f8f2;
                        padding: 1rem;
                        border-radius: 4px;
                        overflow-x: auto;
                        font-family: monospace;
                        white-space: pre-wrap;
                        margin-top: 0.5rem;
                    }
                    .btn {
                        margin-top: 1rem;
                    }
                `}</style>
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
                        <small>Format accepté : PDF (max 5MB)</small>
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

                {error && (
                    <div className="error-message">
                        <h3>Erreur</h3>
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}