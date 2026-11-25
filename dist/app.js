'use strict';

const categories = [
  { id: 'all', name: '全部讨论', icon: 'home' },
  { id: 'help', name: '校园互助', icon: 'assist' },
  { id: 'study', name: '课程与实训', icon: 'book' },
  { id: 'career', name: '实习与竞赛', icon: 'briefcase' },
  { id: 'life', name: '校园生活', icon: 'leaf' },
  { id: 'notice', name: '站务与指南', icon: 'megaphone' },
];
const campuses = [
  { id: 'all', name: '全部校区', icon: 'map' },
  { id: '大学城', name: '大学城', icon: 'pin' },
  { id: '永川', name: '永川', icon: 'flag' },
  { id: '两江', name: '两江', icon: 'waves' },
];
const tags = [
  { id: 'errand', name: '跑腿代取', icon: 'package' },
  { id: 'market', name: '二手闲置', icon: 'bag' },
  { id: 'lost', name: '失物招领', icon: 'key' },
  { id: 'question', name: '求助', icon: 'help' },
  { id: 'notes', name: '经验分享', icon: 'notes' },
  { id: 'project', name: '项目实践', icon: 'chip' },
  { id: 'team', name: '组队/搭子', icon: 'team' },
  { id: 'internship', name: '实习', icon: 'id-card' },
  { id: 'guide', name: '攻略', icon: 'compass' },
];
const tabs = [
  { id: 'latest', name: '最新' },
  { id: 'popular', name: '热门' },
  { id: 'unanswered', name: '待回答' },
];

const demoVerifyQuestions = [
  { id: 1, question: '我们学校的别名是啥？', answers: ['电子校'] },
];

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
const bootNow = Date.now();

const seed = [
  {
    id: 'welcome',
    title: '第一次来重电校园站？看看这份社区发帖与互助指南',
    category: 'notice',
    tags: ['guide'],
    campus: '全校',
    pinned: true,
    author: '校园站',
    initial: '校',
    color: 'violet',
    createdAt: Date.parse('2026-06-12T09:00:00+08:00'),
    views: 108,
    body: '1. 提问与经验分享：写清楚校区、你想解决的问题和已经试过的方法。\n2. 校园互助（跑腿代取、二手、拼车、失物招领）：请填好有效期和独立联系方式，完成后点「标记为已完成」，联系方式会自动隐藏。\n3. 社区边界：请勿发布代课、代做作业、刷课或任何违规广告信息。\n\n当前为离线演示模式，试发内容保存在当前浏览器。',
    replies: [],
  },
  {
    id: 'errand-parcel',
    title: '【跑腿代取】大学城菜鸟驿站帮拿一个小件快递到 6 栋楼下',
    category: 'help',
    tags: ['errand'],
    campus: '大学城',
    status: 'open',
    reward: '5 元',
    expiresAt: bootNow + 4 * HOUR,
    contact: 'QQ 284910372（备注代拿快递）',
    author: '林同学',
    initial: '林',
    color: 'violet',
    createdAt: bootNow - 25 * 60 * 1000,
    views: 34,
    body: '下午有实训课走不开，一个很轻的小包裹在菜鸟驿站，希望 18:00 前帮忙顺路带到 6 栋楼下，到了发消息我马上下楼拿。',
    replies: [
      { id: 'rh1', author: '小陈', initial: '陈', color: 'green', createdAt: bootNow - 12 * 60 * 1000, body: '我五点半刚好路过驿站，没找到人的话我加你。' },
    ],
  },
  {
    id: 'market-stm32',
    title: '【二手闲置】出九成新 STM32F103 核心板 + ST-Link 套件',
    category: 'help',
    tags: ['market', 'project'],
    campus: '永川',
    status: 'open',
    reward: '¥35',
    expiresAt: bootNow + 3 * DAY,
    contact: '微信 cqetc_demo_02（永川自提）',
    author: '周同学',
    initial: '周',
    color: 'blue',
    createdAt: bootNow - 3 * HOUR,
    views: 68,
    body: '上学期实训用完闲置了，带杜邦线和下载器，功能完好可当面测试。永川校区图书馆或食堂门口自提。',
    replies: [],
  },
  {
    id: 'stm32',
    title: '第一次做 STM32 实训，板子和下载器怎么选？',
    category: 'study',
    tags: ['question', 'project'],
    campus: '大学城',
    author: '小陈',
    initial: '陈',
    color: 'green',
    createdAt: Date.parse('2026-11-07T15:40:00+08:00'),
    views: 126,
    accepted: 'r1',
    body: '下周要做 STM32 实训，想先在宿舍把环境跑起来。手里还没有开发板和下载器，买之前主要应该核对哪些信息？',
    replies: [
      { id: 'r1', author: '周同学', initial: '周', color: 'blue', createdAt: Date.parse('2026-11-07T16:02:00+08:00'), body: '先确认老师的例程用的是哪一个芯片型号，以及板上有没有自带调试器。如果没有，再确认板上是否引出了 SWD 接口。收到板子后，先把官方例程编译并下载进去，用点灯验证工具链，然后再接外设。' },
      { id: 'r2', author: '小陈', initial: '陈', color: 'green', createdAt: Date.parse('2026-11-07T16:15:00+08:00'), body: '明白了，我先找老师确认芯片型号，再看板子的接口。谢谢！' },
    ],
  },
  {
    id: 'carpool-closed',
    title: '【拼车】周五下午大学城到重庆西站，还差 2 个人',
    category: 'help',
    tags: ['team'],
    campus: '大学城',
    status: 'closed',
    reward: 'AA 约 15 元',
    expiresAt: bootNow - 2 * DAY,
    contact: '微信 demo_closed_hidden',
    author: '许同学',
    initial: '许',
    color: 'rose',
    createdAt: bootNow - 3 * DAY,
    views: 91,
    body: '周五 16:30 南门出发去重庆西站，已找到两位同学拼车。',
    replies: [
      { id: 'rh2', author: '许同学', initial: '许', color: 'rose', createdAt: bootNow - 2 * DAY - 2 * HOUR, body: '人已拼齐，结贴啦！' },
    ],
  },
  {
    id: 'lost-umbrella',
    title: '【失物招领】两江二教 304 捡到一把黑色折叠伞',
    category: 'help',
    tags: ['lost'],
    campus: '两江',
    status: 'open',
    expiresAt: bootNow - 18 * HOUR,
    contact: 'QQ 99182736',
    author: '罗同学',
    initial: '罗',
    color: 'blue',
    createdAt: bootNow - 5 * DAY,
    views: 49,
    body: '晚自习结束在二教 304 后排看到的，暂时放在楼管阿姨那里，失主记得去认领。',
    replies: [],
  },
];

const $ = (selector) => document.querySelector(selector);
const query = $('#query');
const feed = $('#feed');
const topicPage = $('#topic-page');
const profilePage = $('#profile-page');
const composer = $('#composer');
const postForm = $('#post-form');
const authDialog = $('#auth-dialog');
const authForm = $('#auth-form');
const notifDialog = $('#notif-dialog');
const reportDialog = $('#report-dialog');
const reportForm = $('#report-form');
const lightbox = $('#lightbox');
const storageKey = 'cqetc-campus-demo-v2';
const fullDate = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' });
const shortDate = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' });
const filters = { category: 'all', campus: 'all', tag: 'all', tab: 'latest', query: '', activeOnly: false };

let isServerMode = false;
let emailVerifyEnabled = false;
let currentUser = null;
let currentVerifyQuestion = demoVerifyQuestions[0];
let currentCaptchaId = '';
let captchaVerifiedForSend = false;
let authTab = 'register';
let editingTopicId = null;
let reportingTopicId = null;
let pendingImages = [];
let afterAuthAction = null;
let toastTimer;
let searchDebounce;
let emailCheckTimer;
let nickCheckTimer;
let codeCooldownTimer;
let codeCooldownLeft = 0;
let availabilityState = { email: null, nickname: null };

function loadDemo() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return { posts: data.posts || [], replies: data.replies || {}, statusOverrides: data.statusOverrides || {}, user: data.user || null };
  } catch {
    return { posts: [], replies: {}, statusOverrides: {}, user: null };
  }
}

const demo = loadDemo();

function saveDemo() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(demo));
    return true;
  } catch {
    return false;
  }
}

async function api(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `请求失败 (${res.status})`);
  return data;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

const ICONS = {
  logo: '<path class="ic-outer" d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"/><path class="ic-core" d="M12 8.5 8.5 10.5v4L12 16.5l3.5-2v-4L12 8.5Z"/><path class="ic-spokes" d="M12 3v5.5M4 7.5l4.5 3M20 7.5l-4.5 3"/>',
  home: '<path class="ic-fill" d="M5 10.5 12 5l7 5.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-8.5Z"/><path class="ic-body" d="M5 10.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-8.5"/><path class="ic-roof" d="M3 11.2 11.4 4.5a1 1 0 0 1 1.2 0L21 11.2"/><path class="ic-door" d="M9.8 20.5v-5.2a2.2 2.2 0 0 1 4.4 0v5.2"/>',
  assist: '<path class="ic-heart ic-tint" d="M13 11.2S9 8.8 9 6.3a2.2 2.2 0 0 1 4-1.2 2.2 2.2 0 0 1 4 1.2c0 2.5-4 4.9-4 4.9Z"/><g class="ic-hand"><path d="M3 14.5v6"/><path d="M3 16.2h2.8l2-1.2c.5-.3 1.1-.5 1.8-.5H13a1.6 1.6 0 0 1 0 3.2h-2.2"/><path d="M5.8 19.8h8.5c.8 0 1.5-.2 2.1-.7l3.6-2.7a1.5 1.5 0 0 0-1.9-2.3l-2.3 1.6"/></g>',
  search: '<g class="ic-glass"><circle class="ic-tint" cx="10.8" cy="10.8" r="6.8"/><path d="m20 20-4.2-4.2"/></g>',
  plus: '<g class="ic-plus"><path d="M12 5v14M5 12h14"/></g>',
  book: '<path class="ic-left ic-tint" d="M12 6.2A3.6 3.6 0 0 0 8.5 4H4a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 4 19h4.5a3.5 3.5 0 0 1 3.5 2"/><path class="ic-right ic-tint" d="M12 6.2A3.6 3.6 0 0 1 15.5 4H20a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 20 19h-4.5a3.5 3.5 0 0 0-3.5 2"/><path class="ic-spine" d="M12 6.2V21"/>',
  briefcase: '<g class="ic-brief"><path class="ic-handle" d="M8.5 7V5.4A1.4 1.4 0 0 1 9.9 4h4.2a1.4 1.4 0 0 1 1.4 1.4V7"/><rect class="ic-tint" x="3" y="7" width="18" height="13" rx="2.5"/><path d="M3 12.2c2.8 1.2 5.8 1.8 9 1.8s6.2-.6 9-1.8"/><path class="ic-clasp" d="M12 12.5v2"/></g>',
  leaf: '<path class="ic-steam-1" d="M8.5 4.2c0 1 .9 1.2.9 2.2"/><path class="ic-steam-2" d="M12.5 3.8c0 1 .9 1.2.9 2.2"/><g class="ic-cup"><path class="ic-tint" d="M4 9h13v6.8A4.2 4.2 0 0 1 12.8 20H8.2A4.2 4.2 0 0 1 4 15.8V9Z"/><path d="M17 10h1.3a3.2 3.2 0 0 1 0 6.4H17"/></g>',
  megaphone: '<g class="ic-horn"><path class="ic-tint" d="M4.5 10.5 16.5 5.5v13l-12-5Z"/><path d="M4.5 10.5H3.2a1.2 1.2 0 0 0-1.2 1.2v.6a1.2 1.2 0 0 0 1.2 1.2h1.3"/><path d="M7.5 14.5 9 19a1.1 1.1 0 0 0 1.1.7h.8a1 1 0 0 0 1-1.2l-.7-3"/></g><path class="ic-wave-1" d="M19.3 9.5a4.5 4.5 0 0 1 0 5"/><path class="ic-wave-2" d="M21.5 7.5a7.5 7.5 0 0 1 0 9"/>',
  package: '<g class="ic-lid"><path class="ic-tint" d="M12 3 4 7.3l8 4.4 8-4.4L12 3Z"/><path d="M8.2 5.1 16 9.4"/></g><path class="ic-box" d="M4 7.3v9.4L12 21l8-4.3V7.3M12 11.7V21"/>',
  bag: '<g class="ic-bag"><path class="ic-tint" d="M5.5 8.5h13l1.1 10.3a2 2 0 0 1-2 2.2H6.4a2 2 0 0 1-2-2.2l1.1-10.3Z"/><path d="M9 8.5V6.5a3 3 0 0 1 6 0v2"/></g>',
  key: '<g class="ic-key"><circle class="ic-tint" cx="8" cy="14.5" r="4"/><path d="m11 11.5 8.5-8.5"/><path d="m16.5 6 2.5 2.5M14 8.5l2 2"/></g>',
  pin: '<g class="ic-pin"><path class="ic-tint" d="M12 21s-6.5-5.6-6.5-10.8a6.5 6.5 0 1 1 13 0C18.5 15.4 12 21 12 21Z"/><circle class="ic-dot" cx="12" cy="10.2" r="2.3"/></g>',
  thumbtack: '<g class="ic-tack"><path d="M12 17v5"/><path class="ic-tint" d="M9 10.8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5.8l2.2 2.2a1 1 0 0 1-.7 1.7H7.5a1 1 0 0 1-.7-1.7L9 10.8Z"/></g>',
  map: '<g class="ic-map"><path class="ic-tint" d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5Z"/><path d="M9 4v13.5M15 6.5V20"/></g>',
  flag: '<path d="M5 21V4"/><path class="ic-cloth ic-tint" d="M5 4.8h12.2a.9.9 0 0 1 .7 1.5l-2.3 3 2.3 3a.9.9 0 0 1-.7 1.5H5"/>',
  waves: '<path class="ic-wave-top" d="M3 9c2.2 0 2.8-2 5-2s2.8 2 5 2 2.8-2 5-2 2.6 1.6 3 2"/><path class="ic-wave-bot" d="M3 15.5c2.2 0 2.8-2 5-2s2.8 2 5 2 2.8-2 5-2 2.6 1.6 3 2"/>',
  compass: '<circle class="ic-tint" cx="12" cy="12" r="9"/><polygon class="ic-needle" points="15.8 8.2 13.7 13.7 8.2 15.8 10.3 10.3 15.8 8.2"/>',
  help: '<circle class="ic-tint" cx="12" cy="12" r="9"/><g class="ic-q"><path d="M9.4 9.2a2.7 2.7 0 0 1 5.1 1c0 1.7-2.5 2.1-2.5 3.5"/><circle cx="12" cy="17.2" r=".7" fill="currentColor" stroke="none"/></g>',
  notes: '<g class="ic-doc"><rect class="ic-tint" x="4" y="3" width="16" height="18" rx="2.5"/><path class="ic-line-1" d="M8 8h8"/><path class="ic-line-2" d="M8 12h8"/><path class="ic-line-3" d="M8 16h5"/></g>',
  chip: '<rect class="ic-tint" x="6" y="6" width="12" height="12" rx="2.5"/><rect class="ic-core" x="9.5" y="9.5" width="5" height="5" rx="1"/><path class="ic-pins" d="M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3"/>',
  team: '<g class="ic-p1"><circle class="ic-tint" cx="9" cy="8.5" r="3"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/></g><g class="ic-p2"><circle cx="16.5" cy="9.5" r="2.2"/><path d="M16.5 14.3a4.3 4.3 0 0 1 4 4.7"/></g>',
  'id-card': '<g class="ic-card"><rect class="ic-tint" x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.5" cy="10.5" r="1.8"/><path d="M5.8 15.5a2.8 2.8 0 0 1 5.4 0"/><path class="ic-line-1" d="M14 10h4"/><path class="ic-line-2" d="M14 14h3"/></g>',
  chat: '<path class="ic-bubble ic-tint" d="M20 11.5a8 8 0 0 1-8 8c-1.3 0-2.5-.3-3.6-.8L4 20l1.3-4.2A8 8 0 1 1 20 11.5Z"/>',
  back: '<g class="ic-arrow"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></g>',
  check: '<path class="ic-check" d="m5 12.5 4.5 4.5L19 7.5"/>',
  close: '<g class="ic-x"><path d="m6 6 12 12M18 6 6 18"/></g>',
  clock: '<circle class="ic-tint" cx="12" cy="12" r="9"/><path class="ic-hand-min" d="M12 7.5V12l3 2"/>',
  lock: '<path class="ic-shackle" d="M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11"/><rect class="ic-tint" x="5" y="11" width="14" height="10" rx="2.5"/>',
  image: '<rect class="ic-tint" x="3" y="5" width="18" height="14" rx="2.5"/><circle class="ic-sun" cx="8.5" cy="10" r="1.5"/><path class="ic-mtn" d="m21 15.5-4.5-4.5L9 18.5"/>',
  user: '<circle class="ic-head ic-tint" cx="12" cy="8.2" r="3.4"/><path class="ic-shoulders" d="M5 19.5a7 7 0 0 1 14 0"/>',
  trash: '<g class="ic-lid"><path d="M4 7h16"/><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/></g><path d="M6 7l1 13a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 20l1-13M10 11v6M14 11v6"/>',
  bell: '<g class="ic-bell-body"><path class="ic-tint" d="M18 8.5a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5Z"/></g><path class="ic-clapper" d="M10.3 19.5a2 2 0 0 0 3.4 0"/>',
  heart: '<path class="ic-heart-shape" d="M12 20.2s-7.5-4.6-8.8-9.5A4.8 4.8 0 0 1 12 6.8a4.8 4.8 0 0 1 8.8 3.9c-1.3 4.9-8.8 9.5-8.8 9.5Z"/>',
  edit: '<path class="ic-base" d="M12 20h9"/><path class="ic-pen" d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  alert: '<path class="ic-tint" d="M12 3.2 2.6 19.5h18.8L12 3.2Z"/><g class="ic-bang"><path d="M12 9.5v4.5"/><circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none"/></g>',
  eye: '<path class="ic-lid" d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"/><circle class="ic-pupil" cx="12" cy="12" r="2.8"/><path class="ic-slash" d="M4 4l16 16"/>',
};

function icon(name) {
  const safe = ICONS[name] ? name : 'compass';
  return `<svg class="icon icon-${safe}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[safe]}</svg>`;
}

function avatar(person, extraClass = '') {
  return `<span class="avatar ${escapeHtml(person.color || 'violet')} ${extraClass}" aria-hidden="true">${escapeHtml(person.initial || '友')}</span>`;
}

function categoryName(id) {
  return categories.find((c) => c.id === id)?.name || '校园讨论';
}

function topicHref(id, replyId) {
  const topicPath = `#topic/${encodeURIComponent(id)}`;
  return replyId ? `${topicPath}/${encodeURIComponent(replyId)}` : topicPath;
}

function effectiveDemoStatus(topic, now = Date.now()) {
  if (topic.category !== 'help') return null;
  const raw = demo.statusOverrides[topic.id] || topic.status || 'open';
  if (raw === 'closed') return 'closed';
  if (topic.expiresAt && topic.expiresAt < now) return 'expired';
  return 'open';
}

function statusBadgeHtml(status) {
  if (!status) return '';
  if (status === 'open') return `<span class="status-badge status-open">进行中</span>`;
  if (status === 'closed') return `<span class="status-badge status-closed">${icon('check')}已完成</span>`;
  return `<span class="status-badge status-expired">已过期</span>`;
}

function remainingText(expiresAt, now = Date.now()) {
  if (!expiresAt) return '长期有效';
  const diff = expiresAt - now;
  if (diff <= 0) return '已过截止时间';
  const mins = Math.ceil(diff / 60000);
  if (mins < 60) return `剩 ${mins} 分钟`;
  const hours = Math.ceil(diff / HOUR);
  if (hours < 24) return `剩 ${hours} 小时`;
  return `剩 ${Math.ceil(diff / DAY)} 天`;
}

function tagsFor(topic) {
  return tags.filter(({ id }) => topic.tags?.includes(id));
}

function topicMeta(topic, now = Date.now()) {
  const category = categories.find(({ id }) => id === topic.category);
  const campus = topic.campus === '全校' ? '全校' : `${topic.campus}校区`;
  const status = isServerMode ? topic.status : effectiveDemoStatus(topic, now);
  const pinPart = topic.pinned ? `<span class="pin-badge">${icon('thumbtack')}置顶</span>` : '';
  const badge = category ? `<span class="chip ${category.id}">${icon(category.icon)}${category.name}</span>` : '';
  const statusPart = statusBadgeHtml(status);
  const rewardPart = topic.reward ? `<span class="reward-pill">${escapeHtml(topic.reward)}</span>` : '';
  const ttlPart = status === 'open' && topic.expiresAt ? `<span class="ttl-pill">${icon('clock')}${remainingText(topic.expiresAt, now)}</span>` : '';
  const imgCount = topic.imageCount ?? topic.images?.length ?? 0;
  const imgPart = imgCount > 0 ? `<span class="img-hint">${icon('image')}${imgCount}</span>` : '';
  const likePart = topic.likeCount > 0 ? `<span class="like-hint">${icon('heart')}${topic.likeCount}</span>` : '';
  const badges = tagsFor(topic).map(({ id, name, icon: glyph }) => filterButton('tag', id, name, `topic-tag tag-${id}`, icon(glyph)));
  return `${pinPart}${statusPart}${rewardPart}${badge}<span>${escapeHtml(campus)}</span>${ttlPart}${badges.join('')}${imgPart}${likePart}${topic.accepted ? `<span class="solved">${icon('check')}已解决</span>` : ''}`;
}

function demoRepliesFor(topic) {
  return [...topic.replies, ...(demo.replies[topic.id] || [])];
}

function activityText(timestamp, now) {
  const minutes = Math.max(1, Math.round(Math.round((now - timestamp) / 1000) / 60));
  if (minutes < 45) return `${minutes} 分钟`;
  if (minutes < 1410) return `${Math.round(minutes / 60)} 小时`;
  if (minutes < 2520) return '1 天';
  if (minutes <= 30 * 1440) return `${Math.round(minutes / 1440)} 天`;
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}月`;
  return date.getFullYear() === new Date(now).getFullYear()
    ? `${month} ${date.getDate()} 日`
    : `${date.getFullYear()} 年 ${month}`;
}

function refreshActivity() {
  const now = Date.now();
  document.querySelectorAll('[data-activity]').forEach((element) => {
    const label = activityText(Number(element.dataset.activity), now);
    if (element.textContent !== label) element.textContent = label;
  });
}

function filterButton(key, id, label, className, glyph = '') {
  return `<button type="button" class="${className}" data-filter="${key}" data-value="${id}" aria-pressed="${filters[key] === id}">${glyph}${label}</button>`;
}

function choiceInput(option, name, inputAttributes, badgeClass) {
  return `<label class="choice"><input name="${name}" value="${option.id}" ${inputAttributes}>
    <span class="choice-badge ${badgeClass}">${icon(option.icon)}${option.name}</span></label>`;
}

function updateNotifBadge(count) {
  const btn = $('#notif-button');
  const badge = $('#notif-badge');
  btn.hidden = !isServerMode || !currentUser;
  const n = Number(count || 0);
  badge.hidden = n <= 0;
  badge.textContent = n > 99 ? '99+' : String(n);
}

async function pollUnreadCount() {
  if (!isServerMode || !currentUser) return;
  try {
    const data = await api('/api/notifications/unread-count');
    updateNotifBadge(data.unreadCount);
  } catch { /* ignore */ }
}

async function openNotifDialog() {
  if (!isServerMode || !currentUser) return;
  const list = $('#notif-list');
  list.innerHTML = '<p class="form-note">加载中...</p>';
  notifDialog.showModal();
  try {
    const data = await api('/api/notifications');
    updateNotifBadge(data.unreadCount);
    if (!data.notifications.length) {
      list.innerHTML = '<p class="empty">暂时还没有新通知</p>';
      return;
    }
    const now = Date.now();
    list.innerHTML = data.notifications.map((n) => `
      <button type="button" class="notif-item${n.read ? '' : ' unread'}" data-notif-id="${n.id}" data-notif-href="${topicHref(n.topicId, n.replyId)}">
        ${avatar({ initial: n.actorInitial, color: n.actorColor })}
        <div class="notif-body">
          <div>${escapeHtml(n.message)}</div>
          <div class="notif-time">${activityText(n.createdAt, now)}前</div>
        </div>
      </button>`).join('');
  } catch (err) {
    list.innerHTML = `<p class="form-note">${escapeHtml(err.message)}</p>`;
  }
}

function renderAuthButton() {
  const btn = $('#auth-button');
  if (currentUser) {
    btn.innerHTML = `${avatar(currentUser)}<span>${escapeHtml(currentUser.nickname)}</span>`;
    btn.title = `${currentUser.nickname}（${currentUser.campus}校区）`;
  } else {
    btn.innerHTML = `${icon('user')}<span>${isServerMode ? '登录 / 注册' : '校内验证'}</span>`;
    btn.title = '完成校内验证登录后可发帖、回复和查看联系方式';
  }
  if (!currentUser) updateNotifBadge(0);
}

function inspectPassword(password) {
  const value = String(password || '');
  const checks = {
    len: value.length >= 8 && value.length <= 64,
    noSpace: !/\s/.test(value),
    letter: /[A-Za-z]/.test(value),
    digit: /\d/.test(value),
    symbol: /[^A-Za-z0-9\s]/.test(value),
  };
  let error = null;
  if (!value || value.length < 8 || value.length > 64) {
    error = '密码至少 8 位（8–64 个字符）。';
  } else if (!checks.noSpace) {
    error = '密码不能包含空格。';
  } else if (!checks.letter || !checks.digit || !checks.symbol) {
    const missing = [];
    if (!checks.letter) missing.push('字母');
    if (!checks.digit) missing.push('数字');
    if (!checks.symbol) missing.push('符号');
    error = `还缺少：${missing.join('、')}（需同时包含字母、数字和符号）。`;
  }
  return { checks, error, valid: !error };
}

function validatePasswordStrength(password) {
  return inspectPassword(password).error;
}

function setFieldStatus(el, text = '', tone = '') {
  if (!el) return;
  el.textContent = text;
  el.className = tone ? `field-status ${tone}` : 'field-status';
}

function updateLivePasswordUI({ input, confirmInput, rulesEl, msgEl, confirmMsgEl, active = true }) {
  if (!input) return;
  if (!active) {
    input.classList.remove('is-invalid', 'is-valid');
    if (confirmInput) confirmInput.classList.remove('is-invalid', 'is-valid');
    if (rulesEl) rulesEl.hidden = true;
    setFieldStatus(msgEl, '');
    setFieldStatus(confirmMsgEl, '');
    return;
  }

  if (rulesEl) rulesEl.hidden = false;
  const val = input.value;
  const { checks, valid } = inspectPassword(val);
  const started = val.length > 0;

  if (rulesEl) {
    rulesEl.querySelectorAll('[data-rule]').forEach((el) => {
      const rule = el.dataset.rule;
      const met = rule === 'len' ? (checks.len && checks.noSpace) : Boolean(checks[rule]);
      el.classList.toggle('is-met', started && met);
      el.classList.toggle('is-unmet', started && !met);
    });
  }

  input.classList.toggle('is-valid', started && valid);
  input.classList.toggle('is-invalid', started && !valid);

  if (!started) {
    setFieldStatus(msgEl, '');
  } else if (!checks.noSpace) {
    setFieldStatus(msgEl, '不能含空格', 'is-error');
  } else if (!valid) {
    setFieldStatus(msgEl, '格式未达标', 'is-error');
  } else {
    setFieldStatus(msgEl, '✓ 符合要求', 'is-ok');
  }

  if (confirmInput && confirmMsgEl) {
    const cVal = confirmInput.value;
    if (!cVal) {
      confirmInput.classList.remove('is-invalid', 'is-valid');
      setFieldStatus(confirmMsgEl, '');
    } else if (cVal !== val) {
      confirmInput.classList.add('is-invalid');
      confirmInput.classList.remove('is-valid');
      setFieldStatus(confirmMsgEl, '两次密码不一致', 'is-error');
    } else {
      confirmInput.classList.remove('is-invalid');
      confirmInput.classList.add('is-valid');
      setFieldStatus(confirmMsgEl, '✓ 密码一致', 'is-ok');
    }
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function refreshCaptcha(clearInput = true, preserveError = false) {
  if (!isServerMode) return;
  try {
    const data = await api('/api/captcha');
    currentCaptchaId = data.captchaId;
    captchaVerifiedForSend = false;
    $('#captcha-img').src = data.image;
    if (!preserveError) {
      authForm.elements.captchaCode.classList.remove('is-valid', 'is-invalid');
      setFieldStatus($('#reg-captcha-msg'), '点击图片可刷新');
    }
    if (clearInput) authForm.elements.captchaCode.value = '';
  } catch { /* ignore */ }
}

function startCodeCooldown(seconds = 60) {
  clearInterval(codeCooldownTimer);
  codeCooldownLeft = seconds;
  const btn = $('#send-code-btn');
  const tick = () => {
    if (codeCooldownLeft <= 0) {
      clearInterval(codeCooldownTimer);
      btn.disabled = false;
      btn.textContent = '重新发送';
      return;
    }
    btn.disabled = true;
    btn.textContent = `${codeCooldownLeft}s 后重发`;
    codeCooldownLeft -= 1;
  };
  tick();
  codeCooldownTimer = setInterval(tick, 1000);
}

function updateLiveEmailUI() {
  const input = authForm.elements.username;
  const msg = $('#reg-username-msg');
  clearTimeout(emailCheckTimer);
  const defaultHint = authTab === 'login' ? '' : (authTab === 'reset' ? '输入注册邮箱' : '作为登录账号');
  if (!isServerMode || authTab === 'login') {
    availabilityState.email = null;
    input.classList.remove('is-invalid', 'is-valid');
    setFieldStatus(msg, defaultHint);
    return;
  }
  const val = input.value.trim().toLowerCase();
  if (!val) {
    availabilityState.email = null;
    input.classList.remove('is-invalid', 'is-valid');
    setFieldStatus(msg, defaultHint);
    return;
  }
  if (!EMAIL_RE.test(val) || val.length > 80) {
    availabilityState.email = false;
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    setFieldStatus(msg, '邮箱格式有误', 'is-error');
    return;
  }
  if (authTab === 'reset') {
    availabilityState.email = true;
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    setFieldStatus(msg, '✓ 格式正确', 'is-ok');
    return;
  }
  input.classList.remove('is-invalid');
  emailCheckTimer = setTimeout(async () => {
    try {
      const data = await api(`/api/auth/check-availability?email=${encodeURIComponent(val)}`);
      if (authForm.elements.username.value.trim().toLowerCase() !== val || authTab !== 'register') return;
      availabilityState.email = Boolean(data.emailAvailable);
      if (data.emailAvailable) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        setFieldStatus(msg, '✓ 可注册', 'is-ok');
      } else {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        setFieldStatus(msg, '邮箱已注册', 'is-error');
      }
    } catch { /* ignore */ }
  }, 280);
}

function updateLiveNicknameUI() {
  const input = authForm.elements.nickname;
  const msg = $('#reg-nickname-msg');
  clearTimeout(nickCheckTimer);
  if (!isServerMode || authTab !== 'register') {
    availabilityState.nickname = null;
    input.classList.remove('is-invalid', 'is-valid');
    setFieldStatus(msg, '');
    return;
  }
  const val = input.value.trim();
  if (!val) {
    availabilityState.nickname = null;
    input.classList.remove('is-invalid', 'is-valid');
    setFieldStatus(msg, '');
    return;
  }
  input.classList.remove('is-invalid');
  nickCheckTimer = setTimeout(async () => {
    try {
      const data = await api(`/api/auth/check-availability?nickname=${encodeURIComponent(val)}`);
      if (authForm.elements.nickname.value.trim() !== val || authTab !== 'register') return;
      availabilityState.nickname = Boolean(data.nicknameAvailable);
      if (data.nicknameAvailable) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        setFieldStatus(msg, '✓ 可用', 'is-ok');
      } else {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        setFieldStatus(msg, '已被使用', 'is-error');
      }
    } catch { /* ignore */ }
  }, 280);
}

function syncRegisterLiveValidation() {
  updateLiveEmailUI();
  updateLiveNicknameUI();
  updateLivePasswordUI({
    input: authForm.elements.password,
    confirmInput: authForm.elements.confirmPassword,
    rulesEl: $('#reg-pwd-rules'),
    msgEl: $('#reg-pwd-msg'),
    confirmMsgEl: $('#reg-confirm-msg'),
    active: isServerMode && (authTab === 'register' || authTab === 'reset'),
  });
}

function syncChangePasswordLiveValidation() {
  const form = $('#change-password-form');
  updateLivePasswordUI({
    input: form.elements.newPassword,
    confirmInput: form.elements.confirmNewPassword,
    rulesEl: $('#cp-pwd-rules'),
    msgEl: $('#cp-pwd-msg'),
    confirmMsgEl: $('#cp-confirm-msg'),
    active: true,
  });
}

function setEyeIcon(btn, showing) {
  btn.setAttribute('aria-pressed', showing ? 'true' : 'false');
  btn.setAttribute('aria-label', showing ? '隐藏密码' : '显示密码');
}

function resetPasswordVisibility(root = document) {
  root.querySelectorAll('.pwd-wrap').forEach((wrap) => {
    const input = wrap.querySelector('input');
    const btn = wrap.querySelector('[data-toggle-pwd]');
    if (input) input.type = 'password';
    if (btn) setEyeIcon(btn, false);
  });
}

function syncAuthTabUI() {
  const isLogin = isServerMode && authTab === 'login';
  const isReset = isServerMode && authTab === 'reset';
  const isRegister = !isLogin && !isReset;

  const tabsWrap = $('#auth-mode-tabs');
  tabsWrap.hidden = !isServerMode || Boolean(currentUser) || isReset;
  tabsWrap.querySelectorAll('[data-auth-tab]').forEach((btn) => {
    btn.setAttribute('aria-selected', btn.dataset.authTab === authTab ? 'true' : 'false');
  });

  $('#field-username').hidden = !isServerMode;
  $('#field-identity-row').hidden = isLogin || isReset;
  $('#field-captcha').hidden = !isServerMode || isLogin;
  $('#field-email-code').hidden = !isServerMode || !emailVerifyEnabled || isLogin;
  $('#field-password').hidden = !isServerMode;
  $('#field-confirm-password').hidden = !isServerMode || isLogin;
  $('#field-verify').hidden = isLogin || isReset;
  $('#forgot-pwd-btn').hidden = !isServerMode || !emailVerifyEnabled || !isLogin;
  $('#auth-switch-foot').hidden = !isServerMode;

  authForm.elements.username.type = isLogin ? 'text' : 'email';
  authForm.elements.username.autocomplete = isLogin ? 'username' : 'email';
  authForm.elements.username.placeholder = isLogin ? '输入注册邮箱或管理员账号' : '如：example@qq.com';
  $('#auth-username-label').textContent = isLogin ? '邮箱 / 账号' : '邮箱';
  $('#reg-pwd-msg').hidden = isLogin;

  authForm.elements.password.autocomplete = isLogin ? 'current-password' : 'new-password';
  authForm.elements.password.placeholder = isLogin ? '输入登录密码' : '至少 8 位，含字母、数字和符号';
  $('#auth-password-label').textContent = isReset ? '新密码' : '密码';
  $('#auth-confirm-label').textContent = isReset ? '确认新密码' : '确认密码';

  resetPasswordVisibility(authDialog);
  syncRegisterLiveValidation();

  if (isServerMode && (isRegister || isReset)) {
    refreshCaptcha();
  }

  if (!isServerMode) {
    $('#auth-title').textContent = '验证同学身份';
    $('#auth-panel-label').textContent = '重电校园站 · 轻校内验证（演示）';
    $('#auth-submit').textContent = '完成验证';
  } else if (isLogin) {
    $('#auth-title').textContent = '欢迎回来';
    $('#auth-panel-label').textContent = '登录你的重电校园站账号';
    $('#auth-submit').textContent = '登录';
    $('#auth-switch-text').textContent = '还没有账号？';
    $('#auth-switch-btn').textContent = '立即注册';
    $('#auth-switch-btn').dataset.authTab = 'register';
  } else if (isReset) {
    $('#auth-title').textContent = '重置密码';
    $('#auth-panel-label').textContent = '通过注册邮箱验证身份';
    $('#auth-submit').textContent = '重置密码';
    $('#auth-switch-text').textContent = '想起密码了？';
    $('#auth-switch-btn').textContent = '返回登录';
    $('#auth-switch-btn').dataset.authTab = 'login';
  } else {
    $('#auth-title').textContent = '创建账号';
    $('#auth-panel-label').textContent = emailVerifyEnabled ? '重电校园站 · 邮箱与校内验证' : '重电校园站 · 人机与校内验证';
    $('#auth-submit').textContent = '注册';
    $('#auth-switch-text').textContent = '已有账号？';
    $('#auth-switch-btn').textContent = '立即登录';
    $('#auth-switch-btn').dataset.authTab = 'login';
  }
}

async function loadAdminPanels() {
  if (!isServerMode || currentUser?.role !== 'admin') return;
  const qList = $('#admin-questions-list');
  const rList = $('#admin-reports-list');
  qList.innerHTML = '<p class="form-note">加载题库中...</p>';
  rList.innerHTML = '<p class="form-note">加载举报中...</p>';
  try {
    const [qData, rData] = await Promise.all([api('/api/admin/questions'), api('/api/admin/reports')]);
    qList.innerHTML = qData.questions.map((q) => `
      <div class="admin-q-item">
        <div><strong>${escapeHtml(q.question)}</strong><small>答案：${escapeHtml(q.answers.join(' / '))}</small></div>
        <button type="button" class="text-button danger-text" data-del-question="${q.id}">删除</button>
      </div>`).join('');

    $('#admin-reports-count').textContent = rData.reports.length ? `${rData.reports.length} 条待处理` : '暂无待处理';
    rList.innerHTML = rData.reports.length
      ? rData.reports.map((r) => `
        <div class="admin-q-item">
          <div>
            <a href="${topicHref(r.topicId)}" data-close-auth><strong>${escapeHtml(r.topicTitle)}</strong></a>
            <small>${escapeHtml(r.reporter)} 举报：${escapeHtml(r.reason)}${r.detail ? `（${escapeHtml(r.detail)}）` : ''}</small>
          </div>
          <button type="button" class="text-button" data-resolve-report="${r.id}">已处理</button>
        </div>`).join('')
      : '<p class="form-note">社区目前很干净，没有待处理的举报。</p>';
  } catch (err) {
    qList.innerHTML = `<p class="form-note">${escapeHtml(err.message)}</p>`;
  }
}

async function openAuthDialog(onSuccess = null, preferredTab = 'register') {
  afterAuthAction = onSuccess;
  $('#auth-error').hidden = true;
  if (currentUser) {
    $('#auth-mode-tabs').hidden = true;
    $('#auth-form').hidden = true;
    $('#auth-signed-in').hidden = false;
    $('#auth-panel-label').textContent = currentUser.role === 'admin' ? '站长账号' : '同学账号';
    $('#auth-title').textContent = '当前登录状态';
    const roleTag = currentUser.role === 'admin' ? '<span class="role-tag">管理员</span>' : '';
    const sub = isServerMode
      ? `${escapeHtml(currentUser.email || `@${currentUser.username}`)} · ${escapeHtml(currentUser.campus)}校区`
      : `${escapeHtml(currentUser.campus)}校区 · 本地演示验证`;
    const profileBtn = isServerMode && currentUser.id
      ? `<a class="button secondary small" href="#user/${currentUser.id}" data-close-auth>我的主页</a>`
      : '';
    $('#auth-profile').innerHTML = `<div class="auth-profile-left">${avatar(currentUser)}<div><strong>${escapeHtml(currentUser.nickname)}</strong>${roleTag}<div class="form-note">${sub}</div></div></div>${profileBtn}`;
    $('#change-password-box').hidden = !isServerMode;
    $('#change-password-box').open = false;
    $('#change-password-error').hidden = true;
    $('#change-password-form').reset();
    resetPasswordVisibility(authDialog);
    syncChangePasswordLiveValidation();
    const isAdmin = isServerMode && currentUser.role === 'admin';
    $('#admin-reports-panel').hidden = !isAdmin;
    $('#admin-questions-panel').hidden = !isAdmin;
    if (isAdmin) loadAdminPanels();
  } else {
    authTab = preferredTab;
    $('#auth-form').hidden = false;
    $('#auth-signed-in').hidden = true;
    authForm.reset();
    if (isServerMode) {
      try {
        const res = await api('/api/verify-question');
        if (res.verifyQuestion) currentVerifyQuestion = res.verifyQuestion;
      } catch { /* ignore */ }
    }
    if (currentVerifyQuestion) {
      $('#verify-question-label').textContent = `校内验证题：${currentVerifyQuestion.question}`;
    }
    if (filters.campus !== 'all') authForm.elements.campus.value = filters.campus;
    syncAuthTabUI();
  }
  authDialog.showModal();
  if (!currentUser) {
    (isServerMode ? authForm.elements.username : authForm.elements.nickname).focus();
  }
}

function buildTopicTableHtml(items) {
  const now = Date.now();
  return `<table class="topic-list">
    <caption class="visually-hidden">校园帖子列表</caption>
    <thead><tr>
      <th scope="col">主题</th>
      <th scope="col" class="people-column">参与</th>
      <th scope="col" class="number-column">回复</th>
      <th scope="col" class="number-column views-column">浏览</th>
      <th scope="col" class="time-column desktop-column">活动</th>
    </tr></thead>
    <tbody>${items.map((topic) => {
      const inactive = topic.status === 'closed' || topic.status === 'expired';
      const people = topic.participants || [];
      const names = escapeHtml(people.map((person) => person.author).join('、'));
      const activityLabel = topic.latestReplyId ? '查看最新回复' : '查看主题';
      const timestamp = topic.lastActivityAt || topic.createdAt || 0;
      const dateLabel = timestamp ? fullDate.format(timestamp) : '时间未知';
      const time = timestamp ? `<time datetime="${new Date(timestamp).toISOString()}" data-activity="${timestamp}">${activityText(timestamp, now)}</time>` : '—';
      const activity = `<a class="activity-link" href="${topicHref(topic.id, topic.latestReplyId)}" title="${dateLabel}" aria-label="${activityLabel}：${escapeHtml(topic.title)}，${dateLabel}">${time}</a>`;
      return `<tr class="topic-row${inactive ? ' is-inactive' : ''}">
        <th scope="row">
          <a class="topic-title" href="${topicHref(topic.id)}">${escapeHtml(topic.title)}</a>
          <span class="topic-meta">${topicMeta(topic, now)}<span class="mobile-time">${activity}</span></span>
        </th>
        <td class="people-column"><span class="participant-list" title="${names}"><span class="visually-hidden">${names}</span>${people.map((p) => avatar(p)).join('')}</span></td>
        <td class="reply-count"><span class="reply-glyph">${icon('chat')}<span class="visually-hidden">回复数：</span></span>${topic.replyCount}</td>
        <td class="views-column">${topic.views}</td>
        <td class="desktop-column">${activity}</td>
      </tr>`;
    }).join('')}</tbody></table>`;
}

function renderTopicRows(items) {
  const activeTag = tags.find(({ id }) => id === filters.tag);
  const words = filters.query.trim();
  const filtered = filters.category !== 'all' || filters.campus !== 'all' || activeTag || filters.tab !== 'latest' || filters.activeOnly || Boolean(words);
  $('#feed-title').textContent = words ? '搜索结果' : filters.category === 'all' ? '校园讨论' : categoryName(filters.category);
  const labelParts = [];
  if (filters.campus !== 'all') labelParts.push(`${filters.campus}校区`);
  if (activeTag) labelParts.push(activeTag.name);
  if (words) labelParts.push(`含“${words}”`);
  $('#feed-subtitle').textContent = labelParts.length ? `${labelParts.join(' · ')} · ${items.length} 篇` : `${items.length} 篇帖子`;
  $('#reset-filters').hidden = !filtered;

  if (!items.length) {
    feed.innerHTML = `<div class="empty"><h2>还没有符合条件的帖子</h2><p>试试放宽筛选条件，或者发一条新的校园讨论 / 互助帖。</p>
      <button class="button secondary" data-reset type="button">查看全部讨论</button></div>`;
    return;
  }
  feed.innerHTML = buildTopicTableHtml(items);
}

async function renderFeed() {
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.setAttribute('aria-pressed', filters[button.dataset.filter] === button.dataset.value);
  });
  $('#active-only').checked = filters.activeOnly;

  if (isServerMode) {
    try {
      const params = new URLSearchParams({
        category: filters.category,
        campus: filters.campus,
        tag: filters.tag,
        tab: filters.tab,
        activeOnly: filters.activeOnly ? '1' : '0',
        q: filters.query.trim(),
      });
      const data = await api(`/api/topics?${params.toString()}`);
      renderTopicRows(data.topics);
    } catch (err) {
      feed.innerHTML = `<div class="empty"><h2>加载帖子列表失败</h2><p>${escapeHtml(err.message)}</p></div>`;
    }
    return;
  }

  const now = Date.now();
  const words = filters.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const activeTag = tags.find(({ id }) => id === filters.tag);
  const matching = [...demo.posts, ...seed].filter((topic) => {
    const status = effectiveDemoStatus(topic, now);
    if (filters.activeOnly && status && status !== 'open') return false;
    const tagNames = tagsFor(topic).map(({ name }) => name);
    const replyBodies = demoRepliesFor(topic).map((r) => r.body);
    const haystack = [topic.title, topic.body, topic.reward || '', topic.author, topic.campus, categoryName(topic.category), ...tagNames, ...replyBodies].join(' ').toLowerCase();
    return (filters.category === 'all' || topic.category === filters.category)
      && (filters.campus === 'all' || topic.campus === filters.campus)
      && (!activeTag || topic.tags?.includes(activeTag.id))
      && (filters.tab !== 'unanswered' || demoRepliesFor(topic).length === 0)
      && words.every((word) => haystack.includes(word));
  });

  const normalized = matching.map((topic) => {
    const replies = demoRepliesFor(topic);
    const latest = replies.at(-1);
    const people = [...new Map([topic, ...replies].map((p) => [p.author, p])).values()].slice(0, 3);
    return {
      ...topic,
      status: effectiveDemoStatus(topic, now),
      replyCount: replies.length,
      latestReplyId: latest?.id || null,
      lastActivityAt: (latest || topic).createdAt || 0,
      participants: people,
    };
  });

  if (filters.tab === 'popular') {
    normalized.sort((a, b) => (Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))) || (b.views - a.views));
  } else {
    normalized.sort((a, b) => (Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))) || (b.lastActivityAt - a.lastActivityAt));
  }
  renderTopicRows(normalized);
}

function authorLine(person, extraText = '') {
  const date = person.createdAt ? fullDate.format(person.createdAt) : '时间未知';
  const namePart = isServerMode && person.authorId
    ? `<a class="author-link" href="#user/${person.authorId}">${avatar(person)}<strong>${escapeHtml(person.author)}</strong></a>`
    : `${avatar(person)}<strong>${escapeHtml(person.author)}</strong>`;
  return `<div class="author">${namePart}<span>${escapeHtml(date)}${extraText ? ` · ${escapeHtml(extraText)}` : ''}</span></div>`;
}

function renderHelpPanel(topic, now) {
  if (topic.category !== 'help') return '';
  const status = isServerMode ? topic.status : effectiveDemoStatus(topic, now);
  const canToggle = (status === 'open' || status === 'closed') && (!isServerMode || topic.canManage);
  const toggleBtn = canToggle
    ? `<button class="button secondary small" id="toggle-status-btn" type="button">${status === 'open' ? '标记为已完成' : '重新开启'}</button>`
    : '';

  const hasContact = isServerMode ? topic.hasContact : Boolean(topic.contact);
  let contactHtml = '';
  if (hasContact) {
    if (status !== 'open') {
      contactHtml = `<div class="contact-box">${icon('lock')}<span>帖子已${status === 'closed' ? '完成' : '过期'}，联系方式已自动隐藏</span></div>`;
    } else if (!currentUser) {
      contactHtml = `<div class="contact-box">${icon('lock')}<span>联系方式仅校内验证登录后由服务器下发</span><button class="button secondary small" id="reveal-contact-btn" type="button">登录 / 验证查看</button></div>`;
    } else if (topic.contact) {
      contactHtml = `<div class="contact-box">${icon('lock')}<span>联系方式：</span><span class="contact-value">${escapeHtml(topic.contact)}</span><button class="button secondary small" id="copy-contact-btn" type="button">复制</button></div>`;
    }
  }

  return `<div class="help-panel">
    <div class="help-panel-row">
      <div class="help-facts">
        ${statusBadgeHtml(status)}
        ${topic.reward ? `<span class="reward-pill">${escapeHtml(topic.reward)}</span>` : ''}
        <span class="ttl-pill">${icon('clock')}${remainingText(topic.expiresAt, now)}</span>
      </div>
      ${toggleBtn}
    </div>
    ${contactHtml}
  </div>`;
}

function openEditComposer(topic) {
  editingTopicId = topic.id;
  $('#composer-title').textContent = '编辑帖子';
  $('#submit-post-btn').textContent = '保存修改';
  postForm.elements.title.value = topic.title;
  postForm.elements.category.value = topic.category;
  postForm.elements.campus.value = topic.campus;
  postForm.elements.body.value = topic.body;
  postForm.elements.reward.value = topic.reward || '';
  postForm.elements.contact.value = topic.editContact ?? topic.contact ?? '';
  postForm.elements.ttl.value = '';
  postForm.querySelectorAll('input[name="tags"]').forEach((box) => {
    box.checked = Boolean(topic.tags?.includes(box.value));
  });
  pendingImages = [...(topic.images || [])];
  syncComposerHelpFields();
  renderUploadPreviews();
  composer.showModal();
  postForm.elements.title.focus();
}

function renderTopicView(topic) {
  const now = Date.now();
  const replies = isServerMode ? (topic.replies || []) : demoRepliesFor(topic);
  const imagesHtml = topic.images?.length
    ? `<div class="topic-images">${topic.images.map((src, i) => `<button type="button" class="topic-image-btn" data-lightbox="${i}" aria-label="查看附图 ${i + 1}"><img src="${escapeHtml(src)}" alt="帖子附图 ${i + 1}"></button>`).join('')}</div>`
    : '';

  const adminBar = isServerMode && (topic.canPin || topic.canManage)
    ? `<div class="topic-admin-actions">
        ${topic.canPin ? `<button class="button secondary small" id="pin-topic-btn" type="button">${icon('thumbtack')}<span>${topic.pinned ? '取消置顶' : '置顶'}</span></button>` : ''}
        ${topic.canManage ? `<button class="button secondary small" id="edit-topic-btn" type="button">${icon('edit')}<span>编辑</span></button>` : ''}
        ${topic.canManage ? `<button class="button secondary small danger-text" id="delete-topic-btn" type="button">${icon('trash')}<span>删除</span></button>` : ''}
      </div>`
    : '';

  const topicFooter = isServerMode
    ? `<div class="topic-footer-bar">
        <button type="button" class="like-btn${topic.liked ? ' is-liked' : ''}" id="like-topic-btn" data-like-type="topic" data-like-id="${escapeHtml(topic.id)}">
          ${icon('heart')}<span>${topic.liked ? '已赞' : '赞'}</span><span class="like-num">${topic.likeCount || 0}</span>
        </button>
        ${!topic.canManage ? `<button type="button" class="text-button" id="report-topic-btn">${icon('alert')} 举报</button>` : ''}
      </div>`
    : '';

  topicPage.innerHTML = `
    <div class="topic-top-bar">
      <a class="back-link" href="#">${icon('back')}返回讨论</a>
      ${adminBar}
    </div>
    <article class="topic-card">
      <h1>${escapeHtml(topic.title)}</h1>
      <div class="topic-meta">${topicMeta(topic, now)}</div>
      ${authorLine(topic, topic.updatedAt ? '已编辑' : '')}
      ${renderHelpPanel(topic, now)}
      <p class="topic-body">${escapeHtml(topic.body)}</p>
      ${imagesHtml}
      ${topicFooter}
    </article>
    <section class="replies" aria-labelledby="reply-heading">
      <h2 id="reply-heading">${replies.length} 条回复</h2>
      ${replies.length ? replies.map((reply) => {
        const isAccepted = topic.accepted === reply.id;
        const likeBtn = isServerMode
          ? `<button type="button" class="like-btn mini${reply.liked ? ' is-liked' : ''}" data-like-type="reply" data-like-id="${escapeHtml(reply.id)}">${icon('heart')}<span class="like-num">${reply.likeCount || 0}</span></button>`
          : '';
        const acceptBtn = isServerMode && topic.canManage
          ? `<button type="button" class="text-button" data-accept-reply="${escapeHtml(reply.id)}">${isAccepted ? '取消采纳' : '采纳答案'}</button>`
          : '';
        const delBtn = isServerMode && reply.canDelete
          ? `<button type="button" class="text-button danger-text" data-delete-reply="${escapeHtml(reply.id)}">删除</button>`
          : '';
        return `
        <article id="reply-anchor-${escapeHtml(reply.id)}" class="reply${isAccepted ? ' solved-reply' : ''}" tabindex="-1">
          <div class="author-row">
            ${authorLine(reply)}
            ${likeBtn || acceptBtn || delBtn ? `<div class="reply-actions">${likeBtn}${acceptBtn}${delBtn}</div>` : ''}
          </div>
          ${isAccepted ? `<div class="topic-meta"><span class="solved">${icon('check')}采纳答案</span></div>` : ''}
          <p>${escapeHtml(reply.body)}</p>
        </article>`;
      }).join('') : '<p class="topic-empty">还没有人回复。可以分享你的建议或接单沟通。</p>'}
      <form id="reply-form" class="reply-form">
        <label>写回复<textarea name="body" required maxlength="1000" rows="3" placeholder="${currentUser ? `以「${escapeHtml(currentUser.nickname)}」身份回复...` : '完成校内验证登录后即可发送回复'}"></textarea></label>
        <button class="button primary" type="submit">发送回复</button>
      </form>
    </section>`;

  $('#reveal-contact-btn')?.addEventListener('click', () => openAuthDialog(() => renderRoute(false)));
  $('#edit-topic-btn')?.addEventListener('click', () => openEditComposer(topic));
  $('#report-topic-btn')?.addEventListener('click', () => {
    const launchReport = () => {
      reportingTopicId = topic.id;
      reportForm.reset();
      reportDialog.showModal();
    };
    if (!currentUser) openAuthDialog(launchReport);
    else launchReport();
  });

  $('#copy-contact-btn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(topic.contact);
      showToast('联系方式已复制');
    } catch {
      showToast(`联系方式：${topic.contact}`);
    }
  });

  $('#toggle-status-btn')?.addEventListener('click', async () => {
    const toggle = async () => {
      const currentStatus = isServerMode ? topic.status : effectiveDemoStatus(topic);
      const nextStatus = currentStatus === 'open' ? 'closed' : 'open';
      if (isServerMode) {
        try {
          await api(`/api/topics/${encodeURIComponent(topic.id)}/status`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
          showToast(nextStatus === 'closed' ? '已标记为完成，联系方式已自动隐藏' : '已重新开启互助帖');
          await renderRoute(false);
        } catch (err) {
          showToast(err.message);
        }
      } else {
        demo.statusOverrides[topic.id] = nextStatus;
        saveDemo();
        renderTopicView(topic);
        showToast(nextStatus === 'closed' ? '已标记为完成，联系方式已自动隐藏' : '已重新开启互助帖');
      }
    };
    if (!currentUser) openAuthDialog(toggle);
    else toggle();
  });

  $('#pin-topic-btn')?.addEventListener('click', async () => {
    try {
      const res = await api(`/api/topics/${encodeURIComponent(topic.id)}/pin`, { method: 'PATCH' });
      showToast(res.pinned ? '帖子已置顶' : '已取消置顶');
      await renderRoute(false);
    } catch (err) {
      showToast(err.message);
    }
  });

  $('#delete-topic-btn')?.addEventListener('click', async () => {
    if (!window.confirm('确定要删除这篇帖子吗？删除后无法恢复。')) return;
    try {
      await api(`/api/topics/${encodeURIComponent(topic.id)}`, { method: 'DELETE' });
      showToast('帖子已删除');
      showFeed();
    } catch (err) {
      showToast(err.message);
    }
  });

  topicPage.querySelectorAll('[data-like-type]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const runLike = async () => {
        try {
          const res = await api('/api/likes', {
            method: 'POST',
            body: JSON.stringify({ targetType: btn.dataset.likeType, targetId: btn.dataset.likeId }),
          });
          btn.classList.toggle('is-liked', res.liked);
          btn.querySelector('.like-num').textContent = String(res.count);
          const labelSpan = btn.querySelector('span:not(.like-num)');
          if (labelSpan) labelSpan.textContent = res.liked ? '已赞' : '赞';
        } catch (err) {
          showToast(err.message);
        }
      };
      if (!currentUser) openAuthDialog(runLike);
      else runLike();
    });
  });

  topicPage.querySelectorAll('[data-accept-reply]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        const res = await api(`/api/topics/${encodeURIComponent(topic.id)}/accept`, {
          method: 'POST',
          body: JSON.stringify({ replyId: btn.dataset.acceptReply }),
        });
        showToast(res.accepted ? '已采纳为最佳答案' : '已取消采纳');
        await renderRoute(false);
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  topicPage.querySelectorAll('[data-delete-reply]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!window.confirm('确定删除这条回复？')) return;
      try {
        await api(`/api/replies/${encodeURIComponent(btn.dataset.deleteReply)}`, { method: 'DELETE' });
        showToast('回复已删除');
        await renderRoute(false);
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  topicPage.querySelectorAll('[data-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = topic.images?.[Number(btn.dataset.lightbox)];
      if (!src) return;
      $('#lightbox-img').src = src;
      lightbox.showModal();
    });
  });

  $('#reply-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = event.currentTarget.elements.body;
    const body = input.value.trim();
    if (!body) {
      input.setCustomValidity('请填写回复内容。');
      input.reportValidity();
      return;
    }
    const submitReply = async () => {
      if (isServerMode) {
        try {
          await api(`/api/topics/${encodeURIComponent(topic.id)}/replies`, {
            method: 'POST',
            body: JSON.stringify({ body }),
          });
          showToast('回复已发布');
          await renderRoute(false);
        } catch (err) {
          showToast(err.message);
        }
      } else {
        demo.replies[topic.id] ??= [];
        const createdAt = Date.now();
        const author = currentUser?.nickname || '体验同学';
        demo.replies[topic.id].push({ id: `reply-${createdAt}`, author, initial: currentUser?.initial || author.slice(0, 1), color: currentUser?.color || 'violet', createdAt, body });
        const saved = saveDemo();
        renderTopicView(topic);
        showToast(saved ? '回复已保存到当前浏览器' : '回复仅保留在当前页面');
      }
    };
    if (!currentUser) openAuthDialog(submitReply);
    else submitReply();
  });
}

async function renderProfileView(userId) {
  if (!isServerMode) {
    profilePage.innerHTML = `<a class="back-link" href="#">${icon('back')}返回讨论</a><section class="profile-card"><h1>演示模式暂不支持主页</h1></section>`;
    return;
  }
  try {
    const data = await api(`/api/users/${encodeURIComponent(userId)}`);
    const p = data.profile;
    const roleTag = p.role === 'admin' ? '<span class="role-tag">管理员</span>' : '';
    document.title = `${p.nickname} · 重电校园站`;
    profilePage.innerHTML = `
      <div class="topic-top-bar"><a class="back-link" href="#">${icon('back')}返回讨论</a></div>
      <section class="profile-card">
        <div class="profile-head">
          ${avatar(p, 'lg')}
          <div>
            <h1>${escapeHtml(p.nickname)}${roleTag}</h1>
            <div class="profile-meta">${escapeHtml(p.campus)}校区 · ${shortDate.format(p.createdAt)} 加入</div>
          </div>
        </div>
        <div class="profile-stats">
          <div><strong>${p.topicCount}</strong>发帖</div>
          <div><strong>${p.replyCount}</strong>回复</div>
          <div><strong>${p.likesReceived}</strong>获赞</div>
        </div>
        <h2 class="profile-section-title">最近发布的帖子</h2>
        ${data.topics.length ? buildTopicTableHtml(data.topics) : '<p class="topic-empty">还没有发布过帖子。</p>'}
      </section>`;
  } catch (err) {
    profilePage.innerHTML = `<a class="back-link" href="#">${icon('back')}返回讨论</a><section class="profile-card"><h1>无法加载同学主页</h1><p>${escapeHtml(err.message)}</p></section>`;
  }
}

async function renderRoute(moveFocus = false) {
  const topicMatch = location.hash.match(/^#topic\/([a-zA-Z0-9-]+)(?:\/([a-zA-Z0-9-]+))?$/);
  const userMatch = location.hash.match(/^#user\/(\d+)$/);
  const isDetail = Boolean(topicMatch || userMatch);

  document.body.classList.toggle('is-topic-view', isDetail);
  $('#feed-page').hidden = isDetail;
  topicPage.hidden = !topicMatch;
  profilePage.hidden = !userMatch;

  if (userMatch) {
    await renderProfileView(userMatch[1]);
  } else if (!topicMatch) {
    document.title = '重电校园站 · 校园问答与互助社区';
    await renderFeed();
  } else {
    const [, id, replyId] = topicMatch;
    if (isServerMode) {
      try {
        const data = await api(`/api/topics/${encodeURIComponent(id)}`);
        const topic = data.topic;
        renderTopicView(topic);
        document.title = `${topic.title} · 重电校园站`;
        const reply = replyId && document.getElementById(`reply-anchor-${replyId}`);
        if (reply) {
          reply.classList.add('reply-target');
          reply.scrollIntoView({ block: 'start' });
          if (moveFocus) reply.focus({ preventScroll: true });
          return;
        }
      } catch (err) {
        topicPage.innerHTML = `<a class="back-link" href="#">${icon('back')}返回讨论</a><section class="topic-card"><h1>无法打开这篇帖子</h1><p>${escapeHtml(err.message)}</p></section>`;
        document.title = '帖子详情 · 重电校园站';
      }
    } else {
      const topic = [...demo.posts, ...seed].find((item) => item.id === id);
      if (topic) {
        renderTopicView(topic);
        document.title = `${topic.title} · 重电校园站`;
      } else {
        topicPage.innerHTML = `<a class="back-link" href="#">${icon('back')}返回讨论</a><section class="topic-card"><h1>当前浏览器没有这篇帖子</h1></section>`;
      }
    }
  }

  if (moveFocus) {
    window.scrollTo(0, 0);
    $('#main').focus({ preventScroll: true });
  }
}

function showFeed() {
  if (location.hash) history.pushState(null, '', location.pathname + location.search);
  renderRoute();
}

function resetFilters() {
  Object.assign(filters, { category: 'all', campus: 'all', tag: 'all', tab: 'latest', query: '', activeOnly: false });
  query.value = '';
  showFeed();
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}

function syncComposerHelpFields() {
  const isHelp = postForm.elements.category.value === 'help';
  $('#help-fields').hidden = !isHelp;
  const keepOpt = postForm.elements.ttl.querySelector('option[value=""]');
  if (keepOpt) keepOpt.hidden = !editingTopicId;
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxSide = 1280;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderUploadPreviews() {
  const container = $('#upload-previews');
  container.hidden = pendingImages.length === 0;
  container.innerHTML = pendingImages.map((src, index) => `
    <div class="preview-item">
      <img src="${escapeHtml(src)}" alt="待上传图片 ${index + 1}">
      <button type="button" class="preview-remove" data-remove-img="${index}" aria-label="移除图片">${icon('close')}</button>
    </div>`).join('');
}

async function addImages(fileList) {
  const files = [...fileList].filter((file) => file.type.startsWith('image/'));
  if (!files.length) return;
  const remaining = 4 - pendingImages.length;
  if (remaining <= 0) {
    showToast('最多只能附 4 张图片');
    return;
  }
  for (const file of files.slice(0, remaining)) {
    try {
      pendingImages.push(await compressImage(file));
    } catch {
      showToast('有一张图片读取失败，已跳过');
    }
  }
  renderUploadPreviews();
}

function openComposer() {
  const launch = () => {
    editingTopicId = null;
    pendingImages = [];
    postForm.reset();
    $('#composer-title').textContent = '发布帖子';
    $('#submit-post-btn').textContent = '发布帖子';
    postForm.elements.ttl.value = '12';
    if (filters.category !== 'all') postForm.elements.category.value = filters.category;
    if (filters.campus !== 'all') postForm.elements.campus.value = filters.campus;
    else if (currentUser?.campus) postForm.elements.campus.value = currentUser.campus;
    syncComposerHelpFields();
    renderUploadPreviews();
    composer.showModal();
    postForm.elements.title.focus();
  };
  if (!currentUser) openAuthDialog(launch);
  else launch();
}

$('#categories').innerHTML = categories.map(({ id, name, icon: glyph }) => filterButton('category', id, name, 'nav-button', icon(glyph))).join('');
$('#campuses').innerHTML = campuses.map(({ id, name, icon: glyph }) => filterButton('campus', id, name, 'campus-button', icon(glyph))).join('');
$('#tag-filters').innerHTML = tags.map(({ id, name, icon: glyph }) => filterButton('tag', id, name, `tag-filter tag-${id}`, icon(glyph))).join('');
$('#tabs').innerHTML = tabs.map(({ id, name }) => filterButton('tab', id, name, 'tab')).join('');
$('#post-categories').innerHTML = categories.slice(1).map((category, index) => choiceInput(category, 'category', `type="radio" required${index === 0 ? ' checked' : ''}`, `chip ${category.id}`)).join('');
$('#post-tags').innerHTML = tags.map((tag) => choiceInput(tag, 'tags', 'type="checkbox"', `topic-tag tag-${tag.id}`)).join('');
postForm.elements.campus.innerHTML = [...campuses.slice(1).map(({ name }) => name), '全校'].map((name) => `<option>${name}</option>`).join('');
authForm.elements.campus.innerHTML = campuses.slice(1).map(({ name }) => name).map((name) => `<option>${name}</option>`).join('');

feed.addEventListener('click', (event) => {
  if (!window.matchMedia('(max-width: 640px)').matches || event.button !== 0
    || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
    || event.target.closest('a, button') || window.getSelection()?.isCollapsed === false) return;
  const title = event.target.closest('.topic-row')?.querySelector('.topic-title');
  if (title) location.hash = title.hash;
});

// 阻止按小眼睛时触发文本选中或移走焦点（彻底避免下方“登录”或错误提示被误高亮）
document.addEventListener('mousedown', (event) => {
  if (event.target.closest('[data-toggle-pwd]')) {
    event.preventDefault();
  }
});

document.addEventListener('click', async (event) => {
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    const { filter: key, value } = filter.dataset;
    filters[key] = key === 'tag' && filters.tag === value ? 'all' : value;
    showFeed();
    if (filter.matches('.topic-tag')) {
      const clear = $('#reset-filters');
      (clear.hidden ? $('#tabs [aria-pressed="true"]') : clear).focus();
    }
  }
  if (event.target.closest('[data-reset], #reset-filters')) {
    resetFilters();
    $('#tabs [data-value="latest"]').focus({ preventScroll: true });
  }
  if (event.target.closest('[data-compose]')) openComposer();
  if (event.target.closest('[data-auth]')) openAuthDialog();
  if (event.target.closest('[data-close-auth]')) authDialog.close();

  const tabBtn = event.target.closest('[data-auth-tab]');
  if (tabBtn) {
    authTab = tabBtn.dataset.authTab;
    $('#auth-error').hidden = true;
    syncAuthTabUI();
  }

  const eyeBtn = event.target.closest('[data-toggle-pwd]');
  if (eyeBtn) {
    event.preventDefault();
    const input = eyeBtn.closest('.pwd-wrap')?.querySelector('input');
    if (input) {
      const nextShow = input.type !== 'text';
      const selStart = input.selectionStart;
      const selEnd = input.selectionEnd;
      input.type = nextShow ? 'text' : 'password';
      setEyeIcon(eyeBtn, nextShow);
      input.focus({ preventScroll: true });
      if (selStart !== null && selEnd !== null) {
        try { input.setSelectionRange(selStart, selEnd); } catch { /* ignore */ }
      }
      window.getSelection()?.removeAllRanges();
    }
  }

  const removeBtn = event.target.closest('[data-remove-img]');
  if (removeBtn) {
    pendingImages.splice(Number(removeBtn.dataset.removeImg), 1);
    renderUploadPreviews();
  }

  const delQBtn = event.target.closest('[data-del-question]');
  if (delQBtn) {
    try {
      await api(`/api/admin/questions/${delQBtn.dataset.delQuestion}`, { method: 'DELETE' });
      showToast('已删除验证题');
      loadAdminPanels();
    } catch (err) {
      showToast(err.message);
    }
  }

  const resolveBtn = event.target.closest('[data-resolve-report]');
  if (resolveBtn) {
    try {
      await api(`/api/admin/reports/${resolveBtn.dataset.resolveReport}/resolve`, { method: 'POST' });
      showToast('已标记举报为已处理');
      loadAdminPanels();
    } catch (err) {
      showToast(err.message);
    }
  }

  const notifBtn = event.target.closest('[data-notif-id]');
  if (notifBtn) {
    const id = notifBtn.dataset.notifId;
    const href = notifBtn.dataset.notifHref;
    notifDialog.close();
    api(`/api/notifications/${id}/read`, { method: 'POST' }).then(pollUnreadCount).catch(() => {});
    if (href) location.hash = href;
  }
});

$('#notif-button').addEventListener('click', openNotifDialog);
$('#close-notif').addEventListener('click', () => notifDialog.close());
$('#mark-all-read').addEventListener('click', async () => {
  try {
    await api('/api/notifications/read-all', { method: 'POST' });
    updateNotifBadge(0);
    openNotifDialog();
    showToast('已全部标为已读');
  } catch (err) {
    showToast(err.message);
  }
});

$('#close-report').addEventListener('click', () => reportDialog.close());
$('#cancel-report').addEventListener('click', () => reportDialog.close());
reportForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!reportingTopicId) return;
  try {
    await api('/api/reports', {
      method: 'POST',
      body: JSON.stringify({
        topicId: reportingTopicId,
        reason: reportForm.elements.reason.value,
        detail: reportForm.elements.detail.value.trim(),
      }),
    });
    reportDialog.close();
    showToast('举报已提交，感谢共同维护社区环境');
  } catch (err) {
    showToast(err.message);
  }
});

$('#active-only').addEventListener('change', (event) => {
  filters.activeOnly = event.currentTarget.checked;
  showFeed();
});

postForm.addEventListener('change', (event) => {
  if (event.target.name === 'category') syncComposerHelpFields();
});

$('#image-input').addEventListener('change', async (event) => {
  await addImages(event.currentTarget.files);
  event.currentTarget.value = '';
});

composer.addEventListener('paste', async (event) => {
  const items = [...(event.clipboardData?.items || [])].filter((item) => item.type.startsWith('image/'));
  if (!items.length) return;
  await addImages(items.map((item) => item.getAsFile()).filter(Boolean));
});

document.addEventListener('input', (event) => {
  if (event.target.matches('input, textarea')) event.target.setCustomValidity('');
});

$('#brand').addEventListener('click', (event) => {
  event.preventDefault();
  resetFilters();
  window.scrollTo(0, 0);
});
$('#search').addEventListener('submit', (event) => {
  event.preventDefault();
  showFeed();
  $('#feed-tools').scrollIntoView({ block: 'start' });
});
query.addEventListener('input', () => {
  filters.query = query.value;
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => showFeed(), isServerMode ? 180 : 0);
});
document.addEventListener('keydown', (event) => {
  const typing = event.target.matches('input, textarea, select, [contenteditable]');
  const anyModal = composer.open || authDialog.open || notifDialog.open || reportDialog.open;
  if (!anyModal && (event.key === '/' && !typing || event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey))) {
    event.preventDefault();
    query.focus();
  }
});

$('#close-composer').addEventListener('click', () => composer.close());
$('#cancel-post').addEventListener('click', () => composer.close());
$('#close-auth').addEventListener('click', () => authDialog.close());
$('#close-signed-auth').addEventListener('click', () => authDialog.close());

authForm.elements.username.addEventListener('input', updateLiveEmailUI);
authForm.elements.nickname.addEventListener('input', updateLiveNicknameUI);
authForm.elements.password.addEventListener('input', syncRegisterLiveValidation);
authForm.elements.confirmPassword.addEventListener('input', syncRegisterLiveValidation);
$('#change-password-form').elements.newPassword.addEventListener('input', syncChangePasswordLiveValidation);
$('#change-password-form').elements.confirmNewPassword.addEventListener('input', syncChangePasswordLiveValidation);
$('#refresh-captcha-btn').addEventListener('click', () => refreshCaptcha(true));
authForm.elements.captchaCode.addEventListener('input', () => {
  if (authForm.elements.captchaCode.classList.contains('is-invalid')) {
    authForm.elements.captchaCode.classList.remove('is-invalid');
    setFieldStatus($('#reg-captcha-msg'), '点击图片可刷新');
  }
});

$('#send-code-btn').addEventListener('click', async () => {
  const err = $('#auth-error');
  err.hidden = true;
  const email = authForm.elements.username.value.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    updateLiveEmailUI();
    err.textContent = '请先输入有效的邮箱地址。';
    err.hidden = false;
    showToast('请先输入有效的邮箱地址');
    authForm.elements.username.focus();
    return;
  }
  if (captchaVerifiedForSend) {
    await refreshCaptcha(true, true);
    authForm.elements.captchaCode.classList.remove('is-valid');
    authForm.elements.captchaCode.classList.add('is-invalid');
    setFieldStatus($('#reg-captcha-msg'), '请输入新图形码', 'is-error');
    err.textContent = '重新发送验证码前，请输入新的图形验证码。';
    err.hidden = false;
    authForm.elements.captchaCode.focus();
    return;
  }
  const captchaCode = authForm.elements.captchaCode.value.trim();
  if (!captchaCode) {
    authForm.elements.captchaCode.classList.add('is-invalid');
    setFieldStatus($('#reg-captcha-msg'), '请先输入图形码', 'is-error');
    err.textContent = '请先输入人机图形验证码，再获取邮箱验证码。';
    err.hidden = false;
    showToast('请先输入人机图形验证码');
    authForm.elements.captchaCode.focus();
    return;
  }
  const btn = $('#send-code-btn');
  btn.disabled = true;
  btn.textContent = '发送中...';
  try {
    const purpose = authTab === 'reset' ? 'reset' : 'register';
    const res = await api('/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email, purpose, captchaId: currentCaptchaId, captchaCode }),
    });
    captchaVerifiedForSend = true;
    authForm.elements.captchaCode.classList.remove('is-invalid');
    authForm.elements.captchaCode.classList.add('is-valid');
    setFieldStatus($('#reg-captcha-msg'), '✓ 验证通过', 'is-ok');
    startCodeCooldown(res.cooldown || 60);
    showToast('验证码已发送到您的邮箱，5 分钟内有效（若未收到请查看垃圾箱）');
    authForm.elements.emailCode.focus();
  } catch (e) {
    btn.disabled = false;
    btn.textContent = '发送验证码';
    const isCaptchaErr = /图形验证码/.test(e.message);
    err.textContent = e.message;
    err.hidden = false;
    showToast(e.message);
    if (isCaptchaErr) {
      authForm.elements.captchaCode.classList.remove('is-valid');
      authForm.elements.captchaCode.classList.add('is-invalid');
      setFieldStatus($('#reg-captcha-msg'), e.message.includes('过期') ? '已过期，已换新图' : '输入错误，已换新图', 'is-error');
      await refreshCaptcha(true, true);
      authForm.elements.captchaCode.focus();
    } else {
      await refreshCaptcha(true, false);
    }
  }
});
$('#close-lightbox').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

$('#logout-btn').addEventListener('click', async () => {
  if (isServerMode) {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
  } else {
    demo.user = null;
    saveDemo();
  }
  currentUser = null;
  renderAuthButton();
  authDialog.close();
  renderRoute(false);
  showToast('已退出登录');
});

$('#change-password-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const err = $('#change-password-error');
  err.hidden = true;
  const oldPassword = form.elements.oldPassword.value;
  const newPassword = form.elements.newPassword.value;
  const confirmNewPassword = form.elements.confirmNewPassword.value;

  const pwdErr = validatePasswordStrength(newPassword);
  if (pwdErr) {
    err.textContent = pwdErr;
    err.hidden = false;
    form.elements.newPassword.focus();
    return;
  }
  if (newPassword !== confirmNewPassword) {
    err.textContent = '两次输入的新密码不一致，请重新确认。';
    err.hidden = false;
    form.elements.confirmNewPassword.focus();
    return;
  }

  try {
    await api('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword, confirmNewPassword }),
    });
    form.reset();
    resetPasswordVisibility(form);
    syncChangePasswordLiveValidation();
    $('#change-password-box').open = false;
    showToast('密码已更新，下次登录请使用新密码');
  } catch (e) {
    err.textContent = e.message;
    err.hidden = false;
  }
});

$('#admin-question-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const question = form.elements.question.value.trim();
  const answers = form.elements.answers.value.trim();
  if (!question || !answers) return;
  try {
    await api('/api/admin/questions', { method: 'POST', body: JSON.stringify({ question, answers }) });
    form.reset();
    showToast('新验证题已加入题库');
    loadAdminPanels();
  } catch (err) {
    showToast(err.message);
  }
});

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const err = $('#auth-error');
  err.hidden = true;
  const submitBtn = $('#auth-submit');

  if (isServerMode) {
    const identifier = authForm.elements.username.value.trim();
    const password = authForm.elements.password.value;

    if (authTab === 'login') {
      if (!identifier || !password) {
        err.textContent = '请输入邮箱/账号和密码。';
        err.hidden = false;
        return;
      }
    } else if (authTab === 'reset') {
      const email = identifier.toLowerCase();
      const emailCode = authForm.elements.emailCode.value.trim();
      const confirmPassword = authForm.elements.confirmPassword.value;
      if (!EMAIL_RE.test(email)) {
        err.textContent = '请输入有效的注册邮箱。';
        err.hidden = false;
        authForm.elements.username.focus();
        return;
      }
      if (!/^\d{6}$/.test(emailCode)) {
        err.textContent = '请输入 6 位数字邮箱验证码。';
        err.hidden = false;
        authForm.elements.emailCode.focus();
        return;
      }
      const pwdErr = validatePasswordStrength(password);
      if (pwdErr) {
        syncRegisterLiveValidation();
        err.textContent = pwdErr;
        err.hidden = false;
        authForm.elements.password.focus();
        return;
      }
      if (password !== confirmPassword) {
        syncRegisterLiveValidation();
        err.textContent = '两次输入的新密码不一致，请重新确认。';
        err.hidden = false;
        authForm.elements.confirmPassword.focus();
        return;
      }
    } else {
      const email = identifier.toLowerCase();
      const confirmPassword = authForm.elements.confirmPassword.value;
      const nickname = authForm.elements.nickname.value.trim();
      const captchaCode = authForm.elements.captchaCode.value.trim();
      const emailCode = authForm.elements.emailCode.value.trim();
      const answer = authForm.elements.answer.value.trim();
      if (!EMAIL_RE.test(email)) {
        updateLiveEmailUI();
        err.textContent = '请输入有效的邮箱地址作为账号。';
        err.hidden = false;
        authForm.elements.username.focus();
        return;
      }
      if (availabilityState.email === false) {
        err.textContent = '该邮箱已被注册，请直接登录。';
        err.hidden = false;
        authForm.elements.username.focus();
        return;
      }
      if (!nickname) {
        err.textContent = '请填写一个昵称。';
        err.hidden = false;
        authForm.elements.nickname.focus();
        return;
      }
      if (availabilityState.nickname === false) {
        err.textContent = '该昵称已被其他同学使用，请换一个昵称。';
        err.hidden = false;
        authForm.elements.nickname.focus();
        return;
      }
      if (emailVerifyEnabled) {
        if (!/^\d{6}$/.test(emailCode)) {
          err.textContent = '请先获取并输入 6 位邮箱验证码。';
          err.hidden = false;
          authForm.elements.emailCode.focus();
          return;
        }
      } else if (!captchaCode) {
        err.textContent = '请输入右侧图形验证码。';
        err.hidden = false;
        authForm.elements.captchaCode.focus();
        return;
      }
      const pwdErr = validatePasswordStrength(password);
      if (pwdErr) {
        syncRegisterLiveValidation();
        err.textContent = pwdErr;
        err.hidden = false;
        authForm.elements.password.focus();
        return;
      }
      if (password !== confirmPassword) {
        syncRegisterLiveValidation();
        err.textContent = '两次输入的密码不一致，请重新确认。';
        err.hidden = false;
        authForm.elements.confirmPassword.focus();
        return;
      }
      if (!answer) {
        err.textContent = '请填写校内验证题答案。';
        err.hidden = false;
        authForm.elements.answer.focus();
        return;
      }
    }

    submitBtn.disabled = true;
    try {
      if (authTab === 'reset') {
        await api('/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({
            email: identifier.toLowerCase(),
            emailCode: authForm.elements.emailCode.value.trim(),
            newPassword: password,
            confirmNewPassword: authForm.elements.confirmPassword.value,
          }),
        });
        showToast('密码重置成功，请使用新密码登录');
        authTab = 'login';
        authForm.elements.password.value = '';
        authForm.elements.confirmPassword.value = '';
        syncAuthTabUI();
        return;
      }

      const data = authTab === 'login'
        ? await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: identifier, password }),
          })
        : await api('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
              email: identifier.toLowerCase(),
              password,
              confirmPassword: authForm.elements.confirmPassword.value,
              nickname: authForm.elements.nickname.value.trim(),
              campus: authForm.elements.campus.value,
              captchaId: currentCaptchaId,
              captchaCode: authForm.elements.captchaCode.value.trim(),
              emailCode: authForm.elements.emailCode.value.trim(),
              questionId: currentVerifyQuestion?.id,
              answer: authForm.elements.answer.value.trim(),
            }),
          });
      currentUser = data.user;
      renderAuthButton();
      pollUnreadCount();
      authDialog.close();
      showToast(`欢迎你，${currentUser.nickname}（${currentUser.campus}校区）`);
      const next = afterAuthAction;
      afterAuthAction = null;
      if (next) next();
      else renderRoute(false);
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
      if (authTab !== 'login' && !emailVerifyEnabled) refreshCaptcha();
    } finally {
      submitBtn.disabled = false;
    }
    return;
  }

  const nickname = authForm.elements.nickname.value.trim();
  const campus = authForm.elements.campus.value;
  const answer = authForm.elements.answer.value.trim();
  if (!nickname) {
    err.textContent = '请填写一个昵称。';
    err.hidden = false;
    return;
  }
  if (!demoVerifyQuestions[0].answers.includes(answer)) {
    err.textContent = '验证答案不对哦，提示：三个字，重电同学常用的简称。';
    err.hidden = false;
    authForm.elements.answer.focus();
    return;
  }
  const colors = ['violet', 'blue', 'gold', 'green', 'rose'];
  demo.user = { nickname, initial: nickname.slice(0, 1), campus, color: colors[nickname.charCodeAt(0) % colors.length], verifiedAt: Date.now() };
  currentUser = demo.user;
  saveDemo();
  renderAuthButton();
  authDialog.close();
  showToast(`欢迎你，${nickname}（${campus}校区）`);
  const next = afterAuthAction;
  afterAuthAction = null;
  if (next) next();
  else renderRoute(false);
});

postForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const { title, body, category, campus, reward, ttl, contact } = postForm.elements;
  const blank = [title, body].find((input) => !input.value.trim());
  if (blank) {
    blank.setCustomValidity('请填写内容。');
    blank.reportValidity();
    return;
  }
  const submitBtn = $('#submit-post-btn');
  const selectedTags = new FormData(postForm).getAll('tags');

  if (isServerMode) {
    submitBtn.disabled = true;
    try {
      const payload = {
        title: title.value.trim(),
        body: body.value.trim(),
        category: category.value,
        campus: campus.value,
        tags: selectedTags,
        reward: reward.value.trim(),
        contact: contact.value.trim(),
        images: pendingImages,
      };
      if (ttl.value !== '') payload.ttl = Number(ttl.value);

      const isEdit = Boolean(editingTopicId);
      const res = isEdit
        ? await api(`/api/topics/${encodeURIComponent(editingTopicId)}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await api('/api/topics', { method: 'POST', body: JSON.stringify(payload) });

      pendingImages = [];
      editingTopicId = null;
      postForm.reset();
      composer.close();
      if (isEdit) {
        showToast('帖子修改已保存');
        await renderRoute(false);
      } else {
        resetFilters();
        location.hash = topicHref(res.id);
        showToast('帖子已发布');
      }
    } catch (err) {
      showToast(err.message);
    } finally {
      submitBtn.disabled = false;
    }
    return;
  }

  const createdAt = Date.now();
  const isHelp = category.value === 'help';
  const ttlHours = Number(ttl.value || 12);
  const author = currentUser?.nickname || '体验同学';
  const topic = {
    id: `demo-${createdAt}`,
    title: title.value.trim(),
    body: body.value.trim(),
    category: category.value,
    campus: campus.value,
    tags: selectedTags,
    images: [...pendingImages],
    author,
    initial: currentUser?.initial || author.slice(0, 1),
    color: currentUser?.color || 'violet',
    createdAt,
    views: 0,
    replies: [],
  };
  if (isHelp) {
    topic.status = 'open';
    if (reward.value.trim()) topic.reward = reward.value.trim();
    if (contact.value.trim()) topic.contact = contact.value.trim();
    if (ttlHours > 0) topic.expiresAt = createdAt + ttlHours * HOUR;
  }
  demo.posts.unshift(topic);
  const saved = saveDemo();
  pendingImages = [];
  postForm.reset();
  composer.close();
  resetFilters();
  location.hash = topicHref(topic.id);
  showToast(saved ? '帖子已保存到当前浏览器' : '帖子仅保留在当前页面');
});

window.addEventListener('hashchange', () => renderRoute(true));
window.setInterval(refreshActivity, 30_000);
window.setInterval(pollUnreadCount, 45_000);

async function boot() {
  if (location.protocol.startsWith('http')) {
    try {
      const data = await api('/api/bootstrap');
      if (data.mode === 'server') {
        isServerMode = true;
        emailVerifyEnabled = Boolean(data.emailVerifyEnabled);
        currentUser = data.user || null;
        if (data.verifyQuestion) currentVerifyQuestion = data.verifyQuestion;
        updateNotifBadge(data.unreadCount);
      }
    } catch {
      isServerMode = false;
    }
  }
  if (!isServerMode) {
    currentUser = demo.user;
    $('#mode-badge').textContent = '演示原型';
    $('#composer-note').textContent = '演示模式：内容保存在当前浏览器。请勿发布代课、代做作业等违规信息。';
  } else {
    $('#mode-badge').textContent = '在线社区';
    $('#composer-note').textContent = '图片会自动压缩上传；请勿发布代课、代做作业等违规信息。';
  }
  renderAuthButton();
  await renderRoute();
}

boot();
