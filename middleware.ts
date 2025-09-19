import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rewrite PWA shortcut launch paths like /launch/blitz to the home page
// The client-side handler in src/app/page.tsx reads the pathname to determine the mode
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith('/launch/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    // Preserve original search if any (generally none for /launch/*)
    url.search = search;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/launch/:path*'],
};
