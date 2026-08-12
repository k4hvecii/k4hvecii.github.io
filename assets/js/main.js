import { I18n } from "./core/i18n.js";
import { initLanguagePicker } from "./modules/language-picker.js";
import { initTheme } from "./modules/theme.js";
import { initNavigation } from "./modules/navigation.js";
import { initScrollEffects } from "./modules/scroll-effects.js";
import { initProjects } from "./modules/projects.js";
import { initProjectModal } from "./modules/project-modal.js";
import { initGitHubCard } from "./modules/github-card.js";
import { initSocialLinks } from "./modules/social-links.js";
import { initParallax } from "./modules/parallax.js";
import { initPwa } from "./modules/pwa.js";
import { initStatus } from "./modules/status.js";

async function bootstrap() {
  const year = document.querySelector("#current-year");
  if (year) year.textContent = new Date().getFullYear();

  initTheme();
  initNavigation();
  initScrollEffects();
  initParallax();
  initPwa();

  const i18n = await new I18n().init();
  initLanguagePicker(i18n);

  const modal = await initProjectModal(i18n);

  await Promise.allSettled([
    initProjects(i18n, modal),
    initGitHubCard(i18n),
    initSocialLinks(i18n),
    initStatus(i18n),
  ]);
}

bootstrap().catch((error) => console.error("Application bootstrap failed:", error));
