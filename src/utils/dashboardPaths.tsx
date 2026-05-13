import { Role } from "@/types/global";

export type DashboardPathKey =
    | 'root'
    | 'contracts'
    | 'renewRequests'
    | 'paymentHistory'
    | 'properties'
    | 'revenue'
    | 'settings'
    | 'account'
    | 'notifications'
    | 'payments'
    | 'support'
    | 'chats'
    | 'revenueSummary'
    | 'addProperty'
    | 'contactUs'
    | 'teamMembers'
    | 'blogs'
    | 'aboutUs'
    | 'departments'
    | 'websiteSettings'
		| 'logout'
    | 'users'
    | 'calendar'
    | 'maintenance';

export const dashboardPaths: Record<DashboardPathKey, string> = {
    root: '',
    contracts: 'contracts',
    renewRequests: 'renew-requests',
    paymentHistory: 'payments-history',
    properties: 'properties',
    revenue: 'revenue',
    settings: 'settings',
    account: 'settings/account',
    notifications: 'settings/notifications',
    payments: 'settings/payments',
    support: 'support',
    chats: 'chats',
    revenueSummary: 'revenue-summary',
    addProperty: 'properties/add',
    contactUs: 'contact-us',
    teamMembers: 'team-members',
    blogs: 'blogs',
    aboutUs: 'about-us',
    departments: 'departments',
    websiteSettings: 'website-settings',
    users: 'users' ,
    logout: 'logout',
    calendar: 'calendar',
    maintenance: 'maintenance',
};


export function getDashboardHref(
    key: DashboardPathKey,
    query?: Record<string, string | number | boolean>
): string {

    const subPath = dashboardPaths[key];
    const basePath = `/dashboard${subPath ? "/" + subPath : ""}`;

    if (!query) return basePath;

    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
        searchParams.append(k, String(v));
    }

    return `${basePath}?${searchParams.toString()}`;
}


export function isPathActive(normalizedPath: string, key: DashboardPathKey): boolean {
    const basePath = getDashboardHref(key);
    return normalizedPath.startsWith(basePath);
}
