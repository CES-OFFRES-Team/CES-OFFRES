import { NextResponse } from 'next/server';

export function middleware(request) {
  // Récupérer le token et les données utilisateur depuis les cookies
  const userData = request.cookies.get('userData');
  const authToken = request.cookies.get('authToken');

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!authToken) {
    return NextResponse.redirect(new URL('/Login', request.url));
  }

  // Si les données utilisateur sont disponibles, les parser
  let user = null;
  if (userData) {
    try {
      user = JSON.parse(userData.value);
    } catch (e) {
      console.error('Erreur lors du parsing des données utilisateur:', e);
      return NextResponse.redirect(new URL('/Login', request.url));
    }
  }

  // Vérifier les routes protégées
  const path = request.nextUrl.pathname;

  // Protection des routes admin
  if (path.startsWith('/admin')) {
    if (!user || user.role !== 'Admin') {
      return NextResponse.redirect(new URL('/Login', request.url));
    }
    return NextResponse.next();
  }

  // Protection des routes pilote
  if (path.startsWith('/pilote')) {
    if (!user || user.role !== 'Pilote') {
      return NextResponse.redirect(new URL('/Login', request.url));
    }
    return NextResponse.next();
  }

  // Protection des routes dashboard (pour les étudiants)
  if (path === '/dashboard') {
    if (!user || user.role !== 'Etudiant') {
      return NextResponse.redirect(new URL('/Login', request.url));
    }
    return NextResponse.next();
  }

  // Pour toutes les autres routes protégées
  if (path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/Login', request.url));
  }

  return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    '/admin/:path*',
    '/pilote/:path*',
    '/dashboard/:path*',
    '/dashboard'
  ]
}; 