
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    return res;
  } catch {
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
