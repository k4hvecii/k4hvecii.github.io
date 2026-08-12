const projectsUrl = new URL("../../data/projects.json", import.meta.url);

function create(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

export async function initProjectModal(i18n) {
  const dialog = document.querySelector("#project-modal");
  const close = document.querySelector("#project-modal-close");
  if (!dialog || !close) return { open: () => {} };

  const projects = await fetch(projectsUrl).then((r) => {
    if (!r.ok) throw new Error("Project data could not be loaded");
    return r.json();
  });

  let currentId = null;
  let lastFocused = null;

  function render(project) {
    document.querySelector("#project-modal-number").textContent = project.number;
    document.querySelector("#project-modal-status").textContent = i18n.t(project.statusKey);
    document.querySelector("#project-modal-title").textContent = project.title;
    document.querySelector("#project-modal-description").textContent = i18n.t(project.descriptionKey);

    const tags = document.querySelector("#project-modal-tags");
    tags.replaceChildren(...project.tags.map((tag) => create("span", "", tag)));

    const features = document.querySelector("#project-modal-features");
    const featureValue = project.featuresKey.split(".").reduce((v, k) => v?.[k], i18n.messages);
    const featureList = Array.isArray(featureValue) ? featureValue : [];
    features.replaceChildren(...featureList.map((feature) => create("li", "", feature)));

    const actions = document.querySelector("#project-modal-actions");
    actions.replaceChildren();
    project.links.forEach((link) => {
      const a = create("a", `button ${link.type === "primary" ? "button--primary" : "button--secondary"}`, i18n.t(link.labelKey));
      a.href = link.url; a.target = "_blank"; a.rel = "noreferrer";
      actions.append(a);
    });
  }

  function open(id, sourceElement) {
    const project = projects.find((item) => item.id === id);
    if (!project) return;
    currentId = id;
    lastFocused = sourceElement || document.activeElement;
    render(project);
    document.body.classList.add("modal-open");
    dialog.showModal();
    close.focus();
  }

  function closeDialog() {
    if (dialog.open) dialog.close();
  }

  close.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
  dialog.addEventListener("close", () => { document.body.classList.remove("modal-open"); lastFocused?.focus?.(); });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll('a[href],button:not([disabled])')].filter((el) => !el.hidden);
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  i18n.onChange(() => { if (currentId && dialog.open) { const p = projects.find((item) => item.id === currentId); if (p) render(p); } });
  return { open };
}
