const langButton = document.querySelector('#lang-toggle');
const year = document.querySelector('#year');
const repoList = document.querySelector('#repo-list');
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const statRepos = document.querySelector('#stat-repos');
const statFollowers = document.querySelector('#stat-followers');
const statPush = document.querySelector('#stat-push');
const systemGrid = document.querySelector('#system-grid');
const stackBoard = document.querySelector('#stack-board');
const activityStatGrid = document.querySelector('#activity-stat-grid');
const activityHeatmap = document.querySelector('#activity-heatmap');
const activityVelocity = document.querySelector('#activity-velocity');
const activityMini = document.querySelector('#activity-mini');
const activityLanguages = document.querySelector('#activity-languages');
const activityWeekdays = document.querySelector('#activity-weekdays');
const activityUpdated = document.querySelector('#activity-updated');

const K4_DATA_BASE = 'https://raw.githubusercontent.com/k4hvecii/k4hvecii/main/data';

if (year) year.textContent = new Date().getFullYear();

const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* optional */ }
  }
};

let language = storage.get('k4.lang') || 'tr';
if (!['tr', 'en'].includes(language)) language = 'tr';
let githubData = null;
let k4Data = null;
let activityData = null;

function translateStaticText() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-tr][data-en]').forEach((el) => {
    el.textContent = el.dataset[language] || el.textContent;
  });

  if (langButton) {
    langButton.textContent = language.toUpperCase();
    langButton.setAttribute(
      'aria-label',
      language === 'tr' ? 'Switch language to English' : 'Dili Türkçe yap'
    );
  }
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function formatNumber(value) {
  const number = Number(value || 0);
  if (Math.abs(number) >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (Math.abs(number) >= 1000) return `${(number / 1000).toFixed(1)}k`;
  return String(number);
}

function renderSystems() {
  if (!systemGrid || !k4Data?.systems) return;

  const cards = k4Data.systems.map((item, index) => {
    const article = document.createElement('article');
    article.className = 'system-card is-visible';
    article.setAttribute('data-reveal', '');

    const top = document.createElement('div');
    top.className = 'system-card__top';

    const id = document.createElement('span');
    id.className = 'system-card__id';
    id.textContent = `${String(item.id || 'system').toUpperCase()} / ${String(index + 1).padStart(2, '0')}`;

    const status = document.createElement('span');
    status.className = 'status-pill';
    status.textContent = item.status || 'active';
    top.append(id, status);

    const title = document.createElement('h3');
    title.textContent = item.name || item.title || item.id;

    const desc = document.createElement('p');
    desc.textContent = language === 'tr'
      ? (item.description_tr || item.description)
      : (item.description_en || item.description);

    const tags = document.createElement('div');
    tags.className = 'system-card__tags';
    for (const value of item.stack || []) {
      const tag = document.createElement('span');
      tag.textContent = value;
      tags.appendChild(tag);
    }

    article.append(top, title, desc, tags);
    return article;
  });

  systemGrid.replaceChildren(...cards);
}

function renderStack() {
  if (!stackBoard || !k4Data?.stack) return;
  const rows = Object.entries(k4Data.stack).map(([key, values]) => {
    const row = document.createElement('div');
    row.className = 'stack-line';

    const label = document.createElement('span');
    label.textContent = key;

    const list = document.createElement('div');
    for (const value of values) {
      const item = document.createElement('b');
      item.textContent = value;
      list.appendChild(item);
    }

    row.append(label, list);
    return row;
  });
  stackBoard.replaceChildren(...rows);
}

function renderGitHubStats() {
  if (!githubData?.user) return;
  if (statRepos) statRepos.textContent = String(githubData.user.public_repos ?? '—');
  if (statFollowers) statFollowers.textContent = String(githubData.user.followers ?? '—');

  const latestPush = githubData.repos
    ?.map((repo) => repo.pushed_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  if (statPush) statPush.textContent = formatDate(latestPush);
}

function repoDescription(repo) {
  if (repo.description) return String(repo.description);
  return language === 'tr' ? 'Açıklama eklenmemiş.' : 'No description added yet.';
}

function renderRepos() {
  if (!repoList || !githubData?.repos) return;

  const rows = githubData.repos.map((repo) => {
    const card = document.createElement('a');
    card.className = 'repo-card';
    card.href = repo.html_url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const top = document.createElement('div');
    top.className = 'repo-card__top';

    const name = document.createElement('div');
    name.className = 'repo-card__name';
    name.textContent = String(repo.name || 'repository');

    const arrow = document.createElement('span');
    arrow.className = 'repo-card__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    top.append(name, arrow);

    const desc = document.createElement('p');
    desc.className = 'repo-card__desc';
    desc.textContent = repoDescription(repo);

    const meta = document.createElement('div');
    meta.className = 'repo-card__meta';

    const languageTag = document.createElement('span');
    languageTag.textContent = String(repo.language || 'code');
    const starTag = document.createElement('span');
    starTag.textContent = `★ ${Number(repo.stargazers_count || 0)}`;
    const forkTag = document.createElement('span');
    forkTag.textContent = `fork ${Number(repo.forks_count || 0)}`;
    meta.append(languageTag, starTag, forkTag);

    const foot = document.createElement('div');
    foot.className = 'repo-card__foot';
    const visibility = document.createElement('span');
    visibility.textContent = repo.archived ? 'archived' : 'public';
    const updated = document.createElement('span');
    updated.textContent = `push: ${formatDate(repo.pushed_at)}`;
    foot.append(visibility, updated);

    card.append(top, desc, meta, foot);
    return card;
  });

  repoList.replaceChildren(...rows);
}

function statCard(label, value, note = '') {
  const card = document.createElement('div');
  card.className = 'activity-stat';
  const key = document.createElement('span');
  key.textContent = label;
  const strong = document.createElement('strong');
  strong.textContent = value;
  card.append(key, strong);
  if (note) {
    const small = document.createElement('small');
    small.textContent = note;
    card.appendChild(small);
  }
  return card;
}

function renderHeatmap(days) {
  if (!activityHeatmap) return;
  const groups = new Map();

  for (const day of days || []) {
    const date = new Date(`${day.date}T00:00:00Z`);
    const sunday = new Date(date);
    sunday.setUTCDate(date.getUTCDate() - date.getUTCDay());
    const key = sunday.toISOString().slice(0, 10);
    if (!groups.has(key)) groups.set(key, Array(7).fill(null));
    groups.get(key)[date.getUTCDay()] = day;
  }

  const visibleWeeks = [...groups.values()].slice(-53);
  const max = Math.max(0, ...(days || []).map((d) => Number(d.count || 0)));

  const getLevel = (count) => {
    if (!count || max <= 0) return 0;
    const ratio = count / max;
    if (ratio <= .25) return 1;
    if (ratio <= .5) return 2;
    if (ratio <= .75) return 3;
    return 4;
  };

  const weeks = visibleWeeks.map((week) => {
    const column = document.createElement('div');
    column.className = 'heatmap-week';
    week.forEach((day, weekday) => {
      const cell = document.createElement('i');
      cell.className = 'heatmap-cell';
      const count = Number(day?.count || 0);
      cell.dataset.level = String(getLevel(count));
      cell.title = day ? `${day.date}: ${count} contributions` : '';
      cell.setAttribute('aria-label', cell.title || `weekday ${weekday}`);
      column.appendChild(cell);
    });
    return column;
  });
  activityHeatmap.replaceChildren(...weeks);
}

function renderActivity() {
  if (!activityData?.summary) return;
  const s = activityData.summary;

  if (activityUpdated) {
    activityUpdated.textContent = `sync: ${formatDate(activityData.generated_at)}`;
  }

  if (activityStatGrid) {
    const cards = [
      statCard('contributions', formatNumber(s.contributions), '365d'),
      statCard('commits', formatNumber(s.commits), '365d'),
      statCard('current streak', `${s.current_streak || 0}d`, `best ${s.longest_streak || 0}d`),
      statCard('public repos', formatNumber(s.public_repos), `${formatNumber(s.stars)} stars`),
      statCard('avg / active day', String(s.avg_per_active_day ?? 0), `${s.weekend_percentage || 0}% weekend`),
      statCard('most active', s.most_active_weekday || '—', 'weekday')
    ];
    activityStatGrid.replaceChildren(...cards);
  }

  renderHeatmap(activityData.contribution_days || []);

  if (activityVelocity) {
    const velocity = s.velocity || {};
    const arrow = velocity.trend === 'up' ? '↗' : velocity.trend === 'down' ? '↘' : '→';
    const ratio = velocity.ratio == null ? 'new activity' : `${Number(velocity.ratio).toFixed(2)}×`;
    activityVelocity.innerHTML = `<strong>${arrow} ${ratio}</strong><span>${velocity.recent_28d || 0} / ${velocity.previous_28d || 0}</span>`;
  }

  if (activityMini) {
    activityMini.replaceChildren(
      statCard('pull requests', String(s.pull_requests || 0)),
      statCard('reviews', String(s.reviews || 0)),
      statCard('issues', String(s.issues || 0)),
      statCard('followers', String(s.followers || 0))
    );
  }

  if (activityLanguages) {
    const rows = (activityData.languages || []).map((item) => {
      const row = document.createElement('div');
      row.className = 'language-row';

      const header = document.createElement('div');
      const label = document.createElement('span');
      label.textContent = item.name;
      const pct = document.createElement('span');
      pct.textContent = `${Number(item.percentage || 0).toFixed(1)}%`;
      header.append(label, pct);

      const track = document.createElement('div');
      track.className = 'language-track';
      const fill = document.createElement('i');
      fill.style.width = `${Math.max(2, Number(item.percentage || 0))}%`;
      fill.style.setProperty('--language-color', item.color || '#b7835d');
      track.appendChild(fill);

      row.append(header, track);
      return row;
    });
    activityLanguages.replaceChildren(...rows);
  }

  if (activityWeekdays) {
    const items = activityData.weekday_counts || [];
    const max = Math.max(1, ...items.map((item) => Number(item.count || 0)));
    const bars = items.map((item) => {
      const wrap = document.createElement('div');
      wrap.className = 'weekday-bar';
      const value = document.createElement('i');
      value.style.height = `${Math.max(4, (Number(item.count || 0) / max) * 100)}%`;
      value.title = `${item.day}: ${item.count}`;
      const label = document.createElement('span');
      label.textContent = item.day;
      wrap.append(value, label);
      return wrap;
    });
    activityWeekdays.replaceChildren(...bars);
  }
}

function applyLanguage() {
  translateStaticText();
  renderSystems();
  renderStack();
  renderGitHubStats();
  renderRepos();
  renderActivity();
}

langButton?.addEventListener('click', () => {
  language = language === 'tr' ? 'en' : 'tr';
  storage.set('k4.lang', language);
  applyLanguage();
});

applyLanguage();

const GITHUB_CACHE_KEY = 'k4.github.surface.v50';
const GITHUB_CACHE_TTL = 15 * 60 * 1000;
const K4_CACHE_KEY = 'k4.shared.data.v1';
const K4_CACHE_TTL = 60 * 60 * 1000;

function readCache(key, ttl) {
  try {
    const raw = storage.get(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - Number(data.savedAt || 0) > ttl) return null;
    return data.value;
  } catch {
    return null;
  }
}

function saveCache(key, value) {
  storage.set(key, JSON.stringify({ savedAt: Date.now(), value }));
}

function renderRepoError() {
  if (!repoList) return;
  const line = document.createElement('div');
  line.className = 'repo-loading';
  line.append(document.createTextNode(language === 'tr' ? 'GitHub verisi alınamadı / ' : 'GitHub data unavailable / '));

  const link = document.createElement('a');
  link.href = 'https://github.com/k4hvecii';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = language === 'tr' ? 'profili aç ↗' : 'open profile ↗';

  line.append(link);
  repoList.replaceChildren(line);
}

async function loadSharedData() {
  const cached = readCache(K4_CACHE_KEY, K4_CACHE_TTL);
  if (cached) {
    k4Data = cached.core;
    activityData = cached.activity;
    renderSystems();
    renderStack();
    renderActivity();
  }

  try {
    const [profileRes, systemsRes, projectsRes, stackRes, statsRes] = await Promise.all([
      fetch(`${K4_DATA_BASE}/profile.json`, { cache: 'no-cache' }),
      fetch(`${K4_DATA_BASE}/systems.json`, { cache: 'no-cache' }),
      fetch(`${K4_DATA_BASE}/projects.json`, { cache: 'no-cache' }),
      fetch(`${K4_DATA_BASE}/stack.json`, { cache: 'no-cache' }),
      fetch(`${K4_DATA_BASE}/github-stats.json`, { cache: 'no-cache' })
    ]);

    if (![profileRes, systemsRes, projectsRes, stackRes, statsRes].every((res) => res.ok)) {
      throw new Error('shared data unavailable');
    }

    const [profile, systems, projects, stack, activity] = await Promise.all([
      profileRes.json(), systemsRes.json(), projectsRes.json(), stackRes.json(), statsRes.json()
    ]);

    k4Data = { profile, systems, projects, stack };
    activityData = activity;
    saveCache(K4_CACHE_KEY, { core: k4Data, activity: activityData });
    renderSystems();
    renderStack();
    renderActivity();
  } catch {
    if (activityUpdated) activityUpdated.textContent = 'sync unavailable';
  }
}

async function loadGitHub() {
  const cached = readCache(GITHUB_CACHE_KEY, GITHUB_CACHE_TTL);
  if (cached) {
    githubData = cached;
    renderGitHubStats();
    renderRepos();
  }

  try {
    const headers = { Accept: 'application/vnd.github+json' };
    const [userResponse, repoResponse] = await Promise.all([
      fetch('https://api.github.com/users/k4hvecii', { headers }),
      fetch('https://api.github.com/users/k4hvecii/repos?sort=updated&per_page=20', { headers })
    ]);

    if (!userResponse.ok || !repoResponse.ok) {
      throw new Error(`GitHub ${userResponse.status}/${repoResponse.status}`);
    }

    const user = await userResponse.json();
    const repoData = await repoResponse.json();
    const repos = repoData
      .filter((repo) => !repo.fork && repo.name !== 'k4hvecii')
      .slice(0, 6);

    githubData = { user, repos };
    saveCache(GITHUB_CACHE_KEY, githubData);
    renderGitHubStats();
    renderRepos();
  } catch {
    if (!githubData) renderRepoError();
  }
}

loadSharedData();
loadGitHub();

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

  if (navLinks.length) {
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-30% 0px -58% 0px', threshold: [0.05, 0.25, 0.5] });

    sections.forEach((section) => navObserver.observe(section));
  }
} else {
  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
