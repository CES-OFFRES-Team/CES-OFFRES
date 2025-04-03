import { NextResponse } from 'next/server';

export function middleware(request) {
  // Récupérer le token et les données utilisateur depuis les cookies
  const userData = request.cookies.get('userData');
  const authToken = request.cookies.get('authToken');
  const userRole = request.cookies.get('userRole');

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!authToken) {
    // Ne pas rediriger si on est déjà sur la page de connexion ou la page d'accueil
    if (request.nextUrl.pathname === '/Login' || request.nextUrl.pathname === '/') {
      return NextResponse.next();
    }
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

  // Récupérer le rôle directement du cookie dédié
  const role = userRole ? userRole.value : (user ? user.role : null);

  if (!role) {
    console.error('Rôle non trouvé dans les cookies ou les données utilisateur');
    return NextResponse.redirect(new URL('/Login', request.url));
  }

  // Vérifier les routes protégées
  const path = request.nextUrl.pathname;

  // Protection des routes admin
  if (path.startsWith('/admin')) {
    if (role !== 'Admin') {
      console.log('Accès refusé: rôle non admin', role);
      // Rediriger vers la page appropriée en fonction du rôle
      if (role === 'Pilote') {
        return NextResponse.redirect(new URL('/pilote/dashboard', request.url));
      } else if (role === 'Etudiant') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else if (role === 'Entreprise') {
        return NextResponse.redirect(new URL('/entreprise/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/Login', request.url));
    }
    return NextResponse.next();
  }

  // Protection des routes pilote
  if (path.startsWith('/pilote')) {
    if (role !== 'Pilote' && role !== 'Admin') {
      console.log('Accès refusé: rôle non pilote ou admin', role);
      // Rediriger vers la page appropriée en fonction du rôle
      if (role === 'Etudiant') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else if (role === 'Entreprise') {
        return NextResponse.redirect(new URL('/entreprise/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/Login', request.url));
    }
    return NextResponse.next();
  }

  // Protection des routes dashboard (pour les étudiants)
  if (path === '/dashboard' || path.startsWith('/dashboard/')) {
    if (role !== 'Etudiant' && role !== 'Admin') {
      console.log('Accès refusé: rôle non étudiant ou admin', role);
      // Rediriger vers la page appropriée en fonction du rôle
      if (role === 'Pilote') {
        return NextResponse.redirect(new URL('/pilote/dashboard', request.url));
      } else if (role === 'Entreprise') {
        return NextResponse.redirect(new URL('/entreprise/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/Login', request.url));
    }
    return NextResponse.next();
  }
  
  // Protection des routes entreprise
  if (path.startsWith('/entreprise')) {
    if (role !== 'Entreprise' && role !== 'Admin') {
      console.log('Accès refusé: rôle non entreprise ou admin', role);
      // Rediriger vers la page appropriée en fonction du rôle
      if (role === 'Pilote') {
        return NextResponse.redirect(new URL('/pilote/dashboard', request.url));
      } else if (role === 'Etudiant') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/Login', request.url));
    }
    return NextResponse.next();
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