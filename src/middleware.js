import { NextResponse } from 'next/server';
import { COOKIE_KEYS, USER_ROLES } from './app/utils/constants';

// Chemins publics qui ne nécessitent pas d'authentification
const publicPaths = [
  '/Login', 
  '/Contact', 
  '/',
  '/mentions-legales',
  '/politique-confidentialite',
  '/Contact',
  '/About',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si le chemin est public
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Récupérer le token d'authentification
  const token = request.cookies.get(COOKIE_KEYS.AUTH_TOKEN);
  const userData = request.cookies.get(COOKIE_KEYS.USER_DATA);
  const userRole = request.cookies.get(COOKIE_KEYS.USER_ROLE);

  // Si pas de token, rediriger vers la page de connexion
  if (!token) {
    console.log('Middleware: Pas de token, redirection vers /Login');
    return NextResponse.redirect(new URL('/Login', request.url));
  }

  // Vérifier les accès selon le rôle
  if (pathname.startsWith('/admin') && userRole?.value !== USER_ROLES.ADMIN) {
    console.log('Middleware: Accès admin refusé, redirection vers /Login');
    return NextResponse.redirect(new URL('/Login', request.url));
  }

  if (pathname.startsWith('/etudiant') && userRole?.value !== USER_ROLES.ETUDIANT) {
    console.log('Middleware: Accès étudiant refusé, redirection vers /Login');
    return NextResponse.redirect(new URL('/Login', request.url));
  }

  if (pathname.startsWith('/pilote') && userRole?.value !== USER_ROLES.PILOTE) {
    console.log('Middleware: Accès pilote refusé, redirection vers /Login');
    return NextResponse.redirect(new URL('/Login', request.url));
  }

  if (pathname.startsWith('/entreprise') && userRole?.value !== USER_ROLES.ENTREPRISE) {
    console.log('Middleware: Accès entreprise refusé, redirection vers /Login');
    return NextResponse.redirect(new URL('/Login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 