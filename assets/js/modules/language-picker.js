export function initLanguagePicker(i18n) {
  const root = document.querySelector("#language-picker");
  const trigger = document.querySelector("#language-trigger");
  const menu = document.querySelector("#language-menu");
  const options = document.querySelector("#language-options");
  const search = document.querySelector("#language-search");
  const empty = document.querySelector("#language-empty");
  const currentLabel = document.querySelector("#current-language-label");

  if (!root || !trigger || !menu || !options || !search || !empty || !currentLabel) {
    return;
  }

  let query = "";

  function filteredLanguages() {
    const q = query.trim().toLocaleLowerCase(i18n.locale);
    if (!q) return i18n.languages;

    return i18n.languages.filter((language) =>
      `${language.nativeName} ${language.name || ""} ${language.code}`
        .toLocaleLowerCase(i18n.locale)
        .includes(q)
    );
  }

  function optionButtons() {
    return [...options.querySelectorAll(".language-option")];
  }

  function focusOption(index) {
    const buttons = optionButtons();
    if (!buttons.length) return;

    const normalized = (index + buttons.length) % buttons.length;
    buttons[normalized].focus();
  }

  function handleOptionKeydown(event) {
    const buttons = optionButtons();
    const currentIndex = buttons.indexOf(event.currentTarget);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(currentIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(currentIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(buttons.length - 1);
    }
  }

  function render() {
    options.replaceChildren();
    const list = filteredLanguages();
    empty.hidden = list.length !== 0;

    list.forEach((language) => {
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
        trigger.focus();
      });

      button.addEventListener("keydown", handleOptionKeydown);
      options.append(button);
    });

    const current = i18n.getCurrentLanguage();
    currentLabel.textContent = current?.short || i18n.locale.toUpperCase();
    i18n.apply(menu);
  }

  function openMenu() {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    query = "";
    search.value = "";
    render();
    requestAnimationFrame(() => search.focus());
  }

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", () => {
    menu.hidden ? openMenu() : closeMenu();
  });

  search.addEventListener("input", () => {
    query = search.value;
    render();
  });

  search.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(-1);
    }
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      closeMenu();
      trigger.focus();
    }
  });

  i18n.onChange(render);
  render();
}
