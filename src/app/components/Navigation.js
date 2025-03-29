'use client';
import React from 'react';
import AuthNav from './AuthNav';

export default function Navigation() {
    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <div className="logo-container">
                    <img
                        src="/images/logo.svg"
                        alt="Logo"
                        className="nav-logo"
                    />
                </div>
                <ul className="nav-list primary-nav">
                    <li className="nav-item">
                        <a href="/" className="nav-link">
                            <span className="material-symbols-rounded">home</span>
                            <span className="nav-label">Accueil</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a href="/Offres" className="nav-link">
                            <span className="material-symbols-rounded">work</span>
                            <span className="nav-label">Offres</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a href="/Contact" className="nav-link">
                            <span className="material-symbols-rounded">contact_support</span>
                            <span className="nav-label">Contact</span>
                        </a>
                    </li>
                </ul>
                <ul className="nav-list secondary-nav">
                    <AuthNav />
                </ul>
            </nav>
        </aside>
    );
} 