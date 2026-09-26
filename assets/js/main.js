const langButton = document.querySelector('#lang-toggle');
const year = document.querySelector('#year');
const repoList = document.querySelector('#repo-list');
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];

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
let repos = null;

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

function renderRepos() {
  if (!repoList || !repos) return;

  const rows = repos.map((repo) => {
    const row = document.createElement('a');
    row.className = 'repo-row';
    row.href = repo.html_url;
    row.target = '_blank';
    row.rel = 'noopener noreferrer';

    const left = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'repo-name';
    name.textContent = String(repo.name || 'repository');

    const desc = document.createElement('div');
    desc.className = 'repo-desc';
    desc.textContent = String(
      repo.description || (language === 'tr' ? 'Açıklama yok.' : 'No description.')
    );
    left.append(name, desc);

    const meta = document.createElement('div');
    meta.className = 'repo-meta';
    meta.textContent = `${repo.language || 'code'}  ★${Number(repo.stargazers_count || 0)}`;

    row.append(left, meta);
    return row;
  });

  repoList.replaceChildren(...rows);
}

function applyLanguage() {
  translateStaticText();
  renderRepos();
}

langButton?.addEventListener('click', () => {
  language = language === 'tr' ? 'en' : 'tr';
  storage.set('k4.lang', language);
  applyLanguage();
});

applyLanguage();

const REPO_CACHE_KEY = 'k4.github.repos.v31';
const REPO_CACHE_TTL = 10 * 60 * 1000;

function readRepoCache() {
  try {
    const raw = storage.get(REPO_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.repos) || Date.now() - Number(data.savedAt || 0) > REPO_CACHE_TTL) return null;
    return data.repos;
  } catch {
    return null;
  }
}

function saveRepoCache(items) {
  storage.set(REPO_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos: items }));
}

function renderRepoError() {
  if (!repoList) return;
  const line = document.createElement('div');
  line.className = 'repo-loading';
  line.append(document.createTextNode('github: unavailable / '));
  const link = document.createElement('a');
  link.href = 'https://github.com/k4hvecii';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'open profile ↗';
  line.append(link);
  repoList.replaceChildren(line);
}

async function loadRepos() {
  if (!repoList) return;

  const cached = readRepoCache();
  if (cached?.length) {
    repos = cached;
    renderRepos();
  }

  try {
    const response = await fetch('https://api.github.com/users/k4hvecii/repos?sort=updated&per_page=20', {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) throw new Error(`GitHub ${response.status}`);

    const data = await response.json();
    repos = data
      .filter((repo) => !repo.fork && repo.name !== 'k4hvecii.github.io')
      .slice(0, 4);

    if (!repos.length) throw new Error('No repositories');
    saveRepoCache(repos);
    renderRepos();
  } catch {
    if (!repos?.length) renderRepoError();
  }
}

loadRepos();

if ('IntersectionObserver' in window && navLinks.length) {
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
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
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.05, 0.3, 0.6] });

  sections.forEach((section) => observer.observe(section));
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
