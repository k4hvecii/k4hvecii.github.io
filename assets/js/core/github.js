import { SITE_CONFIG } from "../config.js";

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(SITE_CONFIG.githubCacheKey) || "null");

    if (!cached?.timestamp || !cached?.data) {
      return null;
    }

    if (Date.now() - cached.timestamp > SITE_CONFIG.githubCacheTtlMs) {
      return null;
    }

    return cached.data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(
      SITE_CONFIG.githubCacheKey,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch {
    // Cache is optional.
  }
}

export async function getGitHubProfile() {
  const cached = readCache();
  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(SITE_CONFIG.githubApiUrl, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}`);
    }

    const profile = await response.json();
    writeCache(profile);
    return profile;
  } finally {
    clearTimeout(timeout);
  }
}
