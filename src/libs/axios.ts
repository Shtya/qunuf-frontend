import axios, { AxiosHeaders } from 'axios';

export const baseImg = process.env.NEXT_PUBLIC_BASE_IMAGE || 'http://localhost:8081/';
export const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1`;

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
});


export const refreshClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
});

// attach access token if present
api.interceptors.request.use(config => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');

        if (token) {
            config.headers = config.headers || new AxiosHeaders();
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});


export default api;