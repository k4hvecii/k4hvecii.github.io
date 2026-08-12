export function initNavigation() {
  const header = document.querySelector("#site-header");
  const menuButton = document.querySelector("#mobile-menu-button");
  const mobileMenu = document.querySelector("#mobile-menu");
  const sectionLinks = [...document.querySelectorAll("[data-section-link]")];

  function closeMenu() {
    if (!menuButton || !mobileMenu) return;
    mobileMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
  }

  menuButton?.addEventListener("click", () => {
    const shouldOpen = mobileMenu.hidden;
    mobileMenu.hidden = !shouldOpen;
    menuButton.setAttribute("aria-expanded", String(shouldOpen));
  });
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  window.addEventListener("scroll", () => header?.classList.toggle("is-scrolled", window.scrollY > 12), { passive: true });

  if ("IntersectionObserver" in window) {
    const sections = [...document.querySelectorAll("[data-section]")].filter((el) => el.id !== "home");
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.sectionLink === visible.target.id));
    }, { threshold: [0.2, 0.45, 0.7], rootMargin: "-20% 0px -55% 0px" });
    sections.forEach((section) => observer.observe(section));
  }
}
