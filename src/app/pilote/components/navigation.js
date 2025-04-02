'use client';

import React from 'react';
import AuthNav from '../../components/AuthNav';

export default function Navigation() {
    const handleClickEntreprises = () => { };
    const handleClickPilotes = () => { };
    const handleClickEtudiants = () => { };
    const handleClickOffres = () => { };
    const handleClickSupport = () => { };

    return (
        <aside className="sidebar">
            <div className="logo-container">
                <img src="/images/logo.svg" alt="Logo" className="nav-logo" />
            </div>

            <ul className="nav-list primary-nav">
                <li className="nav-item">
                    <a href="/pilote/entreprises" className="nav-link">
                        <span
                            className="material-symbols-rounded"
                            onClick={handleClickEntreprises}
                        >
                            business
                        </span>
                        <span className="nav-label">Entreprises</span>
                    </a>
                </li>
                <li className="nav-item">
                    <a href="/pilote/Etudiants" className="nav-link">
                        <span
                            className="material-symbols-rounded"
                            onClick={handleClickEtudiants}
                        >
                            school
                        </span>
                        <span className="nav-label">Étudiants</span>
                    </a>
                </li>
                <li className="nav-item">
                    <a href="/pilote/offres" className="nav-link">
                        <span
                            className="material-symbols-rounded"
                            onClick={handleClickOffres}
                        >
                            work
                        </span>
                        <span className="nav-label">Offres</span>
                    </a>

                </li>
                <li className="nav-item">
                    <a href="/pilote/support" className="nav-link">
                        <span
                            className="material-symbols-rounded"
                            onClick={handleClickSupport}
                        >
                            support_agent
                        </span>
                        <span className="nav-label">Support</span>
                    </a>
                </li>

            </ul>

            <ul className="nav-list secondary-nav">
                <AuthNav />
            </ul>
        </aside>
    );
}
