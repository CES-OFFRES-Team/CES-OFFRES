import "./globals.css";
import { Inter } from 'next/font/google'
import Image from 'next/image'

// If you want to use this font, add these lines at the top of your layout.js
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "CES'Offres",
  description: "Platforme Pour trouver un stage",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />
      </head>
      <body>
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className="logo-container">
              <img
                src="/images/logo.webp"
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
              <li className="nav-item">
                <a href="/Login" className="nav-link login-btn">
                  <span className="material-symbols-rounded">login</span>
                  <span className="nav-label">Connexion</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
