/* ============================================================
   AnuRaj Jewellery — homepage renderer
   ============================================================ */
(function () {
  "use strict";

  function renderTaglines() {
    var el = document.getElementById("tagline-rotator");
    if (!el) return;
    var lines = (window.ANURAJ_CONFIG && window.ANURAJ_CONFIG.taglines) || [];
    if (!lines.length) return;
    var i = 0;
    var span = document.createElement("span");
    span.textContent = lines[0];
    el.innerHTML = ""; el.appendChild(span);
    if (lines.length < 2) return;
    setInterval(function () {
      span.style.opacity = "0";
      setTimeout(function () { i = (i + 1) % lines.length; span.textContent = lines[i]; span.style.opacity = "1"; }, 600);
    }, 3800);
  }

  /* The category carousel (cat-carousel) is rendered by
     main_items/carousel.js — see that file and main_items/notes.txt. */

  function renderProducts(filter) {
    var wrap = document.getElementById("product-grid");
    if (!wrap) return;
    var items = window.ANURAJ.products();
    if (filter && filter !== "all") items = items.filter(function (p) { return p.category === filter; });
    if (!items.length) {
      wrap.innerHTML = '<div class="empty-state"><h3>No products here yet</h3><p>Add images to the <strong>products</strong> folder and run Update-Gallery.bat.</p></div>';
      return;
    }
    wrap.innerHTML = items.map(window.ANURAJ.cardHTML).join("");
    reObserve(wrap);
  }

  function renderFilterBar() {
    var bar = document.getElementById("filter-bar");
    if (!bar) return;
    var cats = window.ANURAJ.categories();
    var html = '<button class="filter-chip active" data-filter="all">All</button>';
    cats.forEach(function (c) {
      html += '<button class="filter-chip" data-filter="' + window.ANURAJ.esc(c.slug) + '">' + window.ANURAJ.esc(c.name) + "</button>";
    });
    bar.innerHTML = html;
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-chip");
      if (!btn) return;
      bar.querySelectorAll(".filter-chip").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      renderProducts(btn.getAttribute("data-filter"));
    });
  }

  function reObserve(wrap) {
    var els = wrap.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, idx) {
        if (e.isIntersecting) {
          var i = Array.prototype.indexOf.call(els, e.target);
          e.target.style.transitionDelay = (Math.min(i, 6) * 60) + "ms";
          e.target.classList.add("in"); io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Reviews (saved in the visitor's browser) ---------- */
  var SEED_REVIEWS = [
    { name: "Priya S.", stars: 5, text: "The silk thread bangles are absolutely stunning. Beautiful craftsmanship and the colours are so vibrant!" },
    { name: "Anjali M.", stars: 5, text: "Ordered a memory box as a gift and everyone loved it. Such delicate, thoughtful handwork." },
    { name: "Ritu K.", stars: 5, text: "Elegant, premium and truly handmade. AnuRaj is now my go-to for festive jewellery." }
  ];
  function loadReviews() {
    try { return JSON.parse(localStorage.getItem("anuraj_reviews") || "[]"); } catch (e) { return []; }
  }
  function saveReviews(list) {
    try { localStorage.setItem("anuraj_reviews", JSON.stringify(list)); } catch (e) {}
  }
  function stars(n) { var s = ""; for (var i = 0; i < 5; i++) s += i < n ? "★" : "☆"; return s; }
  function renderReviews() {
    var grid = document.getElementById("review-grid");
    if (!grid) return;
    var all = SEED_REVIEWS.concat(loadReviews());
    grid.innerHTML = all.map(function (r) {
      return '<div class="review-card reveal"><div class="review-stars">' + stars(r.stars) + "</div>" +
        "<p>&ldquo;" + window.ANURAJ.esc(r.text) + "&rdquo;</p>" +
        '<div class="review-author">— ' + window.ANURAJ.esc(r.name) + "</div></div>";
    }).join("");
    reObserve(grid);
  }
  function initReviewForm() {
    var form = document.getElementById("review-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("[name=name]").value.trim();
      var text = form.querySelector("[name=text]").value.trim();
      var starInput = form.querySelector("[name=rating]:checked");
      var rating = starInput ? parseInt(starInput.value, 10) : 5;
      if (!name || !text) { window.ANURAJ.toast("Please add your name and review."); return; }
      var list = loadReviews();
      list.push({ name: name, stars: rating, text: text });
      saveReviews(list);
      form.reset();
      renderReviews();
      window.ANURAJ.toast("Thank you for your review! 💖");
    });
  }

  window.ANURAJ_renderHome = function () {
    renderTaglines();
    renderFilterBar();
    renderProducts("all");
    renderReviews();
    initReviewForm();
  };
})();
