import { getGitHubProfile, getGitHubRepositories } from "../core/github.js";

function formatNumber(value, locale) {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
}

function formatDate(value, locale) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(date);
}

function repoRow(repo, i18n) {
  const a = document.createElement("a");
  a.className = "github-repo-row"; a.href = repo.html_url; a.target = "_blank"; a.rel = "noreferrer";
  const main = document.createElement("div");
  const title = document.createElement("h4"); title.textContent = repo.name;
  const desc = document.createElement("p"); desc.textContent = repo.description || i18n.t("github.noDescription");
  main.append(title, desc);
  const meta = document.createElement("div"); meta.className = "github-repo-meta";
  const lang = document.createElement("span"); lang.className = "github-repo-language"; lang.textContent = repo.language || "Code";
  const stars = document.createElement("span"); stars.textContent = `★ ${repo.stargazers_count || 0}`;
  const updated = document.createElement("span"); updated.textContent = formatDate(repo.updated_at, i18n.locale);
  meta.append(lang, stars, updated); a.append(main, meta); return a;
}

export async function initGitHubCard(i18n) {
  const name = document.querySelector("#github-name");
  const repositories = document.querySelector("#github-repositories");
  const followers = document.querySelector("#github-followers");
  const following = document.querySelector("#github-following");
  const status = document.querySelector("#github-status");
  const repoList = document.querySelector("#github-repo-list");
  const repoState = document.querySelector("#github-repos-state");

  let profile = null; let repos = [];

  function render() {
    if (profile) {
      if (name) name.textContent = profile.name || "K4hveci";
      if (repositories) repositories.textContent = formatNumber(profile.public_repos, i18n.locale);
      if (followers) followers.textContent = formatNumber(profile.followers, i18n.locale);
      if (following) following.textContent = formatNumber(profile.following, i18n.locale);
      if (status) { const p = document.createElement("p"); p.textContent = profile.bio || i18n.t("github.fallbackBio"); status.replaceChildren(p); }
    }
    if (repoList) {
      repoList.replaceChildren(...repos.map((repo) => repoRow(repo, i18n)));
      if (repoState) repoState.textContent = repos.length ? i18n.t("github.openSource") : "";
    }
  }

  try {
    [profile, repos] = await Promise.all([getGitHubProfile(), getGitHubRepositories()]);
    repos = repos.filter((repo) => !repo.fork && repo.name !== "k4hvecii.github.io").slice(0, 4);
    render();
  } catch (error) {
    console.warn("GitHub data could not be loaded:", error);
    if (status) { const p = document.createElement("p"); p.textContent = i18n.t("github.unavailable"); status.replaceChildren(p); }
    if (repoState) repoState.textContent = i18n.t("github.unavailableShort");
  }

  i18n.onChange(render);
}
