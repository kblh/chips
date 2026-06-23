# Tips & Chips — Fáze 2: Funkcionality (design)

**Datum:** 2026-06-22
**Stav:** odsouhlaseno, připraveno k psaní implementačního plánu

## Cíl

Rozšířit stávající informativní web Tips & Chips (Fáze 1) o čtyři funkce:

1. **Přihláška talku** — formulář pro přihlášení příspěvku
2. **Program aktuálního eventu** — sloty řečníků nejbližšího eventu
3. **Archiv proběhlých eventů (blog)** — seznam + detail minulých eventů
4. **Hlasování přes QR kód** — anonymní hlasování o nejlepší talk se živými výsledky na plátně

## Omezení a rozhodnutí

- **Co nejjednodušší stack, bez runtime backendu a bez DB.** Externí služby slouží jako „backend".
- **Ekosystém:** Google Workspace (firemní).
- **Hosting:** interní, dostupný pouze z lokální sítě. Přihlašování/auth se v této fázi neřeší — návštěvníci jsou důvěryhodní zaměstnanci.
- **Správa obsahu:** vývojář, přes Git, v Markdownu.
- **Build:** zvolena varianta s drobným statickým generátorem **Eleventy (11ty)**. Výstup je čistě statický web, deploy ruční (kopie `dist/` na interní host).
- **Hlasování:** zvoleno **Slido** (free tier: 100 účastníků/event, 1 anketa stačí, živé výsledky + QR + anonymita zdarma, anti-dvojhlas přes cookie/zařízení).

### Proč Slido a ne Google Forms

Požadavek je živé výsledky na plátně + anonymita + bránění dvojímu hlasování zároveň. Google Forms neumí živý auto-refresh graf na projektoru a nutí volit mezi *anonymně* NEBO *jeden hlas na osobu*. Slido tyto tři požadavky splňuje v free tieru. (Zvažovány též VoxVote — bez limitu hlasujících — a self-hosted open-source Claper; Slido zvoleno pro zero-setup a dostatečný headroom 100 účastníků.)

## Architektura

Statický web generovaný Eleventy. Fáze 1 (ruční `index.html`) se převede pod 11ty; `styles.css`, `theme.js`, logo a light/dark zůstávají beze změny vzhledu. Hlavička/patička se vytáhnou do sdílené šablony. Web přestává být jednostránkový → přidává se sdílená navigace.

Za běhu webu nejsou žádná API volání kromě embedů (Google Form iframe, odkaz na Slido). Sběr přihlášek a hlasování běží mimo náš web ve službách Google Forms a Slido.

### Struktura projektu

```
src/
  _includes/
    layout.njk          # základní HTML shell (head, theme.js, styles, nav, footer)
    nav.njk             # sdílená navigace
    event-card.njk      # dlaždice eventu pro archiv
  _data/
    site.js             # konfigurace: URL Google Formu, název, claim…
  index.njk             # landing (obsah Fáze 1, beze změny vzhledu)
  program.njk           # program aktuálního eventu
  prihlaska.njk         # přihláška talku (embed Google Form)
  hlasovani.njk         # hlasování (QR + odkaz na Slido)
  archiv.njk            # auto-generovaný seznam minulých eventů
  events/
    2026-06-24-event.md # jeden markdown soubor = jeden event (zdroj pravdy)
styles.css              # beze změny (passthrough)
theme.js                # beze změny
print-dark.css          # zůstává (PDF export landingu)
.eleventy.js            # konfigurace buildu
package.json            # 11ty + QR generátor
```

`node_modules/` a `dist/` jsou v `.gitignore`. Git zůstává bez remote, deploy ruční.

## Obsahový model

**Jeden event = jeden markdown soubor** v `src/events/`. Front-matter nese strukturovaná data, tělo nese volný markdown zápis (recap pro archiv).

```yaml
---
date: 2026-06-24                          # řídí current vs. archiv
location: "V Lodi + Google Meet"
slido: "https://app.sli.do/event/xxxx"    # vyplní se před/během eventu, může chybět
slots:                                     # program – cca 5 slotů
  - time: "16:00"
    speaker: "Petr K."
    role: "FE"
    title: "Claude Code triky"
winner: "Petr K. — Claude Code triky"     # vyplní se po eventu (archiv)
---
Volný markdown zápis / recap eventu.
```

### Odvozená logika (build-time)

Kolekce `events` seřazená dle `date`:

- **Current event** = první event s `date >= dnes`. Pokud žádný neexistuje → placeholder „Další Tips & Chips chystáme".
- **Archiv** = eventy s `date < dnes`, nejnovější nahoře.

Build běží ručně před deployem, takže datová logika je spolehlivá.

## Funkce

### 1. Přihláška talku — `/prihlaska`

Stránka s krátkým úvodem + **embed Google Formu** (iframe; URL v `_data/site.js`). Odpovědi padají do Google Sheetu vlastněného organizátorem. Řečníky organizátor ručně nadeleguje do front-matteru eventu (`slots`). Pod iframem viditelný přímý odkaz „Otevřít formulář v novém okně" jako fallback.

### 2. Program aktuálního eventu — `/program`

Vyrenderuje sloty current eventu (čas, řečník, role, téma) + CTA na hlasování. Pokud current event nemá `slido`, místo QR/CTA text „hlasování spustíme během eventu".

### 3. Archiv / blog — `/archiv` + detail `/archiv/<slug>`

Auto-generovaný seznam minulých eventů (datum, vítěz, odkaz) — generuje se z kolekce, žádná ruční údržba. Detail eventu = program + vítěz + markdown recap.

### 4. Hlasování přes QR — `/hlasovani`

Stránka drží Slido odkaz current eventu + **QR kód vygenerovaný při buildu** (statický obrázek z `slido` URL přes QR knihovnu) + krátký návod. Tištěný/promítaný QR může mířit na krátkou adresu `/hlasovani`, která vede na aktuální Slido. **Živé výsledky na plátně řeší Slido presenter view**, ne náš web (držíme se bez backendu).

## Tok dat

```
Markdown (events/*.md) v Gitu
        │  11ty build (ruční)
        ▼
Statické dist/ → kopie na interní host
        │
        ├─ /prihlaska  → embed Google Form → odpovědi do Google Sheet (organizátor)
        └─ /hlasovani  → odkaz/QR na Slido → hlasování + živé výsledky (Slido presenter view)
```

## Navigace

Slim sdílená navigace (`nav.njk`) v hlavičce všech stránek: **Domů · Program · Přihláška · Hlasování · Archiv**. Na landingu umístěna tak, aby nerušila vstupní animaci loga. Přepínač light/dark zůstává. Aktivní položka zvýrazněna.

## Ošetření chyb a okrajové stavy

Build nesmí spadnout, stránka se vždy načte:

- **Žádný nadcházející event** → program i hlasování ukážou placeholder „Další Tips & Chips chystáme".
- **Event bez `slido`** → místo QR text „hlasování spustíme během eventu".
- **Event bez `winner`** (čerstvě proběhlý) → v archivu „vítěz se dopočítává".
- **Google Form se nenačte** (offline/blokace iframe) → viditelný přímý odkaz jako fallback.
- **Chybějící nepovinná pole** → šablony mají rozumné defaulty.

## Testování / verifikace

Statický obsahový web — žádná aplikační logika k unit testování:

- `npm run build` proběhne bez chyby = primární kontrola.
- `npm run serve` (eleventy --serve) pro lokální náhled při psaní obsahu.
- Vizuální kontrola light/dark a responzivity (pokračuje styl Fáze 1).
- Volitelně lehký link-check. Žádné CI.

## Deploy

Lokálně `npm run build` → výstup `dist/` zkopírovat na interní host (stejný ruční postup jako u Fáze 1).

## Známá rozhodnutí

- **Detailová stránka vzniká pro každý event v `src/events/`, včetně nadcházejícího.** Detail nadcházejícího eventu má tedy živou URL `/archiv/<slug>/` ještě před konáním. Není nikde prolinkovaná (archiv vypisuje jen minulé eventy) a po konání se z ní stane korektní archivní záznam. Vědomě akceptováno — drží konfiguraci nejjednodušší.
- **Soubory eventů se jmenují `YYYY-MM-DD-<slug>.md`, ale `<slug>` musí být unikátní napříč soubory** (ne jen datum), protože Eleventy `fileSlug` odstraňuje datovou předponu — jinak kolidují permalinky.

## Mimo rozsah (Fáze 2 neřeší)

- Přihlašování / autentizace.
- Vlastní real-time hlasování přímo na webu.
- Automatické párování přihlášek do programu (delegace zůstává ruční).
- Self-hosting open-source alternativy k Slidu.
