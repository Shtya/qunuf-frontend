import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { getJwtPayload } from './utils/auth';
import { Role } from './types/global';

// -----------------------------
// 1) Initialize next-intl middleware
// -----------------------------
const intlMiddleware = createMiddleware({
    locales: routing.locales,
    localeCookie: {
        name: 'USER_LOCALE',
        maxAge: Number(process.env.LOCALE_COOKIE_MAX_AGE) || 60 * 60 * 24 * 365,
    },
    defaultLocale: routing.defaultLocale,
    localePrefix: 'always',
});

// -----------------------------
// 2) Route definitions
// -----------------------------
interface Route {
    path: string;
    strict?: boolean;
    regex?: RegExp;
    notFor?: Role;
    replace?: string;
}

const PUBLIC_ROUTES: Route[] = [
    { path: '/auth' },
    { path: '/about', strict: true },
    { path: '/blogs', strict: false },
    { path: '/contact', strict: true },
    { path: '/properties', strict: false },
    { path: '/terms', strict: true },
    { path: '/privacy', strict: true },
    { path: '/', strict: true },
];

// Role-specific routes
const TENANT_ROUTES: string[] = [];
const LANDLORD_ROUTES: string[] = [];
const ADMIN_ROUTES: string[] = ['/website-settings'];

// -----------------------------
// 3) Middleware function
// -----------------------------
export async function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const { pathname } = request.nextUrl;

    // ✅ BASE_URL ثابت بدون port
    const BASE_URL = process.env.BASE_URL_FRONT || `${request.nextUrl.protocol}//${request.nextUrl.hostname}`;

    // Detect locale from URL
    const locale =
        routing.locales.find((l) => pathname.startsWith(`/${l}`)) ??
        routing.defaultLocale;

    // Remove locale prefix to compare route
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    const payload = await getJwtPayload(token);
    const role: Role = payload?.role as Role;

    // -----------------------------
    // 1) PUBLIC ROUTES → always allowed
    // -----------------------------
    const publicRoute = getPublicRouteMatch(pathWithoutLocale, role);

    if (publicRoute) {
        // Check if the user is restricted from this specific public route
        if (publicRoute.restricted) {
            const redirectPath = publicRoute.replace || '/';

            // ✅ استخدام BASE_URL بدل request.nextUrl.clone()
            const url = new URL(`/${locale}${redirectPath}`, BASE_URL);
            return NextResponse.redirect(url);
        }

        // Otherwise, allow access
        return intlMiddleware(request);
    }

    // -----------------------------
    // 2) Must be authenticated
    // -----------------------------
    if (!token) {
        return NextResponse.redirect(new URL(`/${locale}/auth/sign-in`, BASE_URL));
    }

    // -----------------------------
    // 3) Decode JWT and extract role
    // -----------------------------
    if (!payload) {
        return NextResponse.redirect(new URL(`/${locale}/auth/sign-in`, BASE_URL));
    }

    // -----------------------------
    // 4) Role-specific protection
    // -----------------------------
    if (TENANT_ROUTES.some((r) => pathWithoutLocale.startsWith(r))) {
        if (role !== 'tenant') {
            return NextResponse.redirect(new URL(`/${locale}/auth/sign-in`, BASE_URL));
        }
    }

    if (LANDLORD_ROUTES.some((r) => pathWithoutLocale.startsWith(r))) {
        if (role !== 'landlord') {
            return NextResponse.redirect(new URL(`/${locale}/auth/sign-in`, BASE_URL));
        }
    }

    if (ADMIN_ROUTES.some((r) => pathWithoutLocale.startsWith(r))) {
        if (role !== 'admin') {
            return NextResponse.redirect(new URL(`/${locale}/auth/sign-in`, BASE_URL));
        }
    }

    // -----------------------------
    // Everything OK → run next-intl
    // -----------------------------
    return intlMiddleware(request);
}

// -----------------------------
// 5) Required matcher for intl + auth
// -----------------------------
export const config = {
    matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};

// -----------------------------
// Helper functions
// -----------------------------
function createPathRegex(pattern: string, exact = true): RegExp {
    let regexStr = pattern.replace(/([.+*?=^!${}()[\]|\\])/g, "\\$1");
    regexStr = regexStr.replace(/:([A-Za-z0-9_]+)/g, '([^/]+)');

    if (exact) {
        regexStr = `^${regexStr}$`;
    } else {
        regexStr = `^${regexStr}(?:/.*)?$`;
    }

    return new RegExp(regexStr);
}

function getPublicRouteMatch(path, userRole) {
    const match = PUBLIC_ROUTES.find(route => {
        if (route.regex) {
            return createPathRegex(route.path, route?.strict).test(path);
        }
        if (route.strict) {
            return path === route.path;
        }
        return path.startsWith(route.path);
    });

    if (!match) return null;

    if (match.notFor && match.notFor === userRole) {
        return { ...match, restricted: true };
    }

    return { ...match, restricted: false };
}