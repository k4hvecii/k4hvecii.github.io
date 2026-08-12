const USERNAME = "k4hvecii";
const API_BASE = "https://api.github.com";

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const root = document.documentElement;
const header = qs(".site-header");
const navLinks = qs("#nav-links");
const menuToggle = qs(".menu-toggle");
const themeToggle = qs(".theme-toggle");

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("portfolio-theme", theme);

  const themeColor = qs('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute("content", theme === "light" ? "#f4f3ef" : "#111317");
  }
}

function initTheme() {
  const saved = localStorage.getItem("portfolio-theme");
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  setTheme(saved || (prefersLight ? "light" : "dark"));
}

themeToggle?.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

menuToggle?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

qsa(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("scrolled", window.scrollY > 10),
  { passive: true }
);

function initReveal() {
  const items = qsa(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        instance.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
}

function formatNumber(value) {
  return new Intl.NumberFormat("tr-TR", { notation: "compact" }).format(value ?? 0);
}

function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
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

function createRepoRow(repo) {
  const row = document.createElement("a");
  row.className = "repo-row";
  row.href = repo.html_url;
  row.target = "_blank";
  row.rel = "noreferrer";

  const main = document.createElement("div");
  main.className = "repo-main";

  const title = document.createElement("h3");
  title.textContent = repo.name;

  const description = document.createElement("p");
  description.textContent = safeText(repo.description, "Açıklama eklenmemiş.");

  main.append(title, description);

  const meta = document.createElement("div");
  meta.className = "repo-meta";

  const language = document.createElement("span");
  language.className = "language";
  language.textContent = safeText(repo.language, "Code");

  const stars = document.createElement("span");
  stars.textContent = `★ ${Number(repo.stargazers_count || 0)}`;

  const updated = document.createElement("span");
  const date = new Date(repo.updated_at);
  updated.textContent = Number.isNaN(date.valueOf())
    ? "Güncel"
    : new Intl.DateTimeFormat("tr-TR", { month: "short", year: "numeric" }).format(date);

  meta.append(language, stars, updated);
  row.append(main, meta);

  return row;
}

async function loadGitHubData() {
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

    const container = qs("#repo-grid");
    container.replaceChildren();

    const selected = repos
      .filter((repo) => !repo.fork)
      .filter((repo) => repo.name !== `${USERNAME}.github.io`)
      .slice(0, 6);

    if (!selected.length) {
      const empty = document.createElement("div");
      empty.className = "repo-row";
      empty.innerHTML = "<div class='repo-main'><h3>Henüz public repo yok.</h3><p>Yeni projeler burada otomatik olarak görünecek.</p></div>";
      container.append(empty);
      return;
    }

    selected.forEach((repo) => container.append(createRepoRow(repo)));
  } catch (error) {
    console.warn("GitHub verileri alınamadı:", error);

    qs("#github-bio").textContent =
      "GitHub verileri şu anda alınamadı. Güncel çalışmalarımı doğrudan GitHub profilimde görüntüleyebilirsin.";

    const container = qs("#repo-grid");
    container.replaceChildren();

    const fallback = document.createElement("a");
    fallback.className = "repo-row";
    fallback.href = "https://github.com/k4hvecii";
    fallback.target = "_blank";
    fallback.rel = "noreferrer";
    fallback.innerHTML =
      "<div class='repo-main'><h3>@k4hvecii</h3><p>Repository ve açık kaynak çalışmalarımı GitHub profilimde görüntüle.</p></div><div class='repo-meta'><span>GitHub ↗</span></div>";

    container.append(fallback);
  }
}

qs("#year").textContent = new Date().getFullYear();

initTheme();
initReveal();
loadGitHubData();
