"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../styles/pages/_home.css';
import RegisterPopup from './components/RegisterPopup';

const testimonials = [
  {
    text: "J'ai trouvé mon stage idéal en seulement 2 jours !",
    author: "Marie D.",
    role: "Étudiante en informatique"
  },
  {
    text: "Une plateforme vraiment intuitive et efficace.",
    author: "Lucas M.",
    role: "Étudiant en génie civil"
  },
  {
    text: "Des opportunités de qualité et un excellent suivi.",
    author: "Sophie B.",
    role: "Étudiante en marketing"
  },
  {
    text: "Processus de candidature simplifié au maximum.",
    author: "Thomas R.",
    role: "Étudiant en électronique"
  },
  {
    text: "Je recommande à tous les étudiants CESI !",
    author: "Julie L.",
    role: "Étudiante en commerce"
  },
  {
    text: "Une expérience vraiment positive.",
    author: "Paul M.",
    role: "Étudiant en mécanique"
  },
  {
    text: "Stage trouvé en moins d'une semaine !",
    author: "Emma K.",
    role: "Étudiante en design"
  },
  {
    text: "Interface claire et moderne.",
    author: "Lucas P.",
    role: "Étudiant en data science"
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 4) % testimonials.length);
        setIsAnimating(false);
      }, 500); // Durée de l'animation de sortie
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Trouvez votre stage idéal</h1>
            <p>Découvrez des opportunités de stage adaptées à votre profil</p>
            <div className="cta-buttons">
              <Link href="/Offres" className="btn btn-primary">
                Voir les offres
              </Link>
              <button 
                className="btn btn-outline"
                onClick={() => setIsPopupOpen(true)}
              >
                S'inscrire ?
              </button>
            </div>
          </div>

          <div className="testimonials-section">
            <h1>Avis étudiants</h1>
            <p className="testimonials-subtitle">Découvrez les retours d'expérience de nos utilisateurs</p>
            <div className="testimonials-grid">
              {[0, 1, 2, 3].map((offset) => {
                const index = (currentIndex + offset) % testimonials.length;
                return (
                  <div 
                    key={index} 
                    className={`testimonial-card ${isAnimating ? 'fade-out' : 'fade-in'}`}
                  >
                    <p>{testimonials[index].text}</p>
                    <div className="testimonial-author">
                      <span>{testimonials[index].author}</span>
                      <small>{testimonials[index].role}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <RegisterPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
    </main>
  );
}
