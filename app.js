// app.js
// Entry point. Wires the hash router to view renderers + the static topbar's dropdowns + active-nav state.
// Only place that touches the DOM.

import { parseHash } from "./src/router.js";
import { renderOverview } from "./src/views/overview.js";
import { renderDomain }   from "./src/views/domain.js";
import { renderAbout }    from "./src/views/about.js";

function closeDropdown(dropdown) {
  dropdown.classList.remove("open");
  dropdown.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
}

function initDropdown(dropdown) {
  if (!dropdown) return;
  const toggle = dropdown.querySelector(".dropdown-toggle");

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    // Close any other open dropdowns
    document.querySelectorAll(".dropdown.open").forEach(d => { if (d !== dropdown) closeDropdown(d); });
    const open = dropdown.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  // Close on link click (for hash-link items)
  dropdown.querySelectorAll(".dropdown-menu a").forEach(a => {
    a.addEventListener("click", () => closeDropdown(dropdown));
  });

  // Smooth-scroll for in-page section items (data-scroll-to)
  dropdown.querySelectorAll("[data-scroll-to]").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-scroll-to");
      const el = document.getElementById(targetId);
      if (el) {
        const header = document.querySelector(".topbar-sticky");
        const headerH = header ? header.offsetHeight : 0;
        const top = el.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
        window.scrollTo({ top, behavior: "smooth" });
      }
      closeDropdown(dropdown);
    });
  });
}

function initDropdowns() {
  document.querySelectorAll(".dropdown").forEach(initDropdown);

  document.addEventListener("click", (e) => {
    document.querySelectorAll(".dropdown.open").forEach(d => {
      if (!d.contains(e.target)) closeDropdown(d);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".dropdown.open").forEach(closeDropdown);
    }
  });
}

function updateNavActive(route) {
  document.querySelectorAll(".topnav .topnav-link, .topnav .dropdown-toggle, .dropdown-menu a")
    .forEach(el => el.classList.remove("active"));

  if (route.view === "overview") {
    document.querySelector("[data-nav='overview']")?.classList.add("active");
  } else if (route.view === "domain") {
    document.querySelector("[data-nav='domains']")?.classList.add("active");
    document.querySelector(`[data-domain='${route.params.slug}']`)?.classList.add("active");
  }

  // Sections dropdown is only relevant on the Overview page.
  const sectionsDD = document.getElementById("sections-dropdown");
  if (sectionsDD) sectionsDD.hidden = route.view !== "overview";
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
  initDropdowns();
  render();
});
