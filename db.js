'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'campus.db');

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  const [salt, keyHex] = String(stored || '').split(':');
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

function ensureColumn(db, table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function initDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      nickname TEXT NOT NULL,
      campus TEXT NOT NULL DEFAULT '大学城',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      color TEXT NOT NULL DEFAULT 'violet',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT NOT NULL,
      campus TEXT NOT NULL,
      tags_json TEXT NOT NULL DEFAULT '[]',
      status TEXT,
      reward TEXT,
      expires_at INTEGER,
      contact TEXT,
      images_json TEXT NOT NULL DEFAULT '[]',
      author_id INTEGER NOT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      accepted_reply_id TEXT,
      pinned INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER,
      last_activity_at INTEGER NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS replies (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS verify_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answers_json TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS likes (
      user_id INTEGER NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, target_type, target_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      actor_id INTEGER NOT NULL,
      topic_id TEXT,
      reply_id TEXT,
      message TEXT NOT NULL,
      read_at INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id TEXT NOT NULL,
      reporter_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      detail TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_topics_activity ON topics(pinned DESC, last_activity_at DESC);
    CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
    CREATE INDEX IF NOT EXISTS idx_replies_topic ON replies(topic_id, created_at ASC);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);
  `);

  // Safe migration for existing SQLite databases created before Phase 2.5
  ensureColumn(db, 'topics', 'updated_at', 'INTEGER');

  seedInitialData(db);
  return db;
}

function seedInitialData(db) {
  const now = Date.now();
  const HOUR = 3600 * 1000;
  const DAY = 24 * HOUR;

  const qCount = db.prepare('SELECT COUNT(*) AS count FROM verify_questions').get().count;
  if (qCount === 0) {
    db.prepare(
      'INSERT INTO verify_questions (question, answers_json, active, created_at) VALUES (?, ?, 1, ?)'
    ).run('我们学校的别名是啥？', JSON.stringify(['电子校']), now);
  }

  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (userCount > 0) return;

  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'cquet2026';
  const adminNickname = (process.env.ADMIN_NICKNAME || '校园站').trim();

  const insertUser = db.prepare(
    'INSERT INTO users (username, nickname, campus, password_hash, role, color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const adminId = Number(
    insertUser.run(adminUsername, adminNickname, '大学城', hashPassword(adminPassword), 'admin', 'violet', now - 120 * DAY).lastInsertRowid
  );

  const demoPass = hashPassword(crypto.randomBytes(16).toString('hex'));
  const uid = {
    admin: adminId,
    chen: Number(insertUser.run('demo_chen', '小陈', '大学城', demoPass, 'user', 'green', now - 30 * DAY).lastInsertRowid),
    zhou: Number(insertUser.run('demo_zhou', '周同学', '永川', demoPass, 'user', 'blue', now - 28 * DAY).lastInsertRowid),
    song: Number(insertUser.run('demo_song', '宋同学', '两江', demoPass, 'user', 'gold', now - 25 * DAY).lastInsertRowid),
    lin: Number(insertUser.run('demo_lin', '林同学', '大学城', demoPass, 'user', 'violet', now - 20 * DAY).lastInsertRowid),
    xu: Number(insertUser.run('demo_xu', '许同学', '大学城', demoPass, 'user', 'rose', now - 18 * DAY).lastInsertRowid),
    luo: Number(insertUser.run('demo_luo', '罗同学', '两江', demoPass, 'user', 'blue', now - 15 * DAY).lastInsertRowid),
  };

  const insertTopic = db.prepare(`
    INSERT INTO topics (
      id, title, body, category, campus, tags_json, status, reward, expires_at,
      contact, images_json, author_id, views, accepted_reply_id, pinned, created_at, updated_at, last_activity_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)
  `);

  const insertReply = db.prepare(
    'INSERT INTO replies (id, topic_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)'
  );

  const initialTopics = [
    {
      id: 'welcome',
      title: '第一次来重电校园站？看看这份社区发帖与互助指南',
      body: '1. 提问与经验分享：写清楚校区、你想解决的问题和已经试过的方法。\n2. 校园互助（跑腿代取、二手、拼车、失物招领）：请填好有效期和独立联系方式，完成后点「标记为已完成」，联系方式会在服务器端自动隐藏。\n3. 社区边界：严禁发布代课、代做作业、刷课或任何违规广告信息。\n\n欢迎把常见实训经验、选课避坑和校园互助都沉淀在这里！',
      category: 'notice',
      campus: '全校',
      tags: ['guide'],
      authorId: uid.admin,
      views: 108,
      pinned: 1,
      createdAt: now - 30 * DAY,
      replies: [],
    },
    {
      id: 'errand-parcel',
      title: '【跑腿代取】大学城菜鸟驿站帮拿一个小件快递到 6 栋楼下',
      body: '下午有实训课走不开，一个很轻的小包裹在菜鸟驿站，希望 18:00 前帮忙顺路带到 6 栋楼下，到了发消息我马上下楼拿。',
      category: 'help',
      campus: '大学城',
      tags: ['errand'],
      status: 'open',
      reward: '5 元',
      expiresAt: now + 6 * HOUR,
      contact: 'QQ 284910372（备注代拿快递）',
      authorId: uid.lin,
      views: 34,
      createdAt: now - 25 * 60 * 1000,
      replies: [
        { id: 'rh1', authorId: uid.chen, createdAt: now - 12 * 60 * 1000, body: '我五点半刚好路过驿站，没找到人的话我加你。' },
      ],
    },
    {
      id: 'market-stm32',
      title: '【二手闲置】出九成新 STM32F103 核心板 + ST-Link 套件',
      body: '上学期实训用完闲置了，带杜邦线和下载器，功能完好可当面测试。永川校区图书馆或食堂门口自提。',
      category: 'help',
      campus: '永川',
      tags: ['market', 'project'],
      status: 'open',
      reward: '¥35',
      expiresAt: now + 3 * DAY,
      contact: '微信 cqetc_demo_02（永川自提）',
      authorId: uid.zhou,
      views: 68,
      createdAt: now - 3 * HOUR,
      replies: [],
    },
    {
      id: 'stm32',
      title: '第一次做 STM32 实训，板子和下载器怎么选？',
      body: '下周要做 STM32 实训，想先在宿舍把环境跑起来。手里还没有开发板和下载器，买之前主要应该核对哪些信息？',
      category: 'study',
      campus: '大学城',
      tags: ['question', 'project'],
      authorId: uid.chen,
      views: 126,
      accepted: 'r1',
      createdAt: now - 16 * DAY,
      replies: [
        { id: 'r1', authorId: uid.zhou, createdAt: now - 16 * DAY + 22 * 60 * 1000, body: '先确认老师的例程用的是哪一个芯片型号，以及板上有没有自带调试器。如果没有，再确认板上是否引出了 SWD 接口。收到板子后，先把官方例程编译并下载进去，用点灯验证工具链，然后再接外设。' },
        { id: 'r2', authorId: uid.chen, createdAt: now - 16 * DAY + 35 * 60 * 1000, body: '明白了，我先找老师确认芯片型号，再看板子的接口。谢谢！' },
      ],
    },
    {
      id: 'carpool-closed',
      title: '【拼车】周五下午大学城到重庆西站，还差 2 个人',
      body: '周五 16:30 南门出发去重庆西站，已找到两位同学拼车。',
      category: 'help',
      campus: '大学城',
      tags: ['team'],
      status: 'closed',
      reward: 'AA 约 15 元',
      expiresAt: now - 2 * DAY,
      contact: '微信 demo_closed_hidden',
      authorId: uid.xu,
      views: 91,
      createdAt: now - 3 * DAY,
      replies: [
        { id: 'rh2', authorId: uid.xu, createdAt: now - 2 * DAY - 2 * HOUR, body: '人已拼齐，结贴啦！' },
      ],
    },
    {
      id: 'lost-umbrella',
      title: '【失物招领】两江二教 304 捡到一把黑色折叠伞',
      body: '晚自习结束在二教 304 后排看到的，暂时放在楼管阿姨那里，失主记得去认领。',
      category: 'help',
      campus: '两江',
      tags: ['lost'],
      status: 'open',
      expiresAt: now - 18 * HOUR,
      contact: 'QQ 99182736',
      authorId: uid.luo,
      views: 49,
      createdAt: now - 5 * DAY,
      replies: [],
    },
    {
      id: 'internship',
      title: '第一份实习复盘：我怎么整理简历里的项目经历',
      body: '最开始，我的简历只列了项目用过的软件。后来我把每段项目经历改成三句话：做了什么、我负责哪部分、怎么确认它能用。\n\n对一个课程小项目，我附上自己写的说明文档和一张结果截图，面试时就有具体东西可以讲。大家也可以分享自己的改法。',
      category: 'career',
      campus: '两江',
      tags: ['notes', 'internship'],
      authorId: uid.song,
      views: 212,
      createdAt: now - 14 * DAY,
      replies: [
        { id: 'r3', authorId: uid.lin, createdAt: now - 14 * DAY + 45 * 60 * 1000, body: '团队项目也适用，最好说清自己负责的模块和遇到的一个具体问题。' },
      ],
    },
    {
      id: 'competition',
      title: '电子设计竞赛想找队友，有人愿意一起从基础练起吗？',
      body: '我有一点 C 语言基础，周末想和同校区同学一起做一个小项目。可以先从传感器采样和串口输出开始，一起画个分工表。想加入的同学可以回复自己擅长什么、方便的时间。',
      category: 'career',
      campus: '永川',
      tags: ['team', 'project'],
      authorId: uid.lin,
      views: 74,
      createdAt: now - 12 * DAY,
      replies: [],
    },
    {
      id: 'library',
      title: '周末想找个能插电脑的自习位置，大家一般去哪？',
      body: '带电脑做课程项目，希望是能找到插座、可以坐一会儿的地方。有没有同学分享最近的体验？也想了解一下周末开放时间去哪里确认。',
      category: 'life',
      campus: '大学城',
      tags: ['question', 'guide'],
      authorId: uid.xu,
      views: 58,
      createdAt: now - 10 * DAY,
      replies: [],
    },
    {
      id: 'lab-notes',
      title: '我怎么写实验记录，复现时才不用从头再试',
      body: '每次实验我会记录四项：软件版本、输入条件、实际结果、下一次要验证的变化。调试时一次只改一处，这样即使实验没成功，也能判断哪一步出了问题。\n\n如果发给同学，记得附上能复现的最小例子，并说明依赖和数据从哪里来。',
      category: 'study',
      campus: '两江',
      tags: ['notes', 'project'],
      authorId: uid.zhou,
      views: 93,
      createdAt: now - 9 * DAY,
      replies: [
        { id: 'r4', authorId: uid.xu, createdAt: now - 9 * DAY + 100 * 60 * 1000, body: '记版本特别有用，同一个工程换电脑后遇到过好几次环境差异。' },
      ],
    },
  ];

  for (const t of initialTopics) {
    const lastActivity = t.replies.length ? t.replies[t.replies.length - 1].createdAt : t.createdAt;
    insertTopic.run(
      t.id, t.title, t.body, t.category, t.campus, JSON.stringify(t.tags || []),
      t.status || null, t.reward || null, t.expiresAt || null, t.contact || null,
      '[]', t.authorId, t.views || 0, t.accepted || null, t.pinned ? 1 : 0, t.createdAt, lastActivity
    );
    for (const r of t.replies) {
      insertReply.run(r.id, t.id, r.authorId, r.body, r.createdAt);
    }
  }
}

module.exports = {
  initDb,
  hashPassword,
  verifyPassword,
  DB_PATH,
};
