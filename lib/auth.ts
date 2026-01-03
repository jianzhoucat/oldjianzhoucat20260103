export type AuthUser = {
  id: string;
  email: string;
  username: string;
};

type StoredUser = AuthUser & {
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
};

export type AuthSession = {
  user: AuthUser;
  createdAt: string;
};

const USERS_STORAGE_KEY = 'my_next_app_users_v1';
const SESSION_STORAGE_KEY = 'my_next_app_session_v1';

function assertBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('This auth helper must be called in the browser.');
  }
}

function getCryptoOrNull() {
  assertBrowser();
  return window.crypto ?? null;
}

function encodeUtf8(input: string) {
  return new TextEncoder().encode(input);
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function sha256HexPure(bytes: Uint8Array) {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  const ch = (x: number, y: number, z: number) => (x & y) ^ (~x & z);
  const maj = (x: number, y: number, z: number) => (x & y) ^ (x & z) ^ (y & z);
  const bigSigma0 = (x: number) => rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
  const bigSigma1 = (x: number) => rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
  const smallSigma0 = (x: number) => rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
  const smallSigma1 = (x: number) => rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);

  const bitLenHi = Math.floor((bytes.length * 8) / 0x100000000);
  const bitLenLo = (bytes.length * 8) >>> 0;

  const withOne = new Uint8Array(bytes.length + 1);
  withOne.set(bytes, 0);
  withOne[bytes.length] = 0x80;

  const padLen = (64 - ((withOne.length + 8) % 64)) % 64;
  const padded = new Uint8Array(withOne.length + padLen + 8);
  padded.set(withOne, 0);

  const end = padded.length;
  padded[end - 8] = (bitLenHi >>> 24) & 0xff;
  padded[end - 7] = (bitLenHi >>> 16) & 0xff;
  padded[end - 6] = (bitLenHi >>> 8) & 0xff;
  padded[end - 5] = bitLenHi & 0xff;
  padded[end - 4] = (bitLenLo >>> 24) & 0xff;
  padded[end - 3] = (bitLenLo >>> 16) & 0xff;
  padded[end - 2] = (bitLenLo >>> 8) & 0xff;
  padded[end - 1] = bitLenLo & 0xff;

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let i = 0; i < padded.length; i += 64) {
    for (let t = 0; t < 16; t += 1) {
      const j = i + t * 4;
      w[t] = ((padded[j] << 24) | (padded[j + 1] << 16) | (padded[j + 2] << 8) | padded[j + 3]) >>> 0;
    }
    for (let t = 16; t < 64; t += 1) {
      w[t] = (smallSigma1(w[t - 2]) + w[t - 7] + smallSigma0(w[t - 15]) + w[t - 16]) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let t = 0; t < 64; t += 1) {
      const t1 = (h + bigSigma1(e) + ch(e, f, g) + K[t] + w[t]) >>> 0;
      const t2 = (bigSigma0(a) + maj(a, b, c)) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const hs = [h0, h1, h2, h3, h4, h5, h6, h7];
  for (let i = 0; i < hs.length; i += 1) {
    const x = hs[i];
    out[i * 4] = (x >>> 24) & 0xff;
    out[i * 4 + 1] = (x >>> 16) & 0xff;
    out[i * 4 + 2] = (x >>> 8) & 0xff;
    out[i * 4 + 3] = x & 0xff;
  }
  return toHex(out);
}

function randomHex(bytesLength: number) {
  const crypto = getCryptoOrNull();
  if (crypto?.getRandomValues) {
    const bytes = new Uint8Array(bytesLength);
    crypto.getRandomValues(bytes);
    return toHex(bytes);
  }
  let out = '';
  for (let i = 0; i < bytesLength; i += 1) {
    out += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0');
  }
  return out;
}

async function sha256Hex(input: string) {
  const crypto = getCryptoOrNull();
  if (crypto?.subtle?.digest) {
    const digest = await crypto.subtle.digest('SHA-256', encodeUtf8(input));
    return toHex(new Uint8Array(digest));
  }
  return sha256HexPure(encodeUtf8(input));
}

async function hashPassword(password: string, salt: string) {
  return sha256Hex(`${salt}:${password}`);
}

function readUsers(): StoredUser[] {
  assertBrowser();
  const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  assertBrowser();
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function ensureDefaultAccount() {
  const email = normalizeEmail('admin@163.com');
  const users = readUsers();
  if (users.some((u) => normalizeEmail(u.email) === email)) return;

  const passwordSalt = randomHex(16);
  const passwordHash = await hashPassword('admin123', passwordSalt);

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: `u_${randomHex(8)}`,
    email,
    username: 'admin',
    passwordHash,
    passwordSalt,
    createdAt: now,
  };
  writeUsers([user, ...users]);
}

export async function registerUser(input: {
  email: string;
  username: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);
  const username = input.username.trim() || email.split('@')[0] || 'user';

  const users = readUsers();
  if (users.some((u) => normalizeEmail(u.email) === email)) {
    throw new Error('该邮箱已注册');
  }

  const passwordSalt = randomHex(16);
  const passwordHash = await hashPassword(input.password, passwordSalt);

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: `u_${randomHex(8)}`,
    email,
    username,
    passwordHash,
    passwordSalt,
    createdAt: now,
  };
  writeUsers([user, ...users]);

  return { id: user.id, email: user.email, username: user.username } satisfies AuthUser;
}

export async function loginWithPassword(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const users = readUsers();
  const user = users.find((u) => normalizeEmail(u.email) === email);
  if (!user) {
    throw new Error('账号或密码不正确');
  }

  const expectedHash = await hashPassword(input.password, user.passwordSalt);
  if (expectedHash !== user.passwordHash) {
    throw new Error('账号或密码不正确');
  }

  const session: AuthSession = {
    user: { id: user.id, email: user.email, username: user.username },
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
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
