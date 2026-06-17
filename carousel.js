/* ============================================================
   AnuRaj Jewellery — cat-carousel ("Our Collections") renderer
   Moved out of js/home.js. Loaded by index.html.

   Self-contained: renders the category cards into #category-grid.
   Depends only on the shared helpers exposed on window.ANURAJ
   (categories(), esc()) from js/site.js, and on the gallery data
   in data/products.js. The category cover images stay in the
   products/ folder (shared with the gallery) — see notes.txt.
   ============================================================ */
(function () {
  "use strict";

  /* Reveal-on-scroll for dynamically inserted cards. */
  function reObserve(wrap) {
    var els = wrap.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var i = Array.prototype.indexOf.call(els, e.target);
          e.target.style.transitionDelay = (Math.min(i, 6) * 60) + "ms";
          e.target.classList.add("in"); io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  }

  function renderCategories() {
    var wrap = document.getElementById("category-grid");
    if (!wrap || !window.ANURAJ) return;
    var cats = window.ANURAJ.categories();
    wrap.innerHTML = cats.map(function (c) {
      if (c.count > 0 && c.cover) {
        return (
          '<a class="cat-card reveal" href="category.html?cat=' + encodeURIComponent(c.slug) + '">' +
            '<span class="cat-badge">' + c.count + (c.count === 1 ? " item" : " items") + "</span>" +
            '<img loading="lazy" src="' + window.ANURAJ.esc(c.cover) + '" alt="' + window.ANURAJ.esc(c.name) + '">' +
            '<div class="cat-card-overlay"><small>Explore</small><h3>' + window.ANURAJ.esc(c.name) + "</h3></div>" +
          "</a>"
        );
      }
      return (
        '<a class="cat-card empty reveal" href="category.html?cat=' + encodeURIComponent(c.slug) + '">' +
          '<div class="cat-card-overlay"><h3>' + window.ANURAJ.esc(c.name) + "</h3>" +
          '<small>Coming soon</small></div></a>'
      );
    }).join("");
    reObserve(wrap);
  }

  window.ANURAJ_renderCategories = renderCategories;
  document.addEventListener("DOMContentLoaded", renderCategories);
})();
