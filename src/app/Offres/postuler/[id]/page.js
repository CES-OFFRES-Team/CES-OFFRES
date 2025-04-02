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

        try {
            // Vérifier si l'utilisateur est connecté
            if (!userData) {
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
            submitData.append('id_personne', userData.id);
            submitData.append('id_stage', params.id);
            
            if (formData.lettre_motivation) {
                submitData.append('lettre_motivation', formData.lettre_motivation);
            }

            // Afficher les données envoyées pour le debug
            console.log('Données envoyées:', {
                id_personne: userData.id,
                id_stage: params.id,
                cv: cvFile.name,
                cv_size: cvFile.size,
                lettre_motivation: formData.lettre_motivation ? 'présente' : 'absente'
            });

            // Envoyer la candidature
            const response = await fetch(`${API_URL}/candidatures.php`, {
                method: 'POST',
                body: submitData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erreur lors de l'envoi de la candidature");
            }

            const data = await response.json();
            
            if (data.status === 'success') {
                router.push('/candidatures/confirmation');
            } else {
                throw new Error(data.message || "Erreur lors de l'envoi de la candidature");
            }
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
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