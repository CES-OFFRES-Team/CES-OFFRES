// Noms des cookies
export const COOKIE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  USER_ROLE: 'userRole'
};

// Rôles utilisateurs
export const USER_ROLES = {
  ADMIN: 'Admin',
  ETUDIANT: 'Etudiant',
  PILOTE: 'Pilote',
  ENTREPRISE: 'Entreprise'
};

// Chemins de redirection par rôle
export const REDIRECT_PATHS = {
  [USER_ROLES.ADMIN]: '/admin/dashboard',
  [USER_ROLES.ETUDIANT]: '/etudiant/dashboard',
  [USER_ROLES.PILOTE]: '/pilote/dashboard',
  [USER_ROLES.ENTREPRISE]: '/entreprise/dashboard'
}; 