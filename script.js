const USERNAME = "k4hvecii";
const API_BASE = "https://api.github.com";

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const header = qs(".site-header");
const menuButton = qs(".menu-button");
const navLinks = qs(".nav-links");
const themeToggle = qs(".theme-toggle");
const root = document.documentElement;

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("portfolio-theme", theme);
  const metaTheme = qs('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", theme === "light" ? "#f6f8fa" : "#0d1117");
  }
}

function initTheme() {
  const stored = localStorage.getItem("portfolio-theme");
  const preferredLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  setTheme(stored || (preferredLight ? "light" : "dark"));
}

themeToggle?.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

menuButton?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

qsa(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("scrolled", window.scrollY > 12),
  { passive: true }
);

function initReveal() {
  const elements = qsa(".reveal");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach((el) => observer.observe(el));
}

function formatNumber(value) {
  return new Intl.NumberFormat("tr-TR", { notation: "compact" }).format(value ?? 0);
}

function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function createRepoCard(repo) {
  const card = document.createElement("a");
  card.className = "repo-card";
  card.href = repo.html_url;
  card.target = "_blank";
  card.rel = "noreferrer";

  const description = safeText(repo.description, "Açıklama eklenmemiş.");
  const language = safeText(repo.language, "Code");
  const stars = Number(repo.stargazers_count || 0);
  const forks = Number(repo.forks_count || 0);

  const title = document.createElement("h3");
  title.textContent = repo.name;

  const desc = document.createElement("p");
  desc.textContent = description;

  const meta = document.createElement("div");
  meta.className = "repo-meta";

  const lang = document.createElement("span");
  lang.className = "language";
  lang.textContent = language;

  const star = document.createElement("span");
  star.textContent = `★ ${stars}`;

  const fork = document.createElement("span");
  fork.textContent = `⑂ ${forks}`;

  meta.append(lang, star, fork);
  card.append(title, desc, meta);

  return card;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" }
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}`);
  }

  return response.json();
}

async function loadGitHubProfile() {
  try {
    const [profile, repos] = await Promise.all([
      fetchJson(`${API_BASE}/users/${USERNAME}`),
      fetchJson(`${API_BASE}/users/${USERNAME}/repos?sort=updated&per_page=100`)
    ]);

    qs("#repo-count").textContent = formatNumber(profile.public_repos);
    qs("#follower-count").textContent = formatNumber(profile.followers);
    qs("#following-count").textContent = formatNumber(profile.following);
    qs("#github-name").textContent = safeText(profile.name, "K4hveci");
    qs("#github-bio").textContent = safeText(
      profile.bio,
      "JavaScript, Discord.js ve production odaklı sistemler üzerinde çalışıyorum."
    );

    const grid = qs("#repo-grid");
    grid.replaceChildren();

    const selected = repos
      .filter((repo) => !repo.fork)
      .filter((repo) => repo.name !== `${USERNAME}.github.io`)
      .slice(0, 6);

    if (!selected.length) {
      const empty = document.createElement("article");
      empty.className = "repo-card";
      empty.innerHTML = "<h3>Public repo bulunamadı.</h3><p>Yeni projeler burada otomatik olarak görünecek.</p>";
      grid.append(empty);
      return;
    }

    selected.forEach((repo) => grid.append(createRepoCard(repo)));
  } catch (error) {
    console.warn("GitHub verileri alınamadı:", error);

    qs("#github-bio").textContent =
      "GitHub verileri şu anda alınamadı. Profilimi doğrudan GitHub üzerinden görüntüleyebilirsin.";

    const grid = qs("#repo-grid");
    grid.replaceChildren();

    const fallback = document.createElement("a");
    fallback.className = "repo-card";
    fallback.href = "https://github.com/k4hvecii";
    fallback.target = "_blank";
    fallback.rel = "noreferrer";
    fallback.innerHTML =
      "<h3>@k4hvecii</h3><p>Güncel repository ve çalışmalarımı GitHub profilimde görüntüle.</p><div class='repo-meta'><span>GitHub ↗</span></div>";

    grid.append(fallback);
  }
}

qs("#year").textContent = new Date().getFullYear();

initTheme();
initReveal();
loadGitHubProfile();
