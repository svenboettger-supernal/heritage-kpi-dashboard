// app.js
// Entry point. Wires the hash router to view renderers + the static topbar's nav.
// Only place that touches the DOM.

import { parseHash } from "./src/router.js";
import { renderOverview } from "./src/views/overview.js";
import { renderDomain }   from "./src/views/domain.js";
import { renderAbout }    from "./src/views/about.js";

const SECTION_IDS = [
  "section-accuracy",
  "section-accuracy-trend",
  "section-timing",
  "section-timing-trend",
  "section-per-domain",
];

function closeDropdown(dropdown) {
  dropdown.classList.remove("open");
  dropdown.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
}

function initDropdown(dropdown) {
  if (!dropdown) return;
  const toggle = dropdown.querySelector(".dropdown-toggle");
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".dropdown.open").forEach(d => { if (d !== dropdown) closeDropdown(d); });
    const open = dropdown.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  dropdown.querySelectorAll(".dropdown-menu a").forEach(a => {
    a.addEventListener("click", () => closeDropdown(dropdown));
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

function smoothScrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector(".topbar-sticky");
  const headerH = header ? header.offsetHeight : 0;
  const top = el.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
  window.scrollTo({ top, behavior: "smooth" });
}

function initSectionPills() {
  document.querySelectorAll(".section-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const targetId = pill.getAttribute("data-scroll-to");
      smoothScrollToId(targetId);
      setActiveSectionPill(targetId);
    });
  });
}

function setActiveSectionPill(activeId) {
  document.querySelectorAll(".section-pill").forEach(p => {
    p.classList.toggle("active", p.getAttribute("data-scroll-to") === activeId);
  });
}

let scrollSpyRaf = 0;
function updateActiveSectionFromScroll() {
  const header = document.querySelector(".topbar-sticky");
  const headerH = header ? header.offsetHeight : 0;
  const threshold = headerH + 80;
  let activeId = SECTION_IDS[0];
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top - threshold <= 0) {
      activeId = id;
    } else {
      break; // sections are in document order
    }
  }
  setActiveSectionPill(activeId);
}

function onScroll() {
  if (scrollSpyRaf) return;
  scrollSpyRaf = requestAnimationFrame(() => {
    scrollSpyRaf = 0;
    updateActiveSectionFromScroll();
  });
}

function updateNavForRoute(route) {
  const overviewLink = document.getElementById("overview-link");
  const sectionPills = document.getElementById("section-pills");
  const domainsToggle = document.querySelector("[data-nav='domains']");

  document.querySelectorAll(".topnav .topnav-link, .topnav .dropdown-toggle, .dropdown-menu a")
    .forEach(el => el.classList.remove("active"));

  if (route.view === "overview") {
    if (overviewLink) overviewLink.hidden = true;
    if (sectionPills) sectionPills.hidden = false;
    window.addEventListener("scroll", onScroll, { passive: true });
    // Set initial active section after the view renders into the DOM
    requestAnimationFrame(updateActiveSectionFromScroll);
  } else {
    if (overviewLink) overviewLink.hidden = false;
    if (sectionPills) sectionPills.hidden = true;
    window.removeEventListener("scroll", onScroll);
    if (route.view === "domain") {
      domainsToggle?.classList.add("active");
      document.querySelector(`[data-domain='${route.params.slug}']`)?.classList.add("active");
    }
  }
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
  updateNavForRoute(route);
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  initDropdowns();
  initSectionPills();
  render();
});
