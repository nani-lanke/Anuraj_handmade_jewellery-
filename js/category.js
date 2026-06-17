/* ============================================================
   AnuRaj Jewellery — category listing page
   ============================================================ */
(function () {
  "use strict";

  function reObserve(wrap) {
    var els = wrap.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
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

  window.ANURAJ_renderCategory = function () {
    var A = window.ANURAJ;
    var slug = A.qs("cat");
    var cats = A.categories();
    var current = cats.filter(function (c) { return c.slug === slug; })[0];

    var titleEl = document.getElementById("cat-title");
    var subEl = document.getElementById("cat-sub");
    var grid = document.getElementById("category-products");
    var chipsWrap = document.getElementById("cat-chips");

    // category quick-switch chips
    if (chipsWrap) {
      chipsWrap.innerHTML = cats.map(function (c) {
        return '<a class="filter-chip' + (c.slug === slug ? " active" : "") + '" href="category.html?cat=' +
          encodeURIComponent(c.slug) + '">' + A.esc(c.name) + (c.count ? " (" + c.count + ")" : "") + "</a>";
      }).join("");
    }

    var name = current ? current.name : "Products";
    if (titleEl) titleEl.textContent = name;
    document.title = name + " — AnuRaj Jewellery";

    var items = A.products().filter(function (p) { return p.category === slug; });
    if (subEl) subEl.textContent = items.length
      ? items.length + (items.length === 1 ? " handcrafted piece" : " handcrafted pieces") + " in this collection"
      : "This collection is coming soon.";

    if (!grid) return;
    if (!items.length) {
      grid.innerHTML = '<div class="empty-state"><h3>Coming soon</h3>' +
        '<p>New ' + A.esc(name) + ' will appear here. Add images to <strong>products/' + A.esc(slug || "") +
        '/</strong> and run Update-Gallery.bat.</p>' +
        '<a class="btn btn-outline" href="index.html#collections" style="margin-top:1rem">Browse other collections</a></div>';
      return;
    }
    grid.innerHTML = items.map(A.cardHTML).join("");
    reObserve(grid);
  };
})();
