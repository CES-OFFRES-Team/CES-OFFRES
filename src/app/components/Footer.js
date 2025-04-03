"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  useEffect(() => {
    // Écouteur d'événement pour la sidebar
    const handleSidebarChange = (e) => {
      if (document.body.classList.contains('sidebar-open')) {
        document.querySelector('.footer').classList.add('sidebar-shifted');
      } else {
        document.querySelector('.footer').classList.remove('sidebar-shifted');
      }
    };

    // Écouteur d'événement pour le menu burger
    const handleMenuChange = (e) => {
      if (document.body.classList.contains('menu-open')) {
        document.querySelector('.footer').classList.add('menu-shifted');
      } else {
        document.querySelector('.footer').classList.remove('menu-shifted');
      }
    };

    // Observer les changements de classe sur le body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          handleSidebarChange();
          handleMenuChange();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Navigation</h3>
          <ul>
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/Offres">Offres de stage</Link></li>
            <li><Link href="/FAQ">FAQ</Link></li>
            <li><Link href="/About">À propos</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Légal</h3>
          <ul>
            <li><Link href="/mentions-legales">Mentions légales</Link></li>
            <li><Link href="/politique-confidentialite">Politique de confidentialité</Link></li>
            <li><Link href="/cgu">CGU</Link></li>
            <li><Link href="/rgpd">RGPD</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Newsletter</h3>
          <form className="newsletter-form">
            <input type="email" placeholder="Votre email" aria-label="Email pour newsletter" />
            <button type="submit">S'inscrire</button>
          </form>
        </div>

        <div className="footer-section">
          <h3>Suivez-nous</h3>
          <div className="social-links">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="company-info">
          <p>CES'Offres - Partenaire officiel de CESI École d'Ingénieurs</p>
          <p>93 Boulevard de la Seine, 92000 Nanterre</p>
        </div>
        <div className="footer-copyright">
          <p>© {new Date().getFullYear()} CES'Offres. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}