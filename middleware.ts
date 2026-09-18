import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    if (path.includes('.')) {
    return NextResponse.next();
  }

    const isPublicPath = path === '/login' || path === '/register';

    const token = request.cookies.get('token')?.value || '';

    if(isPublicPath && token){
        return NextResponse.redirect(new URL('/', request.nextUrl));
    }

    if(!isPublicPath && !token){
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }
}

export const config = {
    mathcer : [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};