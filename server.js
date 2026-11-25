'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL } = require('node:url');
const { initDb, hashPassword, verifyPassword } = require('./db');
const { isMailerConfigured, sendVerificationEmail } = require('./mailer');

function loadDotEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadDotEnv();

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT) || 3000;
const COOKIE_SECURE = process.env.COOKIE_SECURE === '1';
const SESSION_COOKIE = 'cqetc_sid';
const SESSION_TTL_MS = 30 * 24 * 3600 * 1000;
const MAX_JSON_BYTES = 6 * 1024 * 1024;
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
const MAX_IMAGES_PER_POST = 4;

const DIST_DIR = path.join(__dirname, 'dist');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const VALID_CATEGORIES = new Set(['help', 'study', 'career', 'life', 'notice']);
const VALID_CAMPUSES = new Set(['大学城', '永川', '两江', '全校']);
const VALID_TAGS = new Set(['errand', 'market', 'lost', 'question', 'notes', 'project', 'team', 'internship', 'guide']);
const AVATAR_COLORS = ['violet', 'blue', 'gold', 'green', 'rose'];

// 社区合规底线拦截词（防代课、代做作业、刷课、替考等违规内容）
const BLOCKED_PATTERNS = [
  /代课|替课|帮上课/,
  /代做作业|代写作业|帮写作业|作业代做|作业代写|代做实验|代写论文/,
  /刷网课|网课代刷|代刷网课|代考|替考|考试枪手/,
  /兼职刷单|裸贷|校园贷|博彩|赌博平台/,
];

function checkContentCompliance(...texts) {
  const combined = texts.filter(Boolean).join('\n');
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(combined)) {
      return '内容触发社区规范拦截（严禁发布代课、代做作业、刷网课、替考或违规广告），请修改后再提交。';
    }
  }
  return null;
}

// 邮箱格式校验
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function normalizeEmail(raw) {
  return String(raw || '').trim().toLowerCase();
}

// 零依赖 SVG 人机图形验证码（5 分钟有效、单次消费）
const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const captchaStore = new Map();

function createSvgCaptcha() {
  const now = Date.now();
  if (captchaStore.size > 500) {
    for (const [k, v] of captchaStore.entries()) {
      if (v.expiresAt < now) captchaStore.delete(k);
    }
  }
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += CAPTCHA_CHARS[crypto.randomInt(0, CAPTCHA_CHARS.length)];
  }
  const id = crypto.randomBytes(12).toString('hex');
  captchaStore.set(id, { answer: code.toLowerCase(), expiresAt: now + 5 * 60 * 1000 });

  const palette = ['#6b166b', '#801c80', '#3558b8', '#9a4718', '#19694b', '#8c2d62'];
  const lines = Array.from({ length: 4 }, () => {
    const x1 = crypto.randomInt(0, 25);
    const y1 = crypto.randomInt(5, 36);
    const cx = crypto.randomInt(35, 85);
    const cy = crypto.randomInt(2, 38);
    const x2 = crypto.randomInt(95, 120);
    const y2 = crypto.randomInt(5, 36);
    const color = palette[crypto.randomInt(0, palette.length)];
    return `<path d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}" fill="none" stroke="${color}" stroke-opacity="0.28" stroke-width="1.4"/>`;
  }).join('');

  const dots = Array.from({ length: 18 }, () => {
    const cx = crypto.randomInt(4, 116);
    const cy = crypto.randomInt(4, 36);
    const color = palette[crypto.randomInt(0, palette.length)];
    return `<circle cx="${cx}" cy="${cy}" r="1.1" fill="${color}" fill-opacity="0.32"/>`;
  }).join('');

  const letters = code.split('').map((ch, idx) => {
    const x = 18 + idx * 25 + crypto.randomInt(-3, 4);
    const y = 27 + crypto.randomInt(-4, 4);
    const rot = crypto.randomInt(-22, 23);
    const color = palette[crypto.randomInt(0, palette.length)];
    return `<text x="${x}" y="${y}" fill="${color}" font-family="Verdana,Arial,sans-serif" font-size="22" font-weight="700" transform="rotate(${rot} ${x} ${y})">${ch}</text>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><rect width="120" height="40" rx="7" fill="#f7f1f8"/>${lines}${dots}${letters}</svg>`;
  return {
    captchaId: id,
    image: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`,
  };
}

function consumeCaptcha(captchaId, captchaCode) {
  const id = String(captchaId || '').trim();
  const input = String(captchaCode || '').trim().toLowerCase();
  const rec = captchaStore.get(id);
  captchaStore.delete(id);
  if (!rec || rec.expiresAt < Date.now()) {
    return '图形验证码已过期，请点击图片刷新后重试。';
  }
  if (!input || rec.answer !== input) {
    return '图形验证码输入有误，请重新输入。';
  }
  return null;
}

function verifyAndConsumeEmailCode(email, purpose, codeInput) {
  const code = String(codeInput || '').trim();
  if (!/^\d{6}$/.test(code)) {
    return '请输入 6 位数字邮箱验证码。';
  }
  const row = db.prepare(`
    SELECT id, code_hash, expires_at, attempts
    FROM email_codes
    WHERE email = ? AND purpose = ? AND used_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `).get(email, purpose);
  if (!row || row.expires_at < Date.now()) {
    return '邮箱验证码已过期或不存在，请重新获取。';
  }
  if (row.attempts >= 5) {
    return '该验证码错误次数过多，请重新获取。';
  }
  if (!verifyPassword(code, row.code_hash)) {
    db.prepare('UPDATE email_codes SET attempts = attempts + 1 WHERE id = ?').run(row.id);
    return '邮箱验证码不正确，请检查后重试。';
  }
  db.prepare('UPDATE email_codes SET used_at = ? WHERE id = ?').run(Date.now(), row.id);
  return null;
}

// 参照 Google 注册密码规则：至少 8 位，需同时包含字母、数字和符号，且不含空格
function validatePasswordStrength(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 64) {
    return '密码长度需在 8–64 位之间。';
  }
  if (/\s/.test(password)) {
    return '密码不能包含空格。';
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9\s]/.test(password)) {
    return '请使用至少 8 个字符，且同时包含字母、数字和符号的组合。';
  }
  return null;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
};

const db = initDb();

const rateBuckets = new Map();
function checkRateLimit(key, maxHits, windowMs) {
  const now = Date.now();
  const bucket = rateBuckets.get(key) || [];
  const recent = bucket.filter((ts) => now - ts < windowMs);
  if (recent.length >= maxHits) {
    rateBuckets.set(key, recent);
    return false;
  }
  recent.push(now);
  rateBuckets.set(key, recent);
  return true;
}

setInterval(() => {
  const now = Date.now();
  try {
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
  } catch { /* ignore */ }
  for (const [k, v] of rateBuckets.entries()) {
    const kept = v.filter((ts) => now - ts < 15 * 60 * 1000);
    if (kept.length) rateBuckets.set(k, kept);
    else rateBuckets.delete(k);
  }
}, 10 * 60 * 1000).unref();

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const result = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    try {
      result[k] = decodeURIComponent(v);
    } catch {
      result[k] = v;
    }
  }
  return result;
}

function setSessionCookie(res, token, maxAgeSec) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`,
  ];
  if (COOKIE_SECURE) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function getCurrentUser(req) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  const row = db.prepare(`
    SELECT u.id, u.username, u.email, u.nickname, u.campus, u.role, u.color, s.expires_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ?
  `).get(token);
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }
  return {
    id: row.id,
    username: row.username,
    email: row.email || null,
    nickname: row.nickname,
    initial: row.nickname.slice(0, 1),
    campus: row.campus,
    role: row.role,
    color: row.color,
  };
}

function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .run(token, userId, now, now + SESSION_TTL_MS);
  setSessionCookie(res, token, Math.floor(SESSION_TTL_MS / 1000));
  return token;
}

function createNotification(userId, actorId, type, topicId, replyId, message) {
  if (!userId || userId === actorId) return;
  db.prepare(`
    INSERT INTO notifications (user_id, type, actor_id, topic_id, reply_id, message, read_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NULL, ?)
  `).run(userId, type, actorId, topicId || null, replyId || null, message, Date.now());
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_JSON_BYTES) {
        reject(Object.assign(new Error('请求内容过大，请减少图片数量或体积。'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error('无效的 JSON 请求格式。'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  res.end(body);
}

function effectiveStatus(row, now = Date.now()) {
  if (row.category !== 'help') return null;
  if (row.status === 'closed') return 'closed';
  if (row.expires_at && row.expires_at < now) return 'expired';
  return 'open';
}

function detectImageExtension(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return '.jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return '.png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return '.gif';
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return '.webp';
  return null;
}

function saveUploadedImages(images, allowedExisting = []) {
  if (!Array.isArray(images) || images.length === 0) return [];
  if (images.length > MAX_IMAGES_PER_POST) {
    throw Object.assign(new Error(`每个帖子最多上传 ${MAX_IMAGES_PER_POST} 张图片。`), { status: 400 });
  }
  const existingSet = new Set(allowedExisting);
  const savedUrls = [];
  for (const item of images) {
    if (typeof item !== 'string') continue;
    if (existingSet.has(item)) {
      savedUrls.push(item);
      continue;
    }
    const match = item.match(/^data:image\/(?:jpeg|jpg|png|webp|gif);base64,([A-Za-z0-9+/=]+)$/);
    if (!match) {
      throw Object.assign(new Error('仅支持 JPG / PNG / WebP / GIF 格式图片。'), { status: 400 });
    }
    const buf = Buffer.from(match[1], 'base64');
    if (buf.length === 0 || buf.length > MAX_IMAGE_BYTES) {
      throw Object.assign(new Error('单张图片不能超过 1.5MB。'), { status: 400 });
    }
    const ext = detectImageExtension(buf);
    if (!ext) {
      throw Object.assign(new Error('图片文件内容无效，请重新选择图片。'), { status: 400 });
    }
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), buf);
    savedUrls.push(`/uploads/${filename}`);
  }
  return savedUrls;
}

function safeParseArray(json) {
  try {
    const parsed = JSON.parse(json || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getRandomVerifyQuestion() {
  const rows = db.prepare('SELECT id, question FROM verify_questions WHERE active = 1').all();
  if (!rows.length) return null;
  return rows[Math.floor(Math.random() * rows.length)];
}

function getLikeStats(targetType, targetIds, currentUserId) {
  const counts = new Map();
  const likedSet = new Set();
  if (!targetIds.length) return { counts, likedSet };
  const rows = db.prepare(`SELECT target_id, COUNT(*) AS cnt FROM likes WHERE target_type = ? GROUP BY target_id`).all(targetType);
  for (const r of rows) counts.set(r.target_id, Number(r.cnt));
  if (currentUserId) {
    const mine = db.prepare(`SELECT target_id FROM likes WHERE target_type = ? AND user_id = ?`).all(targetType, currentUserId);
    for (const m of mine) likedSet.add(m.target_id);
  }
  return { counts, likedSet };
}

function formatTopicListItem(row, replies, likeCount, now) {
  const latest = replies.length ? replies[replies.length - 1] : null;
  const peopleMap = new Map();
  peopleMap.set(row.author_nickname, { author: row.author_nickname, initial: row.author_nickname.slice(0, 1), color: row.author_color });
  for (const r of replies) {
    if (!peopleMap.has(r.author_nickname)) {
      peopleMap.set(r.author_nickname, { author: r.author_nickname, initial: r.author_nickname.slice(0, 1), color: r.author_color });
    }
  }
  const images = safeParseArray(row.images_json);
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    campus: row.campus,
    tags: safeParseArray(row.tags_json),
    status: effectiveStatus(row, now),
    reward: row.reward || null,
    expiresAt: row.expires_at || null,
    imageCount: images.length,
    pinned: Boolean(row.pinned),
    accepted: row.accepted_reply_id || null,
    author: row.author_nickname,
    authorId: row.author_id,
    initial: row.author_nickname.slice(0, 1),
    color: row.author_color,
    views: row.views,
    likeCount: likeCount || 0,
    replyCount: replies.length,
    latestReplyId: latest?.id || null,
    lastActivityAt: row.last_activity_at,
    createdAt: row.created_at,
    participants: [...peopleMap.values()].slice(0, 3),
  };
}

function formatTopicDetail(row, replies, currentUser, now) {
  const status = effectiveStatus(row, now);
  const hasContact = Boolean(row.contact);
  const contact = (row.category === 'help' && status === 'open' && currentUser && hasContact)
    ? row.contact
    : null;
  const canManage = Boolean(currentUser && (currentUser.role === 'admin' || currentUser.id === row.author_id));
  const topicLikes = getLikeStats('topic', [row.id], currentUser?.id);
  const replyLikes = getLikeStats('reply', replies.map((r) => r.id), currentUser?.id);

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    campus: row.campus,
    tags: safeParseArray(row.tags_json),
    status,
    rawStatus: row.status || null,
    reward: row.reward || null,
    expiresAt: row.expires_at || null,
    hasContact,
    contact,
    // 仅作者/管理员编辑时提供原始联系方式以便回填
    editContact: canManage ? (row.contact || '') : null,
    images: safeParseArray(row.images_json),
    pinned: Boolean(row.pinned),
    accepted: row.accepted_reply_id || null,
    author: row.author_nickname,
    authorId: row.author_id,
    initial: row.author_nickname.slice(0, 1),
    color: row.author_color,
    views: row.views,
    likeCount: topicLikes.counts.get(row.id) || 0,
    liked: topicLikes.likedSet.has(row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at || null,
    lastActivityAt: row.last_activity_at,
    canManage,
    canPin: Boolean(currentUser && currentUser.role === 'admin'),
    replies: replies.map((r) => ({
      id: r.id,
      body: r.body,
      author: r.author_nickname,
      authorId: r.author_id,
      initial: r.author_nickname.slice(0, 1),
      color: r.author_color,
      createdAt: r.created_at,
      likeCount: replyLikes.counts.get(r.id) || 0,
      liked: replyLikes.likedSet.has(r.id),
      canDelete: Boolean(currentUser && (currentUser.role === 'admin' || currentUser.id === r.author_id)),
    })),
  };
}

function serveStaticFile(res, baseDir, relPath) {
  const safeRel = path.normalize(relPath).replace(/^(\.\.[/\\])+/, '');
  const fullPath = path.resolve(baseDir, safeRel);
  if (!fullPath.startsWith(path.resolve(baseDir))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  const ext = path.extname(fullPath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': mime,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': baseDir === UPLOADS_DIR ? 'public, max-age=604800' : 'no-cache',
  });
  fs.createReadStream(fullPath).pipe(res);
}

async function handleApi(req, res, urlObj) {
  const pathname = urlObj.pathname;
  const method = req.method;
  const user = getCurrentUser(req);
  const ip = getClientIp(req);

  if (method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, mode: 'server' });
  }

  if (method === 'GET' && pathname === '/api/bootstrap') {
    const unreadCount = user
      ? db.prepare('SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND read_at IS NULL').get(user.id).cnt
      : 0;
    const pendingReports = user?.role === 'admin'
      ? db.prepare("SELECT COUNT(*) AS cnt FROM reports WHERE status = 'pending'").get().cnt
      : 0;
    return sendJson(res, 200, {
      mode: 'server',
      user,
      emailVerifyEnabled: isMailerConfigured(),
      unreadCount: Number(unreadCount),
      pendingReports: Number(pendingReports),
      verifyQuestion: getRandomVerifyQuestion(),
    });
  }

  if (method === 'GET' && pathname === '/api/verify-question') {
    return sendJson(res, 200, { verifyQuestion: getRandomVerifyQuestion() });
  }

  // GET /api/captcha (SVG human image verification)
  if (method === 'GET' && pathname === '/api/captcha') {
    if (!checkRateLimit(`captcha:${ip}`, 60, 5 * 60 * 1000)) {
      return sendJson(res, 429, { error: '获取图形验证码太频繁，请稍后再试。' });
    }
    return sendJson(res, 200, createSvgCaptcha());
  }

  // GET /api/auth/check-availability (live email & nickname duplicate check)
  if (method === 'GET' && pathname === '/api/auth/check-availability') {
    if (!checkRateLimit(`avail:${ip}`, 90, 5 * 60 * 1000)) {
      return sendJson(res, 429, { error: '检查过于频繁，请稍后再试。' });
    }
    const emailParam = normalizeEmail(urlObj.searchParams.get('email'));
    const nicknameParam = String(urlObj.searchParams.get('nickname') || '').trim();
    const out = {};
    if (emailParam) {
      const existsEmail = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)').get(emailParam, emailParam);
      out.emailAvailable = !existsEmail;
    }
    if (nicknameParam) {
      const existsNick = db.prepare('SELECT id FROM users WHERE LOWER(nickname) = LOWER(?)').get(nicknameParam);
      out.nicknameAvailable = !existsNick;
    }
    return sendJson(res, 200, out);
  }

  // POST /api/auth/send-code (requires human image captcha before sending email code)
  if (method === 'POST' && pathname === '/api/auth/send-code') {
    if (!isMailerConfigured()) {
      return sendJson(res, 503, { error: '站长尚未配置邮件发信服务，暂不可发送邮箱验证码。' });
    }
    if (!checkRateLimit(`sendcode:${ip}`, 10, 10 * 60 * 1000)) {
      return sendJson(res, 429, { error: '发送验证码太频繁，请稍后再试。' });
    }
    const body = await readJsonBody(req);
    const email = normalizeEmail(body.email);
    const purpose = body.purpose === 'reset' ? 'reset' : 'register';

    if (!email || email.length > 80 || !EMAIL_RE.test(email)) {
      return sendJson(res, 400, { error: '请输入有效的邮箱地址。' });
    }
    const capErr = consumeCaptcha(body.captchaId, body.captchaCode);
    if (capErr) return sendJson(res, 400, { error: capErr, refreshCaptcha: true });

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)').get(email, email);
    if (purpose === 'register' && existing) {
      return sendJson(res, 409, { error: '该邮箱已被注册，请直接登录。' });
    }
    if (purpose === 'reset' && !existing) {
      return sendJson(res, 404, { error: '未找到使用该邮箱注册的账号。' });
    }

    const recent = db.prepare('SELECT created_at FROM email_codes WHERE email = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1').get(email, purpose);
    if (recent && Date.now() - recent.created_at < 60 * 1000) {
      const waitSec = Math.ceil((60 * 1000 - (Date.now() - recent.created_at)) / 1000);
      return sendJson(res, 429, { error: `请 ${waitSec} 秒后再重新发送验证码。` });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const now = Date.now();
    await sendVerificationEmail({ to: email, code, purpose });
    db.prepare('INSERT INTO email_codes (email, purpose, code_hash, expires_at, attempts, used_at, created_at) VALUES (?, ?, ?, ?, 0, NULL, ?)')
      .run(email, purpose, hashPassword(code), now + 5 * 60 * 1000, now);
    return sendJson(res, 200, { ok: true, cooldown: 60 });
  }

  // POST /api/auth/register
  if (method === 'POST' && pathname === '/api/auth/register') {
    if (!checkRateLimit(`reg:${ip}`, 15, 10 * 60 * 1000)) {
      return sendJson(res, 429, { error: '操作太频繁，请稍后再试。' });
    }
    const body = await readJsonBody(req);
    const email = normalizeEmail(body.email || body.username);
    const password = String(body.password || '');
    const confirmPassword = body.confirmPassword !== undefined ? String(body.confirmPassword) : null;
    const nickname = String(body.nickname || '').trim();
    const campus = String(body.campus || '大学城').trim();
    const questionId = Number(body.questionId);
    const answer = String(body.answer || '').trim();

    if (!email || email.length > 80 || !EMAIL_RE.test(email)) {
      return sendJson(res, 400, { error: '请输入有效的邮箱地址作为账号。' });
    }
    const pwdErr = validatePasswordStrength(password);
    if (pwdErr) return sendJson(res, 400, { error: pwdErr });
    if (confirmPassword !== null && password !== confirmPassword) {
      return sendJson(res, 400, { error: '两次输入的密码不一致。' });
    }
    if (!nickname || nickname.length > 16) {
      return sendJson(res, 400, { error: '请填写 1–16 字的昵称。' });
    }
    if (!VALID_CAMPUSES.has(campus) || campus === '全校') {
      return sendJson(res, 400, { error: '请选择有效校区。' });
    }
    const nickBlock = checkContentCompliance(nickname);
    if (nickBlock) return sendJson(res, 400, { error: '昵称包含违规词汇，请更换。' });

    const existsEmail = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)').get(email, email);
    if (existsEmail) return sendJson(res, 409, { error: '该邮箱已被注册，请直接登录。' });

    const existsNick = db.prepare('SELECT id FROM users WHERE LOWER(nickname) = LOWER(?)').get(nickname);
    if (existsNick) return sendJson(res, 409, { error: '该昵称已被其他同学使用，请换一个昵称。' });

    const qRow = db.prepare('SELECT id, question, answers_json FROM verify_questions WHERE id = ? AND active = 1').get(questionId);
    if (!qRow) return sendJson(res, 400, { error: '验证题已失效，请刷新后重试。' });
    const validAnswers = safeParseArray(qRow.answers_json).map((a) => String(a).trim().toLowerCase());
    if (!validAnswers.includes(answer.toLowerCase())) {
      return sendJson(res, 400, { error: '校内验证题答案不对哦，再想想重电同学都知道的简称！' });
    }

    if (isMailerConfigured()) {
      const codeErr = verifyAndConsumeEmailCode(email, 'register', body.emailCode);
      if (codeErr) return sendJson(res, 400, { error: codeErr });
    } else {
      const capErr = consumeCaptcha(body.captchaId, body.captchaCode);
      if (capErr) return sendJson(res, 400, { error: capErr, refreshCaptcha: true });
    }

    const color = AVATAR_COLORS[nickname.charCodeAt(0) % AVATAR_COLORS.length];
    const now = Date.now();
    const result = db.prepare(
      'INSERT INTO users (username, email, nickname, campus, password_hash, role, color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(email, email, nickname, campus, hashPassword(password), 'user', color, now);

    const newUserId = Number(result.lastInsertRowid);
    createSession(res, newUserId);
    return sendJson(res, 201, {
      user: { id: newUserId, username: email, email, nickname, initial: nickname.slice(0, 1), campus, role: 'user', color },
    });
  }

  // POST /api/auth/login (supports both email and legacy username like 'admin')
  if (method === 'POST' && pathname === '/api/auth/login') {
    if (!checkRateLimit(`login:${ip}`, 20, 10 * 60 * 1000)) {
      return sendJson(res, 429, { error: '登录尝试过于频繁，请 10 分钟后再试。' });
    }
    const body = await readJsonBody(req);
    const identifier = String(body.email || body.username || '').trim();
    const password = String(body.password || '');
    const row = db.prepare(
      'SELECT id, username, email, nickname, campus, password_hash, role, color FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)'
    ).get(identifier, identifier);
    if (!row || !verifyPassword(password, row.password_hash)) {
      return sendJson(res, 401, { error: '邮箱/账号或密码错误。' });
    }
    createSession(res, row.id);
    return sendJson(res, 200, {
      user: {
        id: row.id,
        username: row.username,
        email: row.email || null,
        nickname: row.nickname,
        initial: row.nickname.slice(0, 1),
        campus: row.campus,
        role: row.role,
        color: row.color,
      },
    });
  }

  // POST /api/auth/reset-password (via email verification code)
  if (method === 'POST' && pathname === '/api/auth/reset-password') {
    if (!isMailerConfigured()) {
      return sendJson(res, 503, { error: '邮件服务尚未配置，暂不支持自助重置密码。' });
    }
    if (!checkRateLimit(`reset:${ip}`, 10, 10 * 60 * 1000)) {
      return sendJson(res, 429, { error: '操作太频繁，请稍后再试。' });
    }
    const body = await readJsonBody(req);
    const email = normalizeEmail(body.email);
    const newPassword = String(body.newPassword || '');
    const confirmNewPassword = body.confirmNewPassword !== undefined ? String(body.confirmNewPassword) : null;
    if (!email || !EMAIL_RE.test(email)) return sendJson(res, 400, { error: '请输入有效邮箱地址。' });
    const pwdErr = validatePasswordStrength(newPassword);
    if (pwdErr) return sendJson(res, 400, { error: pwdErr });
    if (confirmNewPassword !== null && newPassword !== confirmNewPassword) {
      return sendJson(res, 400, { error: '两次输入的新密码不一致。' });
    }
    const row = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)').get(email, email);
    if (!row) return sendJson(res, 404, { error: '未找到该邮箱对应的账号。' });
    const codeErr = verifyAndConsumeEmailCode(email, 'reset', body.emailCode);
    if (codeErr) return sendJson(res, 400, { error: codeErr });

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), row.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(row.id);
    return sendJson(res, 200, { ok: true });
  }

  // POST /api/auth/logout
  if (method === 'POST' && pathname === '/api/auth/logout') {
    const token = parseCookies(req)[SESSION_COOKIE];
    if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    setSessionCookie(res, '', 0);
    return sendJson(res, 200, { ok: true });
  }

  // POST /api/auth/change-password
  if (method === 'POST' && pathname === '/api/auth/change-password') {
    if (!user) return sendJson(res, 401, { error: '请先登录。' });
    const body = await readJsonBody(req);
    const oldPassword = String(body.oldPassword || '');
    const newPassword = String(body.newPassword || '');
    const confirmNewPassword = body.confirmNewPassword !== undefined ? String(body.confirmNewPassword) : null;
    const pwdErr = validatePasswordStrength(newPassword);
    if (pwdErr) return sendJson(res, 400, { error: pwdErr });
    if (confirmNewPassword !== null && newPassword !== confirmNewPassword) {
      return sendJson(res, 400, { error: '两次输入的新密码不一致。' });
    }
    const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id);
    if (!row || !verifyPassword(oldPassword, row.password_hash)) {
      return sendJson(res, 400, { error: '当前原密码不正确。' });
    }
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), user.id);
    return sendJson(res, 200, { ok: true });
  }

  // GET /api/users/:id (Public student profile)
  const userProfileMatch = pathname.match(/^\/api\/users\/(\d+)$/);
  if (method === 'GET' && userProfileMatch) {
    const targetId = Number(userProfileMatch[1]);
    const u = db.prepare('SELECT id, nickname, campus, role, color, created_at FROM users WHERE id = ?').get(targetId);
    if (!u) return sendJson(res, 404, { error: '未找到该同学。' });

    const topics = db.prepare(`
      SELECT t.*, u.nickname AS author_nickname, u.color AS author_color
      FROM topics t JOIN users u ON u.id = t.author_id
      WHERE t.author_id = ?
      ORDER BY t.created_at DESC
      LIMIT 30
    `).all(targetId);

    const replyCount = db.prepare('SELECT COUNT(*) AS cnt FROM replies WHERE author_id = ?').get(targetId).cnt;
    const topicLikesReceived = db.prepare(`
      SELECT COUNT(*) AS cnt FROM likes l JOIN topics t ON l.target_id = t.id
      WHERE l.target_type = 'topic' AND t.author_id = ?
    `).get(targetId).cnt;
    const replyLikesReceived = db.prepare(`
      SELECT COUNT(*) AS cnt FROM likes l JOIN replies r ON l.target_id = r.id
      WHERE l.target_type = 'reply' AND r.author_id = ?
    `).get(targetId).cnt;

    const now = Date.now();
    const { counts: likeCounts } = getLikeStats('topic', topics.map((t) => t.id), null);
    const items = topics.map((row) => {
      const tReplies = db.prepare(`
        SELECT r.id, r.created_at, u.nickname AS author_nickname, u.color AS author_color
        FROM replies r JOIN users u ON u.id = r.author_id WHERE r.topic_id = ? ORDER BY r.created_at ASC
      `).all(row.id);
      return formatTopicListItem(row, tReplies, likeCounts.get(row.id) || 0, now);
    });

    return sendJson(res, 200, {
      profile: {
        id: u.id,
        nickname: u.nickname,
        initial: u.nickname.slice(0, 1),
        campus: u.campus,
        role: u.role,
        color: u.color,
        createdAt: u.created_at,
        topicCount: topics.length,
        replyCount: Number(replyCount),
        likesReceived: Number(topicLikesReceived) + Number(replyLikesReceived),
      },
      topics: items,
    });
  }

  // Notifications
  if (pathname === '/api/notifications' && method === 'GET') {
    if (!user) return sendJson(res, 401, { error: '请先登录。' });
    const rows = db.prepare(`
      SELECT n.*, u.nickname AS actor_nickname, u.color AS actor_color
      FROM notifications n
      JOIN users u ON u.id = n.actor_id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 30
    `).all(user.id);
    const unreadCount = rows.filter((r) => !r.read_at).length;
    return sendJson(res, 200, {
      unreadCount,
      notifications: rows.map((r) => ({
        id: r.id,
        type: r.type,
        topicId: r.topic_id,
        replyId: r.reply_id,
        message: r.message,
        actor: r.actor_nickname,
        actorInitial: r.actor_nickname.slice(0, 1),
        actorColor: r.actor_color,
        read: Boolean(r.read_at),
        createdAt: r.created_at,
      })),
    });
  }

  if (pathname === '/api/notifications/unread-count' && method === 'GET') {
    if (!user) return sendJson(res, 200, { unreadCount: 0 });
    const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND read_at IS NULL').get(user.id).cnt;
    return sendJson(res, 200, { unreadCount: Number(cnt) });
  }

  if (pathname === '/api/notifications/read-all' && method === 'POST') {
    if (!user) return sendJson(res, 401, { error: '请先登录。' });
    db.prepare('UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL').run(Date.now(), user.id);
    return sendJson(res, 200, { ok: true });
  }

  const notifReadMatch = pathname.match(/^\/api\/notifications\/(\d+)\/read$/);
  if (notifReadMatch && method === 'POST') {
    if (!user) return sendJson(res, 401, { error: '请先登录。' });
    db.prepare('UPDATE notifications SET read_at = ? WHERE id = ? AND user_id = ?').run(Date.now(), Number(notifReadMatch[1]), user.id);
    return sendJson(res, 200, { ok: true });
  }

  // POST /api/likes (toggle like on topic or reply)
  if (method === 'POST' && pathname === '/api/likes') {
    if (!user) return sendJson(res, 401, { error: '请先登录后再点赞。' });
    const body = await readJsonBody(req);
    const targetType = body.targetType === 'reply' ? 'reply' : 'topic';
    const targetId = String(body.targetId || '').trim();
    if (!targetId) return sendJson(res, 400, { error: '参数无效。' });

    let ownerId = null;
    let notifyTopicId = targetId;
    let notifyReplyId = null;
    let notifyLabel = '';

    if (targetType === 'topic') {
      const t = db.prepare('SELECT id, title, author_id FROM topics WHERE id = ?').get(targetId);
      if (!t) return sendJson(res, 404, { error: '帖子不存在。' });
      ownerId = t.author_id;
      notifyLabel = `赞了你的帖子「${t.title.slice(0, 24)}」`;
    } else {
      const r = db.prepare('SELECT r.id, r.topic_id, r.author_id, t.title FROM replies r JOIN topics t ON t.id = r.topic_id WHERE r.id = ?').get(targetId);
      if (!r) return sendJson(res, 404, { error: '回复不存在。' });
      ownerId = r.author_id;
      notifyTopicId = r.topic_id;
      notifyReplyId = r.id;
      notifyLabel = `赞了你在「${r.title.slice(0, 22)}」下的回复`;
    }

    const exists = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?').get(user.id, targetType, targetId);
    let liked;
    if (exists) {
      db.prepare('DELETE FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?').run(user.id, targetType, targetId);
      liked = false;
    } else {
      db.prepare('INSERT INTO likes (user_id, target_type, target_id, created_at) VALUES (?, ?, ?, ?)').run(user.id, targetType, targetId, Date.now());
      liked = true;
      createNotification(ownerId, user.id, 'like', notifyTopicId, notifyReplyId, `${user.nickname} ${notifyLabel}`);
    }
    const count = db.prepare('SELECT COUNT(*) AS cnt FROM likes WHERE target_type = ? AND target_id = ?').get(targetType, targetId).cnt;
    return sendJson(res, 200, { liked, count: Number(count) });
  }

  // Reports (submit & admin management)
  if (pathname === '/api/reports' && method === 'POST') {
    if (!user) return sendJson(res, 401, { error: '请先登录后再举报。' });
    if (!checkRateLimit(`report:${user.id}`, 8, 10 * 60 * 1000)) {
      return sendJson(res, 429, { error: '举报太频繁，请稍后再试。' });
    }
    const body = await readJsonBody(req);
    const topicId = String(body.topicId || '').trim();
    const reason = String(body.reason || '').trim().slice(0, 40);
    const detail = String(body.detail || '').trim().slice(0, 200);
    if (!topicId || !reason) return sendJson(res, 400, { error: '请选择举报原因。' });
    const exists = db.prepare('SELECT id FROM topics WHERE id = ?').get(topicId);
    if (!exists) return sendJson(res, 404, { error: '帖子不存在。' });
    db.prepare('INSERT INTO reports (topic_id, reporter_id, reason, detail, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(topicId, user.id, reason, detail || null, 'pending', Date.now());
    return sendJson(res, 201, { ok: true });
  }

  if (pathname === '/api/admin/reports' && method === 'GET') {
    if (!user || user.role !== 'admin') return sendJson(res, 403, { error: '仅管理员可查看举报。' });
    const rows = db.prepare(`
      SELECT r.*, t.title AS topic_title, u.nickname AS reporter_nickname
      FROM reports r
      JOIN topics t ON t.id = r.topic_id
      JOIN users u ON u.id = r.reporter_id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT 30
    `).all();
    return sendJson(res, 200, {
      reports: rows.map((r) => ({
        id: r.id,
        topicId: r.topic_id,
        topicTitle: r.topic_title,
        reporter: r.reporter_nickname,
        reason: r.reason,
        detail: r.detail,
        createdAt: r.created_at,
      })),
    });
  }

  const reportResolveMatch = pathname.match(/^\/api\/admin\/reports\/(\d+)\/resolve$/);
  if (reportResolveMatch && method === 'POST') {
    if (!user || user.role !== 'admin') return sendJson(res, 403, { error: '仅管理员可操作。' });
    db.prepare("UPDATE reports SET status = 'resolved' WHERE id = ?").run(Number(reportResolveMatch[1]));
    return sendJson(res, 200, { ok: true });
  }

  // GET /api/topics
  if (method === 'GET' && pathname === '/api/topics') {
    const category = urlObj.searchParams.get('category') || 'all';
    const campus = urlObj.searchParams.get('campus') || 'all';
    const tag = urlObj.searchParams.get('tag') || 'all';
    const tab = urlObj.searchParams.get('tab') || 'latest';
    const activeOnly = urlObj.searchParams.get('activeOnly') === '1';
    const q = (urlObj.searchParams.get('q') || '').trim().toLowerCase();
    const words = q ? q.split(/\s+/).filter(Boolean) : [];
    const now = Date.now();

    const rows = db.prepare(`
      SELECT t.*, u.nickname AS author_nickname, u.color AS author_color
      FROM topics t
      JOIN users u ON u.id = t.author_id
      ORDER BY t.pinned DESC, t.last_activity_at DESC
    `).all();

    const allReplies = db.prepare(`
      SELECT r.id, r.topic_id, r.body, r.created_at, u.nickname AS author_nickname, u.color AS author_color
      FROM replies r
      JOIN users u ON u.id = r.author_id
      ORDER BY r.created_at ASC
    `).all();

    const repliesByTopic = new Map();
    for (const r of allReplies) {
      if (!repliesByTopic.has(r.topic_id)) repliesByTopic.set(r.topic_id, []);
      repliesByTopic.get(r.topic_id).push(r);
    }

    const { counts: likeCounts } = getLikeStats('topic', rows.map((r) => r.id), null);

    const TAG_LABELS = {
      errand: '跑腿代取', market: '二手闲置', lost: '失物招领',
      question: '求助', notes: '经验分享', project: '项目实践',
      team: '组队/搭子', internship: '实习', guide: '攻略',
    };
    const CAT_LABELS = {
      help: '校园互助', study: '课程与实训', career: '实习与竞赛', life: '校园生活', notice: '站务与指南',
    };

    const filtered = rows.filter((row) => {
      const status = effectiveStatus(row, now);
      if (activeOnly && status && status !== 'open') return false;
      if (category !== 'all' && row.category !== category) return false;
      if (campus !== 'all' && row.campus !== campus) return false;
      const tTags = safeParseArray(row.tags_json);
      if (tag !== 'all' && !tTags.includes(tag)) return false;
      const tReplies = repliesByTopic.get(row.id) || [];
      if (tab === 'unanswered' && tReplies.length > 0) return false;
      if (words.length) {
        const haystack = [
          row.title, row.body, row.reward || '', row.author_nickname, row.campus,
          CAT_LABELS[row.category] || '',
          ...tTags.map((id) => TAG_LABELS[id] || id),
          ...tReplies.map((r) => r.body),
        ].join(' ').toLowerCase();
        if (!words.every((w) => haystack.includes(w))) return false;
      }
      return true;
    });

    if (tab === 'popular') {
      filtered.sort((a, b) => {
        const scoreA = a.views + (likeCounts.get(a.id) || 0) * 12;
        const scoreB = b.views + (likeCounts.get(b.id) || 0) * 12;
        return (b.pinned - a.pinned) || (scoreB - scoreA) || (b.last_activity_at - a.last_activity_at);
      });
    } else {
      filtered.sort((a, b) => (b.pinned - a.pinned) || (b.last_activity_at - a.last_activity_at));
    }

    const items = filtered.map((row) => formatTopicListItem(row, repliesByTopic.get(row.id) || [], likeCounts.get(row.id) || 0, now));
    return sendJson(res, 200, { topics: items, total: items.length });
  }

  // POST /api/topics
  if (method === 'POST' && pathname === '/api/topics') {
    if (!user) return sendJson(res, 401, { error: '请先登录或完成校内验证后再发帖。' });
    if (!checkRateLimit(`post:${user.id}`, 10, 10 * 60 * 1000)) {
      return sendJson(res, 429, { error: '发帖太快啦，请稍后再试。' });
    }
    const body = await readJsonBody(req);
    const title = String(body.title || '').trim();
    const content = String(body.body || '').trim();
    const category = String(body.category || '').trim();
    const campus = String(body.campus || '').trim();
    const rawTags = Array.isArray(body.tags) ? body.tags : [];
    const tags = [...new Set(rawTags.filter((t) => VALID_TAGS.has(t)))].slice(0, 5);

    if (!title || title.length > 80) return sendJson(res, 400, { error: '标题需为 1–80 字。' });
    if (!content || content.length > 3000) return sendJson(res, 400, { error: '正文需为 1–3000 字。' });
    if (!VALID_CATEGORIES.has(category)) return sendJson(res, 400, { error: '无效的版块。' });
    if (!VALID_CAMPUSES.has(campus)) return sendJson(res, 400, { error: '无效的校区。' });

    const blocked = checkContentCompliance(title, content, body.reward);
    if (blocked) return sendJson(res, 400, { error: blocked });

    const savedImages = saveUploadedImages(body.images);
    const now = Date.now();
    const id = `t-${now}-${crypto.randomBytes(3).toString('hex')}`;
    const isHelp = category === 'help';
    const reward = isHelp ? String(body.reward || '').trim().slice(0, 24) || null : null;
    const contact = isHelp ? String(body.contact || '').trim().slice(0, 60) || null : null;
    const ttlHours = isHelp ? Number(body.ttl || 0) : 0;
    const expiresAt = isHelp && ttlHours > 0 && ttlHours <= 720 ? now + ttlHours * 3600 * 1000 : null;
    const status = isHelp ? 'open' : null;

    db.prepare(`
      INSERT INTO topics (
        id, title, body, category, campus, tags_json, status, reward, expires_at,
        contact, images_json, author_id, views, accepted_reply_id, pinned, created_at, updated_at, last_activity_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, 0, ?, NULL, ?)
    `).run(
      id, title, content, category, campus, JSON.stringify(tags), status, reward, expiresAt,
      contact, JSON.stringify(savedImages), user.id, now, now
    );

    return sendJson(res, 201, { id });
  }

  // Topic detail & actions: /api/topics/:id/...
  const topicMatch = pathname.match(/^\/api\/topics\/([a-zA-Z0-9-]+)(?:\/(replies|status|accept|pin))?$/);
  if (topicMatch) {
    const [, topicId, sub] = topicMatch;
    const topicRow = db.prepare(`
      SELECT t.*, u.nickname AS author_nickname, u.color AS author_color
      FROM topics t
      JOIN users u ON u.id = t.author_id
      WHERE t.id = ?
    `).get(topicId);

    if (!topicRow) return sendJson(res, 404, { error: '帖子不存在或已被删除。' });

    if (method === 'GET' && !sub) {
      db.prepare('UPDATE topics SET views = views + 1 WHERE id = ?').run(topicId);
      topicRow.views += 1;
      const replies = db.prepare(`
        SELECT r.id, r.topic_id, r.author_id, r.body, r.created_at, u.nickname AS author_nickname, u.color AS author_color
        FROM replies r
        JOIN users u ON u.id = r.author_id
        WHERE r.topic_id = ?
        ORDER BY r.created_at ASC
      `).all(topicId);
      return sendJson(res, 200, { topic: formatTopicDetail(topicRow, replies, user, Date.now()) });
    }

    // PATCH /api/topics/:id (edit topic)
    if (method === 'PATCH' && !sub) {
      if (!user) return sendJson(res, 401, { error: '请先登录。' });
      if (user.role !== 'admin' && user.id !== topicRow.author_id) {
        return sendJson(res, 403, { error: '只有楼主或管理员可以编辑该帖子。' });
      }
      const body = await readJsonBody(req);
      const title = String(body.title || '').trim();
      const content = String(body.body || '').trim();
      const category = String(body.category || topicRow.category).trim();
      const campus = String(body.campus || topicRow.campus).trim();
      const rawTags = Array.isArray(body.tags) ? body.tags : [];
      const tags = [...new Set(rawTags.filter((t) => VALID_TAGS.has(t)))].slice(0, 5);

      if (!title || title.length > 80) return sendJson(res, 400, { error: '标题需为 1–80 字。' });
      if (!content || content.length > 3000) return sendJson(res, 400, { error: '正文需为 1–3000 字。' });
      if (!VALID_CATEGORIES.has(category)) return sendJson(res, 400, { error: '无效的版块。' });
      if (!VALID_CAMPUSES.has(campus)) return sendJson(res, 400, { error: '无效的校区。' });

      const blocked = checkContentCompliance(title, content, body.reward);
      if (blocked) return sendJson(res, 400, { error: blocked });

      const existingImages = safeParseArray(topicRow.images_json);
      const nextImages = Array.isArray(body.images)
        ? saveUploadedImages(body.images, existingImages)
        : existingImages;

      const isHelp = category === 'help';
      const reward = isHelp ? String(body.reward || '').trim().slice(0, 24) || null : null;
      const contact = isHelp ? String(body.contact || '').trim().slice(0, 60) || null : null;
      const status = isHelp ? (topicRow.status || 'open') : null;
      let expiresAt = isHelp ? topicRow.expires_at : null;
      if (isHelp && body.ttl !== undefined && body.ttl !== '') {
        const ttlHours = Number(body.ttl);
        expiresAt = ttlHours > 0 && ttlHours <= 720 ? Date.now() + ttlHours * 3600 * 1000 : null;
      }

      db.prepare(`
        UPDATE topics
        SET title = ?, body = ?, category = ?, campus = ?, tags_json = ?,
            status = ?, reward = ?, expires_at = ?, contact = ?, images_json = ?, updated_at = ?
        WHERE id = ?
      `).run(
        title, content, category, campus, JSON.stringify(tags),
        status, reward, expiresAt, contact, JSON.stringify(nextImages), Date.now(), topicId
      );
      return sendJson(res, 200, { id: topicId });
    }

    if (method === 'POST' && sub === 'replies') {
      if (!user) return sendJson(res, 401, { error: '请先登录或完成校内验证后再回复。' });
      if (!checkRateLimit(`reply:${user.id}`, 20, 10 * 60 * 1000)) {
        return sendJson(res, 429, { error: '回复太频繁了，请稍后再试。' });
      }
      const body = await readJsonBody(req);
      const content = String(body.body || '').trim();
      if (!content || content.length > 1000) return sendJson(res, 400, { error: '回复内容需为 1–1000 字。' });
      const blocked = checkContentCompliance(content);
      if (blocked) return sendJson(res, 400, { error: blocked });

      const now = Date.now();
      const replyId = `r-${now}-${crypto.randomBytes(3).toString('hex')}`;
      db.prepare('INSERT INTO replies (id, topic_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(replyId, topicId, user.id, content, now);
      db.prepare('UPDATE topics SET last_activity_at = ? WHERE id = ?').run(now, topicId);

      createNotification(
        topicRow.author_id, user.id, 'reply', topicId, replyId,
        `${user.nickname} 回复了你的帖子「${topicRow.title.slice(0, 24)}」`
      );
      return sendJson(res, 201, { id: replyId });
    }

    if (method === 'PATCH' && sub === 'status') {
      if (!user) return sendJson(res, 401, { error: '请先登录。' });
      if (user.role !== 'admin' && user.id !== topicRow.author_id) {
        return sendJson(res, 403, { error: '只有发帖本人或管理员可以修改互助状态。' });
      }
      if (topicRow.category !== 'help') {
        return sendJson(res, 400, { error: '只有校园互助帖支持状态切换。' });
      }
      const body = await readJsonBody(req);
      const nextStatus = body.status === 'closed' ? 'closed' : 'open';
      db.prepare('UPDATE topics SET status = ? WHERE id = ?').run(nextStatus, topicId);
      return sendJson(res, 200, { status: nextStatus });
    }

    if (method === 'POST' && sub === 'accept') {
      if (!user) return sendJson(res, 401, { error: '请先登录。' });
      if (user.role !== 'admin' && user.id !== topicRow.author_id) {
        return sendJson(res, 403, { error: '只有楼主或管理员可以采纳答案。' });
      }
      const body = await readJsonBody(req);
      const replyId = body.replyId ? String(body.replyId) : null;
      let replyRow = null;
      if (replyId) {
        replyRow = db.prepare('SELECT id, author_id FROM replies WHERE id = ? AND topic_id = ?').get(replyId, topicId);
        if (!replyRow) return sendJson(res, 404, { error: '该回复不存在。' });
      }
      const nextAccepted = topicRow.accepted_reply_id === replyId ? null : replyId;
      db.prepare('UPDATE topics SET accepted_reply_id = ? WHERE id = ?').run(nextAccepted, topicId);
      if (nextAccepted && replyRow) {
        createNotification(
          replyRow.author_id, user.id, 'accept', topicId, replyRow.id,
          `${user.nickname} 采纳了你在「${topicRow.title.slice(0, 22)}」下的回答`
        );
      }
      return sendJson(res, 200, { accepted: nextAccepted });
    }

    if (method === 'PATCH' && sub === 'pin') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: '仅管理员可置顶或取消置顶。' });
      const nextPinned = topicRow.pinned ? 0 : 1;
      db.prepare('UPDATE topics SET pinned = ? WHERE id = ?').run(nextPinned, topicId);
      return sendJson(res, 200, { pinned: Boolean(nextPinned) });
    }

    if (method === 'DELETE' && !sub) {
      if (!user) return sendJson(res, 401, { error: '请先登录。' });
      if (user.role !== 'admin' && user.id !== topicRow.author_id) {
        return sendJson(res, 403, { error: '没有权限删除该帖子。' });
      }
      db.prepare('DELETE FROM topics WHERE id = ?').run(topicId);
      db.prepare("DELETE FROM likes WHERE target_type = 'topic' AND target_id = ?").run(topicId);
      return sendJson(res, 200, { ok: true });
    }
  }

  const replyMatch = pathname.match(/^\/api\/replies\/([a-zA-Z0-9-]+)$/);
  if (method === 'DELETE' && replyMatch) {
    if (!user) return sendJson(res, 401, { error: '请先登录。' });
    const replyId = replyMatch[1];
    const replyRow = db.prepare('SELECT id, topic_id, author_id FROM replies WHERE id = ?').get(replyId);
    if (!replyRow) return sendJson(res, 404, { error: '回复不存在。' });
    if (user.role !== 'admin' && user.id !== replyRow.author_id) {
      return sendJson(res, 403, { error: '没有权限删除该回复。' });
    }
    db.prepare('DELETE FROM replies WHERE id = ?').run(replyId);
    db.prepare("DELETE FROM likes WHERE target_type = 'reply' AND target_id = ?").run(replyId);
    db.prepare('UPDATE topics SET accepted_reply_id = NULL WHERE id = ? AND accepted_reply_id = ?').run(replyRow.topic_id, replyId);
    return sendJson(res, 200, { ok: true });
  }

  if (pathname === '/api/admin/questions') {
    if (!user || user.role !== 'admin') return sendJson(res, 403, { error: '仅管理员可管理校内验证题库。' });
    if (method === 'GET') {
      const rows = db.prepare('SELECT id, question, answers_json, active, created_at FROM verify_questions ORDER BY id ASC').all();
      return sendJson(res, 200, {
        questions: rows.map((r) => ({ id: r.id, question: r.question, answers: safeParseArray(r.answers_json), active: Boolean(r.active) })),
      });
    }
    if (method === 'POST') {
      const body = await readJsonBody(req);
      const question = String(body.question || '').trim();
      const rawAnswers = Array.isArray(body.answers)
        ? body.answers
        : String(body.answers || '').split(/[，,、/\n]+/);
      const answers = [...new Set(rawAnswers.map((s) => String(s).trim()).filter(Boolean))];
      if (!question || question.length > 100) return sendJson(res, 400, { error: '请填写 1–100 字的验证题。' });
      if (!answers.length) return sendJson(res, 400, { error: '请至少填写一个正确答案。' });
      const resInsert = db.prepare(
        'INSERT INTO verify_questions (question, answers_json, active, created_at) VALUES (?, ?, 1, ?)'
      ).run(question, JSON.stringify(answers), Date.now());
      return sendJson(res, 201, { id: Number(resInsert.lastInsertRowid), question, answers });
    }
  }

  const qDelMatch = pathname.match(/^\/api\/admin\/questions\/(\d+)$/);
  if (method === 'DELETE' && qDelMatch) {
    if (!user || user.role !== 'admin') return sendJson(res, 403, { error: '仅管理员可操作。' });
    const activeCount = db.prepare('SELECT COUNT(*) AS count FROM verify_questions WHERE active = 1').get().count;
    if (activeCount <= 1) return sendJson(res, 400, { error: '至少需要保留 1 道校内验证题。' });
    db.prepare('DELETE FROM verify_questions WHERE id = ?').run(Number(qDelMatch[1]));
    return sendJson(res, 200, { ok: true });
  }

  return sendJson(res, 404, { error: '接口不存在。' });
}

const server = http.createServer(async (req, res) => {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = urlObj.pathname;

    if (pathname.startsWith('/api/')) {
      return await handleApi(req, res, urlObj);
    }

    if (pathname.startsWith('/uploads/')) {
      const fileName = pathname.slice('/uploads/'.length);
      return serveStaticFile(res, UPLOADS_DIR, fileName);
    }

    if (pathname === '/' || pathname === '/index.html') {
      return serveStaticFile(res, DIST_DIR, 'index.html');
    }

    const rel = pathname.startsWith('/dist/') ? pathname.slice('/dist/'.length) : pathname.slice(1);
    return serveStaticFile(res, DIST_DIR, rel);
  } catch (err) {
    const status = err?.status || 500;
    if (status >= 500) console.error('[Server Error]', err);
    if (!res.headersSent) {
      sendJson(res, status, { error: status >= 500 ? '服务器开小差了，请稍后再试。' : err.message });
    }
  }
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`重电校园站服务已启动: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  });
}

module.exports = { server, db };
