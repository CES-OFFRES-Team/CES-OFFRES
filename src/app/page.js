import Image from "next/image";
import { memo } from 'react';

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
    </div>
  );
}
