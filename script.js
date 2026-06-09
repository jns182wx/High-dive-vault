/* ============================================================
   script.js — High Dive Vault Guide
   202 bottles, 11 categories. Hash-based SPA.
   ============================================================ */

// ── Helpers ───────────────────────────────────────────────────
const esc = s => String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function catColor(slug) {
  const m = {
    'vermouth-fortified':   'var(--vermouth)',
    'liqueurs-cordials':    'var(--liqueurs)',
    'amaro-aperitivo':      'var(--amaro)',
    'brandy-cognac':        'var(--brandy)',
    'vodka':                'var(--vodka)',
    'gin':                  'var(--gin)',
    'aquavit':              'var(--aquavit)',
    'tequila-mezcal':       'var(--tequila)',
    'whiskey-bourbon-rye':  'var(--whiskey)',
    'scotch':               'var(--scotch)',
    'rum-cane':             'var(--rum)',
  };
  return m[slug] || 'var(--gold)';
}

function priceDisplay(price, cls='') {
  if (price) return `<span class="price-badge ${cls}">${esc(price)}</span>`;
  return `<span class="price-badge no-price ${cls}">—</span>`;
}

function priceTier(price) {
  if (!price) return 'unknown';
  const n = parseFloat(price.replace(/[^0-9.]/g, ''));
  if (n < 20) return 'under20';
  if (n < 40) return 'mid';
  return 'premium';
}

function confDot(conf) {
  const cls = conf === 'high' ? 'conf-high' : conf === 'medium' ? 'conf-medium' : 'conf-low';
  return `<span class="confidence-dot ${cls}" title="Confidence: ${esc(conf)}"></span>`;
}

function flavorTagsHtml(tags, max=5) {
  return tags.slice(0, max).map(t => `<span class="flavor-tag">${esc(t)}</span>`).join('');
}

function breadcrumb(crumbs) {
  return `<nav class="breadcrumb fade-in" aria-label="Breadcrumb">${
    crumbs.map((c,i) => i === crumbs.length-1
      ? `<span class="bc-current">${esc(c.label)}</span>`
      : `<a href="${c.hash}">${esc(c.label)}</a>`
    ).join('<span class="bc-sep"> › </span>')
  }</nav>`;
}

// ── Data lookups ──────────────────────────────────────────────
const { categories, items } = VAULT_DATA;
const itemBySlug = Object.fromEntries(items.map(i => [i.slug, i]));
const catBySlug  = Object.fromEntries(categories.map(c => [c.slug, c]));

// ── Navigate ──────────────────────────────────────────────────
function navigate(hash) { window.location.hash = hash; }

// ── Router ────────────────────────────────────────────────────
function router() {
  const hash = window.location.hash || '#landing';
  const app = document.getElementById('app');
  if (!app) return;
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (hash === '#landing' || hash === '' || hash === '#') {
    renderLanding(app);
  } else if (hash.startsWith('#cat/')) {
    renderCategory(app, hash.slice('#cat/'.length));
  } else if (hash.startsWith('#bottle/')) {
    renderBottle(app, hash.slice('#bottle/'.length));
  } else {
    renderLanding(app);
  }

  // Keep the pill nav in sync
  updatePillNav();
}

// ── Category pill nav (shared across views) ───────────────────
function buildPillNav() {
  const nav = document.getElementById('cat-pill-nav');
  if (!nav) return;
  const hash = window.location.hash || '#landing';
  nav.innerHTML = `<div class="cat-pill-nav-inner">
    <button class="cat-pill${hash === '#landing' ? ' active' : ''}" onclick="navigate('#landing')">
      All
    </button>
    ${categories.map(c => `
      <button class="cat-pill${hash.startsWith('#cat/'+c.slug) ? ' active' : ''}"
              onclick="navigate('#cat/${c.slug}')">
        <span class="cat-pill-emoji">${c.emoji}</span>
        ${esc(c.name.replace(' & ', ' & '))}
      </button>
    `).join('')}
  </div>`;
}

function updatePillNav() {
  // Just rebuild — fast enough
  buildPillNav();
}

// ── LANDING ───────────────────────────────────────────────────
function renderLanding(app) {
  const totalPriced = items.filter(i => i.price).length;

  const catCards = categories.map(c => `
    <a class="cat-card fade-in" href="#cat/${c.slug}"
       style="--card-color: ${catColor(c.slug)}">
      <div class="cat-card-header">
        <span class="cat-emoji">${c.emoji}</span>
        <span class="cat-count-badge">${c.count} bottles</span>
      </div>
      <div class="cat-name">${esc(c.name)}</div>
      <div class="cat-short">${esc(c.short)}</div>
      <span class="cat-link">Browse →</span>
    </a>
  `).join('');

  const catOptions = categories.map(c =>
    `<option value="${c.slug}">${esc(c.name)}</option>`
  ).join('');

  const bottleRows = items.map(item => `
    <div class="bottle-row"
         style="--row-color: ${catColor(item.category_slug)}"
         data-slug="${item.slug}"
         data-cat="${item.category_slug}"
         data-name="${esc(item.name.toLowerCase())}"
         data-sub="${esc((item.substyle||'').toLowerCase())}"
         data-tags="${esc((item.flavor_tags||[]).join(' ').toLowerCase())}"
         data-price-tier="${priceTier(item.price)}"
         role="button" tabindex="0"
         onclick="navigate('#bottle/${item.slug}')"
         onkeydown="if(event.key==='Enter') navigate('#bottle/${item.slug}')">
      <div class="bottle-row-body">
        <div class="style-badge"
             style="--badge-bg: ${catColor(item.category_slug)}18; --badge-fg: ${catColor(item.category_slug)}">
          ${esc(item.category)}
        </div>
        <div class="bottle-row-name">${confDot(item.confidence)}${esc(item.name)}</div>
        <div class="bottle-row-sub">${esc(item.substyle||'')}</div>
      </div>
      <div class="bottle-row-right">
        ${priceDisplay(item.price)}
        <span class="row-arrow">›</span>
      </div>
    </div>
  `).join('');

  app.innerHTML = `
    <section class="hero grain" style="position:relative">
      <div class="hero-inner fade-in">
        <p class="hero-eyebrow">High Dive · Harrisburg, PA</p>
        <h1>The Full <em>Vault</em></h1>
        <p class="hero-diamonds">✦ ✦ ✦</p>
        <p class="hero-subtitle">
          Every bottle on every shelf. Eleven categories, two hundred and two bottles, 
          with flavor notes, use cases, and prices from the inventory sheets.
        </p>
        <div class="hero-stats">
          <div><span class="stat-num">${items.length}</span><span class="stat-lbl">Bottles</span></div>
          <div><span class="stat-num">${categories.length}</span><span class="stat-lbl">Shelves</span></div>
          <div><span class="stat-num">${totalPriced}</span><span class="stat-lbl">Priced</span></div>
        </div>
        <a href="#shelves" class="btn-primary"
           onclick="event.preventDefault(); document.getElementById('shelves').scrollIntoView({behavior:'smooth'})">
          Browse the Vault
        </a>
      </div>
    </section>

    <section class="page-section" id="shelves">
      <div class="section-header">
        <h2 class="section-title">Eleven Shelves</h2>
        <span class="section-count">Tap any to explore</span>
      </div>
      <div class="cat-grid">${catCards}</div>
    </section>

    <section class="page-section" id="all-bottles">
      <div class="section-header">
        <h2 class="section-title">All ${items.length} Bottles</h2>
      </div>
      <div class="search-bar">
        <div class="search-input-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="search" id="bottle-search" placeholder="Search name, flavor, style…"
                 autocomplete="off" aria-label="Search bottles" />
        </div>
        <select class="filter-select" id="cat-filter">
          <option value="">All Shelves</option>
          ${catOptions}
        </select>
        <select class="filter-select" id="price-filter">
          <option value="">Any Price</option>
          <option value="under20">Under $20</option>
          <option value="mid">$20–$40</option>
          <option value="premium">$40+</option>
        </select>
        <button class="btn-clear" onclick="clearSearch()">Clear</button>
        <div id="search-count"></div>
      </div>
      <div id="bottle-list">${bottleRows}</div>
    </section>
  `;

  setupSearch();
}

// ── CATEGORY PAGE ─────────────────────────────────────────────
function renderCategory(app, slug) {
  const cat = catBySlug[slug];
  if (!cat) { navigate('#landing'); return; }

  const catItems = cat.item_slugs.map(s => itemBySlug[s]).filter(Boolean);
  const idx  = categories.indexOf(cat);
  const prev = idx > 0 ? categories[idx-1] : null;
  const next = idx < categories.length-1 ? categories[idx+1] : null;

  const descParas = (cat.description||'').split('\n\n')
    .map(p => `<p>${p.trim()}</p>`).join('');

  const cards = catItems.map(item => `
    <a class="bottle-card fade-in" href="#bottle/${item.slug}"
       style="--card-color: ${catColor(slug)}">
      <div class="bottle-card-header">
        <div class="bottle-card-name">${confDot(item.confidence)}${esc(item.name)}</div>
        <div class="bottle-card-price${item.price ? '' : ' no-price'}">
          ${item.price ? esc(item.price) : '—'}
        </div>
      </div>
      <div class="style-badge"
           style="--badge-bg: ${catColor(slug)}15; --badge-fg: ${catColor(slug)}">
        ${esc(item.substyle||'')}
      </div>
      <div class="bottle-card-desc">${esc(item.two_sentence||item.short||'')}</div>
      <div class="bottle-card-footer">
        <div class="flavor-tags">${flavorTagsHtml(item.flavor_tags||[], 4)}</div>
        <span class="bottle-card-cta">Details →</span>
      </div>
    </a>
  `).join('');

  app.innerHTML = `
    ${breadcrumb([
      { label: 'All Shelves', hash: '#landing' },
      { label: cat.name, hash: '' }
    ])}
    <div class="cat-hero grain" style="position:relative">
      <div class="cat-hero-inner fade-in">
        <div class="cat-hero-emoji">${cat.emoji}</div>
        <div>
          <div class="cat-hero-meta">${cat.count} bottles · High Dive Vault</div>
          <h1 class="cat-hero-title">${esc(cat.name)}</h1>
          <div class="cat-hero-desc">${descParas}</div>
        </div>
      </div>
    </div>
    <div class="page-section" style="padding-bottom:0.5rem">
      <div class="section-header">
        <h2 class="section-title">${cat.count} Bottles</h2>
      </div>
    </div>
    <div class="bottle-cards">${cards}</div>
    <div class="cat-nav">
      ${prev ? `<button class="cat-nav-btn" onclick="navigate('#cat/${prev.slug}')">← ${esc(prev.name)}</button>` : '<span></span>'}
      ${next ? `<button class="cat-nav-btn" onclick="navigate('#cat/${next.slug}')">${esc(next.name)} →</button>` : '<span></span>'}
    </div>
  `;
}

// ── BOTTLE DETAIL ─────────────────────────────────────────────
function renderBottle(app, slug) {
  const item = itemBySlug[slug];
  if (!item) { navigate('#landing'); return; }

  const cat = catBySlug[item.category_slug];
  const related = (cat?.item_slugs || [])
    .filter(s => s !== slug)
    .slice(0, 5)
    .map(s => itemBySlug[s])
    .filter(Boolean);

  const relatedItems = related.map(r => `
    <button class="related-item" onclick="navigate('#bottle/${r.slug}')">
      <span class="related-dot"></span>
      ${esc(r.name)}
      <span class="related-price">${r.price ? esc(r.price) : ''}</span>
    </button>
  `).join('');

  // Confidence notice (only show for medium/low)
  let confNotice = '';
  if (item.confidence === 'low') {
    confNotice = `<div class="confidence-notice"><strong>⚠ Needs bottle check.</strong> ${esc(item.note || 'The exact bottle for this shelf row needs verification.')}</div>`;
  } else if (item.confidence === 'medium') {
    confNotice = `<div class="confidence-notice"><strong>Likely match.</strong> ${esc(item.note || 'Bottle identity is a confident guess from the sheet row.')}</div>`;
  }

  app.innerHTML = `
    ${breadcrumb([
      { label: 'All Shelves', hash: '#landing' },
      { label: cat?.name || item.category, hash: `#cat/${item.category_slug}` },
      { label: item.name, hash: '' }
    ])}
    <div class="bottle-hero grain" style="position:relative">
      <div class="bottle-hero-inner fade-in">
        <button class="bottle-hero-back" onclick="navigate('#cat/${item.category_slug}')">
          ← ${cat?.emoji || ''} ${esc(cat?.name || item.category)}
        </button>
        <h1 class="bottle-hero-name">${esc(item.name)}</h1>
        <div class="bottle-hero-meta">
          <span class="hero-substyle">${esc(item.substyle||'')}</span>
          ${item.price ? `
            <div>
              <div class="hero-price-label">Bottle cost</div>
              <div class="hero-price">${esc(item.price)}</div>
            </div>` : ''}
        </div>
      </div>
    </div>

    <div class="bottle-layout">
      <main>
        <div class="detail-section fade-in">
          <h2 class="detail-section-title">About This Bottle</h2>
          <p class="detail-body">${esc(item.description||item.short||'')}</p>
        </div>
        <div class="detail-section fade-in">
          <h2 class="detail-section-title">Flavor Profile</h2>
          <div class="flavor-tags" style="gap:0.45rem">
            ${flavorTagsHtml(item.flavor_tags||[], 10)}
          </div>
        </div>
        <div class="detail-section fade-in">
          <h2 class="detail-section-title">Best For</h2>
          <div class="best-for-tags">
            ${(item.best_for||[]).map(b => `<span class="best-for-tag">${esc(b)}</span>`).join('')}
          </div>
        </div>
      </main>

      <aside>
        <div class="info-panel fade-in">
          <div class="info-panel-title">Quick Facts</div>
          <div class="info-row">
            <span class="info-label">Shelf</span>
            <span class="info-value">${esc(item.category)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Style</span>
            <span class="info-value">${esc(item.substyle||'—')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Bottle cost</span>
            <span class="info-value price-value">${item.price ? esc(item.price) : '—'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Best use</span>
            <span class="info-value">${esc((item.best_for||[])[0]||'—')}</span>
          </div>
          ${confNotice}
        </div>

        ${related.length ? `
        <div class="related-panel fade-in">
          <div class="info-panel-title">More on this shelf</div>
          <div class="related-list">${relatedItems}</div>
          <div style="margin-top:0.75rem">
            <button class="cat-nav-btn" style="width:100%; text-align:center; font-size:0.72rem"
                    onclick="navigate('#cat/${item.category_slug}')">
              All ${cat?.count||''} ${esc(cat?.name||'')} →
            </button>
          </div>
        </div>` : ''}
      </aside>
    </div>
  `;
}

// ── SEARCH & FILTER ───────────────────────────────────────────
function setupSearch() {
  ['bottle-search','cat-filter','price-filter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(id === 'bottle-search' ? 'input' : 'change', filterBottles);
  });
}

function filterBottles() {
  const query = (document.getElementById('bottle-search')?.value||'').trim().toLowerCase();
  const cat   = document.getElementById('cat-filter')?.value || '';
  const price = document.getElementById('price-filter')?.value || '';

  const rows = document.querySelectorAll('#bottle-list .bottle-row');
  let visible = 0;

  rows.forEach(row => {
    const matchQ = !query ||
      (row.dataset.name||'').includes(query) ||
      (row.dataset.sub||'').includes(query)  ||
      (row.dataset.tags||'').includes(query) ||
      (row.dataset.cat||'').includes(query);

    const matchC = !cat   || row.dataset.cat === cat;
    const matchP = !price || row.dataset.priceTier === price;

    const show = matchQ && matchC && matchP;
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  const count = document.getElementById('search-count');
  if (count) {
    count.textContent = (query || cat || price)
      ? `${visible} of ${rows.length} bottles shown` : '';
  }

  const list  = document.getElementById('bottle-list');
  const noMsg = document.getElementById('no-results-msg');
  if (visible === 0 && list && !noMsg) {
    const d = document.createElement('div');
    d.id = 'no-results-msg'; d.className = 'no-results';
    d.textContent = 'No bottles matched. Try a different search or clear the filters.';
    list.appendChild(d);
  } else if (visible > 0 && noMsg) noMsg.remove();
}

function clearSearch() {
  ['bottle-search','cat-filter','price-filter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  filterBottles();
}

// ── BACK-TO-TOP ───────────────────────────────────────────────
function setupBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 450);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupBackToTop();
  buildPillNav();
  window.addEventListener('hashchange', router);
  router();
});
