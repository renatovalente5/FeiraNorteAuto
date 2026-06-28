/* Feira Norte Auto — main.js
   Mobile nav, sticky header state, scroll-spy, gallery lightbox,
   cookie consent + consent-gated Google Maps embed. No dependencies. */
(function () {
  "use strict";

  var doc = document;

  /* ---------- Footer year ---------- */
  var yearEl = doc.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header state ---------- */
  var header = doc.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = doc.querySelector(".nav__toggle");
  var mobileNav = doc.getElementById("mobile-nav");

  function closeNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    doc.body.classList.remove("nav-open");
  }
  function openNav() {
    mobileNav.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
    doc.body.classList.add("nav-open");
  }
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      if (mobileNav.classList.contains("open")) closeNav();
      else openNav();
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("open")) {
        closeNav();
        toggle.focus();
      }
    });
  }

  /* ---------- Scroll-spy (active nav link) ---------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.nav__links a[href^="#"]'));
  var sections = navLinks
    .map(function (l) { return doc.getElementById(l.getAttribute("href").slice(1)); })
    .filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = en.target.id;
          navLinks.forEach(function (l) {
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Gallery lightbox ---------- */
  var lb = doc.getElementById("lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector(".lightbox__caption");
    var triggers = Array.prototype.slice.call(doc.querySelectorAll("[data-lightbox]"));
    var current = 0;
    var lastFocus = null;

    function show(i) {
      current = (i + triggers.length) % triggers.length;
      var t = triggers[current];
      lbImg.src = t.getAttribute("data-full") || t.querySelector("img").src;
      lbImg.alt = t.getAttribute("data-alt") || "";
      if (lbCap) lbCap.textContent = t.getAttribute("data-alt") || "";
    }
    function openLb(i) {
      lastFocus = doc.activeElement;
      show(i);
      lb.classList.add("open");
      doc.body.classList.add("nav-open");
      lb.querySelector(".lightbox__close").focus();
    }
    function closeLb() {
      lb.classList.remove("open");
      doc.body.classList.remove("nav-open");
      if (lastFocus) lastFocus.focus();
    }
    triggers.forEach(function (t, i) {
      t.addEventListener("click", function () { openLb(i); });
    });
    lb.querySelector(".lightbox__close").addEventListener("click", closeLb);
    lb.querySelector(".prev").addEventListener("click", function () { show(current - 1); });
    lb.querySelector(".next").addEventListener("click", function () { show(current + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    doc.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") { closeLb(); }
      else if (e.key === "ArrowLeft") { show(current - 1); }
      else if (e.key === "ArrowRight") { show(current + 1); }
      else if (e.key === "Tab") {
        // trap focus among the dialog's controls
        var f = [
          lb.querySelector(".lightbox__close"),
          lb.querySelector(".prev"),
          lb.querySelector(".next")
        ];
        var i = f.indexOf(doc.activeElement);
        e.preventDefault();
        var next = e.shiftKey ? (i - 1 + f.length) % f.length : (i + 1) % f.length;
        if (i === -1) next = 0;
        f[next].focus();
      }
    });
  }

  /* ---------- Cookie consent + Google Maps gating ---------- */
  var STORAGE_KEY = "fna-cookie-consent"; // "accepted" | "rejected"
  var bar = doc.getElementById("cookiebar");
  var mapWrap = doc.getElementById("map-wrap");

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
  }

  function loadMap() {
    if (!mapWrap) return;
    if (mapWrap.querySelector("iframe")) return;
    var src = mapWrap.getAttribute("data-map-src");
    if (!src) return;
    var consentEl = mapWrap.querySelector(".map-consent");
    if (consentEl) consentEl.remove();
    var iframe = doc.createElement("iframe");
    iframe.src = src;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.title = "Mapa da localização da Feira Norte Auto em Lourosa";
    iframe.setAttribute("allowfullscreen", "");
    mapWrap.appendChild(iframe);
  }

  function showBar() { if (bar) bar.classList.add("show"); }
  function hideBar() { if (bar) bar.classList.remove("show"); }

  function applyConsent(v) {
    if (v === "accepted") { loadMap(); }
  }

  // initial state
  var consent = getConsent();
  if (consent) { applyConsent(consent); }
  else if (bar) { showBar(); }

  // banner buttons
  var btnAccept = doc.getElementById("cookie-accept");
  var btnReject = doc.getElementById("cookie-reject");
  if (btnAccept) btnAccept.addEventListener("click", function () { setConsent("accepted"); hideBar(); loadMap(); });
  if (btnReject) btnReject.addEventListener("click", function () { setConsent("rejected"); hideBar(); });

  // map placeholder "accept & view map" button
  var mapAccept = doc.getElementById("map-accept");
  if (mapAccept) mapAccept.addEventListener("click", function () { setConsent("accepted"); hideBar(); loadMap(); });

  // footer "Definições de cookies" — reopen banner to change choice
  doc.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      showBar();
      if (bar) bar.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
})();
