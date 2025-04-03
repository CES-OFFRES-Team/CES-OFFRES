'use client';

import React from 'react';
import Link from 'next/link';
import { getUserRole } from '../../utils/auth';
import AuthNav from '../../components/AuthNav';

export default function Navigation() {
    const userRole = getUserRole();

    return (
        <aside className="sidebar">
            <div className="logo-container">
                <img src="/images/logo.svg" alt="Logo" className="nav-logo" />
            </div>

            <ul className="nav-list primary-nav">
                <li className="nav-item">
                    <a href="/admin/entreprises" className="nav-link">
                        <span className="material-symbols-rounded">
                            business
                        </span>
                        <span className="nav-label">Entreprises</span>
                    </a>
                </li>
                <li className="nav-item">
                    <a href="/admin/pilotes" className="nav-link">
                        <span className="material-symbols-rounded">
                            group
                        </span>
                        <span className="nav-label">Pilotes</span>
                    </a>
                </li>

                <li className="nav-item">
                    <a href="/admin/Etudiants" className="nav-link">
                        <span className="material-symbols-rounded">
                            school
                        </span>
                        <span className="nav-label">Étudiants</span>
                    </a>
                </li>

                <li className="nav-item">
                    <a href="/admin/offres" className="nav-link">
                        <span className="material-symbols-rounded">
                            work
                        </span>
                        <span className="nav-label">Offres</span>
                    </a>
                </li>
                
                <li className="nav-item">
                    <a href="/admin/support" className="nav-link">
                        <span className="material-symbols-rounded">
                            support_agent
                        </span>
                        <span className="nav-label">Support</span>
                    </a>
                </li>
                
                {userRole === 'Admin' && (
                    <li className="nav-item">
                        <a href="/etudiant/dashboard" className="nav-link">
                            <span className="material-symbols-rounded">
                                switch_account
                            </span>
                            <span className="nav-label">Espace Étudiant</span>
                        </a>
                    </li>
                )}
            </ul>

            <ul className="nav-list secondary-nav">
                <AuthNav />
            </ul>
        </aside>
    );
}
