import { cookies } from 'next/headers';
import { verifyToken, AuthUser } from './jwt';

export async function getAuthUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    return verifyToken(token);
}
