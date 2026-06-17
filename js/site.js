/* ============================================================
   AnuRaj Jewellery — shared site script
   Handles header behaviour, mobile nav, config-driven contact
   links, WhatsApp buttons, footer, reveal animations & toasts.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.ANURAJ_CONFIG || {};
  var DATA = window.ANURAJ_DATA || { categories: [], products: [] };

  /* ---------- helpers (exposed) ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function waLink(text) {
    var num = (CFG.whatsapp || "").replace(/[^0-9]/g, "");
    var msg = encodeURIComponent(text || ("Hello AnuRaj Jewellery! I would like to know more about your products."));
    return "https://wa.me/" + num + "?text=" + msg;
  }
  function products() { return (window.ANURAJ_DATA || {}).products || []; }
  function categories() { return (window.ANURAJ_DATA || {}).categories || []; }
  function productById(id) {
    return products().filter(function (p) { return p.id === id; })[0] || null;
  }
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._timer); t._timer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- shared product card ---------- */
  function cardHTML(p) {
    var multi = (p.images && p.images.length > 1)
      ? '<span class="count-pill">&#128247; ' + p.images.length + "</span>" : "";
    var price = p.price ? '<div class="price">' + esc(p.price) + "</div>" : "";
    return (
      '<a class="product-card reveal" href="product.html?id=' + encodeURIComponent(p.id) + '" data-id="' + esc(p.id) + '">' +
        '<div class="product-media">' +
          '<img loading="lazy" src="' + esc(p.thumb) + '" alt="' + esc(p.name) + '">' +
          multi +
          '<div class="view-hint">View details &rarr;</div>' +
        "</div>" +
        '<div class="product-info">' +
          '<span class="cat-tag">' + esc(p.categoryName) + "</span>" +
          "<h3>" + esc(p.name) + "</h3>" +
          price +
        "</div>" +
      "</a>"
    );
  }

  window.ANURAJ = {
    esc: esc, waLink: waLink, products: products, categories: categories,
    productById: productById, qs: qs, toast: toast, cfg: CFG, cardHTML: cardHTML
  };

  /* ---------- header scroll state ---------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 12); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- mobile nav ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.innerHTML = open ? "&times;" : "&#9776;";
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { links.classList.remove("open"); toggle.innerHTML = "&#9776;"; }
    });
  }

  /* ---------- brand text from config ---------- */
  function applyBranding() {
    document.querySelectorAll("[data-brand-name]").forEach(function (el) { el.textContent = CFG.brandName || "AnuRaj"; });
    document.querySelectorAll("[data-brand-suffix]").forEach(function (el) { el.textContent = CFG.brandSuffix || "JEWELLERY"; });
  }

  /* ---------- WhatsApp links ---------- */
  function applyWhatsApp() {
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      el.setAttribute("href", waLink(el.getAttribute("data-wa-text")));
      el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener");
    });
  }

  /* ---------- contact + social from config ---------- */
  function applyContact() {
    var map = {
      "contact-phone": CFG.phoneDisplay,
      "contact-email": CFG.email,
      "contact-location": CFG.location,
      "contact-hours": CFG.hours
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && map[id]) el.textContent = map[id];
    });
    var ph = document.getElementById("contact-phone-link"); if (ph && CFG.phoneDisplay) ph.href = "tel:" + CFG.phoneDisplay.replace(/[^0-9+]/g, "");
    var em = document.getElementById("contact-email-link"); if (em && CFG.email) em.href = "mailto:" + CFG.email;

    var socialWrap = document.querySelectorAll("[data-social]");
    var icons = { instagram: "&#9826;", facebook: "f", youtube: "&#9658;", pinterest: "P" };
    var labels = { instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", pinterest: "Pinterest" };
    var glyph = { instagram: "IG", facebook: "f", youtube: "▶", pinterest: "P" };
    socialWrap.forEach(function (wrap) {
      var html = "";
      var s = CFG.social || {};
      Object.keys(s).forEach(function (k) {
        if (s[k]) {
          html += '<a class="social-btn" href="' + esc(s[k]) + '" target="_blank" rel="noopener" aria-label="' +
            (labels[k] || k) + '" title="' + (labels[k] || k) + '">' + (glyph[k] || k.charAt(0).toUpperCase()) + '</a>';
        }
      });
      wrap.innerHTML = html || '<span style="color:var(--text-soft);font-size:.85rem;">Add your social links in data/config.js</span>';
    });

    // Map embed
    var mapWrap = document.getElementById("map-embed");
    if (mapWrap) {
      if (CFG.mapEmbed) {
        mapWrap.innerHTML = '<iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="' + esc(CFG.mapEmbed) + '"></iframe>';
      } else {
        mapWrap.innerHTML = '<div style="display:grid;place-items:center;height:100%;min-height:320px;color:var(--text-soft);text-align:center;padding:2rem;">'
          + '<div><div style="font-size:2.4rem">&#128205;</div><strong>' + esc(CFG.location || "Visit Us") + '</strong>'
          + '<p style="margin-top:.4rem;font-size:.85rem">Add a Google Maps embed link in data/config.js to show a map here.</p></div></div>';
      }
    }
  }

  /* ---------- nav category dropdown / footer links ---------- */
  function buildCategoryMenus() {
    var cats = categories();
    document.querySelectorAll("[data-cat-list]").forEach(function (wrap) {
      var html = "";
      cats.forEach(function (c) {
        html += '<li><a href="category.html?cat=' + encodeURIComponent(c.slug) + '">' + esc(c.name) + "</a></li>";
      });
      wrap.innerHTML = html;
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (el) { el.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- year ---------- */
  function setYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- shared product modal / lightbox ---------- */
  function initProductModal() {
    if (document.getElementById("product-modal")) return;

    var modal = document.createElement("div");
    modal.className = "pmodal";
    modal.id = "product-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML =
      '<div class="pmodal-backdrop" data-close></div>' +
      '<div class="pmodal-dialog" role="dialog" aria-modal="true" aria-label="Product details">' +
        '<button class="pmodal-close" data-close aria-label="Close">&times;</button>' +
        '<div class="pmodal-stage">' +
          '<button class="pmodal-nav prev" aria-label="Previous image">&#8249;</button>' +
          '<img class="pmodal-img" alt="">' +
          '<button class="pmodal-nav next" aria-label="Next image">&#8250;</button>' +
          '<span class="pmodal-counter"></span>' +
        '</div>' +
        '<div class="pmodal-info">' +
          '<span class="cat-tag"></span>' +
          '<h3 class="pmodal-name"></h3>' +
          '<div class="pmodal-price"></div>' +
          '<p class="pmodal-desc"></p>' +
          '<div class="pmodal-thumbs"></div>' +
          '<a class="btn btn-gold pmodal-wa" target="_blank" rel="noopener">&#128172; Inquire on WhatsApp</a>' +
          '<div class="pmodal-related-wrap"><h4>You may also like</h4><div class="pmodal-related"></div></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    var imgEl = modal.querySelector(".pmodal-img");
    var counterEl = modal.querySelector(".pmodal-counter");
    var thumbsEl = modal.querySelector(".pmodal-thumbs");
    var relatedWrap = modal.querySelector(".pmodal-related-wrap");
    var relatedEl = modal.querySelector(".pmodal-related");
    var stage = modal.querySelector(".pmodal-stage");

    var state = { product: null, images: [], index: 0 };

    function showImage(i) {
      var imgs = state.images;
      state.index = (i + imgs.length) % imgs.length;
      imgEl.style.opacity = "0";
      setTimeout(function () { imgEl.src = imgs[state.index]; imgEl.style.opacity = "1"; }, 120);
      counterEl.textContent = imgs.length > 1 ? (state.index + 1) + " / " + imgs.length : "";
      thumbsEl.querySelectorAll("button").forEach(function (b, bi) {
        b.classList.toggle("active", bi === state.index);
      });
    }

    function relatedFor(p) {
      var same = products().filter(function (x) { return x.category === p.category && x.id !== p.id; });
      var rest = products().filter(function (x) { return x.category !== p.category && x.id !== p.id; });
      return same.concat(rest).slice(0, 6);
    }

    function render(p) {
      var imgs = p.images && p.images.length ? p.images : [p.thumb];
      state.product = p; state.images = imgs; state.index = 0;

      modal.querySelector(".cat-tag").textContent = p.categoryName || "";
      modal.querySelector(".pmodal-name").textContent = p.name || "";
      var priceEl = modal.querySelector(".pmodal-price");
      priceEl.textContent = p.price || ""; priceEl.style.display = p.price ? "" : "none";
      modal.querySelector(".pmodal-desc").textContent = p.description || "";

      var hasMulti = imgs.length > 1;
      modal.querySelector(".prev").style.display = hasMulti ? "" : "none";
      modal.querySelector(".next").style.display = hasMulti ? "" : "none";
      thumbsEl.style.display = hasMulti ? "" : "none";
      thumbsEl.innerHTML = hasMulti ? imgs.map(function (src, i) {
        return '<button data-i="' + i + '" aria-label="Image ' + (i + 1) + '">' +
          '<img loading="lazy" src="' + esc(src) + '" alt=""></button>';
      }).join("") : "";

      var wa = modal.querySelector(".pmodal-wa");
      wa.href = waLink('Hello AnuRaj Jewellery! I am interested in "' + p.name + '" (' + (p.categoryName || "") + ').');

      var related = relatedFor(p);
      relatedWrap.style.display = related.length ? "" : "none";
      relatedEl.innerHTML = related.map(function (r) {
        return '<button class="pmodal-related-card" data-id="' + esc(r.id) + '" aria-label="' + esc(r.name) + '">' +
          '<img loading="lazy" src="' + esc(r.thumb) + '" alt="' + esc(r.name) + '">' +
          '<span>' + esc(r.name) + '</span></button>';
      }).join("");

      showImage(0);
    }

    function open(id) {
      var p = productById(id);
      if (!p) return;
      render(p);
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("pmodal-lock");
    }
    function close() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("pmodal-lock");
    }
    function step(d) { if (state.product) showImage(state.index + d); }

    // intercept product-card clicks site-wide
    document.addEventListener("click", function (e) {
      var card = e.target.closest("a.product-card");
      if (!card) return;
      var id = card.getAttribute("data-id");
      if (!id || !productById(id)) return; // let the link work if we can't resolve it
      e.preventDefault();
      open(id);
    });

    modal.addEventListener("click", function (e) {
      if (e.target.hasAttribute("data-close")) { close(); return; }
      if (e.target.closest(".prev")) { step(-1); return; }
      if (e.target.closest(".next")) { step(1); return; }
      var thumb = e.target.closest(".pmodal-thumbs button");
      if (thumb) { showImage(parseInt(thumb.getAttribute("data-i"), 10)); return; }
      var rel = e.target.closest(".pmodal-related-card");
      if (rel) { open(rel.getAttribute("data-id")); modal.querySelector(".pmodal-dialog").scrollTop = 0; return; }
    });

    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });

    // swipe navigation (mobile)
    var sx = 0, sy = 0;
    stage.addEventListener("touchstart", function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.ANURAJ_DATA) {
      console.warn("Gallery data not loaded. Run Update-Gallery.bat to generate data/products.js");
    }
    initHeader(); initNav(); applyBranding(); applyWhatsApp();
    applyContact(); buildCategoryMenus(); setYear(); initReveal();
    initProductModal();
    // page-specific renderers
    if (window.ANURAJ_renderHome) window.ANURAJ_renderHome();
    if (window.ANURAJ_renderCategory) window.ANURAJ_renderCategory();
    if (window.ANURAJ_renderProduct) window.ANURAJ_renderProduct();
  });
})();
