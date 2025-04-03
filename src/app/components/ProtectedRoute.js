'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserRole, hasRole } from '../utils/auth';

export default function ProtectedRoute({ children, requiredRole = null }) {
    const router = useRouter();

    useEffect(() => {
        // Vérifier si l'utilisateur est authentifié
        if (!isAuthenticated()) {
            console.log('Utilisateur non authentifié, redirection vers login');
            router.push('/login');
            return;
        }

        // Si un rôle spécifique est requis, vérifier que l'utilisateur a ce rôle
        if (requiredRole) {
            const userRole = getUserRole();
            console.log(`Vérification du rôle: requis=${requiredRole}, utilisateur=${userRole}`);
            
            let hasAccess = false;
            
            if (requiredRole === 'Admin' && userRole === 'Admin') {
                hasAccess = true;
            } else if (requiredRole === 'Pilote' && (userRole === 'Pilote' || userRole === 'Admin')) {
                hasAccess = true;
            } else if (requiredRole === 'Etudiant' && (userRole === 'Etudiant' || userRole === 'Admin')) {
                hasAccess = true;
            } else if (requiredRole === 'Entreprise' && (userRole === 'Entreprise' || userRole === 'Admin')) {
                hasAccess = true;
            }
            
            if (!hasAccess) {
                console.log(`Accès refusé: rôle ${requiredRole} requis, utilisateur a ${userRole}`);
                // Rediriger l'utilisateur vers la page appropriée en fonction de son rôle
                if (userRole === 'Admin') {
                    router.push('/admin');
                } else if (userRole === 'Pilote') {
                    router.push('/pilote/dashboard');
                } else if (userRole === 'Etudiant') {
                    router.push('/dashboard');
                } else if (userRole === 'Entreprise') {
                    router.push('/entreprise/dashboard');
                } else {
                    router.push('/login');
                }
            }
        }
    }, [router, requiredRole]);

    // Afficher les enfants uniquement si l'utilisateur est authentifié
    // Le middleware se chargera des redirections si nécessaire
    return isAuthenticated() ? children : null;
} 