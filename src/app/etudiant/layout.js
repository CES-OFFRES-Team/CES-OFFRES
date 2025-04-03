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
        try {
            console.log('Déconnexion en cours...');
            await logout();
            console.log('Déconnexion réussie');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    // Afficher un écran de chargement pendant la vérification
    if (loading) {
        return (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-75 z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Si l'utilisateur n'est pas connecté, ne rien afficher (la redirection sera gérée par useEffect)
    if (!user) {
        return null;
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