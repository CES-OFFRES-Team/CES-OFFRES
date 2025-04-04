'use client';

import React, { useState } from 'react';
import { memo } from 'react';
import Link from 'next/link';
import './AdminHome.css';
import ProtectedRoute from '../components/ProtectedRoute';


// Composants mémoïsés pour éviter les rendus inutiles
const AdminCard = memo(({ icon, title, description, link }) => (
    <Link href={link} className="admin-card">
        <span className="material-symbols-rounded">{icon}</span>
        <h3>{title}</h3>
        <p>{description}</p>
    </Link>
));

const StatItem = memo(({ number, description }) => (
    <div className="stat-item">
        <h2>{number}</h2>
        <p>{description}</p>
    </div>
));

export default function AdminHome() {
    const stats = [
        { number: '20+', description: 'Pilotes enregistrés' },
        { number: '50+', description: 'Entreprises partenaires' },
        { number: '300+', description: 'Offres publiées' }
    ];

    const panels = [
        { icon: 'groups', title: 'Gérer les étudiants', description: 'Voir, modifier ou supprimer les comptes étudiants', link: '/admin/Etudiants' },
        { icon: 'business', title: 'Gérer les entreprises', description: 'Consulter ou administrer les entreprises partenaires', link: '/admin/entreprises' },
        { icon: 'account_circle', title: 'Gérer les pilotes', description: 'Ajouter, modifier ou supprimer un pilote', link: '/admin/pilotes' },
        { icon: 'work', title: 'Gérer les offres', description: 'Voir et éditer les offres de stage disponibles', link: '/admin/offres' },
        { icon: 'support_agent', title: 'Support', description: 'Répondre aux demandes de contact', link: '/admin/support' },
    ];

    return (
        <ProtectedRoute requiredRole="Admin">
            <main>
                <div className="home-container">
                    <section className="hero-section">
                        <div className="hero-content">
                            <h1>Interface administrateur</h1>
                            <p>Gérez les données et les utilisateurs de la plateforme.</p>
                        </div>
                    </section>

                    <section className="features-section">
                        {panels.map((panel, index) => (
                            <AdminCard
                                key={index}
                                icon={panel.icon}
                                title={panel.title}
                                description={panel.description}
                                link={panel.link}
                            />
                        ))}
                    </section>

                    <section className="stats-section">
                        {stats.map((stat, index) => (
                            <StatItem
                                key={index}
                                number={stat.number}
                                description={stat.description}
                            />
                        ))}
                    </section>
                </div>
            </main>
        </ProtectedRoute>
    );
}
