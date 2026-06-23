// Tips & Chips theme controller.
(function () {
  "use strict";
  var KEY = "tc-theme";
  var root = document.documentElement;

  // 1) Set initial theme before paint: stored choice wins, else OS preference.
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  var prefersDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", stored || (prefersDark ? "dark" : "light"));

  // 2) Wire the toggle button once the DOM is ready.
  function wire() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    function sync() {
      var isDark = root.getAttribute("data-theme") === "dark";
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute("aria-label", isDark ? "Přepnout na světlý režim" : "Přepnout na tmavý režim");
      btn.textContent = isDark ? "☀︎" : "☾";
    }
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      sync();
    });
    sync();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }

  // Progressive scroll-reveal for sections.
  root.classList.add("js");
  function revealSections() {
    var sections = document.querySelectorAll(".section");
    if (!("IntersectionObserver" in window)) {
      sections.forEach(function (s) { s.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    sections.forEach(function (s) { io.observe(s); });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", revealSections);
  } else {
    revealSections();
  }
})();
