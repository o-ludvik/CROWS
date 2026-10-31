# Changelog GDD: v0.1 → v0.2

Tento changelog popisuje, co se má změnit v `GDD.md` (Demo GDD, verze 0.1). Čísla sekcí odkazují na současný GDD. GDD je psaný anglicky, takže nový text do GDD se píše anglicky ve stejném stylu; veškerý herní text zůstává česky.

## Přehled změn

1. **Tři dny místo jednoho.** Demo trvá 3 herní dny, stav se mezi dny přenáší.
2. **Stoly přibývají.** 1. den jeden stůl, 2. a 3. den dva stoly.
3. **Barevné kódování svitků a výstřižků.** Barva podle království nebo quest linky, ikona království; výstřižky z konverzace mají ikonu hosta a jeho království.
4. **Lounge.** Nová místnost vpravo od hlavního pohledu; ubytovaní hosté s follow-up konverzací v ní ráno čekají a hráč je může pozvat k pultu.
5. **Prázdná bublina na výstřižek.** Některé odpovědi v konverzaci se vybírají přetažením výstřižku; výstřižky z různých zdrojů o stejném tématu umožňují přidat se na něčí stranu.
6. **Ranní reset stresu.** Stres se každé ráno vrací na 0.

Výstřižky tím přestávají být čistě paměťová pomůcka: hra je čte v konverzačních bublinách. Nástěnka zůstává bez herního dopadu.

---

## Změny po sekcích

### Hlavička

- Verze `0.1 · one in-game day` → `0.2 · three in-game days, built for playtesting the core loop`.

### 1. Purpose

- Úvodní věta: demo pokrývá **tři** dny, ne jeden.
- Otázka 1 (Desk cutouts): doplnit, že výstřižky se teď používají i v konverzaci (prázdná bublina), a ptát se, jestli je to zábavné a čitelné.
- Otázka 6 (Stress): doplnit ranní reset.
- Nové otázky:
  - **Colour coding.** Pomáhá barva a ikona rychle poznat, odkud informace je a k čemu patří?
  - **Cutout replies.** Je přetahování výstřižku do prázdné bubliny srozumitelné a dává volba „čí verzi šířím“ pocit rozhodnutí?
  - **Lounge.** Je lounge objevitelná a je pozvání hosta k pultu zajímavé rozhodnutí (kdy ho pozvat, koho nechat odejít)?
  - **Multi-day.** Funguje přenos stavu mezi dny a přibývání stolů jako pocit postupu?

### 2. Setting

- Bez věcných změn. Odstavec o placeholder obsahu nechat, jen odkázat na nové zadání obsahu v sekci 17.

### 3. Platform and technology

- Bez změn ve stacku. Ponechat „no saves“: tři dny běží v paměti v jedné session.
- **Presentation**: mezi povolené pohyby přidat horizontální posun horního pásu do lounge a zpět (stejný ~300 ms slide jako u nástěnky) a krátké „odskočení“ odmítnutého výstřižku zpět na původní místo.
- Pokud repozitář nasazuje build na GitHub Pages (demo běží na `o-ludvik.github.io/CROWS/`), zmínit to vedle `npm run dev -- --host` a nerozbít `base` ve Vite configu.

### 4. Day flow

Přepsat stavový automat:

```
TITLE ─► [ MORNING/DESK ─► DAY (conversations, seating, lounge) ─► NIGHT ─► SUMMARY ] × 3 ─► END
                ▲                                                               │
                └──────────────── "Další den" (po dnech 1 a 2) ─────────────────┘
END: závěrečné shrnutí + "Hrát znovu" (reset na den 1)
```

- **MORNING/DESK:** reset stresu na 0, na stůl přibudou nové svitky daného dne, staré svitky, výstřižky a nástěnka zůstávají. V lounge se objeví hosté s follow-up konverzací (sekce Lounge). Hráč klikne „Otevřít hospodu“.
- **DAY:** fronta hostů daného dne přichází jeden po druhém (konverzace → usazení). Kdykoli během dne může hráč přepnout do lounge a pozvat hosta k pultu (předběhne aktuálního hosta).
- **Konec dne:** když je fronta prázdná a nikdo není u pultu, objeví se v portrétové oblasti tlačítko „Zavřít hospodu“. Hráč tak může před koncem dne ještě zajít do lounge. Teprve kliknutí na „Zavřít hospodu“ vede do NIGHT. Hosté, kteří zůstali v lounge nepozvaní, odcházejí (zapíše se do event logu a jde podmínkovat ve shrnutí).
- **NIGHT:** ubytování všech hostů, kteří byli ten den usazeni (fronta + pozvaní z lounge).
- **SUMMARY:** shrnutí dne. Po dnech 1 a 2 tlačítko „Další den“, po 3. dni závěrečné shrnutí dema a „Hrát znovu“.
- Desk je interaktivní v MORNING i během konverzací; neinteraktivní pod overlayem usazování.

### 5. Pub screen layout

- Horní pás se rozšiřuje o **lounge** napravo:

| Region | Strip x | w | Obsah |
|---|---|---|---|
| Corkboard | 0 | 960 | beze změny |
| Portrait area | 960 | 600 | beze změny |
| Meters panel | 1560 | 420 | beze změny |
| Chat panel | 1980 | 900 | beze změny |
| Lounge | 2880 | 1920 | nová místnost (sekce 7a) |

  Hlavní pohled končí na x = 2880 (960 + 1920), lounge na něj navazuje. Pokud se hodnoty v kódu od GDD liší, napojit lounge na skutečnou pravou hranu hlavního pohledu.
- Tři pozice pásu: nástěnka (translate 0), hlavní pohled (−960), lounge (−2880). Šipka vlevo v hlavním pohledu otevírá nástěnku, **šipka vpravo** přepíná do lounge, v lounge **šipka vlevo** vrací do hlavního pohledu. Desk zůstává viditelný ve všech třech pozicích.

### 6. Desk, scrolls and cutouts

**6.1 Scrolls**
- Svitky jsou per-day: každé ráno přibudou svitky daného dne (počet daný daty, ne nutně tři). Staré svitky zůstávají, dokud je hráč nevyhodí.
- Svitek má barvu a ikonu (sekce 6.6). Ikona království se zobrazuje na sbaleném svitku i v readeru.
- Odstranit „No new scrolls arrive during the day“ jen pokud to data nastaví jinak; výchozí stav: během dne nové svitky nepřicházejí.

**6.3 Cutouts**
- Výstřižek přebírá barvu a ikonu ze svého zdroje (sekce 6.6).
- Výstřižek z konverzace má ikonu hosta (malý portrét) a ikonu jeho království. Dokud hráč nezná frakci hosta, je místo ikony království otazník; po `#reveal:faction` se ikona na existujících výstřižcích aktualizuje.
- Tooltip zdroje zachovat, rozšířit o quest linku: např. „Zdroj: Svitek – Království A · Linka: Požár“.
- Větu „Cutouts have no effect on game state…“ nahradit: výstřižky čte konverzační systém přes prázdné bubliny (sekce 7.5). Kromě toho nemají jiný herní efekt.
- Výstřižky a nástěnka přetrvávají mezi dny, reset až při „Hrát znovu“.

**6.5 Corkboard**
- Rozložení a nitě přetrvávají přes všechny tři dny, reset při „Hrát znovu“.
- Nástěnka sama dál nemá herní efekt. Výstřižek z nástěnky ale do bubliny přetáhnout nejde (chat není při otevřené nástěnce vidět); přetahuje se ze stolu.

**6.6 Colour coding (nová podsekce)**
- Každé království má v datech `color` a `icon`. Každá quest linka má `id`, `name`, `color` (quest linky nemají ikonu).
- Pravidlo barvy: pokud segment/řádek patří do quest linky, má barvu quest linky; jinak barvu království. Ikona království se ukazuje vždy, když je zdroj z království (i u quest-linkového výstřižku). Výstřižek bez království i quest linky má neutrální papír.
- Barva se aplikuje jako barevný okraj/proužek a jemný tón papíru; text musí zůstat čitelný.
- Na svitku: barva celého svitku = království; jednotlivé články nebo segmenty mohou mít quest linku a v readeru se tak zvýrazní.

### 7. Conversations

**7.1 Opening and closing**
- Beze změny pro hosty z fronty. Pro hosta pozvaného z lounge stejné chování (pozdrav enginu + Ink + závěrečná věta + usazení). Pozdrav pro follow-up může být samostatný řetězec (`greetingReturning`, např. „Á, vy jste tu ještě. Co pro vás můžu udělat?“).

**7.2 Chat panel**
- Doplnit renderování **slotové bubliny** (sekce 7.5) mezi tlačítky odpovědí.
- Gated choices: mezi synchronizované proměnné přidat `day` (číslo dne 1–3).

**7.3 Cuttable guest lines**
- `#cut` může nést téma a tvrzení: `#cut:<topic>:<claim>` a volitelně `#quest:<questId>`. Bez parametrů funguje jako dřív (výstřižek bez tématu, do slotu nepasuje).

**7.5 Cutout reply slots (nová podsekce)**
- Odpověď může být **slot**: místo textu je prázdná bublina se štítkem tématu (např. „Kdo za tím stojí?“). Hráč do ní přetáhne výstřižek ze stolu.
- Každý výstřižek nese volitelně `topic` a `claim` (ze scrolls.json nebo z `#cut` tagu). Více zdrojů může mít stejné `topic` s různými `claim` (např. téma `fire_culprit`, tvrzení `k2_soldiers` / `k3_smugglers` / `accident`).
- V Inku je slot skupina voleb označená tagy, např.:
  ```ink
  * [Vojáci z Béčka.] #slot:fire_culprit:k2_soldiers
      ...
  * [Pašeráci z Céčka.] #slot:fire_culprit:k3_smugglers
      ...
  * [Nikdo, byla to nehoda.] #slot:fire_culprit:*
      ...
  ```
  Engine slotové volby nevykreslí jako tlačítka; místo nich ukáže jednu prázdnou bublinu pro dané téma. Po přetažení výstřižku najde volbu se shodným `claim`; pokud není, použije volbu s `*` (libovolný výstřižek k tématu); pokud ani ta není, výstřižek odmítne.
- Po přijetí se vybraná volba vloží do chatu jako hospodského bublina s malým štítkem výstřižku (barva + ikona zdroje), aby bylo vidět, „čí info šíří“. Výstřižek zůstává na stole (nespotřebovává se) a vrací se na původní místo.
- Výstřižek s jiným nebo žádným tématem: bublina zčervená, výstřižek odskočí zpět, nic se nevybere.
- Slot může stát vedle běžných textových voleb (hráč nemusí výstřižek použít). Pokud je ve skupině jen slot a hráč nemá vhodný výstřižek, musí Ink nabídnout i běžnou volbu (konvence pro autory, kontrolovat v obsahu).
- Efekty (afinita k království, jehož verzi hráč šíří, stres) jsou v Inku v příslušné větvi jako dosud (`#aff`, `#stress`).
- Engine zapíše do event logu, který výstřižek (zdroj, tvrzení) byl použit; do Ink proměnné lze uložit stranu, např. `~ sided_with = "k2"`.
- Technicky: tagy na volbách (`choice.tags`) vyžadují dostatečně novou verzi inkjs/Ink. Ověřit v repozitáři; pokud nejsou podporované, použít ekvivalentní konvenci v textu volby a popsat ji v GDD.

### 7a. Lounge (nová sekce)

- Místnost napravo od hlavního pohledu (sekce 5). Pozadí `lounge_bg.png`, hosté jako klikatelné portréty u stolků/lavic (2–4 místa).
- **Kdo se objeví:** ráno dne N host, který (a) minulou noc dostal postel a (b) má pro den N definovanou follow-up konverzaci (`days.json`, sekce 14.9), případně s podmínkou. Den 1 je lounge prázdná.
- **Pozvání:** klik na hosta → malá nabídka „Pozvat k pultu“ (nebo přímo, rozhodnout podle UX). Pozvat lze jen při otevřené hospodě a mimo overlay usazování.
- **Předběhnutí:** pozvaný host jde okamžitě k pultu. Pokud tam stojí host uprostřed konverzace, jeho konverzace se pozastaví: uloží se stav Ink příběhu (`story.state.toJson()`) a chat log. Pohled se přepne do hlavního pohledu, proběhne plnohodnotná konverzace a usazení pozvaného hosta, pak se původní host vrátí a konverzace pokračuje tam, kde skončila (obnovený log i stav). Pokud je pult prázdný, pozvaný host prostě přijde. Nejvýš jedna pozastavená konverzace najednou: během konverzace s pozvaným hostem je pozvání dalšího zablokované.
- **Odchod:** nepozvaní hosté v lounge při „Zavřít hospodu“ odchází, nejsou na noční obrazovce a zapíše se `leftLounge`.
- Hosté v lounge mají tooltip se jménem/frakcí („???“ pokud neodhaleno – ale z předchozího dne bývá jméno známé).
- Při přítomnosti hosta v lounge ukazuje šipka do lounge malý odznak s počtem čekajících.

### 8. Guests

- Místo náhodného losu 3 z 5: **hosté jsou rozpisem po dnech** v `days.json`. Každý den má seznam hostů ve frontě (volitelně `shuffle: true` pro náhodné pořadí) a seznam follow-upů pro lounge.
- Host může přijít víc dní. Afinita hosta, odhalení jména/frakce a Ink proměnné přetrvávají. Doporučeno jeden Ink soubor na hosta s uzly pro jednotlivé návštěvy (`day1`, `followup_day2`, …) a jeden perzistentní `Story` objekt (resp. uložený stav) na hosta po celé demo, aby proměnné přetrvaly.
- Počet hostů za den nesmí přesáhnout počet míst u stolů toho dne (včetně případných pozvaných z lounge); kontrolovat validací dat při startu.

### 9. Affinity and stress meters

- **Stres:** začíná na 0 a **každé ráno se resetuje na 0** (zapíše se do event logu jako `morning reset`). Shrnutí dne čte stres na konci dne.
- Kingdom a guest metry přetrvávají přes všechny dny.
- Meters panel: zobrazuje hosty, kteří ten den přišli (fronta + lounge), v pořadí příchodu. Hosté z předchozích dnů, kteří nepřišli, se nezobrazují (v debug panelu ano).
- Nový zdroj změny afinity: volba ve slotu (efekty jsou v Inku, technicky stejné `#aff`).

### 10. Seating

- **Počet stolů podle dne** z `days.json` (`tables: 1 | 2`). Den 1 jen Stůl 1 (4 místa), dny 2–3 oba stoly. Místa se každé ráno vyprázdní.
- Minimapa i seating overlay ukazují jen dostupné stoly; nedostupný stůl buď skrýt, nebo zobrazit jako „zatím nemáte“ (rozhodnout dle vzhledu, nesmí jít kliknout).
- Pairing a usazování beze změny. „Seating is final until the next day“ platí dál.

### 11. Night management

- Řádky pro všechny hosty usazené dnes (fronta + pozvaní z lounge). Ne pro hosty, kteří odešli z lounge.
- Výsledky noci se ukládají per den (`nightHistory[day]`), aby šlo určit, kdo se ráno objeví v lounge.
- `night.json` může mít volitelně přepis podle dne (`"day2": { "bed": …, "kick": … }`), jinak platí výchozí.

### 12. Summary

- Shrnutí po každém dni (nadpis „Shrnutí dne {n}“). Po dnech 1–2 tlačítko „Další den“ (fade do dalšího rána), po 3. dni „Konec dema“ + závěrečné bloky + „Hrát znovu“.
- Bloky v `summary.json` dostávají volitelné pole `day` (číslo nebo `"final"`); blok bez `day` se vyhodnocuje každý den.
- Nové podmínky (viz 14.7): `day`, `leftLounge`, `invitedFromLounge`, `usedClaim`.
- Podmínky `outcome`, `roommates`, `sameTable` se vyhodnocují pro aktuální den; volitelně s parametrem dne pro odkaz na minulost (např. `{ "outcome": ["mira", "kick", 1] }`).

### 13. Title, transitions and debug

- **Transitions:** přidat summary → další ráno (fade), hlavní pohled ↔ lounge (slide, ne fade), návrat pozastaveného hosta k pultu (fade portrétu).
- **Debug panel:** doplnit aktuální den, počet stolů, obsah lounge, pozastavenou konverzaci (id hosta), historii nocí, poslední použité výstřižky ve slotech. Užitečné (pokud nebude rozbíjet „no controls“ pravidlo, označit jako výjimku): tlačítko/klávesa „skok na den N“ pro rychlé testování.

### 14. Data and content formats

**14.1 Folder structure**
- Přidat `days.json`, `quests.json`, komponenty `Lounge`, `CutoutSlot`, `IconBadge`, engine `slots.ts`, `days.ts`. Obrázky ikon v `public/art/icons/`.

**14.2 kingdoms.json**
```json
{ "id": "k1", "name": "Království A", "startAffinity": 0, "color": "#8b2e2e", "icon": "art/icons/k1.png" }
```
`guests.json`: přidat `icon` (malý portrét, např. `art/icons/guest_mira.png`; pokud chybí, zmenšený portrét).

**14.3 scrolls.json**
- Svitek má `day` (kdy přijde). Článek nebo segment může mít `quest`. Cuttable segment může mít `topic` a `claim`:
```json
{ "id": "k1_d1_s1", "text": "Svědci viděli prchat muže v barvách Království B.", "cut": true,
  "quest": "fire", "topic": "fire_culprit", "claim": "k2_soldiers" }
```

**14.4 Ink tag reference** – doplnit:

| Tag | Význam |
|---|---|
| `#cut:<topic>:<claim>` | Výstřižek s tématem a tvrzením |
| `#quest:<questId>` | Řádek patří do quest linky (barva) |
| `#slot:<topic>:<claim>` / `#slot:<topic>:*` | Tag na volbě: volba se vybírá výstřižkem |

Synchronizovaná proměnná navíc `VAR day`. Uzly pro návštěvy: `=== day1 ===`, `=== followup_day2 ===` apod.; engine skočí na uzel z `days.json`.

**14.5 pairings.json** – beze změny.

**14.6 night.json** – volitelné přepisy po dnech (viz 11).

**14.7 summary.json** – pole `day` u bloku a nové podmínky:

| Podmínka | Význam |
|---|---|
| `{ "day": 2 }` | Aktuální den je 2 |
| `{ "leftLounge": "mira" }` | Host dnes odešel z lounge nepozván |
| `{ "invitedFromLounge": "mira" }` | Host byl dnes pozván z lounge |
| `{ "usedClaim": ["fire_culprit", "k2_soldiers"] }` | Hráč (kdykoli dosud) použil výstřižek s tímto tvrzením ve slotu |

**14.8 strings.cs.json** – doplnit minimálně:
```json
{
  "closePub": "Zavřít hospodu",
  "nextDay": "Další den",
  "endOfDemo": "Konec dema",
  "dayLabel": "Den {n}",
  "summaryHeading": "Shrnutí dne {n}",
  "loungeTitle": "Lounge",
  "inviteToBar": "Pozvat k pultu",
  "greetingReturning": "Á, vy jste tu ještě. Co pro vás můžu udělat?",
  "slotPlaceholder": "Přetáhněte sem výstřižek",
  "slotRejected": "Tohle sem nepatří.",
  "sourceQuest": "Linka: {quest}",
  "tableLocked": "Zatím nemáte"
}
```

**14.9 days.json (nové)**
```json
[
  { "day": 1, "tables": 1, "scrolls": ["k1_d1", "k2_d1", "k3_d1"],
    "queue": [ { "guest": "mira", "knot": "day1" }, { "guest": "bohdan", "knot": "day1" } ],
    "shuffle": false, "lounge": [] },
  { "day": 2, "tables": 2, "scrolls": ["k1_d2", "k2_d2"],
    "queue": [ { "guest": "eliska", "knot": "day2" } ],
    "lounge": [ { "guest": "mira", "knot": "followup_day2", "when": { "inkVar": ["mira", "told_secret", true] } } ] }
]
```
Host z `lounge` se objeví jen tehdy, když minulou noc dostal postel a případná podmínka `when` platí.

**14.10 quests.json (nové)**
```json
[ { "id": "fire", "name": "Požár v průsmyku", "color": "#c27a1a" } ]
```

### 15. Game state

Doplnit do sketche:
```ts
type Phase = "title" | "desk" | "conversation" | "seating" | "dayEnd" | "night" | "summary" | "end";
type View = "cork" | "main" | "lounge";   // nahrazuje corkOpen: boolean

day: 1 | 2 | 3;
view: View;
tableCount: number;
queue: { guest: string; knot: string }[];
loungeGuests: { guest: string; knot: string }[];
invitedFromLounge: string[];               // dnes
leftLounge: string[];                      // dnes
pausedConversation: { guestId: string; inkState: string; chatLog: ChatLine[] } | null;
todayGuests: string[];                     // fronta + pozvaní, v pořadí příchodu
nightHistory: Record<number, Record<string, NightOutcome>>;
usedClaims: { topic: string; claim: string; cutoutId: string; day: number; guestId: string }[];
inkStates: Record<string, string>;         // perzistentní stav Ink příběhu per host
```
`CutoutItem` dostává `topic?`, `claim?`, `quest?`; `source` u konverzace odkazuje na hosta (ikona hosta + království se dopočítá). `ChatLine` dostává `usedCutout?` pro štítek ve slotové odpovědi.

### 16. Placeholder art

Přidat:

| Soubor | Velikost | Použití |
|---|---|---|
| `lounge_bg.png` | 1920×810 | Pozadí lounge |
| `lounge_arrow.png` | ~48×200 | Šipka do lounge / zpět |
| `icons/k1.png` … `k3.png` | 48×48 | Ikony království |
| `icons/guest_<id>.png` | 48×48 | Ikony hostů (fallback zmenšený portrét) |
| `icons/unknown.png` | 48×48 | Otazník pro neodhalenou frakci |
| `cutout_slot.png` | ~400×80 | Prázdná bublina pro výstřižek (může být čisté CSS) |

### 17. Placeholder content to generate

Přepsat celé zadání: obsah je nově 3denní příběh (viz prompt pro Claude Code). Minimální požadavky:
1. Tři království s barvou a ikonou, alespoň dvě quest linky.
2. Svitky na každý den; alespoň jedno téma, ke kterému existují výstřižky s různými tvrzeními z ≥ 3 zdrojů (svitky různých království + konverzace).
3. Každý den alespoň jeden slot v konverzaci; aspoň jeden slot, kde volba tvrzení posune afinitu ke konkrétnímu království.
4. Den 1 jen tolik hostů, aby se vešli k jednomu stolu (max 4), ideálně 3.
5. Dny 2 a 3 mají follow-upy v lounge; aspoň jeden host, jehož ignorování v lounge má dopad ve shrnutí.
6. Shrnutí po každém dni + závěrečné shrnutí; všechny typy podmínek použity.
7. Všechny tagy ze 14.4 použité aspoň jednou.

### 18. Out of scope

- Odstranit „more than one day“.
- Přidat: více než 3 dny; ukládání mezi sessions; spotřebovávání výstřižků; dopad nástěnky na hru; další místnosti kromě lounge; mluvení s hosty přímo v lounge (jen pozvání k pultu).
- Upravit: „hint or glow systems that point at relevant cutouts“ zůstává mimo scope. Slot ukazuje jen téma, ne který výstřižek pasuje.

### 19. Acceptance checklist

Doplnit:
- [ ] Hra projde 3 dny: ráno → den → noc → shrnutí → „Další den“ ×2, po 3. dni závěrečné shrnutí a „Hrát znovu“ vrací na den 1 s čistým stavem.
- [ ] Stres je každé ráno 0; ostatní metry, výstřižky, nástěnka a odhalení přetrvávají.
- [ ] Den 1 má jen jeden stůl, dny 2–3 dva; nedostupný stůl nejde vybrat.
- [ ] Svitky i výstřižky mají správnou barvu (quest linka > království) a ikonu království; výstřižky z konverzace mají ikonu hosta a království / otazník do odhalení frakce.
- [ ] Šipka vpravo přepne do lounge, šipka vlevo zpět; desk zůstává vidět.
- [ ] V lounge se ráno objeví jen hosté, kteří minulou noc spali v posteli a mají follow-up pro daný den.
- [ ] Pozvaný host předběhne aktuálního; pozastavená konverzace se po jeho usazení obnoví se stejným logem a stavem.
- [ ] Nepozvaní hosté v lounge odejdou po „Zavřít hospodu“ a nejsou na noční obrazovce.
- [ ] Slotová bublina přijme výstřižek se správným tématem, vybere volbu podle tvrzení (nebo `*`), odmítne nepasující; výstřižek se nespotřebuje.
- [ ] Použité tvrzení je v event logu a ve shrnutí ho lze podmínkovat.
- [ ] Debug panel ukazuje den, lounge, pozastavenou konverzaci a historii nocí.

### 20. Open items for the script phase

- Přidat: barvy a ikony království; quest linky a jejich barvy; témata a tvrzení pro sloty; follow-up konverzace po dnech; jestli hosté mohou zůstat v lounge víc než jeden den.
