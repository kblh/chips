# Tips & Chips Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static single-page informational website for the internal "Tips & Chips" event, with an animated logo, light/dark theme, and eight content sections.

**Architecture:** Buildless static site — three files (`index.html`, `styles.css`, `theme.js`) opened directly in a browser. Theme is driven by a `data-theme` attribute on `<html>`, set by a small head script from `localStorage` (falling back to the OS `prefers-color-scheme`). All visuals and animations are CSS; the logo is inline SVG whose colors bind to CSS custom properties so a single markup serves both themes.

**Tech Stack:** HTML5, CSS3 (custom properties, Grid/Flexbox, `@keyframes`), vanilla JS (~25 lines), Google Fonts (Alfa Slab One). No build tooling, no framework, no backend.

**Testing approach:** This is a buildless static site with no test runner. Each task ends with concrete **browser verification** — what to open, what to look at, and what to check in the DevTools Console. On macOS open the file with `open index.html`. "No console errors" means the browser DevTools Console (Cmd+Opt+J in Chrome) shows nothing red.

**Source material:** The logo SVG geometry is adapted from `doc/zadani/tricks_and_chips_light_dark.html`. The content comes from `doc/zadani/base.md`. The full design rationale is in `docs/superpowers/specs/2026-06-03-tips-and-chips-web-design.md`.

---

## File Structure

- **Create:** `index.html` — single page: `<head>` (meta, fonts, blocking theme init), `<header>` (hero with inline SVG logo + theme toggle), `<main>` (7 content sections), `<footer>`.
- **Create:** `styles.css` — design tokens (`:root` light + `[data-theme="dark"]`), base typography, layout container, section rhythm, theme toggle, logo animation keyframes, themed-grid/box components, responsive rules, reduced-motion overrides.
- **Create:** `theme.js` — blocking head snippet sets initial `data-theme`; deferred portion wires the toggle button and persists the choice.

Each file has one responsibility: structure (`index.html`), presentation (`styles.css`), behavior (`theme.js`).

---

## Task 1: Scaffold the three files and link them

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `theme.js`

- [ ] **Step 1: Create `index.html` with a minimal linked skeleton**

```html
<!DOCTYPE html>
<html lang="cs" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tips &amp; Chips — TIPS · TRICKS · HACKS · NEWS</title>
  <meta name="description" content="Tips & Chips — interní firemní event plný tipů, triků, hacků a novinek.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <!-- theme init runs before paint to avoid a flash of the wrong theme -->
  <script src="theme.js"></script>
</head>
<body>
  <header class="hero" id="hero"></header>
  <main></main>
  <footer class="site-footer"></footer>
</body>
</html>
```

- [ ] **Step 2: Create `styles.css` with a sentinel rule**

```css
/* Tips & Chips — styles. Sections filled in later tasks. */
* { box-sizing: border-box; }
body { margin: 0; }
```

- [ ] **Step 3: Create `theme.js` with a no-op guard**

```js
// Tips & Chips theme controller. Logic added in Task 3.
(function () {
  "use strict";
})();
```

- [ ] **Step 4: Verify in browser**

Run: `open index.html` (macOS)
Expected: A blank white page loads, the tab title reads "Tips & Chips — TIPS · TRICKS · HACKS · NEWS", and the DevTools Console shows no errors (no 404 for `styles.css` or `theme.js`).

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css theme.js
git commit -m "feat: scaffold static site files"
```

---

## Task 2: Design tokens and base layout

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Replace `styles.css` contents with tokens and base styles**

```css
/* ===== Tips & Chips — styles ===== */

/* --- Design tokens: light (default) --- */
:root {
  --bg: #FAEEDA;
  --bg-alt: #F3E2C4;
  --text: #412402;
  --muted: #854F0B;
  --accent: #EF9F27;
  --accent-2: #BA7517;
  --border: #E0C896;
  --card-bg: #FFFFFF;

  /* logo color hooks */
  --logo-tri-fill: #EF9F27;
  --logo-tri-shadow: #BA7517;
  --logo-stroke: #FAC775;
  --logo-node: #633806;
  --logo-node-core: #FAC775;
  --logo-text-1: #412402; /* TRICKS */
  --logo-text-2: #BA7517; /* & */
  --logo-text-3: #EF9F27; /* CHIPS */
  --logo-claim: #854F0B;
  --logo-spark: #EF9F27;

  --maxw: 720px;
  --font-display: "Alfa Slab One", Georgia, serif;
  --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* --- Design tokens: dark --- */
:root[data-theme="dark"] {
  --bg: #111111;
  --bg-alt: #1A1A1A;
  --text: #FAEEDA;
  --muted: #BA7517;
  --accent: #FAC775;
  --accent-2: #EF9F27;
  --border: #3A2A12;
  --card-bg: #1E1A14;

  --logo-tri-fill: #BA7517;
  --logo-tri-shadow: #412402;
  --logo-stroke: #EF9F27;
  --logo-node: #1A0A00;
  --logo-node-core: #FAC775;
  --logo-text-1: #FAC775;
  --logo-text-2: #EF9F27;
  --logo-text-3: #EF9F27;
  --logo-claim: #BA7517;
  --logo-spark: #BA7517;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  transition: background-color .3s ease, color .3s ease;
}

h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: .5px;
}

/* Section rhythm: alternating tint, centered content column */
.section {
  padding: 64px 20px;
}
.section:nth-of-type(even) {
  background: var(--bg-alt);
}
.section__inner {
  max-width: var(--maxw);
  margin: 0 auto;
}
.section h2 {
  font-size: clamp(28px, 5vw, 40px);
  color: var(--accent-2);
  margin: 0 0 20px;
}
.section p { margin: 0 0 16px; }
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 12px;
  color: var(--muted);
  margin: 0 0 8px;
}
a { color: var(--accent-2); }
```

- [ ] **Step 2: Verify in browser**

Run: reload `index.html`
Expected: Page background turns cream (`#FAEEDA`). Still no visible content (sections empty). No console errors.

- [ ] **Step 3: Temporarily verify dark tokens**

In DevTools Console run: `document.documentElement.setAttribute('data-theme','dark')`
Expected: Background turns near-black (`#111`). Then run `document.documentElement.setAttribute('data-theme','light')` to restore.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "feat: add design tokens and base layout styles"
```

---

## Task 3: Theme controller (system default + persisted toggle)

**Files:**
- Modify: `theme.js`
- Modify: `index.html` (add toggle button into hero header)
- Modify: `styles.css` (toggle button styles)

- [ ] **Step 1: Replace `theme.js` with the controller**

```js
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
})();
```

- [ ] **Step 2: Add the toggle button to the hero in `index.html`**

Replace the `<header class="hero" id="hero"></header>` line with:

```html
  <header class="hero" id="hero">
    <button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false" aria-label="Přepnout na tmavý režim">☾</button>
  </header>
```

- [ ] **Step 3: Add toggle styles to `styles.css`**

Append:

```css
/* Theme toggle */
.hero { position: relative; }
.theme-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--text);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color .2s ease, transform .15s ease;
}
.theme-toggle:hover { transform: scale(1.08); }
.theme-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

- [ ] **Step 4: Verify toggle behavior in browser**

Run: reload `index.html`
Expected:
- A round button shows in the top-right with a moon (☾) in light mode.
- Click it → background flips to dark, icon becomes sun (☀︎).
- Reload the page → it stays dark (persisted in `localStorage`).
- In Console run `localStorage.removeItem('tc-theme')` and reload → theme now follows your OS setting.
- No console errors.

- [ ] **Step 5: Commit**

```bash
git add theme.js index.html styles.css
git commit -m "feat: theme controller with system default and persisted toggle"
```

---

## Task 4: Hero — inline SVG logo bound to theme tokens

**Files:**
- Modify: `index.html` (insert logo SVG + claim into hero)
- Modify: `styles.css` (hero layout)

- [ ] **Step 1: Insert the logo and claim inside `<header class="hero">`, after the toggle button**

```html
    <div class="hero__inner">
      <svg class="logo" viewBox="0 0 680 520" role="img" aria-label="Tricks &amp; Chips logo">
        <!-- Positioning lives on the outer .logo__pos group. The animated
             .logo__mark must NOT carry a transform attribute, because the
             CSS transform in the mark-bob keyframe (Task 5) would override
             that attribute and snap the group to the SVG origin. -->
        <g class="logo__pos" transform="translate(340, 150)">
          <g class="logo__mark">
          <g class="logo__chip">
            <polygon points="0,-118 102,59 -102,59" fill="var(--logo-tri-shadow)" opacity="0.18" transform="translate(5,8)"/>
            <polygon points="0,-118 102,59 -102,59" fill="var(--logo-tri-fill)"/>
            <polygon points="0,-118 30,-40 -30,-40" fill="var(--logo-tri-shadow)" opacity="0.22"/>
            <polygon points="0,-118 102,59 -102,59" fill="none" stroke="var(--logo-stroke)" stroke-width="2.5" stroke-linejoin="round"/>
          </g>
          <g class="logo__net">
            <circle cx="0" cy="-10" r="7" fill="var(--logo-node)" opacity="0.85"/>
            <circle cx="0" cy="-10" r="3.5" fill="var(--logo-node-core)"/>
            <polyline points="0,-10 -38,28" fill="none" stroke="var(--logo-node)" stroke-width="1.8" stroke-linecap="round" opacity="0.75"/>
            <circle cx="-38" cy="28" r="4.5" fill="var(--logo-node)" opacity="0.75"/>
            <polyline points="0,-10 38,28" fill="none" stroke="var(--logo-node)" stroke-width="1.8" stroke-linecap="round" opacity="0.75"/>
            <circle cx="38" cy="28" r="4.5" fill="var(--logo-node)" opacity="0.75"/>
            <polyline points="0,-10 0,-62" fill="none" stroke="var(--logo-node)" stroke-width="1.8" stroke-linecap="round" opacity="0.75"/>
            <circle cx="0" cy="-62" r="4" fill="var(--logo-node)" opacity="0.6"/>
          </g>
          <polygon class="logo__spark" points="118,44 124,30 132,46" fill="var(--logo-spark)" opacity="0.7"/>
          <polygon class="logo__spark" points="-120,38 -128,26 -114,50" fill="var(--logo-spark)" opacity="0.6"/>
          <polygon class="logo__spark" points="-8,76 -2,64 6,78" fill="var(--logo-spark)" opacity="0.55"/>
          <polygon class="logo__spark" points="54,-90 60,-102 68,-88" fill="var(--logo-spark)" opacity="0.45"/>
          </g>
        </g>
        <foreignObject class="logo__text" x="40" y="300" width="600" height="200" aria-hidden="true">
          <div xmlns="http://www.w3.org/1999/xhtml" class="logo__wordmark">
            <span class="logo__tricks">TRICKS</span>
            <span class="logo__amp">&amp;</span>
            <span class="logo__chips">CHIPS</span>
            <span class="logo__claim">TIPS * TRICKS * HACKS * NEWS</span>
          </div>
        </foreignObject>
      </svg>
    </div>
```

- [ ] **Step 2: Add hero + wordmark styles to `styles.css`**

Append:

```css
/* Hero */
.hero {
  background: var(--bg);
  padding: 40px 20px 56px;
  text-align: center;
}
.hero__inner { max-width: 520px; margin: 0 auto; }
.logo { width: 100%; height: auto; display: block; }
.logo__wordmark {
  text-align: center;
  font-family: var(--font-display);
}
.logo__wordmark span { display: block; line-height: 1; }
.logo__tricks { font-size: 78px; color: var(--logo-text-1); letter-spacing: 1px; }
.logo__amp    { font-size: 30px; color: var(--logo-text-2); line-height: 1.2; }
.logo__chips  { font-size: 78px; color: var(--logo-text-3); letter-spacing: 1px; }
.logo__claim  { font-size: 12px; color: var(--logo-claim); letter-spacing: 4px; margin-top: 12px; }
```

- [ ] **Step 3: Verify in browser**

Run: reload `index.html`
Expected:
- The chip-triangle logo with the network nodes and "TRICKS & CHIPS / TIPS * TRICKS * HACKS * NEWS" wordmark renders centered.
- Toggle to dark → logo recolors (gold stroke, lighter wordmark) because fills bind to CSS variables. No second SVG needed.
- No console errors.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: hero with theme-bound inline SVG logo"
```

---

## Task 5: Hero logo animation (assembly → ambient, reduced-motion safe)

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Append animation keyframes and bindings to `styles.css`**

```css
/* ===== Hero logo animation: assembly (once) -> ambient (loop) ===== */
.logo__chip { animation: chip-in .7s ease-out both; }
.logo__text { animation: text-in .6s ease-out both 1.0s; }
.logo__net  {
  animation: net-in .5s ease-out both .7s,
             net-pulse 1.8s ease-in-out infinite 1.7s;
}
.logo__spark {
  transform-origin: center;
  animation: spark-in .4s ease-out both 1.1s,
             spark-twinkle 1.6s ease-in-out infinite 1.7s;
}
.logo__mark {
  transform-origin: center;
  animation: mark-bob 3.4s ease-in-out infinite 1.7s;
}
.logo__spark:nth-of-type(2) { animation-delay: 1.1s, 2.0s; }
.logo__spark:nth-of-type(3) { animation-delay: 1.1s, 2.3s; }
.logo__spark:nth-of-type(4) { animation-delay: 1.1s, 2.6s; }

@keyframes chip-in  { from { opacity: 0; transform: scale(.4) rotate(-12deg); } to { opacity: 1; transform: none; } }
@keyframes net-in   { from { opacity: 0; } to { opacity: 1; } }
@keyframes spark-in { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: none; } }
@keyframes text-in  { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
@keyframes mark-bob     { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes net-pulse    { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }
@keyframes spark-twinkle{ 0%, 100% { opacity: .3; transform: scale(.7); } 50% { opacity: 1; transform: scale(1.15); } }

@media (prefers-reduced-motion: reduce) {
  .logo__chip, .logo__net, .logo__spark, .logo__mark, .logo__text {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

- [ ] **Step 2: Verify animation in browser**

Run: reload `index.html`
Expected:
- On load, the chip pops in, the network fades in, sparks appear, the wordmark rises — then the whole mark settles into a gentle continuous bob with pulsing nodes and twinkling sparks.
- Reload re-plays the assembly.

- [ ] **Step 3: Verify reduced-motion**

In DevTools: open the Rendering panel → set "Emulate CSS prefers-reduced-motion" to `reduce`, then reload.
Expected: Logo appears immediately in final state, no motion.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "feat: hero logo CSS animation with reduced-motion fallback"
```

---

## Task 6: Content sections — "Co je Tips & Chips", "Kdy a kde", "Pro koho"

**Files:**
- Modify: `index.html` (add three sections inside `<main>`)
- Modify: `styles.css` (info-rows styling for "Kdy a kde" and role list)

- [ ] **Step 1: Add the three sections inside `<main>`**

```html
    <section class="section" id="o-eventu" aria-labelledby="o-eventu-h">
      <div class="section__inner">
        <p class="eyebrow">Co je Tips &amp; Chips</p>
        <h2 id="o-eventu-h">Krátké sdílení, velký dopad</h2>
        <p>Tips &amp; Chips je interní event, kde si napříč rolemi předáváme tipy, triky, hacky a novinky — pracovní i soukromé. Krátké bloky, žádná teorie navíc: co tě posune, zpříjemní práci nebo prostě potěší.</p>
        <p>Heslo zní jednoduše: <strong>TIPS · TRICKS · HACKS · NEWS</strong>.</p>
      </div>
    </section>

    <section class="section" id="kdy-kde" aria-labelledby="kdy-kde-h">
      <div class="section__inner">
        <p class="eyebrow">Kdy a kde</p>
        <h2 id="kdy-kde-h">Každé druhé úterý</h2>
        <ul class="info-rows">
          <li><span class="info-rows__icon" aria-hidden="true">🗓️</span> Každé druhé úterý, 16:00–17:00</li>
          <li><span class="info-rows__icon" aria-hidden="true">📍</span> Onsite i online přes Google Meet</li>
          <li><span class="info-rows__icon" aria-hidden="true">🚫</span> Nenahrává se — buď u toho naživo</li>
        </ul>
      </div>
    </section>

    <section class="section" id="pro-koho" aria-labelledby="pro-koho-h">
      <div class="section__inner">
        <p class="eyebrow">Pro koho</p>
        <h2 id="pro-koho-h">Pro všechny T-shape</h2>
        <p>Necílíme jen na FE a BE. Tips &amp; Chips je pro všechny role — ať děláš cokoliv, něco si odneseš a něco můžeš předat.</p>
        <ul class="role-list">
          <li>Frontend</li><li>Backend</li><li>UX/UI</li><li>PM</li><li>…a další</li>
        </ul>
      </div>
    </section>
```

- [ ] **Step 2: Add styles for info rows and role list to `styles.css`**

```css
/* Info rows ("Kdy a kde") */
.info-rows { list-style: none; padding: 0; margin: 0; }
.info-rows li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  font-size: 18px;
}
.info-rows li:last-child { border-bottom: none; }
.info-rows__icon { font-size: 22px; }

/* Role list ("Pro koho") */
.role-list {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.role-list li {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 8px 16px;
  font-weight: 600;
}
```

- [ ] **Step 3: Verify in browser**

Run: reload `index.html`
Expected: Three readable sections below the hero. "Kdy a kde" shows three icon rows with separators; "Pro koho" shows pill-shaped role tags. Even-numbered sections ("Kdy a kde") have the slightly darker `--bg-alt` background. No console errors.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add intro, when/where, and audience sections"
```

---

## Task 7: "Formát & obsah" section with topic grid

**Files:**
- Modify: `index.html` (add section inside `<main>`, after "Pro koho")
- Modify: `styles.css` (grid)

- [ ] **Step 1: Add the section**

```html
    <section class="section" id="format" aria-labelledby="format-h">
      <div class="section__inner">
        <p class="eyebrow">Formát &amp; obsah</p>
        <h2 id="format-h">Zhruba 5 bloků po 10 minutách</h2>
        <p>Každý event nabídne kolem pěti desetiminutových bloků. Témata se prolínají:</p>
        <ul class="topic-grid">
          <li class="topic-grid__item"><span class="topic-grid__emoji" aria-hidden="true">🤖</span> AI tipy &amp; triky</li>
          <li class="topic-grid__item"><span class="topic-grid__emoji" aria-hidden="true">🌐</span> Novinky ve webovém vývoji</li>
          <li class="topic-grid__item"><span class="topic-grid__emoji" aria-hidden="true">🧰</span> Nové nástroje a služby</li>
          <li class="topic-grid__item"><span class="topic-grid__emoji" aria-hidden="true">🛠️</span> Triky a postupy na projektech</li>
          <li class="topic-grid__item"><span class="topic-grid__emoji" aria-hidden="true">✨</span> Life hacks (i nedigitální)</li>
          <li class="topic-grid__item"><span class="topic-grid__emoji" aria-hidden="true">💡</span> Cokoliv, co pomáhá</li>
        </ul>
      </div>
    </section>
```

- [ ] **Step 2: Add grid styles to `styles.css`**

```css
/* Topic grid ("Formát & obsah") */
.topic-grid {
  list-style: none;
  padding: 0;
  margin: 24px 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
.topic-grid__item {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform .15s ease, border-color .15s ease;
}
.topic-grid__item:hover { transform: translateY(-3px); border-color: var(--accent); }
.topic-grid__emoji { font-size: 24px; }
```

- [ ] **Step 3: Verify in browser**

Run: reload `index.html`
Expected: A responsive grid of six topic cards (multi-column on a wide window). Hovering a card lifts it slightly and tints its border. No console errors.

- [ ] **Step 4: Verify reflow**

Narrow the browser window to ~360px wide.
Expected: The grid collapses to a single column with no horizontal scrollbar.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add format & topics grid section"
```

---

## Task 8: "Řečníci & sloty", "Hodnocení & ceny", and footer

**Files:**
- Modify: `index.html` (add two sections + footer content)
- Modify: `styles.css` (prize box + footer)

- [ ] **Step 1: Add the two sections inside `<main>` (after "Formát & obsah")**

```html
    <section class="section" id="recnici" aria-labelledby="recnici-h">
      <div class="section__inner">
        <p class="eyebrow">Řečníci &amp; sloty</p>
        <h2 id="recnici-h">Jak funguje nábor</h2>
        <p>Před každým eventem se nadelegují řečníci. K dispozici je zhruba <strong>5 slotů po 10 minutách</strong>.</p>
        <p>Máš delší příspěvek? Stačí si objednat víc slotů za sebou.</p>
      </div>
    </section>

    <section class="section" id="hodnoceni" aria-labelledby="hodnoceni-h">
      <div class="section__inner">
        <p class="eyebrow">Hodnocení &amp; ceny</p>
        <h2 id="hodnoceni-h">Hlasuj o nejlepší příspěvek</h2>
        <p>Na konci každého eventu se hlasuje o nejlepší příspěvek. Vítěze čeká odměna:</p>
        <div class="prize-box">
          <span class="prize-box__item">🥂 Prosecco</span>
          <span class="prize-box__sep">nebo</span>
          <span class="prize-box__item">🍫 Čokoláda</span>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Add footer content (replace the empty `<footer class="site-footer"></footer>`)**

```html
  <footer class="site-footer">
    <p class="site-footer__claim">TIPS · TRICKS · HACKS · NEWS</p>
    <p class="site-footer__meta">Tips &amp; Chips</p>
  </footer>
```

- [ ] **Step 3: Add prize box and footer styles to `styles.css`**

```css
/* Prize box ("Hodnocení & ceny") */
.prize-box {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  background: var(--card-bg);
  border: 2px solid var(--accent);
  border-radius: 18px;
  padding: 28px 24px;
}
.prize-box__item { font-family: var(--font-display); font-size: clamp(20px, 4vw, 28px); }
.prize-box__sep { color: var(--muted); text-transform: uppercase; letter-spacing: 2px; font-size: 13px; }

/* Footer */
.site-footer {
  background: var(--bg-alt);
  text-align: center;
  padding: 40px 20px;
  border-top: 1px solid var(--border);
}
.site-footer__claim {
  font-family: var(--font-display);
  color: var(--accent-2);
  letter-spacing: 3px;
  font-size: 14px;
  margin: 0 0 6px;
}
.site-footer__meta { color: var(--muted); font-size: 13px; margin: 0; }
```

- [ ] **Step 4: Verify in browser**

Run: reload `index.html`
Expected: The speakers section, a centered highlighted prize box ("🥂 Prosecco nebo 🍫 Čokoláda") with an accent border, and a minimal footer with the claim. All eight blocks (hero + 7) now present. No console errors.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add speakers, voting/prizes sections and footer"
```

---

## Task 9: Scroll-reveal for sections (CSS + tiny IntersectionObserver)

**Files:**
- Modify: `styles.css` (reveal classes)
- Modify: `theme.js` (observer that adds `is-visible`)

- [ ] **Step 1: Add reveal styles to `styles.css`**

```css
/* Scroll reveal */
.section { opacity: 1; }
:root.js .section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity .6s ease, transform .6s ease;
}
:root.js .section.is-visible {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  :root.js .section { opacity: 1 !important; transform: none !important; transition: none !important; }
}
```

Note: the `.js` class on `<html>` gates the hidden state so sections stay visible if JS is disabled (progressive enhancement).

- [ ] **Step 2: Append the observer to `theme.js` (inside the existing IIFE, after the `wire()` wiring block)**

Add this just before the closing `})();` of the IIFE:

```js
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
```

- [ ] **Step 3: Verify in browser**

Run: reload `index.html` and scroll down slowly.
Expected: Each section fades and slides up into place as it enters the viewport. Scrolling back up does not re-hide it (revealed once). No console errors.

- [ ] **Step 4: Verify reduced-motion + no-JS**

- DevTools → emulate `prefers-reduced-motion: reduce` → reload → sections appear immediately while scrolling, no transition.
- DevTools → disable JavaScript → reload → all sections visible (no `.js` class added).

- [ ] **Step 5: Commit**

```bash
git add styles.css theme.js
git commit -m "feat: progressive scroll-reveal for sections"
```

---

## Task 10: Responsive pass

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Append mobile refinements to `styles.css`**

```css
/* Responsive */
@media (max-width: 600px) {
  .section { padding: 48px 16px; }
  .logo__tricks, .logo__chips { font-size: 56px; }
  .logo__amp { font-size: 24px; }
  .info-rows li { font-size: 16px; }
  .theme-toggle { top: 12px; right: 12px; width: 40px; height: 40px; font-size: 18px; }
}
```

- [ ] **Step 2: Verify across widths**

In DevTools device toolbar, check 320px, 375px, 768px, and a wide desktop width.
Expected: No horizontal scrollbar at any width. Logo and headings scale down on small screens. Topic grid is single-column on phones, multi-column on desktop. Toggle button stays in the corner and tappable.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: responsive refinements for small screens"
```

---

## Task 11: Accessibility and final verification

**Files:**
- Modify: `styles.css` (global focus-visible)
- Modify: `index.html` (only if checks below reveal a gap)

- [ ] **Step 1: Add a global focus style to `styles.css`**

```css
/* Visible keyboard focus everywhere */
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

- [ ] **Step 2: Keyboard pass**

Reload `index.html`, press Tab repeatedly.
Expected: The theme toggle receives a visible focus ring and activates with Enter/Space. (There are no other interactive controls.)

- [ ] **Step 3: Structure check**

In Console run:
```js
console.log(
  'header:', document.querySelectorAll('header').length,
  'main:', document.querySelectorAll('main').length,
  'sections:', document.querySelectorAll('main section').length,
  'footer:', document.querySelectorAll('footer').length,
  'h2:', document.querySelectorAll('h2').length
);
```
Expected: `header: 1 main: 1 sections: 6 footer: 1 h2: 6`. The six `<section>` elements in `<main>` are: o-eventu, kdy-kde, pro-koho, format, recnici, hodnoceni. Confirm every `<section>` has an `aria-labelledby` pointing at its `<h2>` id.

- [ ] **Step 4: Contrast + theme check**

Toggle to dark and back; confirm text is readable in both themes (body text vs background, accent headings, prize box, footer). Spot-check with DevTools "Contrast" in the color picker on the body text — aim for AA (≥ 4.5:1).

- [ ] **Step 5: Console cleanliness across themes**

Hard reload in light, toggle to dark, scroll through entire page.
Expected: Zero errors/warnings in the Console.

- [ ] **Step 6: Commit**

```bash
git add styles.css index.html
git commit -m "feat: global focus-visible style and a11y verification"
```

---

## Self-Review (completed during planning)

**Spec coverage:**
- Static buildless single page → Task 1 (no build, three files opened directly).
- `index.html` / `styles.css` / `theme.js` split → Tasks 1–11 keep responsibilities separated.
- Inline SVG logo, both themes via CSS vars → Task 4 (single SVG, var-bound fills).
- Alfa Slab One via Google Fonts → Task 1.
- Eight sections in order (hero + 7) → hero Task 4; o-eventu/kdy-kde/pro-koho Task 6; format Task 7; recnici/hodnoceni + footer Task 8.
- Topic grid; prize highlight box → Tasks 7 and 8.
- Light/dark tokens + system default + persisted manual toggle → Tasks 2 and 3.
- Hero animation assembly→ambient + reduced-motion → Task 5.
- Scroll reveal (CSS, reduced-motion aware) → Task 9.
- Mobile-first responsive, grid reflow → Tasks 2/7/10.
- Accessibility (semantic landmarks, focus, aria on toggle, SVG role/title, reduced-motion) → Tasks 3/4/5/9/11.
- "Done" criteria (opens statically, all sections, animation, toggle persists, responsive 320px+, no console errors) → verified in Tasks 1–11.

**Placeholder scan:** No TBD/TODO; every code step contains complete content.

**Type/name consistency:** Class/id names are consistent across tasks — `theme-toggle` / `#theme-toggle`, `tc-theme` storage key, `data-theme` attribute, `.logo__chip/__net/__spark/__mark/__text`, `.section.is-visible`, `.js` gate, `--logo-*` token names defined in Task 2 and used in Task 4.
