import { useAuth } from "@/contexts/AuthContext"
import api, { BASE_URL, refreshClient } from "@/libs/axios";
import { useEffect, useRef } from "react";

// mark routes that should never trigger refresh
const AUTH_BLOCKLIST = ['/auth/login', '/auth/register', '/auth/verify-email', '/auth/resend-verification-email', '/auth/forgot-password', '/auth/reset-password', '/auth/refresh'];

export const useAuthInterceptor = function () {
    const { logout, updateTokens } = useAuth();
    // Stable ref so concurrent 401s share one refresh call across re-renders
    const refreshPromiseRef = useRef(null);

    function isAuthBlocked(url) {
        if (!url) return false;
        try {
            // url may already be absolute or relative – normalize the path part only
            const u = new URL(url, BASE_URL);
            const path = u.pathname.replace(/\/+$/, ''); // strip trailing slash
            return AUTH_BLOCKLIST.some(b => path.endsWith(b));
        } catch {
            return false;
        }
    }

    useEffect(() => {
        api.interceptors.response.use(
            res => res,
            async error => {
                const response = error.response;
                const original = error.config;

                // If no response (network error / CORS), just bubble up
                if (!response || !original) return Promise.reject(error);

                // do NOT refresh for blocked endpoints
                if (isAuthBlocked(original.url)) {
                    return Promise.reject(error);
                }

                // only handle 401 with a single retry
                if (response.status === 401 && !original._retry) {
                    original._retry = true;

                    // require a refresh token to attempt refresh
                    const storedRt = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
                    if (!storedRt) {
                        // no RT → hard logout once
                        if (typeof window !== 'undefined') {
                            logout();

                            // optional: router.push('/auth?tab=login')
                        }
                        return Promise.reject(error);
                    }

                    try {
                        // share one refresh call across concurrent 401s
                        if (!refreshPromiseRef.current) {
                            refreshPromiseRef.current = refreshClient
                                .post('/auth/refresh', { refreshToken: storedRt })
                                .then(r => r.data)
                                .finally(() => {
                                    refreshPromiseRef.current = null;
                                });
                        }

                        const { data } = await refreshPromiseRef.current;
                        const { accessToken, refreshToken } = data;
                        if (typeof window !== 'undefined') {
                            updateTokens({ accessToken, refreshToken })
                        }

                        // retry original with the fresh access token
                        original.headers = original.headers ?? {};
                        original.headers.Authorization = `Bearer ${accessToken}`;
                        return api(original);
                    } catch (e) {
                        // refresh failed → hard logout and stop retrying
                        if (typeof window !== 'undefined') {
                            logout();
                            window.location.href = '/';
                            // optional:  router.push('/auth?tab=login')
                        }
                        return Promise.reject(e);
                    }
                }

                // For any other error/status, just bubble up
                return Promise.reject(error);
            },
        );
    }, []);
}