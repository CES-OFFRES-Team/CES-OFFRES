'use client';
import { useEffect, useState } from 'react';
import { isAuthenticated, getUserData, verifyToken, logout } from '../utils/auth';
import Link from 'next/link';
import './Navigation.css';

export default function Navigation() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const authenticated = isAuthenticated();
            if (authenticated) {
                // Vérifier la validité du token
                const isValid = await verifyToken();
                if (!isValid) {
                    logout();
                    return;
                }
            }
            setIsLoggedIn(authenticated);
            setUserData(getUserData());
        };

        checkAuth();

        // Vérifier le token toutes les 5 minutes
        const interval = setInterval(checkAuth, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <nav className="main-nav">
            <div className="nav-brand">
                <Link href="/">CES OFFRES</Link>
            </div>
            <div className="nav-links">
                {isLoggedIn ? (
                    <div className="user-menu">
                        <span className="user-name">{userData?.prenom}</span>
                        <Link href="/dashboard" className="account-button">
                            Mon Compte
                        </Link>
                        <button onClick={logout} className="logout-button">
                            Déconnexion
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="login-button">
                        Se connecter
                    </Link>
                )}
            </div>
        </nav>
    );
} 