// app.js
// Entry point. Hash router + two fixed dropdowns (Overview sections / Domain pages).
// Only place that touches the DOM.

import { parseHash } from "./src/router.js";
import { renderOverview } from "./src/views/overview.js";
import { renderDomain }   from "./src/views/domain.js";

// Cross-page scroll: when the user clicks an Overview section from another page,
// we navigate to "#/" and then scroll to this section once the overview has rendered.
let pendingScrollTarget = null;

function closeDropdown(dropdown) {
  dropdown.classList.remove("open");
  dropdown.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
}

function initDropdownToggle(dropdown) {
  const toggle = dropdown.querySelector(".dropdown-toggle");
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".dropdown.open").forEach(d => { if (d !== dropdown) closeDropdown(d); });
    const open = dropdown.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function smoothScrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector(".topbar-sticky");
  const headerH = header ? header.offsetHeight : 0;
  const top = el.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
  window.scrollTo({ top, behavior: "smooth" });
}

function wireOverviewMenu() {
  const dropdown = document.getElementById("overview-dd");
  dropdown.querySelectorAll("button[data-section]").forEach(btn => {
    btn.addEventListener("click", () => {
      const sectionId = btn.getAttribute("data-section");
      const route = parseHash(window.location.hash);
      if (route.view === "overview") {
        smoothScrollToId(sectionId);
      } else {
        pendingScrollTarget = sectionId;
        window.location.hash = "#/";
      }
      closeDropdown(dropdown);
    });
  });
}

function wireDomainsMenu() {
  const dropdown = document.getElementById("domains-dd");
  dropdown.querySelectorAll("a[href]").forEach(a => {
    a.addEventListener("click", () => closeDropdown(dropdown));
  });
}

function initShell() {
  document.querySelectorAll(".dropdown").forEach(initDropdownToggle);
  wireOverviewMenu();
  wireDomainsMenu();
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

function render() {
  const route = parseHash(window.location.hash);
  const app = document.getElementById("app");
  let html;
  switch (route.view) {
    case "domain":   html = renderDomain(route.params.slug); break;
    case "overview":
    default:         html = renderOverview(); break;
  }
  app.innerHTML = html;

  if (pendingScrollTarget && route.view === "overview") {
    const target = pendingScrollTarget;
    pendingScrollTarget = null;
    requestAnimationFrame(() => smoothScrollToId(target));
  } else {
    window.scrollTo(0, 0);
  }
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  initShell();
  render();
});
