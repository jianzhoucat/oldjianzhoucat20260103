import { NextResponse } from 'next/server';
import { getDb, get, run } from '@/lib/server/sqlite';
import { hashPassword } from '@/lib/server/password';

export const runtime = 'nodejs';

type RegisterBody = {
  email?: string;
  username?: string;
  password?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function ensureAdminUser() {
  const { db, dbPath } = await getDb();
  const email = normalizeEmail('admin@163.com');
  const exists = await get<{ id: number }>(db, 'SELECT id FROM users WHERE email = ?', [email]);
  if (exists) return;
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

    const body = (await req.json()) as RegisterBody;
    const email = body.email ? normalizeEmail(body.email) : '';
    const username = (body.username ?? '').trim();
    const password = body.password ?? '';

    if (!email || !password) {
      return NextResponse.json({ message: '邮箱和密码不能为空' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: '密码至少需要6位' }, { status: 400 });
    }

    const { db, dbPath } = await getDb();
    const existing = await get<{ id: number }>(db, 'SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return NextResponse.json({ message: '该邮箱已注册' }, { status: 409 });
    }

    const { salt, hash } = hashPassword(password);
    const createdAt = new Date().toISOString();
    const result = await run(
      db,
      dbPath,
      'INSERT INTO users (email, username, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?)',
      [email, username || email.split('@')[0] || 'user', hash, salt, createdAt]
    );

    return NextResponse.json({
      user: {
        id: String(result.lastID),
        email,
        username: username || email.split('@')[0] || 'user',
      },
    });
  } catch {
    return NextResponse.json({ message: '注册失败，请稍后重试' }, { status: 500 });
  }
}

