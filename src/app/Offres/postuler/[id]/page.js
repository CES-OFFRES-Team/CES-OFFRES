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
    const [debugInfo, setDebugInfo] = useState([]);
    const [formData, setFormData] = useState({
        cv: null,
        lettreMotivation: '',
    });

    const addDebugLog = (message) => {
        setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    };

    useEffect(() => {
        // Récupérer les informations de l'utilisateur
        const userData = getUserData();
        addDebugLog('Données utilisateur récupérées: ' + JSON.stringify(userData));
        
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
                addDebugLog(`Tentative de récupération de l'offre ${params.id}`);
                const response = await fetch(`${API_URL}/offres/${params.id}`);
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des détails de l\'offre');
                }
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    setOffre(result.data);
                    addDebugLog('Offre récupérée avec succès');
                } else {
                    throw new Error('Offre non trouvée');
                }
            } catch (err) {
                addDebugLog('Erreur lors de la récupération de l\'offre: ' + err.message);
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
        setDebugInfo([]); // Réinitialiser les logs

        addDebugLog('Début de la soumission du formulaire');
        addDebugLog('Données utilisateur: ' + JSON.stringify(user));

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
                addDebugLog('Informations du fichier CV: ' + JSON.stringify({
                    nom: formData.cv.name,
                    type: formData.cv.type,
                    taille: formData.cv.size,
                    lastModified: formData.cv.lastModified
                }));
                formDataToSend.append('cv', formData.cv);
            }

            // Log le contenu complet du FormData
            addDebugLog('Contenu du FormData:');
            for (let pair of formDataToSend.entries()) {
                addDebugLog(pair[0] + ': ' + (pair[0] === 'cv' ? 'Fichier PDF' : pair[1]));
            }

            const url = `${API_URL}/candidatures.php`;
            addDebugLog('Envoi de la requête à: ' + url);
            
            try {
                addDebugLog('Configuration de la requête:');
                addDebugLog('- Mode: CORS');
                addDebugLog('- Credentials: include');
                addDebugLog('- Headers: Accept: application/json');
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Origin': window.location.origin
                    },
                    mode: 'cors',
                    credentials: 'include',
                    body: formDataToSend,
                });

                addDebugLog('Statut de la réponse: ' + response.status);
                addDebugLog('En-têtes de la réponse: ' + JSON.stringify(Object.fromEntries(response.headers.entries())));

                // Log de la réponse brute
                const responseText = await response.text();
                addDebugLog('Réponse brute du serveur: ' + responseText);

                let data;
                try {
                    data = JSON.parse(responseText);
                    addDebugLog('Réponse parsée: ' + JSON.stringify(data));
                } catch (e) {
                    addDebugLog('Erreur de parsing JSON: ' + e.message);
                    addDebugLog('Réponse brute reçue: ' + responseText);
                    throw new Error('Réponse invalide du serveur');
                }

                // Afficher les logs du serveur
                if (data.logs) {
                    addDebugLog('Logs du serveur:');
                    data.logs.forEach(log => addDebugLog(log));
                }

                if (data.status === 'success') {
                    router.push('/Offres/confirmation');
                } else {
                    throw new Error(data.message || 'Erreur lors de l\'envoi de la candidature');
                }
            } catch (error) {
                addDebugLog('Erreur complète: ' + error.message);
                addDebugLog('Type d\'erreur: ' + error.name);
                addDebugLog('Stack trace: ' + error.stack);
                
                if (error.message === 'Failed to fetch') {
                    setError(`Erreur de connexion au serveur. Veuillez vérifier que:
                        1. Le serveur est accessible à l'adresse ${API_URL}
                        2. Votre connexion internet est active
                        3. Le serveur autorise les requêtes CORS depuis ${window.location.origin}
                        
                        Détails techniques:
                        - URL: ${url}
                        - Origin: ${window.location.origin}
                        - Mode: CORS
                        - Credentials: include`);
                } else {
                    setError(error.message);
                }
            } finally {
                setLoading(false);
            }
        } catch (error) {
            addDebugLog('Erreur complète: ' + error.message);
            if (error.message === 'Failed to fetch') {
                setError("Impossible de contacter le serveur. Veuillez vérifier votre connexion internet ou réessayer plus tard.");
            } else {
                setError(error.message);
            }
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

                {error && (
                    <div className="error-message">
                        <h3>Erreur</h3>
                        <p>{error}</p>
                    </div>
                )}

                <div className="debug-info">
                    <h3>Informations de débogage</h3>
                    <pre>
                        {debugInfo.map((log, index) => (
                            <div key={index} className="log-entry">{log}</div>
                        ))}
                    </pre>
                </div>
            </div>
        </div>
    );
}