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
    console.log('Suppression des cookies...');
    
    // Supprimer tous les cookies liés à l'authentification avec différentes options
    const cookieOptions = [
        { path: '/' },
        { path: '/', domain: window.location.hostname },
        { path: '/', domain: '.' + window.location.hostname },
        { path: '/', domain: window.location.hostname.split('.').slice(-2).join('.') }
    ];

    const cookiesToRemove = ['authToken', 'userData', 'userRole'];

    cookiesToRemove.forEach(cookieName => {
        cookieOptions.forEach(options => {
            Cookies.remove(cookieName, options);
        });
    });
    
    // Vérifier que les cookies ont bien été supprimés
    const token = Cookies.get('authToken');
    const userData = Cookies.get('userData');
    const userRole = Cookies.get('userRole');
    
    console.log('Vérification après suppression:');
    console.log('Token:', token ? 'existe encore' : 'supprimé');
    console.log('UserData:', userData ? 'existe encore' : 'supprimé');
    console.log('UserRole:', userRole ? 'existe encore' : 'supprimé');
    
    // Forcer un rechargement complet de la page pour vider le cache
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