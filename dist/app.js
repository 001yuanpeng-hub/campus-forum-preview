'use strict';

const categories = [
  { id: 'all', name: '全部讨论', icon: 'home' },
  { id: 'study', name: '课程与实训', icon: 'book' },
  { id: 'career', name: '实习与竞赛', icon: 'briefcase' },
  { id: 'life', name: '校园生活', icon: 'pin' },
  { id: 'notice', name: '站务与指南', icon: 'compass' },
];
const campuses = ['大学城', '永川', '两江'];
const tabs = [
  { id: 'latest', name: '最新' },
  { id: 'popular', name: '热门' },
  { id: 'unanswered', name: '待回答' },
];

const seed = [
  { id: 'stm32', title: '第一次做 STM32 实训，板子和下载器怎么选？', category: 'study', campus: '大学城', author: '小陈', initial: '陈', color: 'green', time: '今天 15:40', views: 126, accepted: 'r1', body: '下周要做 STM32 实训，想先在宿舍把环境跑起来。手里还没有开发板和下载器，买之前主要应该核对哪些信息？', replies: [
    { id: 'r1', author: '周同学', initial: '周', color: 'blue', time: '今天 16:02', body: '先确认老师的例程用的是哪一个芯片型号，以及板上有没有自带调试器。如果没有，再确认板上是否引出了 SWD 接口。收到板子后，先把官方例程编译并下载进去，用点灯验证工具链，然后再接外设。' },
    { id: 'r2', author: '小陈', initial: '陈', color: 'green', time: '今天 16:15', body: '明白了，我先找老师确认芯片型号，再看板子的接口。谢谢！' },
  ] },
  { id: 'internship', title: '第一份实习复盘：我怎么整理简历里的项目经历', category: 'career', campus: '两江', author: '宋同学', initial: '宋', color: 'gold', time: '今天 13:20', views: 212, body: '最开始，我的简历只列了项目用过的软件。后来我把每段项目经历改成三句话：做了什么、我负责哪部分、怎么确认它能用。\n\n对一个课程小项目，我附上自己写的说明文档和一张结果截图，面试时就有具体东西可以讲。大家也可以分享自己的改法。', replies: [
    { id: 'r3', author: '林同学', initial: '林', color: 'violet', time: '今天 14:05', body: '团队项目也适用，最好说清自己负责的模块和遇到的一个具体问题。' },
  ] },
  { id: 'competition', title: '电子设计竞赛想找队友，有人愿意一起从基础练起吗？', category: 'career', campus: '永川', author: '林同学', initial: '林', color: 'violet', time: '今天 11:45', views: 74, body: '我有一点 C 语言基础，周末想和同校区同学一起做一个小项目。可以先从传感器采样和串口输出开始，一起画个分工表。想加入的同学可以回复自己擅长什么、方便的时间。', replies: [] },
  { id: 'library', title: '周末想找个能插电脑的自习位置，大家一般去哪？', category: 'life', campus: '大学城', author: '许同学', initial: '许', color: 'rose', time: '昨天 20:10', views: 58, body: '带电脑做课程项目，希望是能找到插座、可以坐一会儿的地方。有没有同学分享最近的体验？也想了解一下周末开放时间去哪里确认。', replies: [] },
  { id: 'lab-notes', title: '我怎么写实验记录，复现时才不用从头再试', category: 'study', campus: '两江', author: '周同学', initial: '周', color: 'blue', time: '昨天 17:30', views: 93, body: '每次实验我会记录四项：软件版本、输入条件、实际结果、下一次要验证的变化。调试时一次只改一处，这样即使实验没成功，也能判断哪一步出了问题。\n\n如果发给同学，记得附上能复现的最小例子，并说明依赖和数据从哪里来。', replies: [
    { id: 'r4', author: '许同学', initial: '许', color: 'rose', time: '昨天 18:10', body: '记版本特别有用，同一个工程换电脑后遇到过好几次环境差异。' },
  ] },
  { id: 'lab-checklist', title: '第一次进实训室前，哪些东西值得提前准备？', category: 'study', campus: '永川', author: '叶同学', initial: '叶', color: 'green', time: '昨天 14:15', views: 67, body: '准备整理一份实训前检查清单。我想到的是提前确认软件版本、下载老师给的材料、准备数据线。哪些东西你们是到了教室才发现缺的？', replies: [] },
  { id: 'campus-map', title: '新生想问：第一次去另一个校区，怎么确认上课地点？', category: 'life', campus: '全校', author: '方同学', initial: '方', color: 'violet', time: '昨天 10:05', views: 52, body: '课表上只看到楼栋简称，有没有同学知道应该到哪里核对校区和教室？如果是临时换教室，通常看哪个通知最准确？', replies: [] },
  { id: 'portfolio', title: '作品集里只有课程项目，投实习时可以怎么展示？', category: 'career', campus: '大学城', author: '郭同学', initial: '郭', color: 'gold', time: '前天 18:42', views: 84, body: '做过两个小项目，一个是小组完成的，另一个是自己调试的。我准备挑一个写清楚自己负责的部分和成果。想听听有面试经验的同学觉得哪些信息最有用。', replies: [] },
  { id: 'study-group', title: '两江校区有想一起复习 C 语言的吗？', category: 'study', campus: '两江', author: '罗同学', initial: '罗', color: 'blue', time: '前天 12:08', views: 41, body: '想约几个同学，每次挑两道题互相讲思路。我想先复习数组和指针。时间可以在帖子里讨论。', replies: [] },
  { id: 'welcome', title: '第一次发帖？看看这份校园站发帖指南', category: 'notice', campus: '全校', author: '校园站', initial: '站', color: 'green', time: '站务指南', views: 108, body: '提问时，请写清楚校区、你想解决的问题、已经试过的方法，以及具体卡在哪一步。\n\n分享经验时，标明适用时间和范围。涉及开放时间、报名等可能变化的信息，尽量附上原始通知。\n\n这是一个交互原型。预置帖子和浏览数为样例，试发内容只存在当前浏览器。请勿填写姓名、学号、手机号或取件码。', replies: [] },
];

const $ = (selector) => document.querySelector(selector);
const query = $('#query');
const feed = $('#feed');
const topicPage = $('#topic-page');
const composer = $('#composer');
const postForm = $('#post-form');
const storageKey = 'cqetc-campus-demo-v1';
const filters = { category: 'all', campus: 'all', tab: 'latest', query: '' };
let toastTimer;

function loadDemo() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return { posts: data.posts || [], replies: data.replies || {} };
  } catch {
    return { posts: [], replies: {} };
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
  return `<span class="avatar ${escapeHtml(person.color)}" aria-hidden="true">${escapeHtml(person.initial)}</span>`;
}

function categoryName(id) {
  return categories.find((category) => category.id === id)?.name || '校园讨论';
}

function topicHref(id) {
  return `#topic/${encodeURIComponent(id)}`;
}

function topicMeta(topic) {
  const campus = topic.campus === '全校' ? '全校' : `${topic.campus}校区`;
  return `<span class="chip ${escapeHtml(topic.category)}">${categoryName(topic.category)}</span>
    <span>${escapeHtml(campus)}</span>${topic.accepted ? `<span class="solved">${icon('check')}已解决</span>` : ''}`;
}

function repliesFor(topic) {
  return [...topic.replies, ...(demo.replies[topic.id] || [])];
}

function filterButton(key, id, label, className, glyph = '') {
  return `<button type="button" class="${className}" data-filter="${key}" data-value="${id}" aria-pressed="${filters[key] === id}">${glyph}${label}</button>`;
}

function renderFeed() {
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.setAttribute('aria-pressed', filters[button.dataset.filter] === button.dataset.value);
  });

  const words = filters.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matching = [...demo.posts, ...seed].filter((topic) => {
    const haystack = [topic.title, topic.body, topic.author, topic.campus, categoryName(topic.category)].join(' ').toLowerCase();
    return (filters.category === 'all' || topic.category === filters.category)
      && (filters.campus === 'all' || topic.campus === filters.campus)
      && (filters.tab !== 'unanswered' || repliesFor(topic).length === 0)
      && words.every((word) => haystack.includes(word));
  });

  if (filters.tab === 'popular') matching.sort((first, second) => second.views - first.views);
  const filtered = filters.category !== 'all' || filters.campus !== 'all' || filters.tab !== 'latest' || words.length > 0;
  $('#feed-title').textContent = words.length ? '搜索结果' : filters.category === 'all' ? '校园讨论' : categoryName(filters.category);
  $('#feed-subtitle').textContent = `${matching.length} 篇帖子`;
  $('#reset-filters').hidden = !filtered;

  if (!matching.length) {
    feed.innerHTML = `<div class="empty"><h2>还没有符合条件的帖子</h2><p>试试换一个关键词，或者查看全部讨论。</p>
      <button class="button secondary" data-reset type="button">查看全部讨论</button></div>`;
    return;
  }

  feed.innerHTML = `<table class="topic-list">
    <caption class="visually-hidden">校园帖子列表</caption>
    <thead><tr><th scope="col">主题</th><th scope="col" class="number-column">回复</th><th scope="col" class="number-column desktop-column">浏览</th><th scope="col" class="time-column desktop-column">发布</th></tr></thead>
    <tbody>${matching.map((topic) => {
      const replyCount = repliesFor(topic).length;
      const time = escapeHtml(topic.time);
      return `<tr class="topic-row">
        <th scope="row">
          <a class="topic-title" href="${topicHref(topic.id)}">${escapeHtml(topic.title)}</a>
          <span class="topic-meta">${topicMeta(topic)}<span class="mobile-time">${time}</span></span>
        </th>
        <td class="reply-count"><span class="reply-glyph">${icon('chat')}<span class="visually-hidden">回复数：</span></span>${replyCount}</td>
        <td class="desktop-column">${topic.views}</td>
        <td class="desktop-column">${time}</td>
      </tr>`;
    }).join('')}</tbody></table>`;
}

function authorLine(person) {
  return `<div class="author">${avatar(person)}<strong>${escapeHtml(person.author)}</strong><span>${escapeHtml(person.time)}</span></div>`;
}

function renderTopic(topic) {
  const replies = repliesFor(topic);
  topicPage.innerHTML = `
    <a class="back-link" href="#">${icon('back')}返回讨论</a>
    <article class="topic-card">
      <div class="topic-meta">${topicMeta(topic)}</div>
      <h1>${escapeHtml(topic.title)}</h1>
      ${authorLine(topic)}
      <p class="topic-body">${escapeHtml(topic.body)}</p>
    </article>
    <section class="replies" aria-labelledby="reply-heading">
      <h2 id="reply-heading">${replies.length} 条回复</h2>
      ${replies.length ? replies.map((reply) => `
        <article class="reply${topic.accepted === reply.id ? ' solved-reply' : ''}">
          ${authorLine(reply)}
          ${topic.accepted === reply.id ? `<div class="topic-meta"><span class="solved">${icon('check')}采纳答案</span></div>` : ''}
          <p>${escapeHtml(reply.body)}</p>
        </article>`).join('') : '<p class="topic-empty">还没有人回复。可以分享你的建议或经验。</p>'}
      <form id="reply-form" class="reply-form">
        <label>写回复<textarea name="body" required maxlength="1000" rows="3" placeholder="用示例内容试试回复。"></textarea></label>
        <button class="button primary" type="submit">发送回复</button>
      </form>
    </section>`;

  $('#reply-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = event.currentTarget.elements.body;
    const body = input.value.trim();
    if (!body) {
      input.setCustomValidity('请填写回复内容。');
      input.reportValidity();
      return;
    }
    demo.replies[topic.id] ??= [];
    demo.replies[topic.id].push({ id: `reply-${Date.now()}`, author: '体验同学', initial: '我', color: 'green', time: timestamp(), body });
    const saved = saveDemo();
    renderTopic(topic);
    $('#reply-form').elements.body.focus({ preventScroll: true });
    showToast(saved ? '回复已保存到当前浏览器' : '回复仅保留在当前页面');
  });
}

function renderRoute(moveFocus = false) {
  const id = location.hash.match(/^#topic\/([a-z0-9-]+)$/)?.[1];
  const topic = [...demo.posts, ...seed].find((item) => item.id === id);
  $('#feed-page').hidden = Boolean(id);
  topicPage.hidden = !id;
  if (topic) {
    renderTopic(topic);
    document.title = `${topic.title} · 重电校园站`;
  } else if (id) {
    topicPage.innerHTML = `<a class="back-link" href="#">${icon('back')}返回讨论</a><section class="topic-card"><h1>当前浏览器没有这篇帖子</h1><p>演示中发布的内容只能在发布时使用的浏览器中查看。</p></section>`;
    document.title = '帖子详情 · 重电校园站';
  } else {
    renderFeed();
    document.title = '重电校园站 · 校园问答与经验分享';
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
  Object.assign(filters, { category: 'all', campus: 'all', tab: 'latest', query: '' });
  query.value = '';
  showFeed();
}

function timestamp() {
  return new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}

$('#categories').innerHTML = categories.map(({ id, name, icon: glyph }) => filterButton('category', id, name, 'nav-button', icon(glyph))).join('');
$('#campuses').innerHTML = filterButton('campus', 'all', '全部校区', 'campus-button') + campuses.map((name) => filterButton('campus', name, name, 'campus-button')).join('');
$('#tabs').innerHTML = tabs.map(({ id, name }) => filterButton('tab', id, name, 'tab')).join('');
postForm.elements.category.innerHTML = categories.filter(({ id }) => id !== 'all').map(({ id, name }) => `<option value="${id}">${name}</option>`).join('');
postForm.elements.campus.innerHTML = [...campuses, '全校'].map((name) => `<option>${name}</option>`).join('');

document.addEventListener('click', (event) => {
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    filters[filter.dataset.filter] = filter.dataset.value;
    showFeed();
  }
  if (event.target.closest('[data-reset], #reset-filters')) {
    resetFilters();
    $('#tabs [data-value="latest"]').focus({ preventScroll: true });
  }
  if (event.target.closest('[data-compose]')) {
    if (filters.category !== 'all') postForm.elements.category.value = filters.category;
    if (filters.campus !== 'all') postForm.elements.campus.value = filters.campus;
    composer.showModal();
    postForm.elements.title.focus();
  }
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
  $('#feed-title').scrollIntoView({ block: 'start' });
});
query.addEventListener('input', () => {
  filters.query = query.value;
  filters.category = 'all';
  filters.campus = 'all';
  filters.tab = 'latest';
  showFeed();
});
document.addEventListener('keydown', (event) => {
  const typing = event.target.matches('input, textarea, select, [contenteditable]');
  if (!composer.open && (event.key === '/' && !typing || event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey))) {
    event.preventDefault();
    query.focus();
  }
});
$('#close-composer').addEventListener('click', () => composer.close());
$('#cancel-post').addEventListener('click', () => composer.close());
postForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const { title, body, category, campus } = postForm.elements;
  const blank = [title, body].find((input) => !input.value.trim());
  if (blank) {
    blank.setCustomValidity('请填写内容。');
    blank.reportValidity();
    return;
  }
  const topic = {
    id: `demo-${Date.now()}`, title: title.value.trim(), body: body.value.trim(), category: category.value, campus: campus.value,
    author: '体验同学', initial: '我', color: 'green', time: timestamp(), views: 0, replies: [],
  };
  demo.posts.unshift(topic);
  const saved = saveDemo();
  postForm.reset();
  composer.close();
  resetFilters();
  location.hash = topicHref(topic.id);
  showToast(saved ? '帖子已保存到当前浏览器' : '帖子仅保留在当前页面');
});

window.addEventListener('hashchange', () => renderRoute(true));
renderRoute();
