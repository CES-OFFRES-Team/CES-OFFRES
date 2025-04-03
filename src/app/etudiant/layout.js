'use client';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { USER_ROLES } from '../utils/constants';
import './etudiant.css';

export default function EtudiantLayout({ children }) {
    const { user, logout, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Vérifier si l'utilisateur est connecté et est un étudiant
        if (!loading) {  // Attendre que le chargement initial soit terminé
            if (!user) {
                console.log('Utilisateur non connecté, redirection vers login');
                router.push('/Login');
                router.refresh(); // Force le rafraîchissement du router
            } else if (user.role !== USER_ROLES.ETUDIANT) {
                console.log('Utilisateur non étudiant, redirection vers login');
                router.push('/Login');
                router.refresh(); // Force le rafraîchissement du router
            }
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        console.log('Déconnexion en cours...');
        await logout();
        console.log('Redirection vers la page de connexion...');
        router.push('/Login');
        router.refresh(); // Force le rafraîchissement du router après la déconnexion
    };

    // Afficher un écran de chargement pendant la vérification
    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-4">
                    <h1 className="text-xl font-bold">CES OFFRES</h1>
                    <p className="text-sm mt-2">Connecté en tant que : {user.prenom} {user.nom}</p>
                </div>
                <nav className="mt-4">
                    <Link href="/etudiant/dashboard" className="block px-4 py-2 hover:bg-gray-700" onClick={() => router.refresh()}>
                        <i className="fas fa-home"></i> Tableau de bord
                    </Link>
                    <Link href="/Offres" className="block px-4 py-2 hover:bg-gray-700" onClick={() => router.refresh()}>
                        <i className="fas fa-briefcase"></i> Offres de stage
                    </Link>
                    <Link href="/etudiant/profile" className="block px-4 py-2 hover:bg-gray-700" onClick={() => router.refresh()}>
                        <i className="fas fa-user"></i> Mon profil
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-700 focus:outline-none"
                    >
                        <i className="fas fa-sign-out-alt"></i> Déconnexion
                    </button>
                </nav>
            </div>
            <div className="flex-1 bg-gray-100">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
} 