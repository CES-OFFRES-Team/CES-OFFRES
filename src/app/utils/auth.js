import Cookies from 'js-cookie';

/**
 * Récupère le token d'authentification
 */
export const getAuthToken = () => {
    return Cookies.get('authToken');
};

/**
 * Récupère les données de l'utilisateur
 */
export const getUserData = () => {
    try {
        const userData = Cookies.get('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Erreur lors de la lecture des données utilisateur:', error);
        return null;
    }
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = () => {
    return !!getAuthToken();
};

/**
 * Déconnecte l'utilisateur
 */
export const logout = () => {
    Cookies.remove('authToken');
    Cookies.remove('userData');
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