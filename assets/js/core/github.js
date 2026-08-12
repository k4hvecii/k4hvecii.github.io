import { SITE_CONFIG } from "../config.js";

function readCache(key) {
  try {
    const cached = JSON.parse(localStorage.getItem(key) || "null");
    if (!cached?.timestamp || !cached?.data) return null;
    if (Date.now() - cached.timestamp > SITE_CONFIG.githubCacheTtlMs) return null;
    return cached.data;
  } catch { return null; }
}

function writeCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data })); } catch { /* optional */ }
}

async function fetchGitHub(url, cacheKey) {
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" }, signal: controller.signal });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const data = await response.json();
    writeCache(cacheKey, data);
    return data;
  } finally { clearTimeout(timeout); }
}

export function getGitHubProfile() {
  return fetchGitHub(SITE_CONFIG.githubApiUrl, SITE_CONFIG.githubCacheKey);
}

export function getGitHubRepositories() {
  return fetchGitHub(SITE_CONFIG.githubReposApiUrl, SITE_CONFIG.githubReposCacheKey);
}
