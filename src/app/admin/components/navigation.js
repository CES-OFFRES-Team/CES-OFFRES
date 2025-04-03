'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import AuthNav from '../../components/AuthNav';
import { useRouter } from 'next/navigation';

export default function Navigation({ onNavigate }) {
    const { user } = useAuth();
    const router = useRouter();

    const handleNavigation = (path) => {
        router.push(path);
        if (onNavigate) onNavigate();
    };

    return (
        <aside className="sidebar">
            <div className="logo-container">
                <img src="/images/logo.svg" alt="Logo" className="nav-logo" />
            </div>

            <ul className="nav-list primary-nav">
                <li className="nav-item">
                    <Link href="/admin/entreprises" className="nav-link" onClick={() => handleNavigation('/admin/entreprises')}>
                        <span className="material-symbols-rounded">
                            business
                        </span>
                        <span className="nav-label">Entreprises</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link href="/admin/pilotes" className="nav-link" onClick={() => handleNavigation('/admin/pilotes')}>
                        <span className="material-symbols-rounded">
                            group
                        </span>
                        <span className="nav-label">Pilotes</span>
                    </Link>
                </li>

                <li className="nav-item">
                    <Link href="/admin/Etudiants" className="nav-link" onClick={() => handleNavigation('/admin/Etudiants')}>
                        <span className="material-symbols-rounded">
                            school
                        </span>
                        <span className="nav-label">Étudiants</span>
                    </Link>
                </li>

                <li className="nav-item">
                    <Link href="/admin/offres" className="nav-link" onClick={() => handleNavigation('/admin/offres')}>
                        <span className="material-symbols-rounded">
                            work
                        </span>
                        <span className="nav-label">Offres</span>
                    </Link>
                </li>
                
                <li className="nav-item">
                    <Link href="/admin/support" className="nav-link" onClick={() => handleNavigation('/admin/support')}>
                        <span className="material-symbols-rounded">
                            support_agent
                        </span>
                        <span className="nav-label">Support</span>
                    </Link>
                </li>
                
                {user?.role === 'Admin' && (
                    <li className="nav-item">
                        <Link href="/etudiant/dashboard" className="nav-link" onClick={() => handleNavigation('/etudiant/dashboard')}>
                            <span className="material-symbols-rounded">
                                switch_account
                            </span>
                            <span className="nav-label">Espace Étudiant</span>
                        </Link>
                    </li>
                )}
            </ul>

            <ul className="nav-list secondary-nav">
                <AuthNav onNavigate={onNavigate} />
            </ul>
        </aside>
    );
}
