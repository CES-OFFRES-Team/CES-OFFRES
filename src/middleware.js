import { NextResponse } from 'next/server';

export function middleware(request) {
  // Récupérer les cookies
  const authToken = request.cookies.get('authToken');
  
  // Chemins publics qui ne nécessitent pas d'authentification
  const publicPaths = ['/', '/Login', '/Contact', '/Register'];
  
  // Vérifier si l'utilisateur est sur un chemin public
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  
  // Vérification basique du token
  if (!authToken || !authToken.value || authToken.value.trim() === '') {
    return NextResponse.redirect(new URL('/Login', request.url));
  }
  
  // Pour toutes les autres routes, permettre l'accès
  return NextResponse.next();
}

// Configuration des routes à traiter par le middleware
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}; 