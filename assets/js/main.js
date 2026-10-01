const langButton = document.querySelector('#lang-toggle');
const year = document.querySelector('#year');
const repoList = document.querySelector('#repo-list');
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const statRepos = document.querySelector('#stat-repos');
const statFollowers = document.querySelector('#stat-followers');
const statPush = document.querySelector('#stat-push');

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
    updated.textContent = `${language === 'tr' ? 'push' : 'push'}: ${formatDate(repo.pushed_at)}`;
    foot.append(visibility, updated);

    card.append(top, desc, meta, foot);
    return card;
  });

  repoList.replaceChildren(...rows);
}

function applyLanguage() {
  translateStaticText();
  renderGitHubStats();
  renderRepos();
}

langButton?.addEventListener('click', () => {
  language = language === 'tr' ? 'en' : 'tr';
  storage.set('k4.lang', language);
  applyLanguage();
});

applyLanguage();

const GITHUB_CACHE_KEY = 'k4.github.surface.v40';
const GITHUB_CACHE_TTL = 15 * 60 * 1000;

function readGitHubCache() {
  try {
    const raw = storage.get(GITHUB_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.user || !Array.isArray(data?.repos)) return null;
    if (Date.now() - Number(data.savedAt || 0) > GITHUB_CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function saveGitHubCache(data) {
  storage.set(GITHUB_CACHE_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
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

async function loadGitHub() {
  const cached = readGitHubCache();
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
    saveGitHubCache(githubData);
    renderGitHubStats();
    renderRepos();
  } catch {
    if (!githubData) renderRepoError();
  }
}

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