'use strict';

const categories = [
  { id: 'all', name: '全部讨论', icon: 'home' },
  { id: 'help', name: '校园互助', icon: 'package' },
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
  { id: 'lost', name: '失物招领', icon: 'pin' },
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

// 轻校内验证题库（后续可直接往数组里追加更多重电校内常识题）
const verifyQuestions = [
  { question: '我们学校的别名是啥？', answers: ['电子校'] },
];

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
const bootNow = Date.now();

const seed = [
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
  { id: 'internship', title: '第一份实习复盘：我怎么整理简历里的项目经历', category: 'career', tags: ['notes', 'internship'], campus: '两江', author: '宋同学', initial: '宋', color: 'gold', createdAt: Date.parse('2026-11-07T13:20:00+08:00'), views: 212, body: '最开始，我的简历只列了项目用过的软件。后来我把每段项目经历改成三句话：做了什么、我负责哪部分、怎么确认它能用。\n\n对一个课程小项目，我附上自己写的说明文档和一张结果截图，面试时就有具体东西可以讲。大家也可以分享自己的改法。', replies: [
    { id: 'r3', author: '林同学', initial: '林', color: 'violet', createdAt: Date.parse('2026-11-07T14:05:00+08:00'), body: '团队项目也适用，最好说清自己负责的模块和遇到的一个具体问题。' },
  ] },
  { id: 'competition', title: '电子设计竞赛想找队友，有人愿意一起从基础练起吗？', category: 'career', tags: ['team', 'project'], campus: '永川', author: '林同学', initial: '林', color: 'violet', createdAt: Date.parse('2026-11-07T11:45:00+08:00'), views: 74, body: '我有一点 C 语言基础，周末想和同校区同学一起做一个小项目。可以先从传感器采样和串口输出开始，一起画个分工表。想加入的同学可以回复自己擅长什么、方便的时间。', replies: [] },
  { id: 'library', title: '周末想找个能插电脑的自习位置，大家一般去哪？', category: 'life', tags: ['question', 'guide'], campus: '大学城', author: '许同学', initial: '许', color: 'rose', createdAt: Date.parse('2026-11-06T20:10:00+08:00'), views: 58, body: '带电脑做课程项目，希望是能找到插座、可以坐一会儿的地方。有没有同学分享最近的体验？也想了解一下周末开放时间去哪里确认。', replies: [] },
  { id: 'lab-notes', title: '我怎么写实验记录，复现时才不用从头再试', category: 'study', tags: ['notes', 'project'], campus: '两江', author: '周同学', initial: '周', color: 'blue', createdAt: Date.parse('2026-11-06T16:30:00+08:00'), views: 93, body: '每次实验我会记录四项：软件版本、输入条件、实际结果、下一次要验证的变化。调试时一次只改一处，这样即使实验没成功，也能判断哪一步出了问题。\n\n如果发给同学，记得附上能复现的最小例子，并说明依赖和数据从哪里来。', replies: [
    { id: 'r4', author: '许同学', initial: '许', color: 'rose', createdAt: Date.parse('2026-11-06T18:10:00+08:00'), body: '记版本特别有用，同一个工程换电脑后遇到过好几次环境差异。' },
  ] },
  { id: 'lab-checklist', title: '第一次进实训室前，哪些东西值得提前准备？', category: 'study', tags: ['question', 'guide'], campus: '永川', author: '叶同学', initial: '叶', color: 'green', createdAt: Date.parse('2026-11-06T14:15:00+08:00'), views: 67, body: '准备整理一份实训前检查清单。我想到的是提前确认软件版本、下载老师给的材料、准备数据线。哪些东西你们是到了教室才发现缺的？', replies: [] },
  { id: 'campus-map', title: '新生想问：第一次去另一个校区，怎么确认上课地点？', category: 'life', tags: ['question', 'guide'], campus: '全校', author: '方同学', initial: '方', color: 'violet', createdAt: Date.parse('2026-11-06T10:05:00+08:00'), views: 52, body: '课表上只看到楼栋简称，有没有同学知道应该到哪里核对校区和教室？如果是临时换教室，通常看哪个通知最准确？', replies: [] },
  { id: 'welcome', title: '第一次发帖？看看这份校园站发帖指南', category: 'notice', tags: ['guide'], campus: '全校', author: '校园站', initial: '站', color: 'green', createdAt: Date.parse('2026-06-12T09:00:00+08:00'), views: 108, body: '1. 提问与经验分享：写清楚校区、你想解决的问题和已经试过的方法。\n2. 校园互助（跑腿代取、二手、拼车、失物招领）：请填好有效期和独立联系方式，完成后点「标记为已完成」，联系方式会自动隐藏。\n3. 社区边界：请勿发布代课、代做作业、刷课或任何违规广告信息。\n\n当前为本地交互原型，试发内容与验证状态保存在当前浏览器。', replies: [] },
];

const $ = (selector) => document.querySelector(selector);
const query = $('#query');
const feed = $('#feed');
const topicPage = $('#topic-page');
const composer = $('#composer');
const postForm = $('#post-form');
const authDialog = $('#auth-dialog');
const authForm = $('#auth-form');
const lightbox = $('#lightbox');
const storageKey = 'cqetc-campus-demo-v2';
const fullDate = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' });
const filters = { category: 'all', campus: 'all', tag: 'all', tab: 'latest', query: '', activeOnly: false };
let pendingImages = [];
let currentVerifyIndex = 0;
let afterAuthAction = null;
let toastTimer;

function loadDemo() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return {
      posts: data.posts || [],
      replies: data.replies || {},
      statusOverrides: data.statusOverrides || {},
      user: data.user || null,
    };
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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function icon(name) {
  return `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

function avatar(person) {
  return `<span class="avatar ${escapeHtml(person.color || 'green')}" aria-hidden="true">${escapeHtml(person.initial || '友')}</span>`;
}

function categoryName(id) {
  return categories.find((category) => category.id === id)?.name || '校园讨论';
}

function topicHref(id, replyId) {
  const topicPath = `#topic/${encodeURIComponent(id)}`;
  return replyId ? `${topicPath}/${encodeURIComponent(replyId)}` : topicPath;
}

function effectiveStatus(topic, now = Date.now()) {
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

function topicMeta(topic, now = Date.now()) {
  const category = categories.find(({ id }) => id === topic.category);
  const campus = topic.campus === '全校' ? '全校' : `${topic.campus}校区`;
  const status = effectiveStatus(topic, now);
  const badge = category ? `<span class="chip ${category.id}">${icon(category.icon)}${category.name}</span>` : '';
  const statusPart = statusBadgeHtml(status);
  const rewardPart = topic.reward ? `<span class="reward-pill">${escapeHtml(topic.reward)}</span>` : '';
  const ttlPart = status === 'open' && topic.expiresAt ? `<span class="ttl-pill">${icon('clock')}${remainingText(topic.expiresAt, now)}</span>` : '';
  const imgPart = topic.images?.length ? `<span class="img-hint">${icon('image')}${topic.images.length}</span>` : '';
  const badges = tagsFor(topic).map(({ id, name, icon: glyph }) => filterButton('tag', id, name, `topic-tag tag-${id}`, icon(glyph)));
  return `${statusPart}${rewardPart}${badge}<span>${escapeHtml(campus)}</span>${ttlPart}${badges.join('')}${imgPart}${topic.accepted ? `<span class="solved">${icon('check')}已解决</span>` : ''}`;
}

function tagsFor(topic) {
  return tags.filter(({ id }) => topic.tags?.includes(id));
}

function repliesFor(topic) {
  return [...topic.replies, ...(demo.replies[topic.id] || [])];
}

function recordTimestamp(record) {
  return record.createdAt ?? (Number(record.id.match(/^(?:demo|reply)-(\d+)$/)?.[1]) || 0);
}

function activityOrder(topic) {
  return recordTimestamp(repliesFor(topic).at(-1) ?? topic);
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
  feed.querySelectorAll('[data-activity]').forEach((element) => {
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

function renderAuthButton() {
  const btn = $('#auth-button');
  if (demo.user) {
    btn.innerHTML = `${avatar(demo.user)}<span>${escapeHtml(demo.user.nickname)}</span>`;
    btn.title = `已通过校内验证 · ${demo.user.campus}校区`;
  } else {
    btn.innerHTML = `${icon('user')}<span>校内验证</span>`;
    btn.title = '完成轻校内验证后可发帖、回复和查看联系方式';
  }
}

function openAuthDialog(onSuccess = null) {
  afterAuthAction = onSuccess;
  $('#auth-error').hidden = true;
  if (demo.user) {
    $('#auth-title').textContent = '已验证同学';
    $('#auth-desc').hidden = true;
    $('#auth-fields').hidden = true;
    $('#auth-signed-in').hidden = false;
    $('#auth-profile').innerHTML = `${avatar(demo.user)}<div><strong>${escapeHtml(demo.user.nickname)}</strong><div class="form-note">${escapeHtml(demo.user.campus)}校区 · 已通过校内常识验证</div></div>`;
    $('#logout-btn').hidden = false;
    $('#auth-submit').hidden = true;
  } else {
    currentVerifyIndex = Math.floor(Math.random() * verifyQuestions.length);
    $('#verify-question-label').textContent = `校内验证题：${verifyQuestions[currentVerifyIndex].question}`;
    $('#auth-title').textContent = '验证同学身份';
    $('#auth-desc').hidden = false;
    $('#auth-fields').hidden = false;
    $('#auth-signed-in').hidden = true;
    $('#logout-btn').hidden = true;
    $('#auth-submit').hidden = false;
    authForm.reset();
    if (filters.campus !== 'all') authForm.elements.campus.value = filters.campus;
  }
  authDialog.showModal();
  if (!demo.user) authForm.elements.nickname.focus();
}

function renderFeed() {
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.setAttribute('aria-pressed', filters[button.dataset.filter] === button.dataset.value);
  });
  $('#active-only').checked = filters.activeOnly;

  const now = Date.now();
  const words = filters.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const activeTag = tags.find(({ id }) => id === filters.tag);
  const matching = [...demo.posts, ...seed].filter((topic) => {
    const status = effectiveStatus(topic, now);
    if (filters.activeOnly && status && status !== 'open') return false;
    const tagNames = tagsFor(topic).map(({ name }) => name);
    const replyBodies = repliesFor(topic).map((r) => r.body);
    const haystack = [topic.title, topic.body, topic.reward || '', topic.author, topic.campus, categoryName(topic.category), ...tagNames, ...replyBodies].join(' ').toLowerCase();
    return (filters.category === 'all' || topic.category === filters.category)
      && (filters.campus === 'all' || topic.campus === filters.campus)
      && (!activeTag || topic.tags?.includes(activeTag.id))
      && (filters.tab !== 'unanswered' || repliesFor(topic).length === 0)
      && words.every((word) => haystack.includes(word));
  });

  if (filters.tab === 'popular') matching.sort((first, second) => second.views - first.views);
  if (filters.tab === 'latest') matching.sort((first, second) => activityOrder(second) - activityOrder(first));
  const filtered = filters.category !== 'all' || filters.campus !== 'all' || activeTag || filters.tab !== 'latest' || filters.activeOnly || words.length > 0;
  $('#feed-title').textContent = words.length ? '搜索结果' : filters.category === 'all' ? '校园讨论' : categoryName(filters.category);
  const labelParts = [];
  if (filters.campus !== 'all') labelParts.push(`${filters.campus}校区`);
  if (activeTag) labelParts.push(activeTag.name);
  if (words.length) labelParts.push(`含“${filters.query.trim()}”`);
  $('#feed-subtitle').textContent = labelParts.length ? `${labelParts.join(' · ')} · ${matching.length} 篇` : `${matching.length} 篇帖子`;
  $('#reset-filters').hidden = !filtered;

  if (!matching.length) {
    feed.innerHTML = `<div class="empty"><h2>还没有符合条件的帖子</h2><p>试试放宽筛选条件，或者发一条新的校园讨论 / 互助帖。</p>
      <button class="button secondary" data-reset type="button">查看全部讨论</button></div>`;
    return;
  }

  feed.innerHTML = `<table class="topic-list">
    <caption class="visually-hidden">校园帖子列表</caption>
    <thead><tr>
      <th scope="col">主题</th>
      <th scope="col" class="people-column">参与</th>
      <th scope="col" class="number-column">回复</th>
      <th scope="col" class="number-column views-column">浏览</th>
      <th scope="col" class="time-column desktop-column">活动</th>
    </tr></thead>
    <tbody>${matching.map((topic) => {
      const replies = repliesFor(topic);
      const latest = replies.at(-1);
      const status = effectiveStatus(topic, now);
      const inactive = status === 'closed' || status === 'expired';
      const people = [...new Map([topic, ...replies].map((person) => [person.author, person])).values()].slice(0, 3);
      const names = escapeHtml(people.map((person) => person.author).join('、'));
      const activityLabel = latest ? '查看最新回复' : '查看主题';
      const timestamp = recordTimestamp(latest ?? topic);
      const dateLabel = timestamp ? fullDate.format(timestamp) : '时间未知';
      const time = timestamp ? `<time datetime="${new Date(timestamp).toISOString()}" data-activity="${timestamp}">${activityText(timestamp, now)}</time>` : '—';
      const activity = `<a class="activity-link" href="${topicHref(topic.id, latest?.id)}" title="${dateLabel}" aria-label="${activityLabel}：${escapeHtml(topic.title)}，${dateLabel}">${time}</a>`;
      return `<tr class="topic-row${inactive ? ' is-inactive' : ''}">
        <th scope="row">
          <a class="topic-title" href="${topicHref(topic.id)}">${escapeHtml(topic.title)}</a>
          <span class="topic-meta">${topicMeta(topic, now)}<span class="mobile-time">${activity}</span></span>
        </th>
        <td class="people-column"><span class="participant-list" title="${names}"><span class="visually-hidden">${names}</span>${people.map(avatar).join('')}</span></td>
        <td class="reply-count"><span class="reply-glyph">${icon('chat')}<span class="visually-hidden">回复数：</span></span>${replies.length}</td>
        <td class="views-column">${topic.views}</td>
        <td class="desktop-column">${activity}</td>
      </tr>`;
    }).join('')}</tbody></table>`;
}

function authorLine(person) {
  const timestamp = recordTimestamp(person);
  const date = timestamp ? fullDate.format(timestamp) : (person.time || '时间未知');
  return `<div class="author">${avatar(person)}<strong>${escapeHtml(person.author)}</strong><span>${escapeHtml(date)}</span></div>`;
}

function renderHelpPanel(topic, now) {
  if (topic.category !== 'help') return '';
  const status = effectiveStatus(topic, now);
  const canToggle = status === 'open' || status === 'closed';
  const toggleBtn = canToggle
    ? `<button class="button secondary small" id="toggle-status-btn" type="button">${status === 'open' ? '标记为已完成' : '重新开启'}</button>`
    : '';

  let contactHtml = '';
  if (topic.contact) {
    if (status !== 'open') {
      contactHtml = `<div class="contact-box">${icon('lock')}<span>帖子已${status === 'closed' ? '完成' : '过期'}，联系方式已自动隐藏</span></div>`;
    } else if (!demo.user) {
      contactHtml = `<div class="contact-box">${icon('lock')}<span>联系方式仅校内验证登录后可见</span><button class="button secondary small" id="reveal-contact-btn" type="button">校内验证后查看</button></div>`;
    } else {
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

function renderTopic(topic) {
  const now = Date.now();
  const replies = repliesFor(topic);
  const imagesHtml = topic.images?.length
    ? `<div class="topic-images">${topic.images.map((src, i) => `<button type="button" class="topic-image-btn" data-lightbox="${i}" aria-label="查看附图 ${i + 1}"><img src="${src}" alt="帖子附图 ${i + 1}"></button>`).join('')}</div>`
    : '';

  topicPage.innerHTML = `
    <a class="back-link" href="#">${icon('back')}返回讨论</a>
    <article class="topic-card">
      <h1>${escapeHtml(topic.title)}</h1>
      <div class="topic-meta">${topicMeta(topic, now)}</div>
      ${authorLine(topic)}
      ${renderHelpPanel(topic, now)}
      <p class="topic-body">${escapeHtml(topic.body)}</p>
      ${imagesHtml}
    </article>
    <section class="replies" aria-labelledby="reply-heading">
      <h2 id="reply-heading">${replies.length} 条回复</h2>
      ${replies.length ? replies.map((reply) => `
        <article id="reply-anchor-${escapeHtml(reply.id)}" class="reply${topic.accepted === reply.id ? ' solved-reply' : ''}" tabindex="-1">
          ${authorLine(reply)}
          ${topic.accepted === reply.id ? `<div class="topic-meta"><span class="solved">${icon('check')}采纳答案</span></div>` : ''}
          <p>${escapeHtml(reply.body)}</p>
        </article>`).join('') : '<p class="topic-empty">还没有人回复。可以分享你的建议或接单沟通。</p>'}
      <form id="reply-form" class="reply-form">
        <label>写回复<textarea name="body" required maxlength="1000" rows="3" placeholder="${demo.user ? `以「${escapeHtml(demo.user.nickname)}」身份回复...` : '完成校内验证后即可发送回复'}"></textarea></label>
        <button class="button primary" type="submit">发送回复</button>
      </form>
    </section>`;

  $('#reveal-contact-btn')?.addEventListener('click', () => {
    openAuthDialog(() => renderTopic(topic));
  });

  $('#copy-contact-btn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(topic.contact);
      showToast('联系方式已复制');
    } catch {
      showToast(`联系方式：${topic.contact}`);
    }
  });

  $('#toggle-status-btn')?.addEventListener('click', () => {
    const toggle = () => {
      const current = effectiveStatus(topic);
      demo.statusOverrides[topic.id] = current === 'open' ? 'closed' : 'open';
      saveDemo();
      renderTopic(topic);
      showToast(demo.statusOverrides[topic.id] === 'closed' ? '已标记为完成，联系方式已自动隐藏' : '已重新开启互助帖');
    };
    if (!demo.user) {
      openAuthDialog(toggle);
    } else {
      toggle();
    }
  });

  topicPage.querySelectorAll('[data-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = topic.images?.[Number(btn.dataset.lightbox)];
      if (!src) return;
      $('#lightbox-img').src = src;
      lightbox.showModal();
    });
  });

  $('#reply-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = event.currentTarget.elements.body;
    const body = input.value.trim();
    if (!body) {
      input.setCustomValidity('请填写回复内容。');
      input.reportValidity();
      return;
    }
    const postReply = () => {
      demo.replies[topic.id] ??= [];
      const createdAt = Date.now();
      const author = demo.user?.nickname || '体验同学';
      const initial = demo.user?.initial || author.slice(0, 1);
      demo.replies[topic.id].push({ id: `reply-${createdAt}`, author, initial, color: demo.user?.color || 'green', createdAt, body });
      const saved = saveDemo();
      renderTopic(topic);
      $('#reply-form').elements.body.focus({ preventScroll: true });
      showToast(saved ? '回复已保存到当前浏览器' : '回复仅保留在当前页面');
    };
    if (!demo.user) {
      openAuthDialog(postReply);
    } else {
      postReply();
    }
  });
}

function renderRoute(moveFocus = false) {
  const [, id, replyId] = location.hash.match(/^#topic\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/) ?? [];
  const topic = [...demo.posts, ...seed].find((item) => item.id === id);
  document.body.classList.toggle('is-topic-view', Boolean(id));
  $('#feed-page').hidden = Boolean(id);
  topicPage.hidden = !id;
  if (topic) {
    renderTopic(topic);
    document.title = `${topic.title} · 重电校园站`;
    const reply = replyId && document.getElementById(`reply-anchor-${replyId}`);
    if (reply) {
      reply.classList.add('reply-target');
      reply.scrollIntoView({ block: 'start' });
      if (moveFocus) reply.focus({ preventScroll: true });
      return;
    }
  } else if (id) {
    topicPage.innerHTML = `<a class="back-link" href="#">${icon('back')}返回讨论</a><section class="topic-card"><h1>当前浏览器没有这篇帖子</h1><p>演示中发布的内容只能在发布时使用的浏览器中查看。</p></section>`;
    document.title = '帖子详情 · 重电校园站';
  } else {
    renderFeed();
    document.title = '重电校园站 · 校园问答与互助社区';
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
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
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
      <img src="${src}" alt="待上传图片 ${index + 1}">
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
      const dataUrl = await compressImage(file);
      pendingImages.push(dataUrl);
    } catch {
      showToast('有一张图片读取失败，已跳过');
    }
  }
  renderUploadPreviews();
}

function openComposer() {
  const launch = () => {
    if (filters.category !== 'all') postForm.elements.category.value = filters.category;
    if (filters.campus !== 'all') postForm.elements.campus.value = filters.campus;
    else if (demo.user?.campus) postForm.elements.campus.value = demo.user.campus;
    syncComposerHelpFields();
    renderUploadPreviews();
    composer.showModal();
    postForm.elements.title.focus();
  };
  if (!demo.user) {
    openAuthDialog(launch);
  } else {
    launch();
  }
}

$('#categories').innerHTML = categories.map(({ id, name, icon: glyph }) => filterButton('category', id, name, 'nav-button', icon(glyph))).join('');
$('#campuses').innerHTML = campuses.map(({ id, name, icon: glyph }) => filterButton('campus', id, name, 'campus-button', icon(glyph))).join('');
$('#tag-filters').innerHTML = tags.map(({ id, name, icon: glyph }) => filterButton('tag', id, name, `tag-filter tag-${id}`, icon(glyph))).join('');
$('#tabs').innerHTML = tabs.map(({ id, name }) => filterButton('tab', id, name, 'tab')).join('');
$('#post-categories').innerHTML = categories.slice(1).map((category, index) => choiceInput(category, 'category', `type="radio" required${index === 0 ? ' checked' : ''}`, `chip ${category.id}`)).join('');
$('#post-tags').innerHTML = tags.map((tag) => choiceInput(tag, 'tags', 'type="checkbox"', `topic-tag tag-${tag.id}`)).join('');
postForm.elements.campus.innerHTML = [...campuses.slice(1).map(({ name }) => name), '全校'].map((name) => `<option>${name}</option>`).join('');
authForm.elements.campus.innerHTML = campuses.slice(1).map(({ name }) => `<option>${name}</option>`).join('');

renderAuthButton();

feed.addEventListener('click', (event) => {
  if (!window.matchMedia('(max-width: 640px)').matches || event.button !== 0
    || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
    || event.target.closest('a, button') || window.getSelection()?.isCollapsed === false) return;
  const title = event.target.closest('.topic-row')?.querySelector('.topic-title');
  if (title) location.hash = title.hash;
});

document.addEventListener('click', (event) => {
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
  if (event.target.closest('[data-compose]')) {
    openComposer();
  }
  if (event.target.closest('[data-auth]')) {
    openAuthDialog();
  }
  const removeBtn = event.target.closest('[data-remove-img]');
  if (removeBtn) {
    pendingImages.splice(Number(removeBtn.dataset.removeImg), 1);
    renderUploadPreviews();
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
  const files = items.map((item) => item.getAsFile()).filter(Boolean);
  await addImages(files);
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
  showFeed();
});
document.addEventListener('keydown', (event) => {
  const typing = event.target.matches('input, textarea, select, [contenteditable]');
  if (!composer.open && !authDialog.open && (event.key === '/' && !typing || event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey))) {
    event.preventDefault();
    query.focus();
  }
});

$('#close-composer').addEventListener('click', () => composer.close());
$('#cancel-post').addEventListener('click', () => composer.close());
$('#close-auth').addEventListener('click', () => authDialog.close());
$('#cancel-auth').addEventListener('click', () => authDialog.close());
$('#close-lightbox').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

$('#logout-btn').addEventListener('click', () => {
  demo.user = null;
  saveDemo();
  renderAuthButton();
  authDialog.close();
  renderRoute();
  showToast('已退出校内验证状态');
});

authForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const nickname = authForm.elements.nickname.value.trim();
  const campus = authForm.elements.campus.value;
  const answer = authForm.elements.answer.value.trim();
  const err = $('#auth-error');
  const q = verifyQuestions[currentVerifyIndex];
  if (!nickname) {
    err.textContent = '请填写一个昵称。';
    err.hidden = false;
    return;
  }
  if (!q.answers.includes(answer)) {
    err.textContent = '验证答案不对哦，提示：三个字，重电同学常用的简称。';
    err.hidden = false;
    authForm.elements.answer.focus();
    return;
  }
  err.hidden = true;
  const colors = ['green', 'blue', 'gold', 'violet', 'rose'];
  const color = colors[nickname.charCodeAt(0) % colors.length];
  demo.user = { nickname, initial: nickname.slice(0, 1), campus, color, verifiedAt: Date.now() };
  saveDemo();
  renderAuthButton();
  authDialog.close();
  showToast(`欢迎你，${nickname}（${campus}校区）`);
  const next = afterAuthAction;
  afterAuthAction = null;
  if (next) next();
  else renderRoute();
});

postForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const { title, body, category, campus, reward, ttl, contact } = postForm.elements;
  const blank = [title, body].find((input) => !input.value.trim());
  if (blank) {
    blank.setCustomValidity('请填写内容。');
    blank.reportValidity();
    return;
  }
  const createdAt = Date.now();
  const isHelp = category.value === 'help';
  const ttlHours = Number(ttl.value);
  const author = demo.user?.nickname || '体验同学';
  const topic = {
    id: `demo-${createdAt}`,
    title: title.value.trim(),
    body: body.value.trim(),
    category: category.value,
    campus: campus.value,
    tags: new FormData(postForm).getAll('tags'),
    images: [...pendingImages],
    author,
    initial: demo.user?.initial || author.slice(0, 1),
    color: demo.user?.color || 'green',
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
  showToast(saved ? '帖子已保存到当前浏览器' : '帖子仅保留在当前页面（图片较大可能超出本地缓存）');
});

window.addEventListener('hashchange', () => renderRoute(true));
window.setInterval(refreshActivity, 30_000);
renderRoute();
