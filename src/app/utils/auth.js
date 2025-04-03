import Cookies from 'js-cookie';
import { COOKIE_KEYS } from './constants';

/**
 * Récupère le token d'authentification
 */
export const getAuthToken = () => {
    return Cookies.get(COOKIE_KEYS.AUTH_TOKEN);
};

/**
 * Récupère les données de l'utilisateur connecté
 */
export const getUserData = () => {
    try {
        const userData = Cookies.get(COOKIE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Erreur de parsing des données utilisateur:', error);
        return null;
    }
};

/**
 * Récupère le rôle de l'utilisateur connecté
 */
export const getUserRole = () => {
    return Cookies.get(COOKIE_KEYS.USER_ROLE) || null;
};

/**
 * Vérifie si un utilisateur est authentifié
 */
export const isAuthenticated = () => {
    const token = getAuthToken();
    const userData = getUserData();
    return !!(token && userData);
};

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export const hasRole = (requiredRole) => {
    const userRole = getUserRole();
    if (!userRole) return false;
    
    // Si admin, accès à tout
    if (userRole === 'Admin') return true;
    
    // Pour les autres rôles, vérifier l'égalité
    return userRole === requiredRole;
};

/**
 * Déconnecte l'utilisateur
 */
export const logout = () => {
    console.log('Déconnexion en cours...');
    
    // Supprimer les cookies avec les mêmes options que lors de la définition
    const cookieOptions = { 
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };
    
    Cookies.remove(COOKIE_KEYS.AUTH_TOKEN, cookieOptions);
    Cookies.remove(COOKIE_KEYS.USER_DATA, cookieOptions);
    Cookies.remove(COOKIE_KEYS.USER_ROLE, cookieOptions);
    
    // Vérifier que les cookies ont bien été supprimés
    console.log('Vérification après suppression:');
    console.log('Token:', Cookies.get(COOKIE_KEYS.AUTH_TOKEN) ? 'existe encore' : 'supprimé');
    console.log('UserData:', Cookies.get(COOKIE_KEYS.USER_DATA) ? 'existe encore' : 'supprimé');
    console.log('UserRole:', Cookies.get(COOKIE_KEYS.USER_ROLE) ? 'existe encore' : 'supprimé');
};

// Fonction pour vérifier si le token est toujours valide avec le backend
export const verifyToken = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            console.log('Token non trouvé dans les cookies');
            return false;
        }

        const response = await fetch('http://20.19.36.142:8000/api/verify-token', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log('Token invalide selon le serveur');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        return false;
    }
};