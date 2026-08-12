const projectsUrl = new URL("../../data/projects.json", import.meta.url);

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderProject(project, i18n, modal) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.tabIndex = 0;
  card.dataset.projectId = project.id;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `${project.title} — ${i18n.t("projects.openDetails")}`);

  if (project.featured) card.classList.add("project-card--featured");
  if (project.wide) card.classList.add("project-card--wide");

  const header = createElement("div", "project-card-header");
  header.append(
    createElement("span", "", project.number),
    createElement("span", "project-status", i18n.t(project.statusKey))
  );

  const title = createElement("h3", "", project.title);
  const description = createElement("p", "", i18n.t(project.descriptionKey));

  const tags = createElement("div", "project-tags");
  project.tags.forEach((tag) => tags.append(createElement("span", "", tag)));

  const action = createElement(
    "span",
    "project-card-action",
    i18n.t("projects.detailsAction")
  );

  const footer = createElement("div", "project-card-footer");
  footer.append(tags, action);

  card.append(header, title, description, footer);

  const open = () => modal.open(project.id, card);

  card.addEventListener("click", open);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  });

  return card;
}

export async function initProjects(i18n, modal) {
  const container = document.querySelector("#project-grid");
  if (!container) return;

  const response = await fetch(projectsUrl);
  if (!response.ok) throw new Error("Project data could not be loaded");

  const projects = await response.json();

  const render = () => {
    container.replaceChildren(
      ...projects.map((project) => renderProject(project, i18n, modal))
    );
  };

  i18n.onChange(render);
  render();
}
