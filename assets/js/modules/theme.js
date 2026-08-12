import { SITE_CONFIG } from "../config.js";

function preferredTheme() {
  const saved = localStorage.getItem(SITE_CONFIG.themeStorageKey);
  if (saved === "dark" || saved === "light") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(SITE_CONFIG.themeStorageKey, theme);

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
