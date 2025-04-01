'use client';

import React, { useState, useEffect } from 'react';
import { HiPhone, HiMail, HiUser, HiTrash } from 'react-icons/hi';
import '../../Offres/Offres.css';
import Cookies from 'js-cookie';

const EtudiantCard = ({ etudiant, onModifier, onSupprimer }) => {
    return (
        <div className="offre-card">
            <div className="offre-header">
                <h2 className="offre-title">{etudiant.prenom_personne} {etudiant.nom_personne}</h2>
                <div className="offre-company">{etudiant.email_personne}</div>
            </div>
            <div className="offre-content">
                <div className="offre-details">
                    <div className="detail-item">
                        <HiPhone />
                        <span>{etudiant.téléphone_personne}</span>
                    </div>
                    <div className="detail-item">
                        <HiMail />
                        <span>{etudiant.email_personne}</span>
                    </div>
                </div>
            </div>
            <div className="offre-actions">
                <button className="btn btn-outline" onClick={() => onModifier(etudiant)}>Modifier</button>
                <button className="btn btn-outline" onClick={() => onSupprimer(etudiant.id_personne)}>
                    <HiTrash className="trash-icon" />
                </button>
            </div>
        </div>
    );
};

export default function AdminEtudiantsPage() {
    const [etudiants, setEtudiants] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEtudiants();
    }, []);

    const fetchEtudiants = async () => {
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await fetch('http://20.19.36.142:8000/api/users/etudiants', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des étudiants');
            }

            const data = await response.json();
            setEtudiants(data.data);
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleModifier = (etudiant) => {
        // TODO: Implémenter la modification
        console.log('Modifier:', etudiant);
    };

    const handleSupprimer = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
            return;
        }

        try {
            const token = Cookies.get('authToken');
            const response = await fetch(`http://20.19.36.142:8000/api/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            // Mettre à jour la liste des étudiants
            setEtudiants(etudiants.filter(e => e.id_personne !== id));
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression de l\'étudiant');
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const etudiantsFiltres = etudiants.filter((e) =>
        `${e.prenom_personne} ${e.nom_personne}`.toLowerCase().includes(search.toLowerCase()) ||
        e.email_personne.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="offres-container">
                <div className="loading">Chargement des étudiants...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="offres-container">
                <div className="error-message">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="offres-container">
            <div className="offres-header">
                <h1>Gestion des Étudiants</h1>
                <p>Consultez, modifiez ou supprimez les profils étudiants</p>
                <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    value={search}
                    onChange={handleSearchChange}
                    className="filter-input"
                    style={{ maxWidth: '400px', margin: '1rem auto', display: 'block' }}
                />
            </div>

            <div className="offres-grid">
                {etudiantsFiltres.map((etudiant) => (
                    <EtudiantCard 
                        key={etudiant.id_personne} 
                        etudiant={etudiant}
                        onModifier={handleModifier}
                        onSupprimer={handleSupprimer}
                    />
                ))}
            </div>
        </div>
    );
}
