/**
 * Authentication Service
 * Handles user registration, login, and role-based access control.
 * 
 * NOW USES BACKEND API for all authentication operations.
 * Users are stored in SQLite database via FastAPI backend.
 */

const API_BASE = ''; // Use relative path for proxying
const SESSION_KEY = 'ecosort_session';

/**
 * Register a new user via backend API
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function register(username, password) {
    // Validation
    if (!username || username.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters' };
    }
    if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username.toLowerCase(),
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.detail || 'Registration failed' };
        }

        return { success: true };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Network error. Is the backend running?' };
    }
}

/**
 * Login a user via backend API
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
/**
 * Helper to save session
 */
export function createSession(data) {
    const session = {
        username: data.user.email,
        name: data.user.name || data.user.email,
        role: data.user.role,
        token: data.token,
        loginAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}

/**
 * Login a user via backend API
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function login(username, password) {
    if (!username || !password) {
        return { success: false, error: 'Username and password required' };
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username.toLowerCase(),
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.detail || 'Invalid credentials' };
        }

        // Create session from backend response
        createSession(data);

        return {
            success: true,
            user: {
                username: data.user.email,
                name: data.user.name || data.user.email,
                role: data.user.role
            }
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error. Is the backend running?' };
    }
}

/**
 * Logout current user
 */
export function logout() {
    localStorage.removeItem(SESSION_KEY);
}

/**
 * Get current session
 * @returns {Object|null} - Current user session or null
 */
export function getSession() {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Check if user has a specific role
 * @param {string} role 
 * @returns {boolean}
 */
export function hasRole(role) {
    const session = getSession();
    return session?.role === role;
}

/**
 * Check if user is admin
 * @returns {boolean}
 */
export function isAdmin() {
    return hasRole('admin');
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
    return getSession() !== null;
}

/**
 * Get auth token for API requests
 * @returns {string|null}
 */
export function getToken() {
    const session = getSession();
    return session?.token || null;
}
