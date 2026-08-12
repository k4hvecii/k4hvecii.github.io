import { getGitHubProfile } from "../core/github.js";

function formatNumber(value, locale) {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export async function initGitHubCard(i18n) {
  const name = document.querySelector("#github-name");
  const repositories = document.querySelector("#github-repositories");
  const followers = document.querySelector("#github-followers");
  const following = document.querySelector("#github-following");
  const status = document.querySelector("#github-status");

  try {
    const profile = await getGitHubProfile();

    if (name) name.textContent = profile.name || "K4hveci";
    if (repositories) repositories.textContent = formatNumber(profile.public_repos, i18n.locale);
    if (followers) followers.textContent = formatNumber(profile.followers, i18n.locale);
    if (following) following.textContent = formatNumber(profile.following, i18n.locale);

    if (status) {
      const paragraph = document.createElement("p");
      paragraph.textContent =
        profile.bio || i18n.t("github.fallbackBio");
      status.replaceChildren(paragraph);
    }

    i18n.onChange(() => {
      if (repositories) repositories.textContent = formatNumber(profile.public_repos, i18n.locale);
      if (followers) followers.textContent = formatNumber(profile.followers, i18n.locale);
      if (following) following.textContent = formatNumber(profile.following, i18n.locale);

      if (status && !profile.bio) {
        const paragraph = status.querySelector("p");
        if (paragraph) paragraph.textContent = i18n.t("github.fallbackBio");
      }
    });
  } catch (error) {
    console.warn("GitHub profile could not be loaded:", error);

    if (status) {
      const paragraph = document.createElement("p");
      paragraph.textContent = i18n.t("github.unavailable");
      status.replaceChildren(paragraph);
    }
  }
}
