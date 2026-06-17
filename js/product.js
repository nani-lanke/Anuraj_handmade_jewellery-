/* ============================================================
   AnuRaj Jewellery — product detail page
   Multi-image gallery, lightbox, related items, sharing.
   ============================================================ */
(function () {
  "use strict";

  function buildGallery(p) {
    var main = document.getElementById("pd-main-img");
    var thumbsWrap = document.getElementById("pd-thumbs");
    if (!main) return;
    main.src = p.images[0]; main.alt = p.name;

    if (p.images.length > 1) {
      thumbsWrap.innerHTML = p.images.map(function (src, i) {
        return '<button class="' + (i === 0 ? "active" : "") + '" data-i="' + i + '" aria-label="Image ' + (i + 1) + '">' +
          '<img loading="lazy" src="' + window.ANURAJ.esc(src) + '" alt=""></button>';
      }).join("");
      thumbsWrap.addEventListener("click", function (e) {
        var btn = e.target.closest("button"); if (!btn) return;
        var i = parseInt(btn.getAttribute("data-i"), 10);
        setMain(i);
      });
    } else {
      thumbsWrap.style.display = "none";
    }

    var current = 0;
    function setMain(i) {
      current = i;
      main.style.opacity = "0";
      setTimeout(function () { main.src = p.images[i]; main.style.opacity = "1"; }, 150);
      thumbsWrap.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("active", parseInt(b.getAttribute("data-i"), 10) === i);
      });
    }

    // Lightbox
    var lb = document.getElementById("lightbox");
    var lbImg = document.getElementById("lightbox-img");
    function openLb() { lbImg.src = p.images[current]; lb.classList.add("open"); }
    function closeLb() { lb.classList.remove("open"); }
    function step(d) { current = (current + d + p.images.length) % p.images.length; setMain(current); lbImg.src = p.images[current]; }
    main.addEventListener("click", openLb);
    if (lb) {
      lb.querySelector(".lightbox-close").addEventListener("click", closeLb);
      lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
      lb.querySelector(".prev").addEventListener("click", function () { step(-1); });
      lb.querySelector(".next").addEventListener("click", function () { step(1); });
      document.addEventListener("keydown", function (e) {
        if (!lb.classList.contains("open")) return;
        if (e.key === "Escape") closeLb();
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      });
    }
  }

  function buildShare(p) {
    var url = window.location.href;
    var text = "Check out \"" + p.name + "\" from AnuRaj Jewellery";
    var row = document.getElementById("share-row");
    if (!row) return;
    var links = {
      WhatsApp: "https://wa.me/?text=" + encodeURIComponent(text + " " + url),
      Facebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url),
      "X": "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(url),
      Pinterest: "https://pinterest.com/pin/create/button/?url=" + encodeURIComponent(url) + "&media=" +
        encodeURIComponent(new URL(p.images[0], window.location.href).href) + "&description=" + encodeURIComponent(text)
    };
    var glyph = { WhatsApp: "&#128172;", Facebook: "f", "X": "&#120143;", Pinterest: "P" };
    var html = '<span>Share:</span>';
    Object.keys(links).forEach(function (k) {
      html += '<a class="share-btn" href="' + links[k] + '" target="_blank" rel="noopener" title="Share on ' + k + '">' + (glyph[k] || k) + "</a>";
    });
    html += '<button class="share-btn" id="copy-link" title="Copy link">&#128279;</button>';
    row.innerHTML = html;
    var copyBtn = document.getElementById("copy-link");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { window.ANURAJ.toast("Link copied!"); });
      else window.ANURAJ.toast(url);
    });

    // Native share button (mobile)
    var nativeBtn = document.getElementById("native-share");
    if (nativeBtn) {
      if (navigator.share) {
        nativeBtn.addEventListener("click", function () {
          navigator.share({ title: p.name, text: text, url: url }).catch(function () {});
        });
      } else { nativeBtn.style.display = "none"; }
    }
  }

  function buildRelated(p) {
    var wrap = document.getElementById("related-grid");
    if (!wrap) return;
    var related = window.ANURAJ.products().filter(function (x) {
      return x.category === p.category && x.id !== p.id;
    });
    if (related.length < 4) {
      var more = window.ANURAJ.products().filter(function (x) {
        return x.category !== p.category && x.id !== p.id;
      });
      related = related.concat(more).slice(0, 4);
    } else {
      related = related.slice(0, 4);
    }
    var section = document.getElementById("related-section");
    if (!related.length) { if (section) section.style.display = "none"; return; }
    wrap.innerHTML = related.map(window.ANURAJ.cardHTML).join("");
    wrap.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  window.ANURAJ_renderProduct = function () {
    var A = window.ANURAJ;
    var id = A.qs("id");
    var p = A.productById(id);
    var stage = document.getElementById("pd-stage");
    if (!p) {
      if (stage) stage.innerHTML = '<div class="empty-state" style="padding:5rem 1rem">' +
        '<h2>Product not found</h2><p>This item may have been moved or renamed.</p>' +
        '<a class="btn btn-primary" href="index.html" style="margin-top:1.2rem">Back to home</a></div>';
      return;
    }

    document.title = p.name + " — AnuRaj Jewellery";
    var set = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    set("pd-name", p.name);
    set("pd-name-crumb", p.name);
    set("pd-cat", p.categoryName);
    set("pd-desc", p.description);
    set("pd-meta-cat", p.categoryName);
    set("pd-meta-images", p.images.length + (p.images.length === 1 ? " image" : " images"));

    var priceEl = document.getElementById("pd-price");
    if (priceEl) { if (p.price) priceEl.textContent = p.price; else priceEl.style.display = "none"; }

    // breadcrumb category link
    var crumb = document.getElementById("crumb-cat");
    if (crumb) { crumb.textContent = p.categoryName; crumb.href = "category.html?cat=" + encodeURIComponent(p.category); }

    // WhatsApp inquiry with product context
    var wa = document.getElementById("pd-whatsapp");
    if (wa) {
      wa.href = A.waLink('Hello AnuRaj Jewellery! I am interested in "' + p.name + '" (' + p.categoryName + '). ' + window.location.href);
      wa.target = "_blank"; wa.rel = "noopener";
    }

    buildGallery(p);
    buildShare(p);
    buildRelated(p);
  };
})();
