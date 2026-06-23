# Tips & Chips — Fáze 2: Funkcionality — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rozšířit statický web Tips & Chips o přihlášku talku (Google Form embed), program aktuálního eventu, archiv minulých eventů a hlasování přes QR kód (Slido) — vše jako čistě statický web generovaný Eleventy.

**Architecture:** Stávající ruční `index.html` přejde pod Eleventy (11ty). Obsah eventů žije v markdown souborech (`src/events/*.md`); jedna build-time funkce je rozdělí na „aktuální" (nejbližší nadcházející) a „archiv" (minulé). Výstupem buildu je statický `dist/`, který se ručně kopíruje na interní host. Žádný runtime backend ani DB; externě jen Google Form (sběr přihlášek) a Slido (hlasování + živé výsledky na plátně).

**Tech Stack:** Node 18+, Eleventy v3 (ESM), Nunjucks šablony, markdown s front-matterem, `qrcode` (build-time generování QR jako inline SVG). Žádný runtime JS framework — stávající `theme.js` a `styles.css` zůstávají.

## Global Constraints

- **Bez runtime backendu a bez DB.** Externí služby (Google Form, Slido) jsou jediná „serverová" závislost; web sám je statický.
- **Hosting:** interní, jen lokální síť; **žádné přihlašování/auth** se neimplementuje.
- **Správa obsahu:** výhradně přes Git, v Markdownu — žádné CMS, žádné Google Sheets jako zdroj obsahu.
- **Hlasování:** Slido (free tier). Web jen odkazuje/generuje QR na Slido; živé výsledky běží ve Slido presenter view, ne na webu.
- **Vzhled Fáze 1 zůstává beze změny** — `styles.css` design tokeny, logo, light/dark přepínač a animace loga se nemění (jen se přidává navigace a styly nových komponent).
- **Build/deploy:** `npm run build` → výstup `dist/` se ručně zkopíruje na interní host (stejný postup jako u Fáze 1).
- **Jazyk obsahu i UI:** čeština.
- **Vzorová data v `src/events/` jsou placeholdery** k nahrazení reálnými eventy; URL Google Formu a Slido obsahují `REPLACE` a doplní je uživatel.

---

### Task 1: Eleventy scaffold + sdílený layout + navigace + migrace landingu

Položí základ buildu, vytáhne hlavičku/patičku do sdílené šablony, přidá navigaci s přepínačem motivu na všech stránkách a převede stávající landing pod Eleventy beze změny vzhledu.

**Files:**
- Create: `package.json`
- Create: `eleventy.config.js`
- Create: `src/_includes/layout.njk`
- Create: `src/_includes/nav.njk`
- Create: `src/index.njk`
- Delete: `index.html` (obsah se přesune do `src/index.njk`)
- Modify: `styles.css` (přemístění `.theme-toggle`, styly navigace + sdílené styly stránek, print + responsive)
- Modify: `.gitignore`

**Interfaces:**
- Produces: build příkazy `npm run build` (→ `dist/`) a `npm run serve`; layout `layout.njk` (přijímá front-matter `title`, `description` a `content`); include `nav.njk` (čte globální `page.url` pro zvýraznění aktivní položky); passthrough kopie `/styles.css`, `/theme.js`, `/print-dark.css`.

- [ ] **Step 1: Vytvoř `package.json`**

```json
{
  "name": "tips-and-chips-web",
  "version": "2.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "eleventy",
    "serve": "eleventy --serve",
    "test": "node --test"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0"
  },
  "dependencies": {
    "qrcode": "^1.5.4"
  }
}
```

- [ ] **Step 2: Nainstaluj závislosti**

Run: `npm install`
Expected: skončí bez chyby, vznikne `node_modules/` a `package-lock.json`.

- [ ] **Step 3: Vytvoř `eleventy.config.js`** (zatím jen passthrough + adresáře; kolekce a filtry přidají další tasky)

```js
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "styles.css": "styles.css",
    "theme.js": "theme.js",
    "print-dark.css": "print-dark.css",
  });

  return {
    dir: { input: "src", output: "dist", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
```

- [ ] **Step 4: Vytvoř `src/_includes/layout.njk`** (základní HTML shell; přejatý `<head>` z původního `index.html`, theme.js v hlavičce před paintem)

```njk
<!DOCTYPE html>
<html lang="cs" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title or "Tips & Chips" }} — Tips & Chips</title>
  <meta name="description" content="{{ description or 'Tips & Chips — interní firemní event plný tipů, triků, hacků a novinek.' }}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <!-- theme init runs before paint to avoid a flash of the wrong theme -->
  <script src="/theme.js"></script>
</head>
<body>
  {% include "nav.njk" %}
  {{ content | safe }}
  <footer class="site-footer">
    <p class="site-footer__claim">TIPS · TRICKS · HACKS · NEWS</p>
    <p class="site-footer__meta">Tips &amp; Chips</p>
  </footer>
</body>
</html>
```

- [ ] **Step 5: Vytvoř `src/_includes/nav.njk`** (navigace + přepínač motivu; `id="theme-toggle"` musí zůstat, aby ho `theme.js` našel)

```njk
<nav class="site-nav" aria-label="Hlavní navigace">
  <a class="site-nav__brand" href="/">Tips &amp; Chips</a>
  <ul class="site-nav__links">
    <li><a href="/" class="{{ 'is-active' if page.url == '/' }}">Domů</a></li>
    <li><a href="/program/" class="{{ 'is-active' if page.url == '/program/' }}">Program</a></li>
    <li><a href="/prihlaska/" class="{{ 'is-active' if page.url == '/prihlaska/' }}">Přihláška</a></li>
    <li><a href="/hlasovani/" class="{{ 'is-active' if page.url == '/hlasovani/' }}">Hlasování</a></li>
    <li><a href="/archiv/" class="{{ 'is-active' if page.url.startsWith('/archiv') }}">Archiv</a></li>
  </ul>
  <button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false"
    aria-label="Přepnout na tmavý režim">☾</button>
</nav>
```

- [ ] **Step 6: Vytvoř `src/index.njk`** — přesun obsahu landingu

Vytvoř soubor s tímto front-matterem a do těla **vlož `<header class="hero">…</header>` a `<main>…</main>` z původního `index.html` beze změny** — s jedinou úpravou: **vypusť řádek s `<button id="theme-toggle" …>…</button>`** uvnitř hero (přesunul se do `nav.njk`). Logo SVG a sekce zkopíruj přesně.

```njk
---
layout: layout.njk
title: Domů
---
<header class="hero" id="hero">
  <div class="hero__inner">
    <!-- sem vlož logo SVG z původního index.html (řádky 22–60), beze změny -->
  </div>
</header>
<main>
  <!-- sem vlož všech 6 sekcí <section class="section">…</section> z původního index.html (řádky 64–147), beze změny -->
</main>
```

- [ ] **Step 7: Smaž původní `index.html`**

Run: `rm "index.html"`
Expected: soubor v rootu zmizí (obsah už je v `src/index.njk`).

- [ ] **Step 8: Doplň `.gitignore`** (přidej na konec)

```
node_modules/
dist/
```

- [ ] **Step 9: Uprav `styles.css`** — přepínač motivu už není v hero (absolutně pozicovaný), ale v navigaci

Najdi blok `.theme-toggle {` a odstraň první tři vlastnosti (pozicování), tj. změň:

```css
.theme-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
```

na:

```css
.theme-toggle {
  width: 44px;
```

- [ ] **Step 10: Uprav `styles.css`** — přidej styly navigace a sdílené styly stránek

Vlož za blok `a { color: var(--accent-2); }` (okolo řádku 97):

```css
/* ===== Sdílená navigace ===== */
.site-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 20px;
  background: var(--bg-alt);
  border-bottom: 1px solid var(--border);
}
.site-nav__brand {
  font-family: var(--font-display);
  color: var(--accent-2);
  text-decoration: none;
  letter-spacing: 1px;
}
.site-nav__links {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 0;
  padding: 0;
}
.site-nav__links a {
  text-decoration: none;
  color: var(--text);
  font-weight: 600;
}
.site-nav__links a.is-active { color: var(--accent-2); }
.site-nav .theme-toggle { margin-left: auto; }

/* ===== Obsahové stránky (mimo landing) ===== */
.page .section h1 {
  font-size: clamp(28px, 5vw, 40px);
  color: var(--accent-2);
  margin: 0 0 20px;
}
.empty-state { color: var(--muted); }
.cta { font-weight: 700; }
```

- [ ] **Step 11: Uprav `styles.css`** — responsive a print

V bloku `@media (max-width: 600px)` přidej řádek:

```css
  .site-nav { flex-wrap: wrap; gap: 10px; }
```

V bloku `@media print` přidej k pravidlu, které skrývá `.theme-toggle`, i navigaci:

```css
  .theme-toggle, .site-nav { display: none !important; }
```

- [ ] **Step 12: Build a ověření**

Run: `npm run build && grep -q 'class="site-nav"' dist/index.html && grep -q 'logo__wordmark' dist/index.html && echo OK`
Expected: build proběhne bez chyby a vypíše `OK` (landing se vyrenderoval s navigací i logem).

- [ ] **Step 13: Commit**

```bash
git add package.json package-lock.json eleventy.config.js src/_includes/layout.njk src/_includes/nav.njk src/index.njk .gitignore styles.css
git rm index.html
git commit -m "feat: 11ty scaffold, shared layout + nav, migrate landing"
```

---

### Task 2: Obsahový model eventů + rozdělovací funkce (TDD) + stránka Program

Zavede markdown model eventu, čistou build-time funkci pro rozdělení na aktuální/minulé (s unit testem) a první konzument — stránku Program.

**Files:**
- Create: `lib/events.js`
- Create: `test/events.test.js`
- Create: `src/events/2026-12-31-event.md`
- Create: `src/events/2026-06-10-event.md`
- Create: `src/events/events.json` (directory data — permalink + layout pro detaily)
- Create: `src/_includes/event.njk` (layout detailu eventu — využije se i v Tasku 4)
- Create: `src/program.njk`
- Modify: `eleventy.config.js` (přidej kolekci `schedule` a filtr `datefmt`)
- Modify: `styles.css` (styly programu / slotů)

**Interfaces:**
- Consumes: `layout.njk` (z Tasku 1).
- Produces:
  - `splitEvents(events, today)` v `lib/events.js` — `events` je pole objektů s vlastností `date` (JS `Date`), `today` je `Date`; vrací `{ current, past }`, kde `current` je nejbližší event s `date >= dnešní půlnoc` nebo `null`, a `past` je pole eventů s `date < dnešní půlnoc` seřazené od nejnovějšího.
  - Eleventy kolekce `collections.schedule` = `{ current, past }` (položky jsou standardní Eleventy collection items s `.date`, `.url`, `.data`).
  - Nunjucks filtr `datefmt` (formát `cs-CZ`, např. „31. prosince 2026").
  - Front-matter model eventu: `title`, `date`, `location`, `slido` (volitelné), `slots[]` (`time`, `speaker`, `role?`, `title`), `winner` (volitelné); tělo = markdown recap.

- [ ] **Step 1: Napiš padající test** `test/events.test.js`

```js
import test from "node:test";
import assert from "node:assert/strict";
import { splitEvents } from "../lib/events.js";

const ev = (d) => ({ date: new Date(d) });

test("current = nejbližší nadcházející, past = minulé od nejnovějšího", () => {
  const past = ev("2026-06-10");
  const soon = ev("2026-06-24");
  const later = ev("2026-07-08");
  const today = new Date("2026-06-22");

  const result = splitEvents([past, later, soon], today);

  assert.equal(result.current, soon);
  assert.deepEqual(result.past, [past]);
});

test("event přesně dnes se počítá jako current", () => {
  const todayEvent = ev("2026-06-22");
  const today = new Date("2026-06-22T15:00:00");

  const result = splitEvents([todayEvent], today);

  assert.equal(result.current, todayEvent);
  assert.deepEqual(result.past, []);
});

test("žádný nadcházející → current je null, vše v past od nejnovějšího", () => {
  const a = ev("2026-06-01");
  const b = ev("2026-06-10");
  const today = new Date("2026-06-22");

  const result = splitEvents([a, b], today);

  assert.equal(result.current, null);
  assert.deepEqual(result.past, [b, a]);
});
```

- [ ] **Step 2: Spusť test a ověř, že padá**

Run: `npm test`
Expected: FAIL — `Cannot find module '../lib/events.js'` (soubor ještě neexistuje).

- [ ] **Step 3: Vytvoř `lib/events.js`** (minimální implementace)

```js
export function splitEvents(events, today) {
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const upcoming = events
    .filter((e) => e.date >= startOfToday)
    .sort((a, b) => a.date - b.date);
  const past = events
    .filter((e) => e.date < startOfToday)
    .sort((a, b) => b.date - a.date);
  return { current: upcoming[0] || null, past };
}
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm test`
Expected: PASS — 3 testy projdou.

- [ ] **Step 5: Vytvoř vzorové eventy** (placeholdery — datum nadcházejícího je `2026-12-31`, aby zůstal „current" po celý rok 2026)

`src/events/2026-12-31-event.md`:

```markdown
---
title: "Tips & Chips #4"
date: 2026-12-31
location: "V Lodi + Google Meet"
slido: "https://app.sli.do/event/REPLACE"
slots:
  - time: "16:00"
    speaker: "Petr K."
    role: "FE"
    title: "Claude Code triky"
  - time: "16:10"
    speaker: "Jana N."
    role: "UX"
    title: "Figma variables v praxi"
---
Krátká anotace nadcházejícího eventu (volitelné).
```

`src/events/2026-06-10-event.md`:

```markdown
---
title: "Tips & Chips #3"
date: 2026-06-10
location: "V Lodi + Google Meet"
winner: "Petr K. — Claude Code triky"
slots:
  - time: "16:00"
    speaker: "Petr K."
    role: "FE"
    title: "Claude Code triky"
---
## Zápis z eventu

Skvělá várka tipů — nejvíc zaujaly AI workflow triky.
```

- [ ] **Step 6: Vytvoř directory data** `src/events/events.json` (každý event dostane vlastní detail na `/archiv/<slug>/` přes layout `event.njk`)

```json
{
  "layout": "event.njk",
  "permalink": "/archiv/{{ page.fileSlug }}/"
}
```

- [ ] **Step 7: Vytvoř layout detailu eventu** `src/_includes/event.njk` (využije Task 4; vytváříme teď, protože `events.json` ho odkazuje)

```njk
---
layout: layout.njk
---
<main class="page">
  <article class="section">
    <div class="section__inner">
      <p class="eyebrow">{{ date | datefmt }}{% if location %} · {{ location }}{% endif %}</p>
      <h1>{{ title }}</h1>
      {% if winner %}<p class="event-winner">🏆 Vítěz: <strong>{{ winner }}</strong></p>{% endif %}
      {% if slots %}
        <h2>Program</h2>
        <ol class="program">
          {% for slot in slots %}
            <li class="slot">
              <span class="slot__time">{{ slot.time }}</span>
              <span class="slot__body">
                <span class="slot__title">{{ slot.title }}</span>
                <span class="slot__meta">{{ slot.speaker }}{% if slot.role %} · {{ slot.role }}{% endif %}</span>
              </span>
            </li>
          {% endfor %}
        </ol>
      {% endif %}
      {% if content %}<div class="event-recap">{{ content | safe }}</div>{% endif %}
    </div>
  </article>
</main>
```

- [ ] **Step 8: Zaregistruj kolekci a filtr** — uprav `eleventy.config.js`

Na začátek souboru přidej importy:

```js
import { splitEvents } from "./lib/events.js";
```

Dovnitř funkce (před `return`) přidej:

```js
  eleventyConfig.addCollection("schedule", (api) =>
    splitEvents(api.getFilteredByGlob("src/events/*.md"), new Date())
  );

  eleventyConfig.addFilter("datefmt", (d) =>
    new Date(d).toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );
```

- [ ] **Step 9: Vytvoř stránku** `src/program.njk`

```njk
---
layout: layout.njk
title: Program
---
{% set ev = collections.schedule.current %}
<main class="page">
  <section class="section">
    <div class="section__inner">
      <p class="eyebrow">Program</p>
      {% if ev %}
        <h1>{{ ev.data.title }}</h1>
        <ul class="info-rows">
          <li><span class="info-rows__icon" aria-hidden="true">🗓️</span> {{ ev.date | datefmt }}</li>
          <li><span class="info-rows__icon" aria-hidden="true">📍</span> {{ ev.data.location }}</li>
        </ul>
        <ol class="program">
          {% for slot in ev.data.slots %}
            <li class="slot">
              <span class="slot__time">{{ slot.time }}</span>
              <span class="slot__body">
                <span class="slot__title">{{ slot.title }}</span>
                <span class="slot__meta">{{ slot.speaker }}{% if slot.role %} · {{ slot.role }}{% endif %}</span>
              </span>
            </li>
          {% endfor %}
        </ol>
        {% if ev.data.slido %}
          <p><a class="cta" href="/hlasovani/">Hlasuj o nejlepší talk →</a></p>
        {% else %}
          <p class="empty-state">Hlasování spustíme během eventu.</p>
        {% endif %}
      {% else %}
        <h1>Další Tips &amp; Chips chystáme</h1>
        <p class="empty-state">Termín dalšího eventu zveřejníme brzy. Zatím mrkni do <a href="/archiv/">archivu</a>.</p>
      {% endif %}
    </div>
  </section>
</main>
```

- [ ] **Step 10: Přidej styly** — vlož na konec `styles.css` (před blok `@media print`)

```css
/* ===== Program / sloty ===== */
.program { list-style: none; padding: 0; margin: 24px 0; }
.slot {
  display: flex;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}
.slot:last-child { border-bottom: none; }
.slot__time { font-family: var(--font-display); color: var(--accent-2); min-width: 64px; }
.slot__body { display: flex; flex-direction: column; }
.slot__title { font-weight: 700; }
.slot__meta { color: var(--muted); font-size: 14px; }
.event-winner { color: var(--accent-2); }
.event-recap { margin-top: 24px; }
```

- [ ] **Step 11: Build a ověření**

Run: `npm run build && grep -q 'Figma variables v praxi' dist/program/index.html && echo OK`
Expected: build projde a vypíše `OK` (program aktuálního eventu se vyrenderoval ze vzorového eventu `2026-12-31`).

- [ ] **Step 12: Commit**

```bash
git add lib/events.js test/events.test.js src/events/ src/_includes/event.njk src/program.njk eleventy.config.js styles.css
git commit -m "feat: event content model, current/past split (tested), program page"
```

---

### Task 3: Stránka Přihláška talku (Google Form embed)

Stránka s embedovaným Google Formem a viditelným fallback odkazem; URL formuláře v centrální konfiguraci.

**Files:**
- Create: `src/_data/site.js`
- Create: `src/prihlaska.njk`
- Modify: `styles.css` (styly embedu formuláře)

**Interfaces:**
- Consumes: `layout.njk` (Task 1).
- Produces: globální data `site` s vlastnostmi `talkFormEmbedUrl` (URL pro `<iframe>`) a `talkFormUrl` (přímý odkaz pro fallback).

- [ ] **Step 1: Vytvoř konfiguraci** `src/_data/site.js` (URL doplní uživatel — nech `REPLACE`)

```js
export default {
  // Google Form → Send → Embed HTML → zkopíruj src z <iframe>
  talkFormEmbedUrl:
    "https://docs.google.com/forms/d/e/REPLACE_FORM_ID/viewform?embedded=true",
  // Veřejný odkaz na formulář (Send → link / forms.gle/…)
  talkFormUrl: "https://forms.gle/REPLACE",
};
```

- [ ] **Step 2: Napiš ověřovací příkaz a ověř, že padá** (stránka ještě neexistuje)

Run: `npm run build && grep -q 'class="form-embed"' dist/prihlaska/index.html && echo OK`
Expected: FAIL — `grep` nenajde soubor `dist/prihlaska/index.html` (žádný `OK`).

- [ ] **Step 3: Vytvoř stránku** `src/prihlaska.njk`

```njk
---
layout: layout.njk
title: Přihláška talku
---
<main class="page">
  <section class="section">
    <div class="section__inner">
      <p class="eyebrow">Přihláška</p>
      <h1>Přihlas svůj talk</h1>
      <p>Máš tip, trik, hack nebo novinku? Přihlas příspěvek na nejbližší Tips &amp; Chips.
         K dispozici je zhruba 5 slotů po 10 minutách — delší příspěvek = víc slotů za sebou.</p>
      <div class="form-embed">
        <iframe src="{{ site.talkFormEmbedUrl }}" loading="lazy" title="Přihláška talku">Načítání…</iframe>
      </div>
      <p><a class="cta" href="{{ site.talkFormUrl }}" target="_blank" rel="noopener">Nenačítá se? Otevři formulář v novém okně →</a></p>
    </div>
  </section>
</main>
```

- [ ] **Step 4: Přidej styly** — vlož na konec `styles.css` (před blok `@media print`)

```css
/* ===== Embed formuláře ===== */
.form-embed { margin: 24px 0; }
.form-embed iframe {
  width: 100%;
  min-height: 1200px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card-bg);
}
```

- [ ] **Step 5: Build a ověření**

Run: `npm run build && grep -q 'class="form-embed"' dist/prihlaska/index.html && grep -q 'Otevři formulář v novém okně' dist/prihlaska/index.html && echo OK`
Expected: build projde a vypíše `OK` (embed i fallback odkaz jsou na stránce).

- [ ] **Step 6: Commit**

```bash
git add src/_data/site.js src/prihlaska.njk styles.css
git commit -m "feat: talk submission page with Google Form embed + fallback link"
```

---

### Task 4: Archiv — seznam minulých eventů + detaily

Auto-generovaný seznam minulých eventů (z `collections.schedule.past`) a dlaždice odkazující na detail každého eventu. Detailové stránky už generuje layout `event.njk` (Task 2) přes `events.json`.

**Files:**
- Create: `src/_includes/event-card.njk`
- Create: `src/archiv.njk`
- Modify: `styles.css` (styly seznamu archivu + dlaždic)

**Interfaces:**
- Consumes: `collections.schedule.past` (Task 2), filtr `datefmt` (Task 2), layout `event.njk` (Task 2).
- Produces: stránka `/archiv/` (seznam) + detaily `/archiv/<slug>/` (z `events.json`).

- [ ] **Step 1: Napiš ověřovací příkaz a ověř, že padá** (stránka archivu ještě neexistuje)

Run: `npm run build && grep -q 'class="archive-list"' dist/archiv/index.html && echo OK`
Expected: FAIL — `dist/archiv/index.html` neexistuje (žádný `OK`).

- [ ] **Step 2: Vytvoř dlaždici** `src/_includes/event-card.njk` (očekává proměnnou `ev` z kontextu cyklu)

```njk
<li class="event-card">
  <a class="event-card__link" href="{{ ev.url }}">
    <span class="event-card__date">{{ ev.date | datefmt }}</span>
    <span class="event-card__title">{{ ev.data.title }}</span>
    {% if ev.data.winner %}<span class="event-card__winner">🏆 {{ ev.data.winner }}</span>{% endif %}
  </a>
</li>
```

- [ ] **Step 3: Vytvoř stránku** `src/archiv.njk`

```njk
---
layout: layout.njk
title: Archiv
---
<main class="page">
  <section class="section">
    <div class="section__inner">
      <p class="eyebrow">Archiv</p>
      <h1>Proběhlé eventy</h1>
      {% if collections.schedule.past.length %}
        <ul class="archive-list">
          {% for ev in collections.schedule.past %}
            {% include "event-card.njk" %}
          {% endfor %}
        </ul>
      {% else %}
        <p class="empty-state">Zatím tu nic není — první event teprve přijde.</p>
      {% endif %}
    </div>
  </section>
</main>
```

- [ ] **Step 4: Přidej styly** — vlož na konec `styles.css` (před blok `@media print`)

```css
/* ===== Archiv ===== */
.archive-list { list-style: none; padding: 0; margin: 24px 0; display: grid; gap: 14px; }
.event-card__link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px 20px;
  text-decoration: none;
  color: var(--text);
  transition: transform .15s ease, border-color .15s ease;
}
.event-card__link:hover { transform: translateY(-3px); border-color: var(--accent); }
.event-card__date { color: var(--muted); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
.event-card__title { font-family: var(--font-display); font-size: 20px; }
.event-card__winner { color: var(--accent-2); font-size: 14px; }
```

- [ ] **Step 5: Build a ověření** (seznam i detail; minulý vzorový event `2026-06-10` je v archivu deterministicky)

Run: `npm run build && grep -q 'class="archive-list"' dist/archiv/index.html && grep -q 'Vítěz' dist/archiv/2026-06-10-event/index.html && grep -q 'Zápis z eventu' dist/archiv/2026-06-10-event/index.html && echo OK`
Expected: build projde a vypíše `OK` (seznam existuje, detail eventu má vítěze i markdown recap).

- [ ] **Step 6: Commit**

```bash
git add src/_includes/event-card.njk src/archiv.njk styles.css
git commit -m "feat: archive list + per-event detail pages"
```

---

### Task 5: Stránka Hlasování + QR kód na Slido

Stránka drží Slido odkaz aktuálního eventu, vygeneruje k němu QR kód jako inline SVG (build-time) a pokrývá stavy „bez Slido" a „žádný event".

**Files:**
- Create: `src/hlasovani.njk`
- Modify: `eleventy.config.js` (async shortcode `qr`)
- Modify: `styles.css` (styly QR)

**Interfaces:**
- Consumes: `collections.schedule.current` (Task 2), balík `qrcode` (z Tasku 1).
- Produces: Nunjucks async shortcode `{% qr <url> %}` → inline `<svg>` QR kódu (vkládá se jako bezpečné HTML).

- [ ] **Step 1: Zaregistruj shortcode** — uprav `eleventy.config.js`

Na začátek souboru přidej import:

```js
import QRCode from "qrcode";
```

Dovnitř funkce (před `return`) přidej:

```js
  eleventyConfig.addNunjucksAsyncShortcode("qr", async (text) =>
    QRCode.toString(text, { type: "svg", margin: 1 })
  );
```

- [ ] **Step 2: Napiš ověřovací příkaz a ověř, že padá** (stránka ještě neexistuje)

Run: `npm run build && grep -q 'class="voting-qr"' dist/hlasovani/index.html && echo OK`
Expected: FAIL — `dist/hlasovani/index.html` neexistuje (žádný `OK`).

- [ ] **Step 3: Vytvoř stránku** `src/hlasovani.njk`

```njk
---
layout: layout.njk
title: Hlasování
---
{% set ev = collections.schedule.current %}
<main class="page">
  <section class="section">
    <div class="section__inner">
      <p class="eyebrow">Hlasování</p>
      <h1>Hlasuj o nejlepší talk</h1>
      {% if ev and ev.data.slido %}
        <p>Naskenuj QR kód nebo otevři odkaz a vyber nejlepší příspěvek. Hlasování je anonymní.</p>
        <div class="voting-qr">{% qr ev.data.slido %}</div>
        <p><a class="cta" href="{{ ev.data.slido }}" target="_blank" rel="noopener">Otevřít hlasování →</a></p>
        <p class="empty-state">Živé výsledky uvidíš na plátně (Slido).</p>
      {% elif ev %}
        <p class="empty-state">Hlasování spustíme během eventu — zkontroluj tuto stránku, až začne.</p>
      {% else %}
        <p class="empty-state">Žádný event právě neběží. Mrkni do <a href="/archiv/">archivu</a>.</p>
      {% endif %}
    </div>
  </section>
</main>
```

- [ ] **Step 4: Přidej styly** — vlož na konec `styles.css` (před blok `@media print`)

```css
/* ===== Hlasování / QR ===== */
.voting-qr { margin: 24px auto; max-width: 280px; }
.voting-qr svg {
  width: 100%;
  height: auto;
  background: #fff;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid var(--border);
}
```

- [ ] **Step 5: Build a ověření** (aktuální vzorový event má `slido`, takže se vygeneruje QR jako SVG)

Run: `npm run build && grep -q 'class="voting-qr"' dist/hlasovani/index.html && grep -q '<svg' dist/hlasovani/index.html && echo OK`
Expected: build projde a vypíše `OK` (QR kód jako inline SVG je na stránce).

- [ ] **Step 6: Vizuální kontrola** (manuální — QR a light/dark)

Run: `npm run serve`
Otevři `http://localhost:8080/hlasovani/`, ověř že se QR zobrazuje a je čitelný v light i dark režimu; projdi i `/`, `/program/`, `/prihlaska/`, `/archiv/` a klikni napříč navigací. Ukonči `Ctrl+C`.
Expected: všechny stránky fungují, navigace zvýrazňuje aktivní položku, přepínač motivu funguje, QR je čitelný.

- [ ] **Step 7: Commit**

```bash
git add src/hlasovani.njk eleventy.config.js styles.css
git commit -m "feat: voting page with build-time Slido QR code"
```

---

## Self-Review

**1. Spec coverage:**
- Přihláška talku → Task 3 ✅
- Program aktuálního eventu → Task 2 (stránka) + Task 2 logika current ✅
- Archiv (blog) → Task 4 (seznam + detaily) ✅
- Hlasování přes QR → Task 5 ✅
- 11ty build, statický výstup, deploy kopií `dist/` → Task 1 ✅
- Markdown model eventu (1 soubor = 1 event) → Task 2 ✅
- Sdílená navigace (web už není jednostránkový) → Task 1 ✅
- Light/dark + zachování vzhledu Fáze 1 → Task 1 (passthrough `theme.js`/`styles.css`, layout přejímá `<head>`) ✅
- Okrajové stavy: žádný event / bez slido / bez winner → Task 2 (program, event detail), Task 4 (archiv prázdný), Task 5 (hlasování) ✅
- Google Form fallback odkaz → Task 3 ✅
- Verifikace `npm run build` / `npm run serve` → Task 1–5 (build) + Task 5 Step 6 (vizuální) ✅
- `.gitignore` `node_modules/` + `dist/` → Task 1 ✅

**2. Placeholder scan:** Jediné záměrné placeholdery jsou `REPLACE` v URL Google Formu/Slido a vzorová data eventů — to jsou hodnoty k doplnění uživatelem, ne nedodělané kroky plánu; explicitně označeno v Global Constraints. Žádné „TBD/TODO" kroky.

**3. Type consistency:** `splitEvents(events, today) → { current, past }` použito konzistentně v `eleventy.config.js` a šablonách jako `collections.schedule.current` / `.past`. Filtr `datefmt` definován v Tasku 2 a používán v Tasku 2 i 4. Shortcode `qr` definován i použit v Tasku 5. Front-matter pole (`title`, `date`, `location`, `slido`, `slots[].{time,speaker,role,title}`, `winner`) konzistentní napříč `event.njk`, `program.njk`, `event-card.njk` i vzorovými soubory. `id="theme-toggle"` zachováno z původního kódu pro `theme.js`.
