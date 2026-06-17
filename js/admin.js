/* ============================================================
   AnuRaj Jewellery — Owner Edit / Upload (browser-only)
   ------------------------------------------------------------
   Lets the shop owner log in and add gallery images straight
   from the browser. NO server, NO accounts needed.

   HOW THE OWNER OPENS THE LOGIN (hidden from normal visitors):
     • Press  Ctrl + Shift + E    (on a keyboard), OR
     • Open   index.html#edit     in the address bar, OR
     • Tap the footer "AR" logo 5 times quickly (good on phones)

   FIRST TIME: you'll be asked to CREATE an owner username +
   password. Only a scrambled (hashed) version is stored in this
   browser — the real password is never written into any file,
   so other people can't read it.

   IMPORTANT — how far the uploads reach:
   Because this site has no server, images you upload are saved
   inside THIS browser only and show on THIS device. To publish
   an image so EVERY visitor on every phone/PC sees it, drop the
   picture into the matching folder under  products\  and run
   Update-Gallery.bat (the original workflow). This panel is a
   quick local preview / personal catalogue.
   ============================================================ */
(function () {
  "use strict";

  var LS_PRODUCTS = "anuraj_owner_products";  // uploaded items (this browser)
  var LS_CRED     = "anuraj_owner_cred";      // { user, hash }
  var SS_SESSION  = "anuraj_owner_session";   // "1" while logged in (this tab)
  var SS_FLASH    = "anuraj_owner_flash";     // toast to show after reload
  var MAX_PX      = 1600;                      // downscale uploads to this max edge
  var JPEG_Q      = 0.82;

  /* ---------- tiny SHA-256 (so the password is never stored as plain text) ---------- */
  function utf8(str) { return unescape(encodeURIComponent(String(str))); }
  function sha256(asciiIn) {
    var ascii = utf8(asciiIn);
    function ror(v, a) { return (v >>> a) | (v << (32 - a)); }
    var mp = Math.pow, maxWord = mp(2, 32), result = "", words = [];
    var bitLen = ascii.length * 8;
    var hash = sha256.h = sha256.h || [], k = sha256.k = sha256.k || [];
    var pc = k.length, composite = {};
    for (var cand = 2; pc < 64; cand++) {
      if (!composite[cand]) {
        for (var x = 0; x < 313; x += cand) composite[x] = cand;
        hash[pc] = (mp(cand, .5) * maxWord) | 0;
        k[pc++] = (mp(cand, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += "\x80";
    while (ascii.length % 64 - 56) ascii += "\x00";
    for (var i = 0; i < ascii.length; i++) {
      var j = ascii.charCodeAt(i);
      if (j >> 8) return null;
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (bitLen / maxWord) | 0;
    words[words.length] = bitLen;
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var t1 = hash[7] + (ror(e, 6) ^ ror(e, 11) ^ ror(e, 25)) +
          ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] +
          (w[i] = i < 16 ? w[i] : (
            w[i - 16] + (ror(w15, 7) ^ ror(w15, 18) ^ (w15 >>> 3)) +
            w[i - 7] + (ror(w2, 17) ^ ror(w2, 19) ^ (w2 >>> 10))
          ) | 0);
        var t2 = (ror(a, 2) ^ ror(a, 13) ^ ror(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++)
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? "0" : "") + b.toString(16);
      }
    return result;
  }

  /* ---------- storage helpers ---------- */
  function loadOwnerProducts() {
    try { return JSON.parse(localStorage.getItem(LS_PRODUCTS) || "[]"); } catch (e) { return []; }
  }
  function saveOwnerProducts(list) { localStorage.setItem(LS_PRODUCTS, JSON.stringify(list)); }
  function getCred() {
    try { return JSON.parse(localStorage.getItem(LS_CRED) || "null"); } catch (e) { return null; }
  }
  function setCred(user, password) {
    localStorage.setItem(LS_CRED, JSON.stringify({ user: user, hash: sha256(user + ":" + password) }));
  }
  function isLoggedIn() { return sessionStorage.getItem(SS_SESSION) === "1"; }
  function ownerIdSet() {
    var s = {}; loadOwnerProducts().forEach(function (p) { s[p.id] = true; }); return s;
  }

  /* ---------- merge uploaded items into the gallery data (runs immediately) ---------- */
  function mergeOwnerProducts() {
    var data = window.ANURAJ_DATA;
    if (!data || !data.products || !data.categories) return;
    var owned = loadOwnerProducts();
    // avoid double-merge if script somehow runs twice
    var existing = {}; data.products.forEach(function (p) { existing[p.id] = true; });
    owned.forEach(function (p) { if (!existing[p.id]) data.products.push(p); });
    // recompute each category's count + cover from the full product list
    data.categories.forEach(function (c) {
      var inCat = data.products.filter(function (p) { return p.category === c.slug; });
      c.count = inCat.length;
      if (!c.cover && inCat.length) c.cover = inCat[0].thumb;
    });
  }
  mergeOwnerProducts();   // <-- before any renderer reads the data

  /* ---------- styles ---------- */
  function injectStyles() {
    if (document.getElementById("anuraj-admin-style")) return;
    var css =
      ".anuraj-bar{position:fixed;left:0;right:0;bottom:0;z-index:1200;display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;justify-content:center;padding:.7rem 1rem;background:#2a0f1c;color:#fff;box-shadow:0 -6px 24px rgba(0,0,0,.3);font-family:'Poppins',sans-serif}" +
      ".anuraj-bar b{color:#f6d488;font-weight:600}" +
      ".anuraj-bar .ab-btn{cursor:pointer;border:0;border-radius:999px;padding:.5rem 1rem;font-weight:600;font-size:.85rem}" +
      ".anuraj-bar .ab-gold{background:linear-gradient(135deg,#f6d488,#d9a441);color:#2a0f1c}" +
      ".anuraj-bar .ab-ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4)}" +
      "body.anuraj-edit{padding-bottom:74px}" +
      "body.anuraj-edit .wa-float{bottom:90px}" +
      ".anuraj-modal{position:fixed;inset:0;z-index:1300;display:none;align-items:center;justify-content:center;padding:1rem;background:rgba(20,8,14,.6);backdrop-filter:blur(3px)}" +
      ".anuraj-modal.open{display:flex}" +
      ".anuraj-card{background:#fff;color:#2a0f1c;width:min(440px,100%);max-height:92vh;overflow:auto;border-radius:18px;padding:1.6rem;box-shadow:0 24px 60px rgba(0,0,0,.4);font-family:'Poppins',sans-serif}" +
      ".anuraj-card h3{font-family:'Cormorant Garamond',serif;font-size:1.7rem;margin:0 0 .2rem}" +
      ".anuraj-card p.sub{margin:0 0 1.1rem;font-size:.85rem;color:#7a5563}" +
      ".anuraj-field{margin-bottom:.9rem}" +
      ".anuraj-field label{display:block;font-size:.78rem;font-weight:600;margin-bottom:.3rem;color:#5c3a48}" +
      ".anuraj-field input,.anuraj-field select,.anuraj-field textarea{width:100%;box-sizing:border-box;padding:.7rem .8rem;border:1px solid #e3cdd6;border-radius:10px;font:inherit;background:#fff}" +
      ".anuraj-field input:focus,.anuraj-field select:focus,.anuraj-field textarea:focus{outline:2px solid #d9a441;border-color:#d9a441}" +
      ".anuraj-row{display:flex;gap:.7rem;margin-top:.4rem}" +
      ".anuraj-row .ab-btn{flex:1}" +
      ".anuraj-card .ab-btn{cursor:pointer;border:0;border-radius:999px;padding:.75rem 1rem;font-weight:600;font-size:.9rem}" +
      ".anuraj-card .ab-gold{background:linear-gradient(135deg,#f6d488,#d9a441);color:#2a0f1c}" +
      ".anuraj-card .ab-ghost{background:#f3e9ee;color:#2a0f1c}" +
      ".anuraj-note{font-size:.74rem;color:#9a7081;margin-top:.8rem;line-height:1.5}" +
      ".anuraj-err{color:#b3261e;font-size:.8rem;margin:.2rem 0 .6rem;min-height:1em}" +
      ".anuraj-prev{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.5rem}" +
      ".anuraj-prev img{width:54px;height:54px;object-fit:cover;border-radius:8px;border:1px solid #e3cdd6}" +
      // owner-only controls injected on cards
      ".owner-del{position:absolute;top:8px;left:8px;z-index:5;border:0;cursor:pointer;background:rgba(179,38,30,.92);color:#fff;border-radius:999px;padding:.32rem .7rem;font-size:.72rem;font-weight:600;font-family:'Poppins',sans-serif}" +
      ".owner-tag{position:absolute;bottom:8px;left:8px;z-index:5;background:#2a0f1c;color:#f6d488;border-radius:999px;padding:.2rem .6rem;font-size:.66rem;font-weight:600}" +
      ".owner-add-card{display:flex;align-items:center;justify-content:center;min-height:220px;border:2px dashed #d9a441;border-radius:16px;background:#fff8ef;color:#a87a1e;cursor:pointer;font-weight:600;text-align:center;padding:1rem}" +
      ".owner-add-card span{font-size:2rem;display:block;margin-bottom:.3rem}";
    var s = document.createElement("style");
    s.id = "anuraj-admin-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------- toast that survives a reload ---------- */
  function flash(msg) { try { sessionStorage.setItem(SS_FLASH, msg); } catch (e) {} }
  function showFlash() {
    var m = sessionStorage.getItem(SS_FLASH);
    if (m) { sessionStorage.removeItem(SS_FLASH); if (window.ANURAJ) window.ANURAJ.toast(m); }
  }
  function toast(msg) { if (window.ANURAJ) window.ANURAJ.toast(msg); else alert(msg); }

  /* ---------- login / setup modal ---------- */
  var modal;
  function buildModal() {
    if (modal) return;
    modal = document.createElement("div");
    modal.className = "anuraj-modal";
    modal.innerHTML = '<div class="anuraj-card"></div>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  }
  function closeModal() { if (modal) modal.classList.remove("open"); }
  function openModal(html, onMount) {
    buildModal();
    modal.querySelector(".anuraj-card").innerHTML = html;
    modal.classList.add("open");
    if (onMount) onMount(modal.querySelector(".anuraj-card"));
  }

  function openAuth() {
    if (isLoggedIn()) { enterEditMode(); return; }
    getCred() ? showLogin() : showSetup();
  }

  function showSetup(changing) {
    openModal(
      '<h3>' + (changing ? "Change owner password" : "Create owner login") + '</h3>' +
      '<p class="sub">' + (changing ? "Set a new password for this browser." :
        "First time here — set a private username and password. Only you will know it.") + '</p>' +
      '<div class="anuraj-field"><label>Username</label><input id="au-user" type="text" autocomplete="off" placeholder="e.g. anuraj"></div>' +
      '<div class="anuraj-field"><label>Password</label><input id="au-pass" type="password" autocomplete="new-password" placeholder="Choose a password"></div>' +
      '<div class="anuraj-field"><label>Confirm password</label><input id="au-pass2" type="password" autocomplete="new-password" placeholder="Type it again"></div>' +
      '<div class="anuraj-err" id="au-err"></div>' +
      '<div class="anuraj-row"><button class="ab-btn ab-gold" id="au-save">Save</button>' +
      '<button class="ab-btn ab-ghost" id="au-cancel">Cancel</button></div>' +
      '<p class="anuraj-note">Your password is scrambled and stored only in this browser — it is never written into the website files, so visitors can\'t read it.</p>',
      function (card) {
        card.querySelector("#au-cancel").onclick = closeModal;
        card.querySelector("#au-save").onclick = function () {
          var u = card.querySelector("#au-user").value.trim();
          var p = card.querySelector("#au-pass").value;
          var p2 = card.querySelector("#au-pass2").value;
          var err = card.querySelector("#au-err");
          if (!u || !p) { err.textContent = "Please fill in a username and password."; return; }
          if (p.length < 4) { err.textContent = "Use at least 4 characters."; return; }
          if (p !== p2) { err.textContent = "The two passwords don't match."; return; }
          setCred(u, p);
          sessionStorage.setItem(SS_SESSION, "1");
          closeModal();
          enterEditMode();
          toast(changing ? "Password updated." : "Owner login created. You're in! ✨");
        };
        card.querySelector("#au-user").focus();
      }
    );
  }

  function showLogin() {
    openModal(
      '<h3>Owner login</h3>' +
      '<p class="sub">Enter your username and password to edit the gallery.</p>' +
      '<div class="anuraj-field"><label>Username</label><input id="au-user" type="text" autocomplete="off"></div>' +
      '<div class="anuraj-field"><label>Password</label><input id="au-pass" type="password" autocomplete="current-password"></div>' +
      '<div class="anuraj-err" id="au-err"></div>' +
      '<div class="anuraj-row"><button class="ab-btn ab-gold" id="au-login">Log in</button>' +
      '<button class="ab-btn ab-ghost" id="au-cancel">Cancel</button></div>' +
      '<p class="anuraj-note">Forgot it? Owner login is per-browser. You can reset by clearing this site\'s data in your browser settings, then setting it up again.</p>',
      function (card) {
        card.querySelector("#au-cancel").onclick = closeModal;
        function attempt() {
          var u = card.querySelector("#au-user").value.trim();
          var p = card.querySelector("#au-pass").value;
          var cred = getCred();
          if (cred && u === cred.user && sha256(u + ":" + p) === cred.hash) {
            sessionStorage.setItem(SS_SESSION, "1");
            closeModal();
            enterEditMode();
            toast("Welcome back! ✨");
          } else {
            card.querySelector("#au-err").textContent = "Wrong username or password.";
          }
        }
        card.querySelector("#au-login").onclick = attempt;
        card.querySelector("#au-pass").addEventListener("keydown", function (e) { if (e.key === "Enter") attempt(); });
        card.querySelector("#au-user").focus();
      }
    );
  }

  /* ---------- edit mode (toolbar + card controls) ---------- */
  var bar;
  function enterEditMode() {
    document.body.classList.add("anuraj-edit");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "anuraj-bar";
      bar.innerHTML =
        '<span>🔒 <b>Owner mode</b></span>' +
        '<button class="ab-btn ab-gold" id="ab-add">＋ Add image to gallery</button>' +
        '<button class="ab-btn ab-ghost" id="ab-backup">⇅ Backup</button>' +
        '<button class="ab-btn ab-ghost" id="ab-pass">Change password</button>' +
        '<button class="ab-btn ab-ghost" id="ab-out">Log out</button>';
      document.body.appendChild(bar);
      bar.querySelector("#ab-add").onclick = showUpload;
      bar.querySelector("#ab-backup").onclick = showBackup;
      bar.querySelector("#ab-pass").onclick = function () { showSetup(true); };
      bar.querySelector("#ab-out").onclick = logout;
    }
    decorateAll();
    watchGrids();
  }
  function logout() {
    sessionStorage.removeItem(SS_SESSION);
    document.body.classList.remove("anuraj-edit");
    if (bar) { bar.remove(); bar = null; }
    undecorateAll();
    toast("Logged out.");
  }

  /* ---------- upload panel ---------- */
  function categoriesList() { return (window.ANURAJ_DATA && window.ANURAJ_DATA.categories) || []; }

  function readAndCompress(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          var w = img.width, h = img.height;
          if (w > MAX_PX || h > MAX_PX) {
            if (w > h) { h = Math.round(h * MAX_PX / w); w = MAX_PX; }
            else { w = Math.round(w * MAX_PX / h); h = MAX_PX; }
          }
          var c = document.createElement("canvas");
          c.width = w; c.height = h;
          c.getContext("2d").drawImage(img, 0, 0, w, h);
          try { resolve(c.toDataURL("image/jpeg", JPEG_Q)); }
          catch (e) { reject(e); }
        };
        img.onerror = function () { reject(new Error("bad image")); };
        img.src = fr.result;
      };
      fr.onerror = function () { reject(new Error("read failed")); };
      fr.readAsDataURL(file);
    });
  }

  function showUpload() {
    var cats = categoriesList();
    var opts = cats.map(function (c) {
      return '<option value="' + c.slug + '">' + (c.name || c.slug) + "</option>";
    }).join("");
    openModal(
      '<h3>Add to the gallery</h3>' +
      '<p class="sub">Pick one or more photos. The first becomes the cover.</p>' +
      '<div class="anuraj-field"><label>Photos</label><input id="up-files" type="file" accept="image/*" multiple></div>' +
      '<div class="anuraj-prev" id="up-prev"></div>' +
      '<div class="anuraj-field"><label>Title</label><input id="up-name" type="text" placeholder="e.g. Emerald Silk Bangle Set"></div>' +
      '<div class="anuraj-field"><label>Category</label><select id="up-cat">' + opts + '</select></div>' +
      '<div class="anuraj-field"><label>Description (optional)</label><textarea id="up-desc" rows="2" placeholder="A few words about this piece"></textarea></div>' +
      '<div class="anuraj-field"><label>Price (optional)</label><input id="up-price" type="text" placeholder="e.g. ₹1,200"></div>' +
      '<div class="anuraj-err" id="up-err"></div>' +
      '<div class="anuraj-row"><button class="ab-btn ab-gold" id="up-save">Add to gallery</button>' +
      '<button class="ab-btn ab-ghost" id="up-cancel">Cancel</button></div>' +
      '<p class="anuraj-note">Saved in this browser and shown on this device. To show it to every visitor, also add the photo under <b>products\\</b> and run <b>Update-Gallery.bat</b>.</p>',
      function (card) {
        var prev = card.querySelector("#up-prev");
        card.querySelector("#up-files").addEventListener("change", function (e) {
          prev.innerHTML = "";
          Array.prototype.slice.call(e.target.files).slice(0, 8).forEach(function (f) {
            var u = URL.createObjectURL(f);
            var im = document.createElement("img"); im.src = u; prev.appendChild(im);
          });
        });
        card.querySelector("#up-cancel").onclick = closeModal;
        card.querySelector("#up-save").onclick = function () {
          var files = card.querySelector("#up-files").files;
          var name = card.querySelector("#up-name").value.trim();
          var slug = card.querySelector("#up-cat").value;
          var err = card.querySelector("#up-err");
          if (!files.length) { err.textContent = "Please choose at least one photo."; return; }
          if (!name) { err.textContent = "Please add a title."; return; }
          var btn = card.querySelector("#up-save");
          btn.disabled = true; btn.textContent = "Working…";
          var jobs = Array.prototype.slice.call(files).slice(0, 8).map(readAndCompress);
          Promise.all(jobs).then(function (images) {
            var cat = categoriesList().filter(function (c) { return c.slug === slug; })[0];
            var item = {
              id: "owner__" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
              name: name,
              category: slug,
              categoryName: cat ? cat.name : slug,
              description: card.querySelector("#up-desc").value.trim(),
              price: card.querySelector("#up-price").value.trim(),
              thumb: images[0],
              images: images,
              _owner: true
            };
            var list = loadOwnerProducts();
            list.push(item);
            try { saveOwnerProducts(list); }
            catch (e) {
              btn.disabled = false; btn.textContent = "Add to gallery";
              err.textContent = "This browser's storage is full. Try fewer or smaller photos.";
              return;
            }
            flash("Added “" + name + "” to the gallery. 💎");
            location.reload();
          }).catch(function () {
            btn.disabled = false; btn.textContent = "Add to gallery";
            err.textContent = "Sorry, one of the images couldn't be processed.";
          });
        };
      }
    );
  }

  /* ---------- backup / restore (move uploads between devices) ---------- */
  function exportBackup() {
    var list = loadOwnerProducts();
    if (!list.length) { toast("Nothing to back up yet."); return; }
    var d = new Date();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var stamp = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    var blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "anuraj-gallery-backup-" + stamp + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Backup downloaded (" + list.length + " item" + (list.length === 1 ? "" : "s") + ").");
  }

  function importBackup(file, onDone) {
    var fr = new FileReader();
    fr.onload = function () {
      var parsed;
      try { parsed = JSON.parse(fr.result); }
      catch (e) { onDone(0, "That file isn't a valid backup."); return; }
      var incoming = Array.isArray(parsed) ? parsed : (parsed && parsed.products) || [];
      if (!incoming.length) { onDone(0, "No items found in that file."); return; }
      var current = loadOwnerProducts();
      var have = {}; current.forEach(function (p) { have[p.id] = true; });
      var cats = categoriesList();
      var added = 0;
      incoming.forEach(function (p) {
        if (!p || !p.name) return;
        var imgs = (p.images && p.images.length) ? p.images : (p.thumb ? [p.thumb] : []);
        if (!imgs.length) return;
        var id = (p.id && !have[p.id]) ? p.id
          : ("owner__" + Date.now() + "_" + Math.random().toString(36).slice(2, 7));
        if (have[id]) return; // already present — skip duplicate
        var cat = cats.filter(function (c) { return c.slug === p.category; })[0];
        current.push({
          id: id,
          name: p.name,
          category: p.category || (cat ? cat.slug : ""),
          categoryName: p.categoryName || (cat ? cat.name : (p.category || "")),
          description: p.description || "",
          price: p.price || "",
          thumb: p.thumb || imgs[0],
          images: imgs,
          _owner: true
        });
        have[id] = true; added++;
      });
      if (!added) { onDone(0, "Nothing new to import (already in this gallery)."); return; }
      try { saveOwnerProducts(current); }
      catch (e) { onDone(0, "This browser's storage is full — couldn't import all photos."); return; }
      onDone(added, null);
    };
    fr.onerror = function () { onDone(0, "Couldn't read that file."); };
    fr.readAsText(file);
  }

  function showBackup() {
    var count = loadOwnerProducts().length;
    openModal(
      '<h3>Backup &amp; restore</h3>' +
      '<p class="sub">Move your uploaded photos between devices or browsers.</p>' +
      '<div class="anuraj-field"><label>Save a backup</label>' +
      '<button class="ab-btn ab-gold" id="bk-export" style="width:100%">⬇ Export ' +
      count + ' item' + (count === 1 ? "" : "s") + ' to a file</button></div>' +
      '<div class="anuraj-field"><label>Restore from a backup</label>' +
      '<input id="bk-file" type="file" accept=".json,application/json"></div>' +
      '<div class="anuraj-err" id="bk-err"></div>' +
      '<div class="anuraj-row"><button class="ab-btn ab-gold" id="bk-import">⬆ Import file</button>' +
      '<button class="ab-btn ab-ghost" id="bk-cancel">Close</button></div>' +
      '<p class="anuraj-note">Export saves a single file with your photos and titles. On another device, open Owner mode here and Import that file. Items already present are skipped, so importing twice is safe.</p>',
      function (card) {
        card.querySelector("#bk-cancel").onclick = closeModal;
        card.querySelector("#bk-export").onclick = exportBackup;
        card.querySelector("#bk-import").onclick = function () {
          var f = card.querySelector("#bk-file").files[0];
          var err = card.querySelector("#bk-err");
          if (!f) { err.textContent = "Please choose a backup file first."; return; }
          var btn = card.querySelector("#bk-import");
          btn.disabled = true; btn.textContent = "Importing…";
          importBackup(f, function (added, msg) {
            if (msg) { btn.disabled = false; btn.textContent = "⬆ Import file"; err.textContent = msg; return; }
            flash("Imported " + added + " item" + (added === 1 ? "" : "s") + ". 💎");
            location.reload();
          });
        };
      }
    );
  }

  function removeOwnerProduct(id) {
    var list = loadOwnerProducts().filter(function (p) { return p.id !== id; });
    saveOwnerProducts(list);
    flash("Item removed.");
    location.reload();
  }

  /* ---------- decorate gallery cards with owner controls ---------- */
  var GRID_IDS = ["product-grid", "category-products"];

  function decorateGrid(grid) {
    if (!grid) return;
    var ids = ownerIdSet();
    // add a "＋ Add" card once
    if (!grid.querySelector(".owner-add-card")) {
      var add = document.createElement("div");
      add.className = "owner-add-card";
      add.innerHTML = "<div><span>＋</span>Add a new photo</div>";
      add.addEventListener("click", showUpload);
      grid.insertBefore(add, grid.firstChild);
    }
    // mark + add delete buttons to owner cards
    grid.querySelectorAll("a.product-card").forEach(function (card) {
      var id = card.getAttribute("data-id");
      if (!ids[id] || card.querySelector(".owner-del")) return;
      var media = card.querySelector(".product-media") || card;
      media.style.position = "relative";
      var del = document.createElement("button");
      del.className = "owner-del";
      del.type = "button";
      del.setAttribute("data-del", id);
      del.textContent = "✕ Remove";
      media.appendChild(del);
      var tag = document.createElement("span");
      tag.className = "owner-tag";
      tag.textContent = "Your upload";
      media.appendChild(tag);
    });
  }
  function decorateAll() { GRID_IDS.forEach(function (gid) { decorateGrid(document.getElementById(gid)); }); }
  function undecorateAll() {
    document.querySelectorAll(".owner-del,.owner-tag,.owner-add-card").forEach(function (el) { el.remove(); });
  }

  // re-apply controls when a grid re-renders (e.g. filter chips)
  var observers = [];
  function watchGrids() {
    if (observers.length || !("MutationObserver" in window)) return;
    GRID_IDS.forEach(function (gid) {
      var grid = document.getElementById(gid);
      if (!grid) return;
      var mo = new MutationObserver(function () {
        if (isLoggedIn()) { decorateGrid(grid); }
      });
      mo.observe(grid, { childList: true });
      observers.push(mo);
    });
  }

  // intercept Remove clicks before the product modal opens (capture phase)
  document.addEventListener("click", function (e) {
    var del = e.target.closest && e.target.closest(".owner-del");
    if (del) {
      e.preventDefault(); e.stopPropagation();
      var id = del.getAttribute("data-del");
      if (confirm("Remove this item from your gallery on this device?")) removeOwnerProduct(id);
    }
  }, true);

  /* ---------- secret triggers to open the login ---------- */
  function initTriggers() {
    // 1) keyboard: Ctrl+Shift+E
    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault(); openAuth();
      }
    });
    // 2) URL hash #edit or #admin
    function checkHash() {
      var h = (location.hash || "").toLowerCase();
      if (h === "#edit" || h === "#admin") openAuth();
    }
    checkHash();
    window.addEventListener("hashchange", checkHash);
    // 3) tap the footer logo 5 times quickly (handy on phones)
    var taps = 0, timer = null;
    document.addEventListener("click", function (e) {
      var mark = e.target.closest && e.target.closest(".site-footer .brand-mark");
      if (!mark) return;
      taps++;
      clearTimeout(timer);
      timer = setTimeout(function () { taps = 0; }, 1200);
      if (taps >= 5) { taps = 0; openAuth(); }
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    injectStyles();
    initTriggers();
    showFlash();
    if (isLoggedIn()) enterEditMode();
  });
})();
