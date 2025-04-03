'use client';
import React from 'react';
import Navigation from './components/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { USER_ROLES } from '../utils/constants';

export default function AdminLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Vérifier si l'utilisateur est connecté et est un admin
        if (!loading) {  // Attendre que le chargement initial soit terminé
            if (!user) {
                console.log('Utilisateur non connecté, redirection vers login');
                router.push('/Login');
            } else if (user.role !== USER_ROLES.ADMIN) {
                console.log('Utilisateur non admin, redirection vers login');
                router.push('/Login');
            }
        }
    }, [user, loading, router]);

    // Afficher un écran de chargement pendant la vérification
    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Afficher le layout admin une fois l'authentification vérifiée
    return (
        <div className="admin-page">
            <Navigation />
            <main className="admin-content">
                {children}
            </main>
        </div>
    );
}

