const socialsUrl = new URL("../../data/socials.json", import.meta.url);

const ICONS = {
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .7a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.2.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C15 4.7 16 5 16 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.8 5.5-5.5 5.8.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.5 11.5 0 0 0 12 .7Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.8 5h16.4A1.8 1.8 0 0 1 22 6.8v10.4a1.8 1.8 0 0 1-1.8 1.8H3.8A1.8 1.8 0 0 1 2 17.2V6.8A1.8 1.8 0 0 1 3.8 5Zm.3 2 7.9 5.8L19.9 7H4.1Zm15.9 2.3-7.4 5.4a1 1 0 0 1-1.2 0L4 9.3v7.5h16V9.3Z"/></svg>'
};

export async function initSocialLinks(i18n) {
  const hero = document.querySelector("#hero-social-links");
  const contact = document.querySelector("#contact-social-links");
  const response = await fetch(socialsUrl);
  if (!response.ok) throw new Error("Social data could not be loaded");
  const socials = await response.json();

  function makeLink(item) {
    const a = document.createElement("a"); a.className = "social-link"; a.href = item.href;
    if (item.external) { a.target = "_blank"; a.rel = "noreferrer"; }
    a.innerHTML = ICONS[item.icon] || "";
    const span = document.createElement("span"); span.textContent = item.labelKey ? i18n.t(item.labelKey, item.label) : item.label; a.append(span);
    return a;
  }

  function render() {
    const heroLinks = socials.map(makeLink);
    const contactLinks = socials.map(makeLink);
    hero?.replaceChildren(...heroLinks);
    contact?.replaceChildren(...contactLinks);
  }

  i18n.onChange(render); render();
}
