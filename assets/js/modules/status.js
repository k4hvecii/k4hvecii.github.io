const statusUrl = new URL("../../data/status.json", import.meta.url);

function formatDate(value, locale) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.valueOf())) return "";

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export async function initStatus(i18n) {
  const response = await fetch(statusUrl, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error("Status data could not be loaded");
  }

  const status = await response.json();

  const state = document.querySelector("#current-status-state");
  const title = document.querySelector("#current-status-title");
  const description = document.querySelector("#current-status-description");
  const date = document.querySelector("#current-status-date");
  const about = document.querySelector("#about-status-text");

  function render() {
    if (state) state.textContent = i18n.t(status.labelKey);
    if (title) title.textContent = status.title;
    if (description) description.textContent = i18n.t(status.descriptionKey);
    if (about) about.textContent = `${status.title} · ${i18n.t(status.labelKey)}`;

    if (date) {
      const formatted = formatDate(status.updatedAt, i18n.locale);
      date.textContent = formatted
        ? `${i18n.t("status.updated")}: ${formatted}`
        : "";
    }
  }

  i18n.onChange(render);
  render();

  return status;
}
