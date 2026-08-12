const USERNAME = "k4hvecii";
const API = "https://api.github.com";

const qs = (selector, scope = document) => scope.querySelector(selector);

function formatNumber(value) {
  return new Intl.NumberFormat("tr-TR", { notation: "compact" }).format(value ?? 0);
}

function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json"
    }
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
  language.className = "repo-language";
  language.textContent = safeText(repo.language, "Code");

  const stars = document.createElement("span");
  stars.textContent = `★ ${Number(repo.stargazers_count || 0)}`;

  const date = document.createElement("span");
  const updatedAt = new Date(repo.updated_at);
  date.textContent = Number.isNaN(updatedAt.valueOf())
    ? "recent"
    : new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(updatedAt);

  meta.append(language, stars, date);
  row.append(main, meta);

  return row;
}

async function loadGitHub() {
  const list = qs("#repo-list");

  try {
    const [profile, repos] = await Promise.all([
      fetchJson(`${API}/users/${USERNAME}`),
      fetchJson(`${API}/users/${USERNAME}/repos?sort=updated&per_page=100`)
    ]);

    qs("#repo-count").textContent = formatNumber(profile.public_repos);
    qs("#follower-count").textContent = formatNumber(profile.followers);
    qs("#following-count").textContent = formatNumber(profile.following);

    const selected = repos
      .filter((repo) => !repo.fork)
      .filter((repo) => repo.name !== `${USERNAME}.github.io`)
      .slice(0, 5);

    list.replaceChildren();

    if (!selected.length) {
      const empty = document.createElement("div");
      empty.className = "repo-row";
      empty.innerHTML = `
        <div class="repo-main">
          <h3>No public repositories yet.</h3>
          <p>New public work will appear here automatically.</p>
        </div>
      `;
      list.append(empty);
      return;
    }

    selected.forEach((repo) => list.append(createRepoRow(repo)));
  } catch (error) {
    console.warn("GitHub data could not be loaded:", error);

    list.replaceChildren();

    const fallback = document.createElement("a");
    fallback.className = "repo-row";
    fallback.href = "https://github.com/k4hvecii";
    fallback.target = "_blank";
    fallback.rel = "noreferrer";
    fallback.innerHTML = `
      <div class="repo-main">
        <h3>@k4hvecii</h3>
        <p>GitHub verileri şu anda alınamadı. Güncel çalışmalarımı GitHub profilimde görüntüle.</p>
      </div>
      <div class="repo-meta"><span>GitHub ↗</span></div>
    `;

    list.append(fallback);
  }
}

function initTilt() {
  const card = qs("[data-tilt]");
  if (!card) return;

  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canHover || reduceMotion) return;

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * 2.2;
    const rotateX = (0.5 - y) * 2.2;

    card.style.transform =
      `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg)";
  });
}

qs("#year").textContent = new Date().getFullYear();

initTilt();
loadGitHub();
