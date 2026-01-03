export type AuthUser = {
  id: string;
  email: string;
  username: string;
};

export type AuthSession = {
  user: AuthUser;
  createdAt: string;
};

const SESSION_STORAGE_KEY = 'my_next_app_session_v1';

function assertBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('This auth helper must be called in the browser.');
  }
}

function setSession(user: AuthUser) {
  assertBrowser();
  const session: AuthSession = { user, createdAt: new Date().toISOString() };
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

async function readErrorMessage(res: Response) {
  try {
    const data = (await res.json()) as { message?: string };
    return data?.message;
  } catch {
    return undefined;
  }
}

export async function registerUser(input: { email: string; username: string; password: string }) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const message = await readErrorMessage(res);
    throw new Error(message || '注册失败，请稍后重试');
  }

  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

export async function loginWithPassword(input: { email: string; password: string }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const message = await readErrorMessage(res);
    throw new Error(message || '登录失败，请稍后重试');
  }

  const data = (await res.json()) as { user: AuthUser };
  setSession(data.user);
  return data.user;
}

export function getSession(): AuthSession | null {
  assertBrowser();
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.user?.id || !parsed?.user?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function logout() {
  assertBrowser();
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
