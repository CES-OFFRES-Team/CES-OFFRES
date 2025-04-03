import { NextResponse } from 'next/server';

export function middleware(request) {
    // Laisser passer toutes les requêtes
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}; 