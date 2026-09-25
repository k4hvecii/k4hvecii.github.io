function applyTheme() {
  document.documentElement.dataset.theme = "dark";
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.content = "#090604";
}

export function initTheme() {
  applyTheme();
}
