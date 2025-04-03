import Cookies from 'js-cookie';

const TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

export const setAuthToken = (token, rememberMe = false) => {
    const options = {
        secure: true,
        sameSite: 'strict',
        expires: rememberMe ? 7 : 1  // 7 jours si "Se souvenir de moi", sinon 1 jour
    };
    Cookies.set(TOKEN_KEY, token, options);
};

export const getAuthToken = () => {
    return Cookies.get(TOKEN_KEY);
};

export const setUserData = (userData, rememberMe = false) => {
    const options = {
        secure: true,
        sameSite: 'strict',
        expires: rememberMe ? 7 : 1
    };
    Cookies.set(USER_DATA_KEY, JSON.stringify(userData), options);
};

export const getUserData = () => {
    const userData = Cookies.get(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = () => {
    const token = getAuthToken();
    const userData = getUserData();
    return !!(token && userData);
};

export const logout = () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_DATA_KEY);
    window.location.href = '/login';
};

// Fonction pour vérifier si le token est toujours valide avec le backend
export const verifyToken = async () => {
    try {
        const token = getAuthToken();
        if (!token) return false;

        const response = await fetch('http://20.19.36.142:8000/api/verify-token', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.ok;
    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        return false;
    }
};