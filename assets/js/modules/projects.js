const projectsUrl = new URL("../../data/projects.json", import.meta.url);

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderProject(project, i18n) {
  const card = project.url
    ? document.createElement("a")
    : document.createElement("article");

  card.className = "project-card";

  if (project.featured) {
    card.classList.add("project-card--featured");
  }

  if (project.wide) {
    card.classList.add("project-card--wide");
  }

  if (project.url) {
    card.href = project.url;
    card.target = "_blank";
    card.rel = "noreferrer";
  }

  const header = createElement("div", "project-card-header");
  header.append(
    createElement("span", "", project.number),
    createElement("span", "project-status", i18n.t(project.statusKey))
  );

  const title = createElement("h3", "", project.title);
  const description = createElement("p", "", i18n.t(project.descriptionKey));

  const tags = createElement("div", "project-tags");
  project.tags.forEach((tag) => {
    tags.append(createElement("span", "", tag));
  });

  card.append(header, title, description, tags);
  return card;
}

export async function initProjects(i18n) {
  const container = document.querySelector("#project-grid");
  if (!container) return;

  const response = await fetch(projectsUrl);
  if (!response.ok) {
    throw new Error("Project data could not be loaded");
  }

  const projects = await response.json();

  function render() {
    container.replaceChildren(
      ...projects.map((project) => renderProject(project, i18n))
    );
  }

  i18n.onChange(render);
  render();
}
