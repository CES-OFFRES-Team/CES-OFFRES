'use client';

import React, { useState, useEffect } from 'react';
import { HiIdentification, HiPhone, HiMail, HiTrash } from 'react-icons/hi';
import '../../Offres/Offres.css';

// Données fictives pour les pilotes
const pilotesDeTest = [
    {
        id: 1,
        nom: 'Martin',
        prenom: 'Alice',
        telephone: '0701020304',
        mail: 'alice.martin@cesi.fr',
    },
    {
        id: 2,
        nom: 'Lemoine',
        prenom: 'Jean',
        telephone: '0704050607',
        mail: 'jean.lemoine@cesi.fr',
    },
];

const PiloteCard = ({ pilote }) => {
    const handleModifier = () => { };
    const handleSupprimer = () => { };
    const handlePostuler = () => { };

    return (
        <div className="offre-card">
            <div className="offre-header">
                <h2 className="offre-title">{pilote.prenom} {pilote.nom}</h2>
                <div className="offre-company">{pilote.mail}</div>
            </div>
            <div className="offre-content">
                <div className="offre-details">
                    <div className="detail-item">
                        <HiPhone />
                        <span>{pilote.telephone}</span>
                    </div>
                    <div className="detail-item">
                        <HiMail />
                        <span>{pilote.mail}</span>
                    </div>
                </div>
            </div>
            <div className="offre-actions">
                <button className="btn btn-outline" onClick={handleModifier}>Modifier</button>
                <button className="btn btn-outline" onClick={handleSupprimer}>
                    <HiTrash className="trash-icon" />
                </button>
                <button className="btn btn-primary" onClick={handlePostuler}>
                    Postuler
                </button>
            </div>
        </div>
    );
};

export default function AdminPilotesPage() {
    const [pilotes, setPilotes] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setPilotes(pilotesDeTest);
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const pilotesFiltres = pilotes.filter((e) =>
        `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase()) ||
        e.mail.toLowerCase().includes(search.toLowerCase())
    );

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
                    <PiloteCard key={pilote.id} pilote={pilote} />
                ))}
            </div>
        </div>
    );
}
