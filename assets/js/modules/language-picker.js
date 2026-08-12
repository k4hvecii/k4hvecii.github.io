export function initLanguagePicker(i18n) {
  const root = document.querySelector("#language-picker");
  const trigger = document.querySelector("#language-trigger");
  const menu = document.querySelector("#language-menu");
  const currentLabel = document.querySelector("#current-language-label");

  if (!root || !trigger || !menu || !currentLabel) {
    return;
  }

  function render() {
    menu.replaceChildren();

    i18n.languages.forEach((language) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "language-option";
      button.role = "option";
      button.dataset.locale = language.code;
      button.setAttribute("aria-selected", String(language.code === i18n.locale));

      if (language.code === i18n.locale) {
        button.classList.add("is-active");
      }

      const name = document.createElement("span");
      name.textContent = language.nativeName;

      const code = document.createElement("span");
      code.textContent = language.short || language.code.toUpperCase();

      button.append(name, code);

      button.addEventListener("click", async () => {
        await i18n.setLocale(language.code);
        closeMenu();
      });

      menu.append(button);
    });

    const current = i18n.getCurrentLanguage();
    currentLabel.textContent = current?.short || i18n.locale.toUpperCase();
  }

  function openMenu() {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", () => {
    menu.hidden ? openMenu() : closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      trigger.focus();
    }
  });

  i18n.onChange(render);
  render();
}
