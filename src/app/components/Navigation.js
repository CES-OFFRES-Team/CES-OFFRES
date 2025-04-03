'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../utils/constants';

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.refresh();
        router.push('/Login');
    };

    useEffect(() => {
        const checkWindowState = () => {
            // Méthode 1: Vérifier si la fenêtre occupe tout l'écran disponible
            const method1 = window.outerWidth >= window.screen.availWidth && 
                          window.outerHeight >= window.screen.availHeight;

            // Méthode 2: Vérifier le ratio d'occupation
            const heightRatio = window.innerHeight / window.screen.availHeight;
            const widthRatio = window.innerWidth / window.screen.availWidth;
            const method2 = heightRatio > 0.95 && widthRatio > 0.95;

            // Méthode 3: Vérifier si la fenêtre est à 0,0 et occupe presque tout l'écran
            const method3 = window.screenX <= 0 && 
                          window.screenY <= 0 && 
                          Math.abs(window.outerWidth - window.screen.availWidth) < 10 && 
                          Math.abs(window.outerHeight - window.screen.availHeight) < 10;

            // On considère la fenêtre maximisée si au moins deux méthodes le confirment
            const isMax = [method1, method2, method3].filter(Boolean).length >= 2;
            
            setIsMaximized(isMax);
        };

        // Vérifier l'état initial
        checkWindowState();

        // Vérifier à chaque changement de taille
        window.addEventListener('resize', checkWindowState);

        // Vérifier périodiquement (au cas où)
        const interval = setInterval(checkWindowState, 1000);

        return () => {
            window.removeEventListener('resize', checkWindowState);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        // Ajouter/retirer les classes sur le body pour le footer
        document.body.classList.toggle('sidebar-expanded', isOpen);
        document.body.classList.toggle('maximized', isMaximized);

        return () => {
            document.body.classList.remove('sidebar-expanded', 'maximized');
        };
    }, [isOpen, isMaximized]);

    return (
        <>
            <button 
                className={`menu-toggle ${isOpen ? 'active' : ''} ${isMaximized ? 'hidden' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
            <aside 
                className={`sidebar ${isOpen ? 'expanded' : ''} ${isMaximized ? 'maximized' : ''}`}
                onMouseEnter={() => isMaximized && setIsOpen(true)}
                onMouseLeave={() => isMaximized && setIsOpen(false)}
            >
                {!isMaximized && (
                    <div className="mobile-header">
                        <button 
                            className="back-button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close menu"
                        >
                            <i className="fa-solid fa-chevron-left"></i>
                            <span>Retour</span>
                        </button>
                    </div>
                )}
                <div className="logo-container">
                    <Image 
                        src="/images/logo.svg" 
                        alt="CES'Offres Logo" 
                        width={isOpen ? 130 : 45} 
                        height={45} 
                        className="nav-logo"
                    />
                </div>
                <nav className="sidebar-nav">
                    <ul className="primary-nav">
                        <li className="nav-item">
                            <Link 
                                href={user?.role === USER_ROLES.ADMIN ? "/admin" : "/"} 
                                className="nav-link"
                                onClick={() => setIsOpen(false)}
                            >
                                <i className={`fa-solid ${user?.role === USER_ROLES.ADMIN ? "fa-gauge-high" : "fa-house"}`}></i>
                                <span className="nav-label">{user?.role === USER_ROLES.ADMIN ? "Dashboard" : "Accueil"}</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/Offres" className="nav-link" onClick={() => setIsOpen(false)}>
                                <i className="fa-solid fa-briefcase"></i>
                                <span className="nav-label">Offres</span>
                            </Link>
                        </li>
                        {user?.role === USER_ROLES.ADMIN && (
                            <>
                                <li className="nav-item">
                                    <Link href="/admin/entreprises" className="nav-link" onClick={() => setIsOpen(false)}>
                                        <i className="fa-solid fa-building"></i>
                                        <span className="nav-label">Entreprises</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link href="/admin/Etudiants" className="nav-link" onClick={() => setIsOpen(false)}>
                                        <i className="fa-solid fa-user-graduate"></i>
                                        <span className="nav-label">Étudiants</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link href="/admin/pilotes" className="nav-link" onClick={() => setIsOpen(false)}>
                                        <i className="fa-solid fa-user-tie"></i>
                                        <span className="nav-label">Pilotes</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link href="/admin/support" className="nav-link" onClick={() => setIsOpen(false)}>
                                        <i className="fa-solid fa-headset"></i>
                                        <span className="nav-label">Support</span>
                                    </Link>
                                </li>
                            </>
                        )}
                        {!user?.role === USER_ROLES.ADMIN && (
                            <li className="nav-item">
                                <Link href="/Contact" className="nav-link" onClick={() => setIsOpen(false)}>
                                    <i className="fa-solid fa-envelope"></i>
                                    <span className="nav-label">Contact</span>
                                </Link>
                            </li>
                        )}
                    </ul>
                    <ul className="secondary-nav">
                        <li className="nav-item">
                            {user ? (
                                <button 
                                    onClick={handleLogout}
                                    className="nav-link deconnexion-button"
                                >
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                    <span className="nav-label">Déconnexion</span>
                                </button>
                            ) : (
                                <Link href="/Login" className="nav-link" onClick={() => setIsOpen(false)}>
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                    <span className="nav-label">Connexion</span>
                                </Link>
                            )}
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
}