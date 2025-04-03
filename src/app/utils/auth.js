import Cookies from 'js-cookie';

// Clés pour les cookies
const TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';
const USER_ROLE_KEY = 'userRole';

/**
 * Récupère le token d'authentification
 */
export const getAuthToken = () => {
    return Cookies.get(TOKEN_KEY);
};

/**
 * Récupère les données de l'utilisateur connecté
 */
export const getUserData = () => {
    try {
        const userData = Cookies.get(USER_DATA_KEY);
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
    return Cookies.get(USER_ROLE_KEY) || null;
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
    // Supprimer tous les cookies avec différentes options
    const options = [
        {}, // Options par défaut
        { path: '/' }, // Spécifier le path
        { domain: window.location.hostname }, // Spécifier le domaine
        { path: '/', domain: window.location.hostname } // Les deux
    ];
    
    // Essayer toutes les combinaisons pour s'assurer que les cookies sont supprimés
    options.forEach(opt => {
        Cookies.remove(TOKEN_KEY, opt);
        Cookies.remove(USER_DATA_KEY, opt);
        Cookies.remove(USER_ROLE_KEY, opt);
    });
    
    // Redirection vers la page de login avec une redirection complète du navigateur
    window.location.href = '/Login';
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

        const data = await response.json();
        return data.valid === true;
    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        return false;
    }
};