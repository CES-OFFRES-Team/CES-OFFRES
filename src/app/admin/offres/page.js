'use client';

import React, { useState, useEffect } from 'react';
import { HiOfficeBuilding, HiCalendar, HiLocationMarker, HiTrash, HiPlus } from 'react-icons/hi';
import OffreModal from './OffreModal';
import './Offres.css';

// Données fictives pour les offres
const offresDeTest = [
    {
        id: 1,
        titre: 'Développeur Full-Stack',
        entreprise: 'TechCorp',
        localisation: 'Paris',
        dateDebut: '2024-05-01',
        description: 'Développement d\'applications web modernes',
        competences: ['React', 'Node.js', 'TypeScript']
    },
    {
        id: 2,
        titre: 'Ingénieur DevOps',
        entreprise: 'EcoSolutions',
        localisation: 'Lyon',
        dateDebut: '2024-06-01',
        description: 'Mise en place et maintenance de l\'infrastructure cloud',
        competences: ['Docker', 'Kubernetes', 'AWS']
    }
];

const OffreCard = ({ offre, onModifier, onSupprimer }) => {
    return (
        <div className="offre-card">
            <div className="offre-header">
                <h2 className="offre-title">{offre.titre}</h2>
                <div className="offre-entreprise">
                    <HiOfficeBuilding />
                    <span>{offre.entreprise}</span>
                </div>
            </div>
            <div className="offre-content">
                <div className="offre-details">
                    <div className="detail-item">
                        <HiLocationMarker />
                        <span>{offre.localisation}</span>
                    </div>
                    <div className="detail-item">
                        <HiCalendar />
                        <span>{offre.dateDebut}</span>
                    </div>
                </div>
                <p className="offre-description">{offre.description}</p>
                <div className="offre-competences">
                    {offre.competences.map((comp, index) => (
                        <span key={index} className="competence-tag">{comp}</span>
                    ))}
                </div>
            </div>
            <div className="offre-actions">
                <button className="btn btn-outline" onClick={() => onModifier(offre)}>
                    Modifier
                </button>
                <button className="btn btn-outline" onClick={() => onSupprimer(offre.id)}>
                    <HiTrash className="trash-icon" />
                </button>
            </div>
        </div>
    );
};

export default function AdminOffresPage() {
    const [offres, setOffres] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOffre, setSelectedOffre] = useState(null);

    useEffect(() => {
        setOffres(offresDeTest);
    }, []);

    const handleCreate = () => {
        setSelectedOffre(null);
        setModalOpen(true);
    };

    const handleModifier = (offre) => {
        setSelectedOffre(offre);
        setModalOpen(true);
    };

    const handleSupprimer = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
            setOffres(offres.filter(o => o.id !== id));
        }
    };

    const handleModalSubmit = (formData) => {
        if (selectedOffre) {
            setOffres(offres.map(o => 
                o.id === selectedOffre.id ? { ...formData, id: o.id } : o
            ));
        } else {
            setOffres([
                ...offres,
                { ...formData, id: Math.max(...offres.map(o => o.id)) + 1 }
            ]);
        }
        setModalOpen(false);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const offresFiltrees = offres.filter((o) =>
        o.titre.toLowerCase().includes(search.toLowerCase()) ||
        o.entreprise.toLowerCase().includes(search.toLowerCase()) ||
        o.localisation.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="offres-container">
            <div className="offres-header">
                <h1>Gestion des Offres</h1>
                <button className="btn btn-primary" onClick={handleCreate}>
                    <HiPlus /> Nouvelle Offre
                </button>
                <input
                    type="text"
                    placeholder="Rechercher une offre..."
                    value={search}
                    onChange={handleSearchChange}
                    className="filter-input"
                />
            </div>

            <div className="offres-grid">
                {offresFiltrees.map((offre) => (
                    <OffreCard 
                        key={offre.id} 
                        offre={offre}
                        onModifier={handleModifier}
                        onSupprimer={handleSupprimer}
                    />
                ))}
            </div>

            {modalOpen && (
                <OffreModal
                    offre={selectedOffre}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleModalSubmit}
                />
            )}
        </div>
    );
}
