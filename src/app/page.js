import Image from "next/image";
import { memo } from 'react';
import TestAPI from './components/TestAPI';

// Composants memoïsés pour éviter les rendus inutiles
const FeatureCard = memo(({ icon, title, description }) => (
  <div className="feature-card">
    <span className="material-symbols-rounded">{icon}</span>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
));

const StatItem = memo(({ number, description }) => (
  <div className="stat-item">
    <h2>{number}</h2>
    <p>{description}</p>
  </div>
));

export default function Home() {
  const features = [
    { icon: 'search', title: 'Recherche simplifiée', description: 'Trouvez rapidement le stage qui vous correspond' },
    { icon: 'work', title: 'Stages qualifiés', description: 'Des offres sélectionnées et vérifiées' },
    { icon: 'timeline', title: 'Suivi personnalisé', description: 'Accompagnement tout au long de votre recherche' }
  ];

  const stats = [
    { number: '500+', description: 'Entreprises partenaires' },
    { number: '1000+', description: 'Stages disponibles' },
    { number: '5000+', description: 'Étudiants satisfaits' }
  ];

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://20.19.36.142:8000/api/users');
      const data = await response.json();
      console.log('Utilisateurs:', data);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  };

  const createUser = async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123"
    };

    try {
      const response = await fetch('http://20.19.36.142:8000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      console.log('Réponse de création:', data);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Trouvez le stage idéal</h1>
          <p>Explorez les meilleures opportunités de stage pour votre carrière</p>
          <a href="/Offres" className="cta-button">
            Voir les offres
          </a>
        </div>
      </section>

      <section className="features-section">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
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

      <TestAPI />
    </div>
  );
}
