'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL } = require('node:url');
const { initDb, hashPassword, verifyPassword } = require('./db');

// Load optional .env file (without external dependencies)
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

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
};

const db = initDb();

// Lightweight in-memory rate limiter
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

// Cleanup expired sessions & rate buckets periodically
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
    SELECT u.id, u.username, u.nickname, u.campus, u.role, u.color, s.expires_at
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
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return '.jpg';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return '.png';
  // GIF: GIF87a / GIF89a
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return '.gif';
  // WebP: RIFF....WEBP
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return '.webp';
  return null;
}

function saveUploadedImages(images) {
  if (!Array.isArray(images) || images.length === 0) return [];
  if (images.length > MAX_IMAGES_PER_POST) {
    throw Object.assign(new Error(`每个帖子最多上传 ${MAX_IMAGES_PER_POST} 张图片。`), { status: 400 });
  }
  const savedUrls = [];
  for (const item of images) {
    if (typeof item !== 'string') continue;
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

function formatTopicListItem(row, replies, now) {
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
  // 服务端强校验：仅当互助帖处于“进行中”且当前用户已登录时才返回真实联系方式
  const contact = (row.category === 'help' && status === 'open' && currentUser && hasContact)
    ? row.contact
    : null;

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
    images: safeParseArray(row.images_json),
    pinned: Boolean(row.pinned),
    accepted: row.accepted_reply_id || null,
    author: row.author_nickname,
    authorId: row.author_id,
    initial: row.author_nickname.slice(0, 1),
    color: row.author_color,
    views: row.views,
    createdAt: row.created_at,
    lastActivityAt: row.last_activity_at,
    canManage: Boolean(currentUser && (currentUser.role === 'admin' || currentUser.id === row.author_id)),
    canPin: Boolean(currentUser && currentUser.role === 'admin'),
    replies: replies.map((r) => ({
      id: r.id,
      body: r.body,
      author: r.author_nickname,
      authorId: r.author_id,
      initial: r.author_nickname.slice(0, 1),
      color: r.author_color,
      createdAt: r.created_at,
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

  // GET /api/health
  if (method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, mode: 'server' });
  }

  // GET /api/bootstrap
  if (method === 'GET' && pathname === '/api/bootstrap') {
    const question = getRandomVerifyQuestion();
    return sendJson(res, 200, {
      mode: 'server',
      user,
      verifyQuestion: question,
    });
  }

  // GET /api/verify-question
  if (method === 'GET' && pathname === '/api/verify-question') {
    return sendJson(res, 200, { verifyQuestion: getRandomVerifyQuestion() });
  }

  // POST /api/auth/register
  if (method === 'POST' && pathname === '/api/auth/register') {
    if (!checkRateLimit(`reg:${ip}`, 15, 10 * 60 * 1000)) {
      return sendJson(res, 429, { error: '操作太频繁，请稍后再试。' });
    }
    const body = await readJsonBody(req);
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const nickname = String(body.nickname || '').trim();
    const campus = String(body.campus || '大学城').trim();
    const questionId = Number(body.questionId);
    const answer = String(body.answer || '').trim();

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return sendJson(res, 400, { error: '账号需为 3–20 位字母、数字或下划线。' });
    }
    if (password.length < 6 || password.length > 64) {
      return sendJson(res, 400, { error: '密码长度需在 6–64 位之间。' });
    }
    if (!nickname || nickname.length > 16) {
      return sendJson(res, 400, { error: '请填写 1–16 字的昵称。' });
    }
    if (!VALID_CAMPUSES.has(campus) || campus === '全校') {
      return sendJson(res, 400, { error: '请选择有效校区。' });
    }

    const qRow = db.prepare('SELECT id, question, answers_json FROM verify_questions WHERE id = ? AND active = 1').get(questionId);
    if (!qRow) {
      return sendJson(res, 400, { error: '验证题已失效，请刷新后重试。' });
    }
    const validAnswers = safeParseArray(qRow.answers_json).map((a) => String(a).trim().toLowerCase());
    if (!validAnswers.includes(answer.toLowerCase())) {
      return sendJson(res, 400, { error: '校内验证题答案不对哦，再想想重电同学都知道的简称！' });
    }

    const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (exists) {
      return sendJson(res, 409, { error: '该账号已被注册，请换一个或直接登录。' });
    }

    const color = AVATAR_COLORS[nickname.charCodeAt(0) % AVATAR_COLORS.length];
    const now = Date.now();
    const result = db.prepare(
      'INSERT INTO users (username, nickname, campus, password_hash, role, color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(username, nickname, campus, hashPassword(password), 'user', color, now);

    const newUserId = Number(result.lastInsertRowid);
    createSession(res, newUserId);
    return sendJson(res, 201, {
      user: { id: newUserId, username, nickname, initial: nickname.slice(0, 1), campus, role: 'user', color },
    });
  }

  // POST /api/auth/login
  if (method === 'POST' && pathname === '/api/auth/login') {
    if (!checkRateLimit(`login:${ip}`, 20, 10 * 60 * 1000)) {
      return sendJson(res, 429, { error: '登录尝试过于频繁，请 10 分钟后再试。' });
    }
    const body = await readJsonBody(req);
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const row = db.prepare('SELECT id, username, nickname, campus, password_hash, role, color FROM users WHERE username = ?').get(username);
    if (!row || !verifyPassword(password, row.password_hash)) {
      return sendJson(res, 401, { error: '账号或密码错误。' });
    }
    createSession(res, row.id);
    return sendJson(res, 200, {
      user: {
        id: row.id,
        username: row.username,
        nickname: row.nickname,
        initial: row.nickname.slice(0, 1),
        campus: row.campus,
        role: row.role,
        color: row.color,
      },
    });
  }

  // POST /api/auth/logout
  if (method === 'POST' && pathname === '/api/auth/logout') {
    const token = parseCookies(req)[SESSION_COOKIE];
    if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    setSessionCookie(res, '', 0);
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

    const TAG_LABELS = {
      errand: '跑腿代取', market: '二手闲置', lost: '失物招领',
      question: '求助', notes: '经验分享', project: '项目实践',
      team: '组队/搭子', internship: '实习', guide: '攻略',
    };
    const CAT_LABELS = {
      help: '校园互助', study: '课程与实训', career: '实习与竞赛', life: '校园生活', notice: '站务与指南',
    };

    let filtered = rows.filter((row) => {
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
          row.title,
          row.body,
          row.reward || '',
          row.author_nickname,
          row.campus,
          CAT_LABELS[row.category] || '',
          ...tTags.map((id) => TAG_LABELS[id] || id),
          ...tReplies.map((r) => r.body),
        ].join(' ').toLowerCase();
        if (!words.every((w) => haystack.includes(w))) return false;
      }
      return true;
    });

    if (tab === 'popular') {
      filtered.sort((a, b) => (b.pinned - a.pinned) || (b.views - a.views) || (b.last_activity_at - a.last_activity_at));
    } else {
      filtered.sort((a, b) => (b.pinned - a.pinned) || (b.last_activity_at - a.last_activity_at));
    }

    const items = filtered.map((row) => formatTopicListItem(row, repliesByTopic.get(row.id) || [], now));
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
        contact, images_json, author_id, views, accepted_reply_id, pinned, created_at, last_activity_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, 0, ?, ?)
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

    // GET /api/topics/:id
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

    // POST /api/topics/:id/replies
    if (method === 'POST' && sub === 'replies') {
      if (!user) return sendJson(res, 401, { error: '请先登录或完成校内验证后再回复。' });
      if (!checkRateLimit(`reply:${user.id}`, 20, 10 * 60 * 1000)) {
        return sendJson(res, 429, { error: '回复太频繁了，请稍后再试。' });
      }
      const body = await readJsonBody(req);
      const content = String(body.body || '').trim();
      if (!content || content.length > 1000) return sendJson(res, 400, { error: '回复内容需为 1–1000 字。' });
      const now = Date.now();
      const replyId = `r-${now}-${crypto.randomBytes(3).toString('hex')}`;
      db.prepare('INSERT INTO replies (id, topic_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(replyId, topicId, user.id, content, now);
      db.prepare('UPDATE topics SET last_activity_at = ? WHERE id = ?').run(now, topicId);
      return sendJson(res, 201, { id: replyId });
    }

    // PATCH /api/topics/:id/status
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

    // POST /api/topics/:id/accept
    if (method === 'POST' && sub === 'accept') {
      if (!user) return sendJson(res, 401, { error: '请先登录。' });
      if (user.role !== 'admin' && user.id !== topicRow.author_id) {
        return sendJson(res, 403, { error: '只有楼主或管理员可以采纳答案。' });
      }
      const body = await readJsonBody(req);
      const replyId = body.replyId ? String(body.replyId) : null;
      if (replyId) {
        const exists = db.prepare('SELECT id FROM replies WHERE id = ? AND topic_id = ?').get(replyId, topicId);
        if (!exists) return sendJson(res, 404, { error: '该回复不存在。' });
      }
      const nextAccepted = topicRow.accepted_reply_id === replyId ? null : replyId;
      db.prepare('UPDATE topics SET accepted_reply_id = ? WHERE id = ?').run(nextAccepted, topicId);
      return sendJson(res, 200, { accepted: nextAccepted });
    }

    // PATCH /api/topics/:id/pin
    if (method === 'PATCH' && sub === 'pin') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: '仅管理员可置顶或取消置顶。' });
      const nextPinned = topicRow.pinned ? 0 : 1;
      db.prepare('UPDATE topics SET pinned = ? WHERE id = ?').run(nextPinned, topicId);
      return sendJson(res, 200, { pinned: Boolean(nextPinned) });
    }

    // DELETE /api/topics/:id
    if (method === 'DELETE' && !sub) {
      if (!user) return sendJson(res, 401, { error: '请先登录。' });
      if (user.role !== 'admin' && user.id !== topicRow.author_id) {
        return sendJson(res, 403, { error: '没有权限删除该帖子。' });
      }
      db.prepare('DELETE FROM topics WHERE id = ?').run(topicId);
      return sendJson(res, 200, { ok: true });
    }
  }

  // DELETE /api/replies/:id
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
    db.prepare('UPDATE topics SET accepted_reply_id = NULL WHERE id = ? AND accepted_reply_id = ?').run(replyRow.topic_id, replyId);
    return sendJson(res, 200, { ok: true });
  }

  // Admin: manage campus verification question bank
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
