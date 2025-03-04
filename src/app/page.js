import Image from "next/image";

export default function Home() {
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
        <div className="feature-card">
          <span className="material-symbols-rounded">search</span>
          <h3>Recherche simplifiée</h3>
          <p>Trouvez rapidement le stage qui vous correspond</p>
        </div>
        <div className="feature-card">
          <span className="material-symbols-rounded">work</span>
          <h3>Stages qualifiés</h3>
          <p>Des offres sélectionnées et vérifiées</p>
        </div>
        <div className="feature-card">
          <span className="material-symbols-rounded">timeline</span>
          <h3>Suivi personnalisé</h3>
          <p>Accompagnement tout au long de votre recherche</p>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <h2>500+</h2>
          <p>Entreprises partenaires</p>
        </div>
        <div className="stat-item">
          <h2>1000+</h2>
          <p>Stages disponibles</p>
        </div>
        <div className="stat-item">
          <h2>5000+</h2>
          <p>Étudiants satisfaits</p>
        </div>
      </section>
    </div>
  );
}
