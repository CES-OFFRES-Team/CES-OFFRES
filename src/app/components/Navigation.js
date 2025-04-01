'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const [showBurger, setShowBurger] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setShowBurger(window.innerWidth <= 1200);
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {showBurger && (
                <button 
                    className={`menu-toggle ${isOpen ? 'active' : ''}`} 
                    onClick={toggleMenu}
                    aria-label="Toggle navigation"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            )}
            <aside 
                className={`sidebar ${isOpen ? 'expanded' : ''}`}
                onMouseEnter={() => !showBurger && setIsOpen(true)}
                onMouseLeave={() => !showBurger && setIsOpen(false)}
            >
                {showBurger && (
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
                <button 
                    className="close-menu"
                    onClick={() => setIsOpen(false)}
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
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
                            <Link href="/" className="nav-link">
                                <i className="fa-solid fa-house"></i>
                                <span className="nav-label">Accueil</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/Offres" className="nav-link">
                                <i className="fa-solid fa-briefcase"></i>
                                <span className="nav-label">Offres</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/Contact" className="nav-link">
                                <i className="fa-solid fa-envelope"></i>
                                <span className="nav-label">Contact</span>
                            </Link>
                        </li>
                    </ul>
                    <ul className="secondary-nav">
                        <li className="nav-item">
                            <Link href="/Login" className="nav-link">
                                <i className="fa-solid fa-right-to-bracket"></i>
                                <span className="nav-label">Connexion</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
}