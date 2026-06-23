# Tips & Chips — web

Statický web interního firemního eventu **Tips & Chips** (TIPS · TRICKS · HACKS · NEWS).
Generuje se přes [Eleventy (11ty)](https://www.11ty.dev/) do čistě statického HTML/CSS/JS — **žádný runtime backend ani databáze**. Obsah eventů žije v Markdownu v Gitu. Přihlášky talků sbírá Google Form, hlasování běží přes Slido.

## Požadavky

- **Node.js 18+** (testováno na v22)
- npm

## Rychlý start

```bash
npm install          # jednorázově – nainstaluje závislosti
npm run serve        # vývojový server s živým náhledem
```

Pak otevři **http://localhost:8080/**. Změny v `src/`, `styles.css` nebo `theme.js` se projeví automaticky (live reload).

## Příkazy

| Příkaz | Co dělá |
|---|---|
| `npm run serve` | Vývojový server na `http://localhost:8080/` s živým náhledem |
| `npm run build` | Vygeneruje produkční web do složky **`dist/`** |
| `npm test` | Spustí unit testy (`node --test`) — logika rozdělení eventů na aktuální/archiv |

## Deploy

```bash
npm run build
```

Výstup je ve složce **`dist/`** — celý ji zkopíruj na interní webový host. Žádný server-side runtime není potřeba, stačí servírovat statické soubory.

> `dist/` a `node_modules/` jsou v `.gitignore` (negenerují se do repa).

## Struktura projektu

```
src/
  _includes/
    layout.njk        # základní HTML shell (head, nav, footer)
    nav.njk           # navigace + přepínač light/dark
    event-card.njk    # dlaždice eventu v archivu
    event.njk         # layout detailu eventu
  _data/
    site.js           # konfigurace: URL Google Formu (přihláška talku)
  index.njk           # úvodní stránka (logo + info sekce)
  program.njk         # program nejbližšího eventu
  prihlaska.njk       # přihláška talku (embed Google Form)
  hlasovani.njk       # hlasování (QR kód na Slido)
  archiv.njk          # seznam proběhlých eventů
  events/
    YYYY-MM-DD-<slug>.md  # jeden soubor = jeden event (zdroj pravdy)
styles.css            # styly + design tokeny (light/dark)
theme.js              # přepínač motivu + animace
eleventy.config.js    # konfigurace buildu
lib/events.js         # rozdělení eventů na aktuální vs. archiv
```

## Správa obsahu

### Přidání / úprava eventu

Vytvoř soubor v `src/events/`. Front-matter nese strukturovaná data, tělo (Markdown) je volný zápis/recap do archivu:

```markdown
---
title: "Tips & Chips #5"
date: 2026-09-15            # řídí, jestli je event aktuální nebo v archivu
location: "V Lodi + Google Meet"
slido: "https://app.sli.do/event/xxxx"   # odkaz na hlasování (může chybět)
slots:                       # program – cca 5 slotů
  - time: "16:00"
    speaker: "Jméno P."
    role: "FE"               # volitelné
    title: "Název příspěvku"
winner: "Jméno P. — Název"   # doplň po eventu (zobrazí se v archivu)
---
Volný Markdown zápis z eventu (pro archiv).
```

**Jak se obsah chová:**

- **Program** (`/program`) ukazuje nejbližší event s `date >= dnes`.
- **Archiv** (`/archiv`) vypisuje eventy s `date < dnes`, nejnovější nahoře.
- Každý event má detail na `/archiv/<slug>/`.

> ⚠️ **`<slug>` v názvu souboru musí být unikátní napříč soubory** (ne jen datum). Eleventy z názvu odstraňuje datovou předponu `YYYY-MM-DD-`, takže dva soubory se stejným slugem by kolidovaly. Použij např. `2026-09-15-tips-chips-5.md`.

> Datová logika se vyhodnocuje **při buildu** — před každým eventem znovu spusť `npm run build` a nahraj `dist/`.

### Přihláška talku (Google Form)

V `src/_data/site.js` doplň reálné URL (zatím obsahují `REPLACE`):

- `talkFormEmbedUrl` — z Google Formu: *Odeslat → `< >` (Embed HTML)* → zkopíruj `src` z `<iframe>`
- `talkFormUrl` — veřejný odkaz na formulář (pro fallback „otevřít v novém okně")

Odpovědi padají do Google Sheetu; řečníky pak ručně doplníš do `slots` ve front-matteru eventu.

### Hlasování (Slido)

Pro každý event nastav anketu ve [Slido](https://www.slido.com/) a jeho join-odkaz vlož do pole `slido:` ve front-matteru eventu. Web z něj při buildu vygeneruje QR kód. **Živé výsledky na plátně** ukazuje Slido presenter view (ne tento web).

## Light / dark režim

Přepínač je v navigaci. Volba se ukládá do `localStorage`; bez uložené volby se řídí systémovým nastavením. Styly jsou řízené CSS proměnnými v `styles.css`.

## Dokumentace návrhu

- Spec: `docs/superpowers/specs/2026-06-22-faze2-funkcionality-design.md`
- Implementační plán: `docs/superpowers/plans/2026-06-22-faze2-funkcionality.md`
