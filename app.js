// app.js
// Entry point. Hash router + two dropdowns (Overview = sections on this page, Domains = domain pages).
// Only place that touches the DOM.

import { parseHash } from "./src/router.js";
import { OVERVIEW_SECTIONS, renderOverview } from "./src/views/overview.js";
import { getDomainSections, renderDomain }   from "./src/views/domain.js";
import { getDomain } from "./src/data.js";

const DOMAIN_PAGES = [
  { hash: "#/domain/insurance-summary",         label: "Insurance summary" },
  { hash: "#/domain/flow-diagram",              label: "Flow Diagram" },
  { hash: "#/domain/asset-sheet",               label: "Asset Sheet" },
  { hash: "#/domain/data-sheet",                label: "Data Sheet" },
  { hash: "#/domain/estate-distribution-chart", label: "Estate Distribution" },
];

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  }[c]));
}

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

function getCurrentSections(route) {
  if (route.view === "overview") return OVERVIEW_SECTIONS;
  if (route.view === "domain")   return getDomainSections(getDomain(route.params.slug));
  return [];
}

function currentDomainHash(route) {
  return route.view === "domain" ? `#/domain/${route.params.slug}` : null;
}

function populateSectionsDropdown(sections) {
  const dropdown = document.getElementById("sections-dd");
  const menu = dropdown.querySelector(".dropdown-menu");
  menu.innerHTML = sections.map(s =>
    `<button type="button" role="menuitem" data-scroll-to="${escapeHtml(s.id)}">${escapeHtml(s.label)}</button>`
  ).join("");
  menu.querySelectorAll("button[data-scroll-to]").forEach(btn => {
    btn.addEventListener("click", () => {
      smoothScrollToId(btn.getAttribute("data-scroll-to"));
      closeDropdown(dropdown);
    });
  });
}

function populateDomainsDropdown(activeHash) {
  const dropdown = document.getElementById("pages-dd");
  const menu = dropdown.querySelector(".dropdown-menu");
  menu.innerHTML = DOMAIN_PAGES.map(p =>
    `<a href="${escapeHtml(p.hash)}" role="menuitem"${p.hash === activeHash ? ' class="active" aria-current="page"' : ""}>${escapeHtml(p.label)}</a>`
  ).join("");
  menu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => closeDropdown(dropdown));
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
  populateSectionsDropdown(getCurrentSections(route));
  populateDomainsDropdown(currentDomainHash(route));
  window.scrollTo(0, 0);
}

function initShellDropdowns() {
  document.querySelectorAll(".dropdown").forEach(initDropdownToggle);
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

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  initShellDropdowns();
  render();
});
