'use client';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { USER_ROLES } from '../utils/constants';
import './etudiant.css';

export default function EtudiantLayout({ children }) {
    const { user, logout } = useAuth();
    const router = useRouter();

    // Rediriger si l'utilisateur n'est pas connecté ou n'est pas un étudiant
    useEffect(() => {
        if (!user) {
            router.push('/Login');
        } else if (user.role !== USER_ROLES.ETUDIANT) {
            router.push('/Login');
        }
    }, [user, router]);

    const handleLogout = () => {
        logout();
        router.push('/Login');
    };

    // Afficher un écran de chargement si l'utilisateur n'est pas encore vérifié
    if (!user) {
        return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
    }

    return (
        <div className="flex min-h-screen">
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-4">
                    <h1 className="text-xl font-bold">CES OFFRES</h1>
                </div>
                <nav className="mt-4">
                    <Link href="/etudiant/dashboard" className="block px-4 py-2 hover:bg-gray-700">
                        <i className="fas fa-home"></i> Tableau de bord
                    </Link>
                    <Link href="/Offres" className="block px-4 py-2 hover:bg-gray-700">
                        <i className="fas fa-briefcase"></i> Offres de stage
                    </Link>
                    <Link href="/etudiant/profile" className="block px-4 py-2 hover:bg-gray-700">
                        <i className="fas fa-user"></i> Mon profil
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-700"
                    >
                        <i className="fas fa-sign-out-alt"></i> Déconnexion
                    </button>
                </nav>
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
} 