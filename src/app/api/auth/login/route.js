import { NextResponse } from 'next/server';

const isProd = process.env.NODE_ENV === 'production';
const TWO_DAYS = 60 * 60 * 24 * 2;

export async function POST(req) {
    try {
        const { accessToken, refreshToken, user } = await req.json();

        if (!accessToken || !user) {
            return NextResponse.json({ message: 'Missing token or user' }, { status: 400 });
        }

        const res = NextResponse.json({ ok: true, user });

        res.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            path: '/',
            maxAge: TWO_DAYS,
        });

        if (refreshToken) {
            res.cookies.set('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isProd,
                sameSite: 'strict',
                path: '/',
                maxAge: TWO_DAYS,
            });
        }

        return res;
    } catch (err) {
        return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
    }
}

