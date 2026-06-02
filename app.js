// app.js
// Entry point. Wires the hash router to view renderers + the static topbar's dropdown + active-nav state.
// Only place that touches the DOM.

import { parseHash } from "./src/router.js";
import { renderOverview } from "./src/views/overview.js";
import { renderDomain }   from "./src/views/domain.js";
import { renderAbout }    from "./src/views/about.js";

function updateNavActive(route) {
  document.querySelectorAll(".topnav .topnav-link, .topnav .dropdown-toggle, .dropdown-menu a")
    .forEach(el => el.classList.remove("active"));

  if (route.view === "overview") {
    document.querySelector("[data-nav='overview']")?.classList.add("active");
  } else if (route.view === "about") {
    document.querySelector("[data-nav='about']")?.classList.add("active");
  } else if (route.view === "domain") {
    document.querySelector("[data-nav='domains']")?.classList.add("active");
    document.querySelector(`[data-domain='${route.params.slug}']`)?.classList.add("active");
  }
}

function initDropdown() {
  const dropdown = document.getElementById("domains-dropdown");
  if (!dropdown) return;
  const toggle = dropdown.querySelector(".dropdown-toggle");

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  dropdown.querySelectorAll(".dropdown-menu a").forEach(a => {
    a.addEventListener("click", () => {
      dropdown.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdown.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function render() {
  const route = parseHash(window.location.hash);
  const app = document.getElementById("app");
  let html;
  switch (route.view) {
    case "domain":   html = renderDomain(route.params.slug); break;
    case "about":    html = renderAbout(); break;
    case "overview":
    default:         html = renderOverview(); break;
  }
  app.innerHTML = html;
  updateNavActive(route);
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  initDropdown();
  render();
});
