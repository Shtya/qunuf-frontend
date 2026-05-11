import { Role } from '@/types/global';
import { decodeJwt, JWTPayload } from 'jose';
import { cookies } from 'next/headers';

function isLikelyJwt(token: string) {
  return typeof token === 'string' && token.split('.').length === 3;
}

export async function getJwtPayload(token?: string): Promise<JWTPayload | null> {
  try {
    if (!token || typeof token !== 'string') {
      console.error('JWT missing or not a string:', token);
      return null;
    }

    const cleanToken = token.startsWith('Bearer ')
      ? token.slice(7)
      : token;

    if (!isLikelyJwt(cleanToken)) {
      console.error('Invalid JWT format:', cleanToken);
      return null;
    }

    return decodeJwt(cleanToken);
  } catch (err) {
    console.error('JWT decode failed:', err);
    return null;
  }
}

export async function getUserRole(): Promise<Role | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return null;

  const payload = await getJwtPayload(token);
  return (payload?.role as Role) ?? null;
}