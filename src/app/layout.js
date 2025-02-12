import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Internship Search",
  description: "Platform for finding internships",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="header">
          <div className="header-content">
            <a href="/" className="logo-link">
              <h1 className="logo">IS</h1>
            </a>
            <nav>
              <ul className="nav-list">
                <li><a href="/">Home</a></li>
                <li><a href="/Offres">Offers</a></li>
                <li><a href="/About">About</a></li>
                <li><a href="/Contact">Contact</a></li>
                <li><a href="/Inscription">Inscription</a></li>
              </ul>
            </nav>
            <a href="/Login" className="login-button">Login</a>
          </div>
        </header>
        <div className="bottom-bar"></div>
        <main>
          {children}
        </main>
        <footer>
          <p>&copy; 2025 Internship Search. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
