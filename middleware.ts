import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rewrite PWA shortcut launch paths like /launch/blitz to the home page
// The client-side handler in src/app/page.tsx reads the pathname to determine the mode
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith('/launch/')) {
    const url = request.nextUrl.clone();
    // Extract mode from /launch/<mode>
    const mode = pathname.replace('/launch/', '').split('/')[0];
    url.pathname = '/';
    // Preserve original search if any, but ensure mode is present
    const params = new URLSearchParams(search);
    if (mode && !params.has('mode')) {
      params.set('mode', mode);
    }
    url.search = params.toString() ? `?${params.toString()}` : '';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/launch/:path*'],
};
