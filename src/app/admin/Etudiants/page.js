'use client';

import React, { useState, useEffect } from 'react';
import { HiPhone, HiMail, HiUser, HiTrash } from 'react-icons/hi';
import '../../Offres/Offres.css';
import CreateEtudiantButton from '../../components/CreateEtudiantButton';
import StatsEtudiantsButton from '../../components/StatsEtudiantsButton';



// Données fictives pour les étudiants
const etudiantsDeTest = [
    {
        id: 1,
        nom: 'Dupont',
        prenom: 'Marie',
        telephone: '0601020304',
        mail: 'marie.dupont@example.com',
    },
    {
        id: 2,
        nom: 'Durand',
        prenom: 'Paul',
        telephone: '0604050607',
        mail: 'paul.durand@example.com',
    },
    {
        id: 3,
        nom: 'Moreau',
        prenom: 'Claire',
        telephone: '0611121314',
        mail: 'claire.moreau@example.com',
    },
];

const EtudiantCard = ({ etudiant }) => {
    const handleModifier = () => { };
    const handleSupprimer = () => { };
    const handlePostuler = () => { };

    return (
        <div className="offre-card">
            <div className="offre-header">
                <h2 className="offre-title">{etudiant.prenom} {etudiant.nom}</h2>
                <div className="offre-company">{etudiant.mail}</div>
            </div>
            <div className="offre-content">
                <div className="offre-details">
                    <div className="detail-item">
                        <HiPhone />
                        <span>{etudiant.telephone}</span>
                    </div>
                    <div className="detail-item">
                        <HiMail />
                        <span>{etudiant.mail}</span>
                    </div>
                </div>
            </div>
            <div className="offre-actions">
                <button className="btn btn-outline" onClick={handleModifier}>Modifier</button>
                <button className="btn btn-outline" onClick={handleSupprimer}>
                    <HiTrash className="trash-icon" />
                </button>

            </div>
        </div>
    );
};

export default function AdminEtudiantsPage() {
    const [etudiants, setEtudiants] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setEtudiants(etudiantsDeTest);
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const etudiantsFiltres = etudiants.filter((e) =>
        `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase()) ||
        e.mail.toLowerCase().includes(search.toLowerCase())
    );

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
                    <EtudiantCard key={etudiant.id} etudiant={etudiant} />
                ))}
            </div>
            <CreateEtudiantButton />
            <StatsEtudiantsButton />
        </div>
    );
}
