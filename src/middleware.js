import { NextResponse } from 'next/server';

export function middleware(request) {
  // Récupérer les cookies
  const authToken = request.cookies.get('authToken');
  const userData = request.cookies.get('userData');
  const userRole = request.cookies.get('userRole');
  
  // Chemins publics qui ne nécessitent pas d'authentification
  const publicPaths = ['/', '/Login', '/Contact', '/Register'];
  
  // Vérifier si l'utilisateur est sur un chemin public
  if (publicPaths.includes(request.nextUrl.pathname)) {
    console.log('Middleware - Chemin public, accès autorisé');
    return NextResponse.next();
  }
  
  // Log pour le débogage
  console.log('Middleware - URL:', request.nextUrl.pathname);
  console.log('Middleware - Token:', authToken?.value);
  console.log('Middleware - UserData:', userData?.value);
  console.log('Middleware - UserRole:', userRole?.value);
  
  // Vérification basique du token
  if (!authToken || !authToken.value || authToken.value.trim() === '') {
    console.log('Middleware - Redirection vers login (pas de token)');
    return NextResponse.redirect(new URL('/Login', request.url));
  }
  
  // Pour toutes les autres routes, permettre l'accès
  console.log('Middleware - Accès autorisé');
  return NextResponse.next();
}

// Configuration des routes à traiter par le middleware
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}; 