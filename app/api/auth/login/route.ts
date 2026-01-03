import { NextResponse } from 'next/server';
import { getDb, get, run } from '@/lib/server/sqlite';
import { hashPassword, verifyPassword } from '@/lib/server/password';

export const runtime = 'nodejs';

type LoginBody = {
  email?: string;
  password?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function ensureAdminUser() {
  const { db, dbPath } = await getDb();
  const email = normalizeEmail('admin@163.com');
  const existing = await get<{ id: number }>(db, 'SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return;
  const { salt, hash } = hashPassword('admin123');
  await run(
    db,
    dbPath,
    'INSERT INTO users (email, username, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?)',
    [email, 'admin', hash, salt, new Date().toISOString()]
  );
}

export async function POST(req: Request) {
  try {
    await ensureAdminUser();

    const body = (await req.json()) as LoginBody;
    const email = body.email ? normalizeEmail(body.email) : '';
    const password = body.password ?? '';

    if (!email || !password) {
      return NextResponse.json({ message: '邮箱和密码不能为空' }, { status: 400 });
    }

    const { db } = await getDb();
    const row = await get<{
      id: number;
      email: string;
      username: string;
      password_hash: string;
      password_salt: string;
    }>(db, 'SELECT id, email, username, password_hash, password_salt FROM users WHERE email = ?', [email]);

    if (!row) {
      return NextResponse.json({ message: '账号或密码不正确' }, { status: 401 });
    }

    const ok = verifyPassword(password, { salt: row.password_salt, hash: row.password_hash });
    if (!ok) {
      return NextResponse.json({ message: '账号或密码不正确' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: String(row.id),
        email: row.email,
        username: row.username,
      },
    });
  } catch {
    return NextResponse.json({ message: '登录失败，请稍后重试' }, { status: 500 });
  }
}
