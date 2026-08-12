import { SITE_CONFIG } from "../config.js";

function safeReadTheme() {
  try {
    const saved = localStorage.getItem(SITE_CONFIG.themeStorageKey);
    return saved === "dark" || saved === "light" ? saved : null;
  } catch {
    return null;
  }
}

function safeSaveTheme(theme) {
  try {
    localStorage.setItem(SITE_CONFIG.themeStorageKey, theme);
  } catch {
    // Theme persistence is optional.
  }
}

function preferredTheme() {
  const saved = safeReadTheme();
  if (saved) return saved;

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  safeSaveTheme(theme);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.content = theme === "light" ? "#f3f2ee" : "#0a0b0e";
  }
}

export function initTheme() {
  const button = document.querySelector("#theme-toggle");

  applyTheme(preferredTheme());

  button?.addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";

    applyTheme(next);
  });
}
