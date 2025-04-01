'use client';

import React, { useState, useEffect } from 'react';
import { HiPhone, HiMail, HiTrash } from 'react-icons/hi';
import '../../Offres/Offres.css';
import Cookies from 'js-cookie';

const PiloteCard = ({ pilote, onModifier, onSupprimer }) => {
    return (
        <div className="offre-card">
            <div className="offre-header">
                <h2 className="offre-title">{pilote.prenom_personne} {pilote.nom_personne}</h2>
                <div className="offre-company">{pilote.email_personne}</div>
            </div>
            <div className="offre-content">
                <div className="offre-details">
                    <div className="detail-item">
                        <HiPhone />
                        <span>{pilote.téléphone_personne}</span>
                    </div>
                    <div className="detail-item">
                        <HiMail />
                        <span>{pilote.email_personne}</span>
                    </div>
                </div>
            </div>
            <div className="offre-actions">
                <button className="btn btn-outline" onClick={() => onModifier(pilote)}>Modifier</button>
                <button className="btn btn-outline" onClick={() => onSupprimer(pilote.id_personne)}>
                    <HiTrash className="trash-icon" />
                </button>
            </div>
        </div>
    );
};

export default function AdminPilotesPage() {
    const [pilotes, setPilotes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPilotes();
    }, []);

    const fetchPilotes = async () => {
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await fetch('http://20.19.36.142:8000/api/users/pilotes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des pilotes');
            }

            const data = await response.json();
            setPilotes(data.data);
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleModifier = (pilote) => {
        // TODO: Implémenter la modification
        console.log('Modifier:', pilote);
    };

    const handleSupprimer = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce pilote ?')) {
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

            // Mettre à jour la liste des pilotes
            setPilotes(pilotes.filter(p => p.id_personne !== id));
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression du pilote');
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const pilotesFiltres = pilotes.filter((p) =>
        `${p.prenom_personne} ${p.nom_personne}`.toLowerCase().includes(search.toLowerCase()) ||
        p.email_personne.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="offres-container">
                <div className="loading">Chargement des pilotes...</div>
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
                <h1>Gestion des Pilotes</h1>
                <p>Consultez, modifiez ou supprimez les profils pilotes</p>
                <input
                    type="text"
                    placeholder="Rechercher un pilote..."
                    value={search}
                    onChange={handleSearchChange}
                    className="filter-input"
                    style={{ maxWidth: '400px', margin: '1rem auto', display: 'block' }}
                />
            </div>

            <div className="offres-grid">
                {pilotesFiltres.map((pilote) => (
                    <PiloteCard 
                        key={pilote.id_personne} 
                        pilote={pilote}
                        onModifier={handleModifier}
                        onSupprimer={handleSupprimer}
                    />
                ))}
            </div>
        </div>
    );
}
