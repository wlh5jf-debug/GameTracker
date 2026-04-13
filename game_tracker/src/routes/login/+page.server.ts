import { auth } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async (event) => {
        const formData = await event.request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return fail(400, { message: 'Email and password are required' });
        }

        const response = await auth.api.signInEmail({
            body: { email, password },
            headers: event.request.headers,
            asResponse: true
        });

        if (!response.ok) {
            return fail(400, { message: 'Invalid email or password' });
        }

    
        const setCookieHeader = response.headers.getSetCookie();
        for (const cookie of setCookieHeader) {
            const [nameValue, ...attributes] = cookie.split(';').map(s => s.trim());
            const [name, value] = nameValue.split('=');

            const attrs: Record<string, string | boolean | number> = {};
            for (const attr of attributes) {
                const [k, v] = attr.split('=').map(s => s.trim());
                const key = k.toLowerCase();
                if (key === 'max-age') attrs.maxAge = parseInt(v);
                else if (key === 'path') attrs.path = v;
                else if (key === 'samesite') attrs.sameSite = v as 'lax' | 'strict' | 'none';
                else if (key === 'httponly') attrs.httpOnly = true;
                else if (key === 'secure') attrs.secure = true;
            }

            event.cookies.set(name, decodeURIComponent(value), {
                path: (attrs.path as string) ?? '/',
                maxAge: attrs.maxAge as number | undefined,
                sameSite: (attrs.sameSite as 'lax' | 'strict' | 'none') ?? 'lax',
                httpOnly: (attrs.httpOnly as boolean) ?? true,
                secure: (attrs.secure as boolean) ?? false
            });
        }

        redirect(303, '/dashboard');
    }
};