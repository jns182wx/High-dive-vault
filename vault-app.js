/* ===========================================================
   vault-app.js — High Dive · The Vault
   Depends on vault-data.js (VAULT_CATEGORIES, VAULT_BOTTLES)
   =========================================================== */
(function () {
  "use strict";

  // ── Shelf presentation (accent + ordering) ──────────────
  const SHELF = {
    "rum-cane":                       { accent: "#E5342B" },
    "whiskey-bourbon-rye":            { accent: "#E2A748" },
    "scotch":                         { accent: "#6FA8CE" },
    "liqueurs-cordials":              { accent: "#E8709E" },
    "agave":                          { accent: "#EE8B3C" },
    "amaro-aperitivo-bitters":        { accent: "#C9923E" },
    "vermouth-fortified":             { accent: "#B179C6" },
    "gin":                            { accent: "#57B68A" },
    "brandy-cognac-pisco-eau-de-vie": { accent: "#CB7E4C" },
    "vodka":                          { accent: "#9FD0EC" },
    "aquavit":                        { accent: "#BFC85A" },
  };
  const FEATURED = ["rum-cane", "whiskey-bourbon-rye", "scotch"];
  const REST_ORDER = ["liqueurs-cordials", "agave", "amaro-aperitivo-bitters",
    "vermouth-fortified", "gin", "brandy-cognac-pisco-eau-de-vie", "vodka", "aquavit"];

  const catBySlug = {};
  VAULT_CATEGORIES.forEach(c => { catBySlug[c.slug] = c; });
  const bySlug = {};
  VAULT_BOTTLES.forEach(b => { bySlug[b.slug] = b; });
  const accent = s => (SHELF[s] && SHELF[s].accent) || "#E2A748";

  const TOTAL = VAULT_BOTTLES.length;

  // ── helpers ──────────────────────────────────────────────
  const $ = sel => document.querySelector(sel);
  const app = () => $("#app");
  const esc = s => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const tagSlug = t => t.toLowerCase().trim();
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function scrollTop() { window.scrollTo(0, 0); }

  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>';

  function bottlesOf(slug) { return VAULT_BOTTLES.filter(b => b.shelf_slug === slug); }

  // pick favorites that have real content
  function richBottles(pool) {
    const rich = pool.filter(b => b.desc && b.tags.length && b.best.length);
    return rich.length >= 6 ? rich : pool.filter(b => b.desc || b.tags.length);
  }

  // ── card builders ───────────────────────────────────────
  function bestLine(b, n) {
    if (!b.best.length) return "";
    const items = b.best.slice(0, n || 3).join(", ");
    return `<div class="b-best"><b>Best in</b> ${esc(items)}</div>`;
  }
  function tagsHtml(tags, n) {
    const list = (n ? tags.slice(0, n) : tags);
    return list.map(t => `<button class="tag" data-tag="${esc(t)}">${esc(t)}</button>`).join("");
  }

  function bottleCard(b) {
    const a = accent(b.shelf_slug);
    const price = b.price
      ? `<div class="b-price">${esc(b.price)}</div>`
      : `<div class="b-price tbd">Ask&nbsp;bar</div>`;
    let body = "";
    if (b.short) body = `<div class="b-desc">${esc(b.short)}</div>`;
    else if (b.pos_only) body = `<div class="tbd-note">Tasting notes coming soon.</div>`;
    return `
      <div class="bottle" style="--accent:${a}">
        <div class="b-top">
          <button class="b-name" data-bottle="${b.slug}">${esc(b.name)}</button>
          ${price}
        </div>
        ${b.substyle ? `<div class="b-style">${esc(b.substyle)}</div>` : ""}
        ${body}
        ${bestLine(b)}
        ${b.tags.length ? `<div class="b-tags">${tagsHtml(b.tags, 5)}</div>` : ""}
        <button class="b-cta" data-bottle="${b.slug}">Full notes ${"\u2192"}</button>
      </div>`;
  }

  function favCard(b) {
    const a = accent(b.shelf_slug);
    return `
      <button class="fav-card" style="--accent:${a}" data-bottle="${b.slug}">
        <div class="ftop">
          <span class="fname">${esc(b.name)}</span>
          ${b.price ? `<span class="fprice">${esc(b.price)}</span>` : ""}
        </div>
        ${b.substyle ? `<span class="fstyle">${esc(b.substyle)}</span>` : ""}
        ${b.best.length ? `<span class="fbest"><b>Best in</b> ${esc(b.best.slice(0, 2).join(", "))}</span>` : (b.short ? `<span class="fbest">${esc(b.short)}</span>` : "")}
      </button>`;
  }

  // ── HOME ─────────────────────────────────────────────────
  function renderHome() {
    const favs = shuffle(richBottles(VAULT_BOTTLES)).slice(0, 10);

    const feature = FEATURED.map(slug => {
      const c = catBySlug[slug]; if (!c) return "";
      const a = accent(slug);
      return `
        <button class="feat-card" style="--accent:${a}" data-shelf="${slug}">
          <div class="fc-name">${esc(c.name.replace(" & Cane Spirits", "").replace(", Bourbon & Rye", ""))}</div>
          <div class="fc-meta">
            <span class="fc-count">${c.count} bottles</span>
            <span class="fc-arrow">${ARROW}</span>
          </div>
        </button>`;
    }).join("");

    const rest = REST_ORDER.map(slug => {
      const c = catBySlug[slug]; if (!c) return "";
      const a = accent(slug);
      return `
        <button class="shelf-card" style="--accent:${a}" data-shelf="${slug}">
          <div class="sc-name">${esc(c.name)}</div>
          <div class="sc-count">${c.count} ${c.count === 1 ? "bottle" : "bottles"}</div>
        </button>`;
    }).join("");

    app().innerHTML = `
      <div class="view">
        <section class="hero">
          <img class="logo" src="assets/highdive-logo-full.png" alt="High Dive Cocktail Bar" />
          <div class="eyebrow">The Vault</div>
          <p class="lede">Every bottle behind the bar — what it tastes like, and what it’s best in.</p>
          <p class="sub">Tap a shelf to explore, or search the whole vault.</p>
          <div class="stats">
            <div class="st"><div class="n">${TOTAL}</div><div class="l">Bottles</div></div>
            <div class="st"><div class="n">11</div><div class="l">Shelves</div></div>
          </div>
          <button class="search-trigger" id="open-search">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            Search ${TOTAL} bottles, flavors, cocktails…
          </button>
        </section>

        <section class="section">
          <div class="sec-head">
            <span class="k">Bartender’s Picks</span><span class="line"></span>
          </div>
        </section>
        <div class="fav-strip" id="home-favs">${favs.map(favCard).join("")}</div>

        <section class="section">
          <div class="sec-head">
            <span class="k">The Big Shelves</span><span class="line"></span>
          </div>
        </section>
        <div class="feature-grid">${feature}</div>

        <section class="section">
          <div class="sec-head">
            <span class="k">More Shelves</span><span class="line"></span>
          </div>
        </section>
        <div class="shelf-grid">${rest}</div>
      </div>`;
    scrollTop();
  }

  // ── SHELF ────────────────────────────────────────────────
  let shelfState = { slug: null, sub: "all" };

  function substylesFor(list) {
    // group raw substyles into a few broad chips by keyword
    const counts = {};
    list.forEach(b => {
      const key = broadStyle(b);
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  }
  function broadStyle(b) {
    const s = (b.substyle || "").toLowerCase();
    const t = (b.tags.join(" ") + " " + s).toLowerCase();
    const slug = b.shelf_slug;
    if (slug === "rum-cane") {
      if (/agricole|cane[- ]juice|rhum|clairin/.test(t)) return "Agricole / Cane";
      if (/overproof|151|navy|high.?proof/.test(t)) return "Overproof";
      if (/aged|añejo|anejo|dark|demerara|reserva|gold|amber/.test(t)) return "Aged & Dark";
      if (/white|light|silver|blanco|platinum/.test(t)) return "White & Light";
      if (/spiced|coconut|pineapple/.test(t)) return "Spiced & Flavored";
      if (/cacha|cachaca/.test(t)) return "Cachaça";
      return "Other Rum";
    }
    if (slug === "whiskey-bourbon-rye") {
      if (/\brye\b/.test(t)) return "Rye";
      if (/bourbon/.test(t)) return "Bourbon";
      if (/irish/.test(t)) return "Irish";
      if (/tennessee/.test(t)) return "Tennessee";
      if (/blend/.test(t)) return "Blended";
      return "Other";
    }
    if (slug === "liqueurs-cordials") {
      if (/coffee|espresso|cacao|chocolate/.test(t)) return "Coffee & Cacao";
      if (/orange|curaçao|curacao|triple/.test(t)) return "Orange";
      if (/herb|chartreuse|bénédictine|benedictine|allspice|falernum/.test(t)) return "Herbal & Spice";
      if (/cream|coconut|vanilla|amaretto|nut|noyaux/.test(t)) return "Nutty & Creamy";
      if (/cherry|passion|mango|pineapple|peach|apricot|banane|banana|cassis|pomegranate|melon|berry|fruit|elderflower|floral|violet/.test(t)) return "Fruit & Floral";
      return "Other";
    }
    if (slug === "agave") {
      if (/mezcal|smok/.test(t)) return "Mezcal";
      if (/reposado|añejo|anejo|aged/.test(t)) return "Aged";
      if (/blanco|silver|plata/.test(t)) return "Blanco";
      return "Other Agave";
    }
    if (slug === "gin") {
      if (/navy|strength/.test(t)) return "Navy Strength";
      if (/london dry|london/.test(t)) return "London Dry";
      if (/floral|honey|citrus/.test(t)) return "Floral & Citrus";
      return "Other Gin";
    }
    if (slug === "vermouth-fortified") {
      if (/sherry|px|amontillado|oloroso|cream/.test(t)) return "Sherry & Fortified";
      if (/dry|blanc|bianco/.test(t)) return "Dry & Blanc";
      if (/sweet|rosso|rouge/.test(t)) return "Sweet";
      return "Other";
    }
    // generic: first 2 words of substyle, capitalized
    return "All";
  }

  function renderShelf(slug, sub) {
    const c = catBySlug[slug];
    if (!c) { location.hash = "#home"; return; }
    shelfState = { slug, sub: sub || "all" };
    const a = accent(slug);
    let list = bottlesOf(slug);
    // sort: priced + has desc first, then alpha
    list.sort((x, y) => x.name.localeCompare(y.name));

    const styles = list.length > 8 ? substylesFor(list) : [];
    const showFavs = list.length >= 18;
    const favs = showFavs ? shuffle(richBottles(list)).slice(0, 8) : [];

    let filtered = list;
    if (shelfState.sub !== "all") filtered = list.filter(b => broadStyle(b) === shelfState.sub);

    const chips = styles.length > 1
      ? `<div class="chips">
           <button class="chip ${shelfState.sub === "all" ? "active" : ""}" style="--accent:${a}" data-sub="all">All ${list.length}</button>
           ${styles.map(s => `<button class="chip ${shelfState.sub === s ? "active" : ""}" style="--accent:${a}" data-sub="${esc(s)}">${esc(s)}</button>`).join("")}
         </div>`
      : "";

    app().innerHTML = `
      <div class="view" style="--accent:${a}">
        <div class="back-row"><button class="back-btn" data-home>${BACK} The Vault</button></div>
        <section class="shelf-hero">
          <div class="sh-eyebrow">Shelf · ${list.length} bottles</div>
          <h1>${esc(c.name)}</h1>
          <p class="sh-desc">${esc(c.description)}</p>
        </section>

        ${showFavs ? `
          <section class="section">
            <div class="sec-head"><span class="k" style="color:${a}">Bartender’s Picks</span><span class="line"></span></div>
          </section>
          <div class="fav-strip">${favs.map(favCard).join("")}</div>` : ""}

        ${chips}

        <div class="bottle-list" id="shelf-list">
          ${filtered.length ? filtered.map(bottleCard).join("") : `<div class="empty">No bottles in this style.</div>`}
        </div>
      </div>`;
    scrollTop();
  }

  // ── DETAIL SHEET ─────────────────────────────────────────
  function relatedFor(b) {
    const same = bottlesOf(b.shelf_slug).filter(x => x.slug !== b.slug);
    const tagset = new Set(b.tags.map(tagSlug));
    const scored = same.map(x => ({ x, s: x.tags.reduce((n, t) => n + (tagset.has(tagSlug(t)) ? 1 : 0), 0) }));
    scored.sort((p, q) => q.s - p.s);
    let picks = scored.filter(p => p.s > 0).slice(0, 4).map(p => p.x);
    if (picks.length < 3) picks = picks.concat(shuffle(same).slice(0, 3 - picks.length));
    return picks.slice(0, 4);
  }

  function openBottle(slug, push) {
    const b = bySlug[slug]; if (!b) return;
    const a = accent(b.shelf_slug);
    const c = catBySlug[b.shelf_slug];
    const rel = relatedFor(b);

    let descBlock;
    if (b.desc) descBlock = `<p class="sheet-desc">${esc(b.desc)}</p>`;
    else descBlock = `<p class="tbd-note">This bottle is on the shelf — full tasting notes are being written. Ask your bartender what it’s pouring into tonight.</p>`;

    $("#sheet").innerHTML = `
      <div class="sheet-grab"><span></span></div>
      <button class="sheet-close" id="sheet-close"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <div class="sheet-body" style="--accent:${a}">
        <div class="sheet-accent"></div>
        <button class="sheet-style" data-shelf="${b.shelf_slug}" style="background:none;padding:0">${esc(c ? c.name : b.shelf)}</button>
        <h2 class="sheet-name">${esc(b.name)}</h2>
        ${b.label ? `<div class="sheet-label">Bar sheet: “${esc(b.label)}”</div>` : ""}
        <div class="sheet-pricerow">
          ${b.price ? `<span class="sheet-price">${esc(b.price)}</span><span class="sheet-price-l">per&nbsp;pour</span>`
                    : `<span class="tbd-note" style="margin:0">Pricing — ask your bartender</span>`}
          ${b.substyle ? `<span style="margin-left:auto;text-align:right" class="b-style">${esc(b.substyle)}</span>` : ""}
        </div>

        <div class="sheet-h">About this bottle</div>
        ${descBlock}

        ${b.tags.length ? `<div class="sheet-h">Flavor</div><div class="sheet-tags">${tagsHtml(b.tags)}</div>` : ""}

        ${b.best.length ? `<div class="sheet-h">Goes best in</div><div class="best-list">${b.best.map(x => `<span class="best-pill">${esc(x)}</span>`).join("")}</div>` : ""}

        ${rel.length ? `<div class="sheet-h">More on this shelf</div>
          <div class="related">${rel.map(x => `
            <button class="rel-item" style="--accent:${accent(x.shelf_slug)}" data-bottle="${x.slug}">
              <span class="rel-dot"></span>
              <span class="rel-name">${esc(x.name)}</span>
              ${x.substyle ? `<span class="rel-style">${esc(x.substyle.split("/")[0].trim())}</span>` : ""}
              ${x.price ? `<span class="rel-price">${esc(x.price)}</span>` : ""}
            </button>`).join("")}</div>` : ""}
      </div>`;

    $("#scrim").classList.add("open");
    $("#sheet").classList.add("open");
    $("#sheet").scrollTop = 0;
    document.body.style.overflow = "hidden";
    setTimeout(() => { const c = document.getElementById("sheet-close"); if (c) c.focus(); }, 60);
    if (push !== false) history.pushState({ sheet: slug }, "");
  }

  function closeSheet(fromPop) {
    $("#scrim").classList.remove("open");
    $("#sheet").classList.remove("open");
    document.body.style.overflow = "";
    if (!fromPop && history.state && history.state.sheet) history.back();
  }

  // ── SEARCH ───────────────────────────────────────────────
  function openSearch(preset) {
    const v = $("#search-view");
    v.classList.add("open");
    document.body.style.overflow = "hidden";
    const input = $("#search-input");
    input.value = preset || "";
    runSearch(input.value);
    if (!preset) setTimeout(() => input.focus(), 80);
  }
  function closeSearch() {
    $("#search-view").classList.remove("open");
    if (!$("#sheet").classList.contains("open")) document.body.style.overflow = "";
  }
  function runSearch(q) {
    q = (q || "").trim().toLowerCase();
    const out = $("#search-results");
    if (!q) {
      const rnd = shuffle(richBottles(VAULT_BOTTLES)).slice(0, 12);
      $("#search-meta").textContent = "Try a flavor, a spirit, or a cocktail";
      out.innerHTML = `<button class="surprise" id="surprise">🎲 Surprise me — pick a bottle</button>` +
        `<div class="bottle-list">${rnd.map(bottleCard).join("")}</div>`;
      return;
    }
    const terms = q.split(/\s+/);
    const scored = VAULT_BOTTLES.map(b => {
      const hay = (b.name + " " + b.substyle + " " + b.shelf + " " + b.tags.join(" ") + " " + b.best.join(" ")).toLowerCase();
      let s = 0;
      terms.forEach(t => {
        if (!t) return;
        if (b.name.toLowerCase().includes(t)) s += 5;
        if (b.tags.some(x => x.toLowerCase().includes(t))) s += 3;
        if (b.best.some(x => x.toLowerCase().includes(t))) s += 2;
        if (hay.includes(t)) s += 1;
      });
      return { b, s };
    }).filter(r => r.s > 0).sort((a, b) => b.s - a.s);

    $("#search-meta").textContent = scored.length + (scored.length === 1 ? " bottle" : " bottles");
    out.innerHTML = scored.length
      ? `<div class="bottle-list">${scored.map(r => bottleCard(r.b)).join("")}</div>`
      : `<div class="empty">Nothing matches “${esc(q)}”.</div>`;
  }

  // ── ROUTER ───────────────────────────────────────────────
  function route() {
    const h = location.hash.replace(/^#/, "");
    if (h.startsWith("shelf/")) renderShelf(h.slice(6));
    else renderHome();
  }

  // ── EVENTS (delegated) ───────────────────────────────────
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-bottle],[data-shelf],[data-home],[data-sub],[data-tag],#open-search,#sheet-close,#surprise,.brand");
    if (!t) return;

    if (t.id === "open-search") { openSearch(); return; }
    if (t.classList.contains("brand")) { closeSheet(); location.hash = "#home"; return; }
    if (t.id === "sheet-close") { closeSheet(); return; }
    if (t.id === "surprise") { const b = VAULT_BOTTLES[Math.floor(Math.random() * TOTAL)]; openBottle(b.slug); return; }

    if (t.hasAttribute("data-bottle")) { openBottle(t.getAttribute("data-bottle")); return; }
    if (t.hasAttribute("data-tag")) {
      const tag = t.getAttribute("data-tag");
      if ($("#sheet").classList.contains("open")) closeSheet();
      openSearch(tag); return;
    }
    if (t.hasAttribute("data-home")) { location.hash = "#home"; return; }
    if (t.hasAttribute("data-shelf")) {
      if ($("#sheet").classList.contains("open")) closeSheet();
      location.hash = "#shelf/" + t.getAttribute("data-shelf"); return;
    }
    if (t.hasAttribute("data-sub")) {
      renderShelf(shelfState.slug, t.getAttribute("data-sub"));
      return;
    }
  });

  $("#scrim") && $("#scrim").addEventListener("click", () => closeSheet());
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if ($("#search-view").classList.contains("open")) { closeSearch(); return; }
    if ($("#sheet").classList.contains("open")) { closeSheet(); return; }
  });
  window.addEventListener("popstate", () => {
    if ($("#sheet").classList.contains("open")) closeSheet(true);
  });

  // search wiring
  $("#search-input").addEventListener("input", e => runSearch(e.target.value));
  $("#search-cancel").addEventListener("click", closeSearch);
  $("#topbar-search").addEventListener("click", () => openSearch());

  window.addEventListener("hashchange", route);
  route();
})();
