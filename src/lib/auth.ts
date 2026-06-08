const ACCESS_TOKEN_KEY = 'accessToken';
const REMEMBER_EMAIL_KEY = 'rememberEmail';
const AUTH_USER_EMAIL_KEY = 'authUserEmail';
const AUTH_USER_ID_KEY = 'authUserId';
const AUTH_USERNAME_KEY = 'authUsername';
const AUTH_USER_BIO_KEY = 'authUserBio';
const AUTH_USER_ROLE_KEY = 'authUserRole';
const AUTH_USER_AVATAR_KEY = 'authUserAvatar';
const AUTH_SESSION_EVENT = 'auth-session-changed';

export type AuthSessionSnapshot = {
    authenticated: boolean;
    userId: number | null;
    email: string | null;
    username: string | null;
    role: string | null;
    avatarUrl: string | null;
};

export const emptyAuthSessionSnapshot: AuthSessionSnapshot = {
    authenticated: false,
    userId: null,
    email: null,
    username: null,
    role: null,
    avatarUrl: null,
};

let cachedAuthSessionSnapshot: AuthSessionSnapshot = emptyAuthSessionSnapshot;

function readAuthSessionSnapshot(): AuthSessionSnapshot {
    const token = getAccessToken();
    if (token && isAccessTokenExpired(token)) {
        clearAuthSession();
        return emptyAuthSessionSnapshot;
    }

    return {
        authenticated: Boolean(token),
        userId: getAuthUserId(),
        email: getAuthUserEmail(),
        username: getAuthUsername(),
        role: getAuthUserRole(),
        avatarUrl: getAuthUserAvatar(),
    };
}

function authSessionSnapshotsEqual(a: AuthSessionSnapshot, b: AuthSessionSnapshot) {
    return (
        a.authenticated === b.authenticated &&
        a.userId === b.userId &&
        a.email === b.email &&
        a.username === b.username &&
        a.role === b.role &&
        a.avatarUrl === b.avatarUrl
    );
}

/** Snapshot estable para useSyncExternalStore (misma referencia si los datos no cambiaron). */
export function getAuthSessionSnapshot(): AuthSessionSnapshot {
    const next = readAuthSessionSnapshot();
    if (authSessionSnapshotsEqual(cachedAuthSessionSnapshot, next)) {
        return cachedAuthSessionSnapshot;
    }
    cachedAuthSessionSnapshot = next;
    return cachedAuthSessionSnapshot;
}

export function getAuthSessionServerSnapshot(): AuthSessionSnapshot {
    return emptyAuthSessionSnapshot;
}

function notifyAuthSessionChanged() {
    if (typeof window !== 'undefined') {
        getAuthSessionSnapshot();
        window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
    }
}

export function subscribeAuthSession(onStoreChange: () => void) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const handler = () => onStoreChange();
    window.addEventListener(AUTH_SESSION_EVENT, handler);
    window.addEventListener('storage', handler);

    return () => {
        window.removeEventListener(AUTH_SESSION_EVENT, handler);
        window.removeEventListener('storage', handler);
    };
}

export function setAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    notifyAuthSessionChanged();
}

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    notifyAuthSessionChanged();
}

export function setAuthUserEmail(email: string) {
    localStorage.setItem(AUTH_USER_EMAIL_KEY, email);
    notifyAuthSessionChanged();
}

export function getAuthUserEmail() {
    return localStorage.getItem(AUTH_USER_EMAIL_KEY);
}

export function clearAuthUserEmail() {
    localStorage.removeItem(AUTH_USER_EMAIL_KEY);
    notifyAuthSessionChanged();
}

export function setAuthUserId(id: number) {
    localStorage.setItem(AUTH_USER_ID_KEY, String(id));
    notifyAuthSessionChanged();
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
    notifyAuthSessionChanged();
}

export function setAuthUsername(username: string) {
    localStorage.setItem(AUTH_USERNAME_KEY, username);
    notifyAuthSessionChanged();
}

export function getAuthUsername() {
    return localStorage.getItem(AUTH_USERNAME_KEY);
}

export function clearAuthUsername() {
    localStorage.removeItem(AUTH_USERNAME_KEY);
    notifyAuthSessionChanged();
}

export function setAuthUserBio(bio: string) {
    localStorage.setItem(AUTH_USER_BIO_KEY, bio);
    notifyAuthSessionChanged();
}

export function getAuthUserBio() {
    return localStorage.getItem(AUTH_USER_BIO_KEY);
}

export function clearAuthUserBio() {
    localStorage.removeItem(AUTH_USER_BIO_KEY);
    notifyAuthSessionChanged();
}

export function setAuthUserRole(role: string) {
    localStorage.setItem(AUTH_USER_ROLE_KEY, role);
    notifyAuthSessionChanged();
}

export function getAuthUserRole() {
    return localStorage.getItem(AUTH_USER_ROLE_KEY);
}

export function clearAuthUserRole() {
    localStorage.removeItem(AUTH_USER_ROLE_KEY);
    notifyAuthSessionChanged();
}

export function setAuthUserAvatar(avatarUrl: string) {
    localStorage.setItem(AUTH_USER_AVATAR_KEY, avatarUrl);
    notifyAuthSessionChanged();
}

export function getAuthUserAvatar() {
    return localStorage.getItem(AUTH_USER_AVATAR_KEY);
}

export function clearAuthUserAvatar() {
    localStorage.removeItem(AUTH_USER_AVATAR_KEY);
    notifyAuthSessionChanged();
}

export function clearAuthSession() {
    clearAccessToken();
    clearAuthUserEmail();
    clearAuthUserId();
    clearAuthUsername();
    clearAuthUserBio();
    clearAuthUserRole();
    clearAuthUserAvatar();
    notifyAuthSessionChanged();
}

export function isAuthenticated() {
    return typeof window !== 'undefined' && Boolean(getAccessToken());
}

type JwtPayload = {
    permissions?: string[];
    email?: string;
    sub?: number;
    exp?: number;
};

export function isAccessTokenExpired(token: string) {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) {
        return false;
    }
    return payload.exp * 1000 <= Date.now();
}

export function decodeJwtPayload(token: string): JwtPayload | null {
    try {
        const payloadSegment = token.split('.')[1];
        if (!payloadSegment) {
            return null;
        }
        const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(normalized);
        return JSON.parse(decoded) as JwtPayload;
    } catch {
        return null;
    }
}

export function inferRoleFromToken(token: string) {
    const payload = decodeJwtPayload(token);
    const permissions = payload?.permissions ?? [];

    if (permissions.includes('user:read') && permissions.includes('user:update')) {
        return 'admin';
    }
    if (permissions.includes('product:create')) {
        return 'seller';
    }
    if (permissions.includes('product:purchase')) {
        return 'buyer';
    }

    return 'guest';
}

export function formatDisplayName(email?: string | null) {
    if (!email) {
        return 'User';
    }

    const [localPart] = email.split('@');
    if (!localPart) {
        return 'User';
    }

    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

export function applyAuthUserFromLogin(user: {
    id?: number;
    email?: string;
    username?: string;
    avatarUrl?: string | null;
}) {
    if (user.email) {
        setAuthUserEmail(user.email);
    }
    if (user.username) {
        setAuthUsername(user.username);
    } else if (user.email) {
        setAuthUsername(user.email.split('@')[0] ?? 'user');
    }
    if (user.id) {
        setAuthUserId(user.id);
    }
    if (user.avatarUrl) {
        setAuthUserAvatar(user.avatarUrl);
    }
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
