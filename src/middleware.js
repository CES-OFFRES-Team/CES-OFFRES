import { NextResponse } from 'next/server';

export function middleware(request) {
  // Récupérer les cookies
  const authToken = request.cookies.get('authToken');
  const userRole = request.cookies.get('userRole');
  
  // Chemins publics qui ne nécessitent pas d'authentification
  const publicPaths = ['/', '/Login', '/Contact', '/Register'];
  
  // Vérifier si l'utilisateur est sur un chemin public
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  
  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!authToken) {
    return NextResponse.redirect(new URL('/Login', request.url));
  }
  
  // Récupérer le rôle de l'utilisateur
  const role = userRole?.value;
  
  // Si aucun rôle n'est trouvé, rediriger vers la connexion
  if (!role) {
    console.error('Rôle non trouvé, redirection vers login');
    return NextResponse.redirect(new URL('/Login', request.url));
  }
  
  // Vérifier les accès selon le rôle
  const path = request.nextUrl.pathname;
  
  // Routes admin - accessibles uniquement aux administrateurs
  if (path.startsWith('/admin')) {
    if (role !== 'Admin') {
      return redirectToRoleDashboard(role, request.url);
    }
    return NextResponse.next();
  }
  
  // Routes étudiant - accessibles aux étudiants et administrateurs
  if (path.startsWith('/etudiant')) {
    if (role !== 'Etudiant' && role !== 'Admin') {
      return redirectToRoleDashboard(role, request.url);
    }
    return NextResponse.next();
  }
  
  // Routes pilote - accessibles aux pilotes et administrateurs
  if (path.startsWith('/pilote')) {
    if (role !== 'Pilote' && role !== 'Admin') {
      return redirectToRoleDashboard(role, request.url);
    }
    return NextResponse.next();
  }
  
  // Routes entreprise - accessibles aux entreprises et administrateurs
  if (path.startsWith('/entreprise')) {
    if (role !== 'Entreprise' && role !== 'Admin') {
      return redirectToRoleDashboard(role, request.url);
    }
    return NextResponse.next();
  }
  
  // Ancienne route dashboard - rediriger vers le nouveau dashboard étudiant
  if (path === '/dashboard' || path.startsWith('/dashboard/')) {
    return NextResponse.redirect(new URL('/etudiant/dashboard', request.url));
  }
  
  // Pour toutes les autres routes, permettre l'accès
  return NextResponse.next();
}

// Fonction pour rediriger l'utilisateur vers son dashboard en fonction du rôle
function redirectToRoleDashboard(role, baseUrl) {
  switch (role) {
    case 'Admin':
      return NextResponse.redirect(new URL('/admin', baseUrl));
    case 'Pilote':
      return NextResponse.redirect(new URL('/pilote/dashboard', baseUrl));
    case 'Etudiant':
      return NextResponse.redirect(new URL('/etudiant/dashboard', baseUrl));
    case 'Entreprise':
      return NextResponse.redirect(new URL('/entreprise/dashboard', baseUrl));
    default:
      return NextResponse.redirect(new URL('/Login', baseUrl));
  }
}

// Configuration des routes à traiter par le middleware
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}; 