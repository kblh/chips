# Tips & Chips — jednostránkový web (design / spec)

**Datum:** 2026-06-03
**Stav:** Schváleno k implementaci

## Cíl

Jednostránkový informační web (statická vizitka) pro interní firemní event **Tips & Chips**
(TIPS · TRICKS · HACKS · NEWS). Web představí, co event je, kdy a pro koho se koná, jak probíhá,
jak funguje nábor řečníků a hodnocení. Žádné interaktivní funkce (přihlašování, hlasování) — ty se
řeší mimo web.

## Rozsah

**V rozsahu:**
- Jedna HTML stránka s osmi sekcemi (viz níže)
- Animované logo v hero sekci (CSS animace)
- Světlý / tmavý motiv s ručním přepínačem + respektem k systémovému nastavení
- Plně responzivní, mobile-first
- Český obsah (logo a claim zůstávají anglicky)

**Mimo rozsah (YAGNI):**
- Žádný build systém, framework ani bundler
- Žádný backend, žádné formuláře
- Žádné CTA / přihlašování / hlasování přímo na webu
- Žádná analytika ani cookie lišty

## Architektura a soubory

```
index.html      — sémantická struktura, jedna stránka, inline SVG logo
styles.css      — veškerý vzhled; CSS proměnné, light/dark, layout (flex/grid), animace
theme.js        — ~20 řádků: detekce prefers-color-scheme, přepínač, localStorage
```

- **Logo** je inline SVG přímo v `index.html` (nutné kvůli CSS animaci jednotlivých částí).
  Vychází z dodaného `doc/zadani/tricks_and_chips_light_dark.html` — existují obě barevné
  varianty (light/dark), přepínají se podle aktivního motivu.
- **Font:** Alfa Slab One z Google Fonts (na nadpisy a logo). Tělo textu systémový sans-serif stack.
- **Bez závislostí** kromě Google Fonts.

## Sekce (pořadí shora dolů)

Jeden vystředěný sloupec, max. šířka obsahu ~720 px, sekce se střídavě tónují (krémová ↔ o odstín
tmavší v light; obdoba v dark).

1. **Hero** — inline SVG logo + claim „TIPS · TRICKS · HACKS · NEWS". Vpravo nahoře přepínač motivu.
   Animace loga: *sestavení při načtení → trvalý ambient* (detail níže).
2. **Co je Tips & Chips** — krátký úvodní odstavec o eventu a jeho myšlence (vzdělávací,
   napříč rolemi, sdílení tipů a triků).
3. **Kdy a kde** — termín *každé druhé úterý 16:00–17:00*, forma *onsite + online (Google Meet)*,
   pozn. *nenahrává se*. Prezentováno jako pár řádků s ikonami.
4. **Pro koho** — cílíme na T-shape: všechny role včetně UX/UI a PM, nejen FE/BE. Krátký claim + výčet rolí.
5. **Formát & obsah** — ~5 bloků po 10 min. Témata jako **mřížka dlaždic**:
   AI tipy & triky · novinky ve webovém vývoji · nové nástroje a služby · triky a postupy (na
   projektech i jinde) · life hacks (i nedigitální). Na mobilu se mřížka zalomí do jednoho sloupce.
6. **Řečníci & sloty** — jak funguje nábor: před každým eventem se nadelegují řečníci, ~5 slotů
   po 10 min, delší příspěvek = víc slotů.
7. **Hodnocení & ceny** — na konci eventu se hlasuje o nejlepší příspěvek; vítěz dostane
   Prosecco nebo čokoládu. Prezentováno jako **zvýrazněný box**.
8. **Patička** — minimální vizuální uzávěr (např. claim / rok). Bez CTA.

## Motiv (light / dark)

- Barvy z dodaného loga jako CSS proměnné v `:root`, tmavá varianta přes `[data-theme="dark"]`.
- **Light:** pozadí `#FAEEDA`, text `#412402`, akcenty `#EF9F27` / `#BA7517`, jemné `#854F0B`.
- **Dark:** pozadí `#111111`, akcenty `#FAC775` / `#EF9F27`, hnědé tóny `#412402`.
- **Chování přepínače:**
  1. Při prvním načtení se motiv řídí `prefers-color-scheme`.
  2. Ruční přepínač (tlačítko vpravo nahoře v hero) přepne motiv a uloží volbu do `localStorage`.
  3. Při dalších návštěvách má uložená volba přednost před systémovým nastavením.
- Logo reaguje na motiv: jedno inline SVG, jehož `fill`/`stroke` jsou navázané na CSS proměnné
  palety. Přepnutí motivu (změna proměnných) automaticky překreslí logo do správných barev —
  není potřeba druhá kopie SVG.

## Animace loga (hero)

Schválená kombinace **A → B**, čistě CSS `@keyframes`:

1. **Fáze sestavení (jednorázově při načtení):**
   - „čip" (trojúhelník) naskočí se scale + lehkou rotací (~0,7 s),
   - „síť" (uzly a spoje) se rozsvítí (fade-in, ~0,7 s zpožděně),
   - jiskřičky popnou (scale, ~1,1 s zpožděně),
   - textová část (TRICKS & CHIPS) vyjede zespodu s fade-in (~1,0 s zpožděně).
2. **Fáze ambientu (po dosednutí, nekonečně):**
   - celé logo se jemně vznáší (translateY bob, ~3,4 s),
   - uzly sítě pulzují v opacitě (~1,8 s),
   - jiskřičky blikají (twinkle, fázově posunuté).

- Sekce pod hero můžou mít jemné odhalení při scrollu (fade-in) — taktéž CSS.
- **`prefers-reduced-motion: reduce`**: všechny animace vypnuté, logo i sekce rovnou ve finálním stavu.

## Responzivita

- Mobile-first. Jeden sloupec na všech šířkách; obsahový sloupec se centruje a omezuje max šířkou.
- Mřížka témat (sekce 5): vícesloupcová na desktopu, jeden sloupec na mobilu (CSS Grid + `auto-fit`/breakpoint).
- Velikosti písma a odsazení škálované pro malé displeje (logo i nadpisy se zmenší).

## Přístupnost

- Sémantické HTML: `<header>`, `<main>`, `<section>` s nadpisy, `<footer>`.
- Dostatečný kontrast textu v obou motivech.
- Viditelné focus stavy, ovladatelnost klávesnicí.
- Přepínač motivu jako `<button>` s `aria-label` a `aria-pressed`.
- SVG logo s `role="img"` a `<title>` / `aria-label`.
- Respekt k `prefers-reduced-motion`.

## Kritéria hotovo

- Stránka se otevře jako statický `index.html` bez serveru/buildu.
- Všech osm sekcí je přítomných s odpovídajícím obsahem.
- Hero logo se animuje (sestavení → ambient) a respektuje reduced-motion.
- Přepínač light/dark funguje, volba přežije reload, výchozí stav respektuje systém.
- Layout je čitelný a nerozbitý od ~320 px do desktopu.
- Validní, sémantické HTML; žádné chyby v konzoli.
