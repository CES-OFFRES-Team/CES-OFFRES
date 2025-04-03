// Noms des cookies
export const COOKIE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  USER_ROLE: 'userRole'
};

// URL de l'API
export const API_URL = 'http://20.19.36.142:8000/api';

// Rôles utilisateurs
export const USER_ROLES = {
  ADMIN: 'Admin',
  ETUDIANT: 'Etudiant',
  PILOTE: 'Pilote',
  ENTREPRISE: 'Entreprise'
};

// Chemins de redirection par rôle
export const REDIRECT_PATHS = {
  [USER_ROLES.ADMIN]: '/admin',
  [USER_ROLES.ETUDIANT]: '/etudiant/dashboard',
  [USER_ROLES.PILOTE]: '/pilote/dashboard',
  [USER_ROLES.ENTREPRISE]: '/entreprise/dashboard'
}; 