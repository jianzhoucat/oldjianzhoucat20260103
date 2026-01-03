'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, logout, type AuthSession } from '@/lib/auth';

type DashboardTask = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

const TASKS_STORAGE_KEY = 'my_next_app_tasks_v1';

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readTasks(): DashboardTask[] {
  const parsed = safeJsonParse<DashboardTask[]>(window.localStorage.getItem(TASKS_STORAGE_KEY));
  if (!parsed || !Array.isArray(parsed)) return [];
  return parsed.filter((t) => !!t?.id && typeof t.title === 'string');
}

function writeTasks(tasks: DashboardTask[]) {
  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

function formatCompactNumber(n: number) {
  return new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function statusColor(status: '正常' | '预警' | '失败') {
  if (status === '正常') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === '预警') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    setSession(s);
    setTasks(readTasks());
  }, [router]);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [search, tasks]);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.done).length;
    const total = tasks.length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, completionRate };
  }, [tasks]);

  const kpis = useMemo(() => {
    const today = new Date();
    const seed = Number(
      `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
    );
    const visitors = 4200 + (seed % 900);
    const conversions = 160 + (seed % 40);
    const messages = 12 + (seed % 9);
    const uptime = 99.9;
    return { visitors, conversions, messages, uptime };
  }, []);

  const activities = useMemo(
    () => [
      { title: '登录成功', time: new Date().toISOString(), type: '安全' as const },
      { title: '已同步个人偏好设置', time: new Date(Date.now() - 12 * 60 * 1000).toISOString(), type: '系统' as const },
      { title: '生成每日报表', time: new Date(Date.now() - 42 * 60 * 1000).toISOString(), type: '分析' as const },
      { title: '更新项目状态为「进行中」', time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), type: '项目' as const },
    ],
    []
  );

  const projects = useMemo(
    () => [
      { name: '站点改版', owner: '产品组', updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), status: '正常' as const },
      { name: '登录体验优化', owner: '前端组', updatedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), status: '预警' as const },
      { name: '服务健康巡检', owner: '运维组', updatedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), status: '正常' as const },
      { name: '支付链路压测', owner: '后端组', updatedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), status: '失败' as const },
    ],
    []
  );

  const chartPoints = useMemo(() => {
    const base = 28;
    const points = Array.from({ length: 14 }, (_, i) => {
      const wave = Math.sin(i / 2.2) * 8;
      const trend = i * 1.2;
      return Math.max(8, Math.round(base + wave + trend));
    });
    const max = Math.max(...points);
    const min = Math.min(...points);
    const width = 520;
    const height = 140;
    const padX = 12;
    const padY = 18;
    const scaleX = (width - padX * 2) / (points.length - 1);
    const scaleY = (height - padY * 2) / Math.max(1, max - min);
    const toY = (v: number) => height - padY - (v - min) * scaleY;
    const d = points
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${padX + i * scaleX} ${toY(v)}`)
      .join(' ');
    return { d, points, width, height, padX, padY };
  }, []);

  function addTask() {
    const title = newTaskTitle.trim();
    if (!title) return;
    const task: DashboardTask = {
      id: `t_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
      title,
      done: false,
      createdAt: new Date().toISOString(),
    };
    const next = [task, ...tasks];
    setTasks(next);
    writeTasks(next);
    setNewTaskTitle('');
  }

  function toggleTask(id: string) {
    const next = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(next);
    writeTasks(next);
  }

  function removeTask(id: string) {
    const next = tasks.filter((t) => t.id !== id);
    setTasks(next);
    writeTasks(next);
  }

  function handleLogout() {
    logout();
    router.push('/login');
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex items-center gap-3 text-gray-600">
          <svg className="animate-spin h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm">正在加载您的工作台…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-16 left-10 w-72 h-72 bg-purple-200 rounded-full filter blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-200 rounded-full filter blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">工作台</div>
              <div className="text-sm text-gray-600">
                {session.user.username} · {session.user.email}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索待办、项目、动态…"
                className="w-full sm:w-80 pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white/80 backdrop-blur text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-3 py-2.5 rounded-lg bg-white/80 backdrop-blur border border-gray-200 text-gray-700 hover:bg-white transition-colors"
              >
                返回首页
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">今日访问</div>
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3l3 8 4-16 3 8h5" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-800">{formatCompactNumber(kpis.visitors)}</div>
            <div className="mt-2 text-sm text-gray-600">较昨日 +{(kpis.visitors % 9) + 3}%</div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">转化数</div>
              <div className="h-9 w-9 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-12-5-4-4 5-4-5-5 4 9 12z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-800">{formatCompactNumber(kpis.conversions)}</div>
            <div className="mt-2 text-sm text-gray-600">目标完成 {(kpis.conversions % 20) + 60}%</div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">消息待处理</div>
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a4 4 0 01-4 4H7l-4 3V7a4 4 0 014-4h10a4 4 0 014 4v8z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-800">{kpis.messages}</div>
            <div className="mt-2 text-sm text-gray-600">平均响应 {(kpis.messages % 8) + 6} 分钟</div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">系统可用性</div>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-800">{kpis.uptime.toFixed(1)}%</div>
            <div className="mt-2 text-sm text-gray-600">最近7天无重大故障</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white/80 backdrop-blur shadow-sm p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-gray-800">趋势概览</div>
                <div className="text-sm text-gray-600">近两周关键指标变化</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  访问
                </span>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-600">当前完成率</div>
                <div className="text-sm font-semibold text-gray-800">{stats.completionRate}%</div>
              </div>
              <div className="px-4 pb-4">
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
              <div className="px-4 pb-4">
                <svg viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`} className="w-full h-[160px]">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="fillGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity="0.04" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${chartPoints.d} L ${chartPoints.width - chartPoints.padX} ${chartPoints.height - chartPoints.padY} L ${chartPoints.padX} ${chartPoints.height - chartPoints.padY} Z`}
                    fill="url(#fillGrad)"
                  />
                  <path d={chartPoints.d} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-800">待办清单</div>
                <div className="text-sm text-gray-600">
                  已完成 {stats.completed}/{stats.total}
                </div>
              </div>
              <Link href="/contact" className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                联系我们
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTask();
                  }
                }}
                placeholder="添加一个待办…"
                className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button
                onClick={addTask}
                className="px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                添加
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-[320px] overflow-auto pr-1">
              {filteredTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-sm text-gray-600">
                  暂无待办。试试添加“查看联系页表单”或“完善个人资料”。
                </div>
              ) : (
                filteredTasks.map((t) => (
                  <div key={t.id} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-3 py-3">
                    <button
                      onClick={() => toggleTask(t.id)}
                      className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                        t.done ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-300 text-transparent'
                      }`}
                      aria-label={t.done ? '标记为未完成' : '标记为已完成'}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${t.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {t.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">创建于 {formatDateTime(t.createdAt)}</div>
                    </div>
                    <button
                      onClick={() => removeTask(t.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="删除待办"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-800">最近动态</div>
              <button
                onClick={() => setTasks((prev) => prev)}
                className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                刷新
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {activities.map((a, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-gray-800 truncate">{a.title}</div>
                      <div className="text-xs text-gray-500 shrink-0">{a.type}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{formatDateTime(a.time)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white/80 backdrop-blur shadow-sm p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-gray-800">项目概览</div>
                <div className="text-sm text-gray-600">近 4 个项目的状态与更新时间</div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/register" className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                  新建账号
                </Link>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100">
                <div className="col-span-5">项目</div>
                <div className="col-span-3">负责人</div>
                <div className="col-span-2">状态</div>
                <div className="col-span-2 text-right">更新</div>
              </div>
              {projects.map((p) => (
                <div key={p.name} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm text-gray-700 border-b last:border-b-0 border-gray-50">
                  <div className="col-span-5 font-medium text-gray-800">{p.name}</div>
                  <div className="col-span-3">{p.owner}</div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs ${statusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="col-span-2 text-right text-gray-500">{formatDateTime(p.updatedAt)}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link
                href="/contact"
                className="rounded-xl border border-gray-100 bg-white px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm font-semibold text-gray-800">反馈与建议</div>
                <div className="text-xs text-gray-500 mt-1">提交表单，快速沟通</div>
              </Link>
              <Link href="/" className="rounded-xl border border-gray-100 bg-white px-4 py-4 hover:bg-gray-50 transition-colors">
                <div className="text-sm font-semibold text-gray-800">访问首页</div>
                <div className="text-xs text-gray-500 mt-1">查看站点展示内容</div>
              </Link>
              <button
                onClick={() => {
                  const preset = [
                    '检查联系页表单',
                    '更新个人资料信息',
                    '规划下一周目标',
                    '清理无用项目',
                  ];
                  const next = preset
                    .map((title, i) => ({
                      id: `t_preset_${i}_${Date.now().toString(16)}`,
                      title,
                      done: false,
                      createdAt: new Date().toISOString(),
                    }))
                    .concat(tasks)
                    .slice(0, 12);
                  setTasks(next);
                  writeTasks(next);
                }}
                className="rounded-xl border border-gray-100 bg-white px-4 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-sm font-semibold text-gray-800">一键填充待办</div>
                <div className="text-xs text-gray-500 mt-1">快速体验丰富交互</div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          会话与待办存储在浏览器本地，仅用于演示。
        </div>
      </div>
    </div>
  );
}

