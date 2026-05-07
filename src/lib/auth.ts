const ACCESS_TOKEN_KEY = 'accessToken';
const REMEMBER_EMAIL_KEY = 'rememberEmail';
const AUTH_USER_EMAIL_KEY = 'authUserEmail';
const AUTH_USER_ID_KEY = 'authUserId';

export function setAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function setAuthUserEmail(email: string) {
    localStorage.setItem(AUTH_USER_EMAIL_KEY, email);
}

export function getAuthUserEmail() {
    return localStorage.getItem(AUTH_USER_EMAIL_KEY);
}

export function clearAuthUserEmail() {
    localStorage.removeItem(AUTH_USER_EMAIL_KEY);
}

export function setAuthUserId(id: number) {
    localStorage.setItem(AUTH_USER_ID_KEY, String(id));
}

export function getAuthUserId() {
    const raw = localStorage.getItem(AUTH_USER_ID_KEY);
    if (!raw) {
        return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
}

export function clearAuthUserId() {
    localStorage.removeItem(AUTH_USER_ID_KEY);
}

export function formatDisplayName(email?: string | null) {
    if (!email) {
        return 'Usuario';
    }

    const [localPart] = email.split('@');
    if (!localPart) {
        return 'Usuario';
    }

    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

export function setRememberEmail(email: string) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email);
}

export function getRememberEmail() {
    return localStorage.getItem(REMEMBER_EMAIL_KEY);
}

export function clearRememberEmail() {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
}

export function getAuthHeaders() {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}
