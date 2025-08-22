export interface AuthCredentials {
  username: string;
  password: string;
}

export const VALID_CREDENTIALS: AuthCredentials = {
  username: 'superkid',
  password: 'buildSG'
};

export function validateCredentials(credentials: AuthCredentials): boolean {
  return (
    credentials.username === VALID_CREDENTIALS.username &&
    credentials.password === VALID_CREDENTIALS.password
  );
}

export function setAuthSession(authenticated: boolean): void {
  if (typeof window !== 'undefined') {
    if (authenticated) {
      localStorage.setItem('dreamBigAuth', 'authenticated');
      localStorage.setItem('dreamBigLoginTime', Date.now().toString());
    } else {
      localStorage.removeItem('dreamBigAuth');
      localStorage.removeItem('dreamBigLoginTime');
    }
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dreamBigAuth') === 'authenticated';
  }
  return false;
}

export function isFirstLogin(): boolean {
  if (typeof window !== 'undefined') {
    return !localStorage.getItem('dreamBigLoginTime');
  }
  return true; // Changed to true for SSR consistency - first time users should see first login experience
}