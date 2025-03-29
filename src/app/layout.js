import "./globals.css";
import { Inter } from 'next/font/google'
import Navigation from './components/Navigation'

// If you want to use this font, add these lines at the top of your layout.js
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "CES'Offres",
  description: "Platforme Pour trouver un stage",
};

// Le layout principal reste un composant serveur
export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={inter.className}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        <Navigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
