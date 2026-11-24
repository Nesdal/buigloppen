# Bu i Gloppen

Ei oversikt over butikkar, bedrifter og aktivitetar i Gloppen – for folk som bur her, og for dei som nettopp har flytta hit.

Bygd med [Angular](https://angular.dev) 21 og laga for å køyrast på [Vercel](https://vercel.com).

## Kom i gang

Krev Node.js 20.19+ eller 22.12+.

```bash
npm install
npm start
```

Opne <http://localhost:4200>.

> Har du npm 8 og får feilen `Cannot read properties of null (reading 'edgesOut')`, bruk ein nyare npm:
> `npx npm@11 install`

## Legg til eller endre bedrifter

All bedriftsinformasjon ligg i [`src/app/data/bedrifter.json`](src/app/data/bedrifter.json). Kvar bedrift ser slik ut:

```json
{
  "id": "sandane-bakeri",
  "namn": "Sandane Bakeri",
  "type": "butikk",
  "kategori": "mat-og-servering",
  "stad": "Sandane",
  "kortSkildring": "Ferskt brød og kaker kvar dag.",
  "skildring": "Lengre tekst om bedrifta (valfri).",
  "tilbyr": ["Brød", "Kaker", "Bestilling til selskap"],
  "adresse": "Gata 1, 6823 Sandane",
  "telefon": "+47 00 00 00 00",
  "epost": "post@example.no",
  "nettstad": "https://example.no",
  "opningstider": "Måndag–fredag 8–16",
  "stikkord": ["brød", "kaker"],
  "kjelde": "https://example.no/kontakt",
  "sjekka": "2026-11-23"
}
```

- **Obligatoriske felt:** `id`, `namn`, `type`, `kategori`, `stad`, `kortSkildring`, `tilbyr`. Ekte oppføringar skal òg ha `kjelde` og `sjekka`. Resten er valfrie.
- **`type`** er `butikk` (sel varer over disk), `servering` (kafé, restaurant, pub eller bakeri med kafé) eller `bedrift` (alt anna: tenester, overnatting, handverk …). Hotell og gardar der servering berre er ein del av tilbodet står som `bedrift`.
- **`tilbyr`** er korte punkt om kva bedrifta sel eller tilbyr. Dei første fire vert viste på korta i oversikta.
- **`praktisk`** (valfri) er praktisk informasjon for den som skal dit, eitt punkt per tema på forma `"Parkering: Bak bygget, ved inngangen."`. Det som står før kolonet vert utheva. Bruk ikkje semikolon, sidan CSV-eksporten skil punkta med det.
- **`kjelde`** er lenkja opplysningane er henta frå, og **`sjekka`** er datoen dei sist vart kontrollerte. Begge vert viste på sida til bedrifta.
- **`opningstider`** skal berre hentast frå bedrifta si eiga side eller kjeda si butikkside. Er du usikker, lat feltet vere ute.
- **`kategori`**, **`type`** og **`stad`** må vere ein av verdiane i [`src/app/models/bedrift.ts`](src/app/models/bedrift.ts).
- **`id`** vert brukt i adressa (`/bedrift/sandane-bakeri`) og kan berre innehalde a–z, 0–9 og bindestrek.
- Oppføringa med `"eksempel": true` er eit oppdikta døme som døme-aktiviteten «Språkkafé» peikar til. Slett dei saman.

`npm test` sjekkar at fila er gyldig (unike id-ar, kjende kategoriar, typar og stader, og at ekte oppføringar har kjelde og dato).

## Legg til aktivitetar

Aktivitetar og arrangement ligg i [`src/app/data/aktivitetar.json`](src/app/data/aktivitetar.json). Det finst to slag, og dei vert viste på kvar si side:

**Arrangement** skjer på ein bestemt dato, vert viste under **Kva skjer** (`/aktivitetar`) og forsvinn frå lista når dagen er over:

```json
{
  "id": "julekonsert-2026",
  "tittel": "Julekonsert",
  "type": "arrangement",
  "kategori": "kultur",
  "stad": "Sandane",
  "lokale": "Kyrkja",
  "kortSkildring": "Kor og korps syng inn jula.",
  "dato": "2026-12-13",
  "starttid": "18:00",
  "sluttid": "19:30",
  "arrangor": "Sandane skulekorps",
  "pamelding": "https://example.no/billettar"
}
```

**Kampar og stemne** er arrangement med `"kategori": "idrett"`. Dei får ein eigen seksjon øvst under **Kva skjer**, og dei neste vert òg viste på **Trening og fritid**. Legg inn kampar som vanlege arrangement:

```json
{
  "id": "sandane-til-handball-2026-12-06",
  "tittel": "Handball: Sandane – Førde",
  "type": "arrangement",
  "kategori": "idrett",
  "stad": "Sandane",
  "lokale": "Idrettshallen",
  "kortSkildring": "Seriekamp i 4. divisjon.",
  "dato": "2026-12-06",
  "starttid": "15:00",
  "arrangor": "Sandane TIL"
}
```

**Faste aktivitetar** går att, t.d. kvar veke, og vert alltid viste under **Trening og fritid** (`/fritid`). Her høyrer treningar, lag, klubbar, kor og treffpunkt heime:

```json
{
  "id": "sandane-til-turn",
  "tittel": "Turn i Sandane TIL",
  "type": "fast",
  "kategori": "idrett",
  "gren": "Turn",
  "stad": "Sandane",
  "kortSkildring": "Turn og leik for barn.",
  "naar": "Kvar onsdag kl. 17–18",
  "sesong": "September–mai",
  "malgruppe": ["barn"]
}
```

- **`gren`** (valfri) er idretten eller hobbyen, t.d. `Fotball`, `Handball`, `Turn`, `Dart`, `Golf` eller `Kor`. Han vert vist på korta, og øvst på **Trening og fritid** kan ein filtrere på kvar gren. Skriv han likt for alle lag med same idrett, med stor forbokstav. Har eit idrettslag fleire grener, lag éi oppføring per gren.
- Kategorien `hobby` («Hobby og spel») passar for t.d. sjakk, bridge, strikkekafé og modellbygging.

- **Obligatoriske felt:** `id`, `tittel`, `type`, `kategori`, `stad`, `kortSkildring`, og anten `dato` (arrangement) eller `naar` (fast). Ekte oppføringar skal òg ha `kjelde` og `sjekka`.
- **`kategori`** og **`malgruppe`** må vere ein av verdiane i [`src/app/models/aktivitet.ts`](src/app/models/aktivitet.ts). Utan `malgruppe` er aktiviteten open for alle.
- **`malgruppe`** er `barn` (0–12 år), `ungdom` (13–19), `unge-vaksne` (18–39), `vaksne` (18+) eller `seniorar` (65+). Spenna overlappar, så ein på 30 får tilrådd både det som er merkt «unge vaksne» og «vaksne». Merk berre aktivitetar som verkeleg er for ei bestemt gruppe, t.d. julebord for vaksne eller Gloppen U40 for unge vaksne.
- **`bedriftId`** kan peike til ei bedrift i `bedrifter.json`. Då vert det lenkje frå aktiviteten til bedrifta, og aktiviteten vert vist på sida til bedrifta.
- Arrangement får ein knapp for å leggje dei til i kalenderen (`.ics`).
- **Prisar** legg vi ikkje inn, sidan dei endrar seg og fort vert feil.

`npm test` sjekkar òg denne fila (gyldige datoar, klokkeslett, kategoriar, grener og bedrift-id-ar).

### Hent arrangement frå visit-gloppen.no

```bash
npm run import:visit-gloppen
```

hentar komande arrangement frå [arrangementkalenderen på visit-gloppen.no](https://www.visit-gloppen.no/arrangementkalender) og oppdaterer `aktivitetar.json`. Køyr han t.d. ein gong i veka. Det tek eit par minutt, fordi skriptet hentar kvar arrangementsside med ein liten pause imellom.

- Kategori, stad, arrangør og stikkord vert gjetta ut frå tittel og adresse. Rett dei gjerne for hand. Neste import tek vare på det du har endra i `kategori`, `stad`, `lokale`, `malgruppe`, `arrangor`, `bedriftId`, `stikkord`, `skildring` og `pamelding`. Dato, tid, tittel og kort skildring vert alltid oppdaterte frå kjelda.
- Importerte arrangement er dei som har `kjelde` på visit-gloppen.no. Dei som er over eller avlyste, vert fjerna. Andre oppføringar i fila vert ikkje rørte.
- `-- --prov` viser kva som ville endra seg utan å skrive noko. `-- --manader 24` ser lenger attende etter endra arrangementssider (standard 12 månader).
- Nye stader, lokale og arrangørar kan leggjast inn øvst i [`scripts/importer-visit-gloppen.mjs`](scripts/importer-visit-gloppen.mjs).

### Kino og kultursal i Trivselshagen

```bash
npm run import:trivselshagen
```

hentar programmet til Trivselshagen frå [eBillett](https://ebillett.no/trivselshagen/events/daily):

- **Kinoframsyningane** vert skrivne til [`src/app/data/kino.json`](src/app/data/kino.json), gruppert per film med aldersgrense, lengd, omtale, plakat og billettlenkje. Fila vert skriven heilt på nytt kvar gong, så ikkje rediger henne for hand. Programmet vert vist på **`/kino`**, dag for dag eller film for film (`/kino?vis=filmar`).
- **Arrangementa** (konsertar, teater, foredrag i Kultursalen og andre salar) vert lagde inn i `aktivitetar.json` med id `trivselshagen-<eBillett-id>` og billettlenkje i `pamelding`. Same reglar som for visit-gloppen-importen: felt du har retta for hand (`kategori`, `stad`, `lokale`, `malgruppe`, `arrangor`, `bedriftId`, `stikkord`) vert tekne vare på, og arrangement som er over eller borte frå eBillett, vert fjerna.
- Står eit arrangement alt i fila frå ei anna kjelde (same dato og tid, og eit felles ord i tittelen), vert det ikkje lagt inn to gonger. Den gamle oppføringa får berre billettlenkja. Køyr difor dette skriptet etter visit-gloppen-importen, eller køyr begge med `npm run import`.
- Middagsshow som vert selde per bord, vert slått saman til eitt arrangement per kveld.
- Nye salnamn kan leggjast inn i `SALAR` øvst i [`scripts/importer-trivselshagen.mjs`](scripts/importer-trivselshagen.mjs). `-- --prov` viser kva som ville endra seg utan å skrive noko.

## Tips for deg

Sida **For deg** (`/for-deg?alder=30`) tilrår aktivitetar ut frå alderen den besøkjande skriv inn. Ho viser først faste aktivitetar (lag og nettverk) og arrangement som er merkte med ei `malgruppe` som passar alderen, og deretter dei neste arrangementa som er opne for alle. Aktivitetar merkte for andre aldrar vert aldri tilrådde. Jo fleire aktivitetar som har `malgruppe`, jo betre vert tipsa.

## Ting å gjere

Framsida har ein seksjon **Ting å gjere** med symjehallen, Trivselsskogen og kinoen, pluss eit kort til alle kafear og restaurantar. Kva stader som er med, står i [`src/app/data/ting-a-gjere.ts`](src/app/data/ting-a-gjere.ts). Kvar framheving peikar til ei bedrift med `bedriftId`, så opningstider og kontaktinfo vert henta frå `bedrifter.json`. Med `lenkje` går kortet til ei eiga side i staden. Kinokortet går til `/kino` og viser neste film.

## Lokalmat og gardsutsal

Sida **Lokalmat** (`/lokalmat`) viser gardar og produsentar i Gloppen og kvar ein får kjøpt maten. Ho vert laga ut frå `bedrifter.json`: alle bedrifter med feltet `lokalmat` kjem med, same kva kategori dei står i. Ein gard med hytter kan difor stå under overnatting og likevel vere med her.

```json
{
  "id": "tystad-fruktgard",
  "kategori": "lokalmat",
  "lokalmat": ["frukt-og-bar", "drikke"],
  "sal": ["sjolvbetent"],
  "kjopTekst": "Eplemosten får du òg kjøpt hos Bakar Jon.",
  "sesong": "Eple frå september til november"
}
```

- **`lokalmat`** er kva slag mat: `kjot`, `meieri`, `egg`, `frukt-og-bar`, `gront`, `honning`, `fisk`, `drikke`, `bakst` eller `anna`. Det første matslaget avgjer ikonet på kortet.
- **`sal`** er korleis ein får kjøpt han: `gardsutsal` (betent utsal på garden), `sjolvbetent`, `butikk` (vert selt i butikkar), `reko`, `bestilling` eller `marknad`. Gardar med sal på garden kjem først i lista.
- **`kjopTekst`** og **`sesong`** er fri tekst som vert vist på sida til bedrifta.
- Bruk kategorien **`lokalmat`** («Lokalmat og gardsutsal») for bedrifter der mat er hovudsaka. Kafear og bakeri som òg sel lokalmat, står i sin vanlege kategori med `lokalmat`-feltet.
- Verdiane står i [`src/app/models/lokalmat.ts`](src/app/models/lokalmat.ts).
- **Marknader og REKO-ring:** aktivitetar i `aktivitetar.json` med stikkordet `lokalmat`, eller marknader som ein lokalmatprodusent står bak (`bedriftId`), vert viste nedst på lokalmatsida. Legg t.d. inn REKO-ringen som ein fast aktivitet.
- Produsentar melder seg på med knappen «Meld deg på» på sida. Han opnar ei ferdig utfylt GitHub-sak.

`npm test` sjekkar at matslag og salskanalar er kjende, og at alle i kategorien `lokalmat` har `lokalmat`-feltet.

## Oppslag: ny meny, tilbod og anna nytt

Kafear, restaurantar og andre bedrifter kan få vist at dei har noko nytt. Oppslaga ligg i [`src/app/data/oppslag.json`](src/app/data/oppslag.json):

```json
{
  "id": "lauget-vintermeny-2026",
  "bedriftId": "lauget-kaffibar",
  "type": "ny-meny",
  "tittel": "Ny vintermeny",
  "tekst": "Varm suppe og ny kakedisk med sesongbakst.",
  "fra": "2026-11-20",
  "til": "2027-02-28",
  "lenkje": "https://example.no/meny",
  "kjelde": "https://www.facebook.com/..."
}
```

- **`type`** er `ny-meny`, `spesial`, `tilbod`, `nyopna` eller `nyheit` (sjå [`src/app/models/oppslag.ts`](src/app/models/oppslag.ts)).
- Oppslaget vert vist frå og med **`fra`** til og med **`til`**. Utan `til` vert det vist i 30 dagar. Dei første 7 dagane får det eit «Nytt!»-merke.
- Aktive oppslag vert viste under **Nytt og verdt eit besøk** på framsida, på `/nytt`, øvst på sida til bedrifta og som eit merke på bedriftskortet.
- Bedrifter sender inn oppslag med lenkja «send det inn her» på bedriftssida eller knappen på `/nytt`. Ho opnar ei ferdig utfylt GitHub-sak som du legg inn i fila.

`npm test` sjekkar at `bedriftId` finst, at typen er kjend, og at datoane er gyldige.

## Lokale til leige

Sida **Lokale** (`/lokale`) viser grendehus, samfunnshus, kulturhus og selskapslokale ein kan leige, kor mange det er plass til, og kven ein kontaktar. Lista ligg i [`src/app/data/lokale.json`](src/app/data/lokale.json):

```json
{
  "id": "eksempel-grendehus",
  "namn": "Eksempel grendehus",
  "slag": "grendehus",
  "stad": "Nordstranda",
  "bygd": "Rygg",
  "kortSkildring": "Grendehus med sal og kjøkken, mykje brukt til selskap.",
  "plassar": 80,
  "plassarTekst": "ca. 80 ved bord",
  "fasilitetar": ["kjokken", "servise", "scene"],
  "praktisk": ["Servise: til 100 personar."],
  "utleigar": "Eksempel grendalag",
  "kontakt": "Utleigeansvarleg i grendalaget",
  "telefon": "+47 00 00 00 00",
  "epost": "utleige@example.no",
  "booking": "https://example.no/leige",
  "kjelde": "https://example.no/grendehuset",
  "sjekka": "2026-11-24"
}
```

- **Obligatoriske felt:** `id`, `namn`, `slag`, `stad`, `kortSkildring`, `kjelde` og `sjekka`. Resten er valfrie, men ta med kontakt når det finst.
- **`slag`** er `grendehus` (òg samfunnshus og ungdomshus), `kulturhus`, `selskapslokale`, `leirstad`, `bedehus` eller `anna`.
- **`plassar`** er om lag kor mange som får plass ved bord i den største salen, og vert brukt i filteret «Kor mange gjester?». Lokale utan `plassar` fell vekk når nokon filtrerer på storleik. **`plassarTekst`** vert vist i staden for talet når han finst.
- **`fasilitetar`** er `kjokken`, `servise`, `scene`, `lyd`, `prosjektor`, `hc`, `overnatting`, `uteomrade` eller `servering` (mat kan bestillast). Sjå [`src/app/models/lokale.ts`](src/app/models/lokale.ts).
- **Prisar** legg vi ikkje inn, sidan dei endrar seg og fort vert feil.
- **`kontakt`**: bruk helst ei rolle, felles e-post eller bookinglenkje. Namn og telefonnummer til privatpersonar skal berre med når grendalaget sjølv har publisert dei for utleige.
- **`bedriftId`** kan peike til ei bedrift i `bedrifter.json`, t.d. eit hotell, og gjer utleigaren til ei lenkje.
- Utleigarar melder inn lokale med knappen «Meld inn lokale» på sida. Han opnar ei ferdig utfylt GitHub-sak.

`npm test` sjekkar at id-ane er unike, at slag, stader og fasilitetar er kjende, og at alle har kjelde og dato.

## Deling med Visit Gloppen

[visit-gloppen.no](https://www.visit-gloppen.no) er laga i Wix. Koden her kan ikkje flyttast inn i Wix, men **dataa** kan:

```bash
npm run eksport:csv
```

skriv `dist/bedrifter.csv`, `dist/aktivitetar.csv`, `dist/oppslag.csv` og `dist/lokale.csv` (utan døme-oppføringane). CSV-fila kan importerast i Wix CMS som ei samling.

## Kommandoar

| Kommando                       | Kva han gjer                                                       |
| ------------------------------ | ------------------------------------------------------------------ |
| `npm start`                    | Utviklingsserver på port 4200                                      |
| `npm run build`                | Produksjonsbygg med førehandsrendra sider, sitemap.xml og robots.txt i `dist/buigloppen/browser` |
| `npm test`                     | Einingstestar (Vitest)                                             |
| `npm run eksport:csv`          | Eksporterer bedriftene, aktivitetane, oppslaga og lokala til CSV   |
| `npm run import:visit-gloppen` | Hentar komande arrangement frå visit-gloppen.no                    |
| `npm run import:trivselshagen` | Hentar kinoprogrammet og arrangementa i Trivselshagen frå eBillett |
| `npm run import`               | Køyrer begge importane                                             |

## Publisering

Prosjektet er sett opp for Vercel (sjå `vercel.json`). Kopla repoet til eit Vercel-prosjekt, eller køyr `vercel` frå denne mappa.

## Søkjemotorar og deling

- **Førehandsrendering:** `npm run build` lagar ferdig HTML for kvar side, også kvar bedrift og aktivitet (sjå `src/app/app.routes.server.ts`). Søkjemotorar og delingskort på Facebook/Messenger ser då innhaldet utan JavaScript. Lister som avheng av dagens dato (kommande arrangement, kino) viser stoda frå byggedagen til nettlesaren har lasta, så bygg på nytt jamleg, t.d. etter kvar import.
- **Metadata:** tittel, skildring, kanonisk adresse, Open Graph og strukturerte data (schema.org `LocalBusiness`/`Event`) vert sette per side i `src/app/seo.ts`. Skildringa for oversiktssidene står i `data.skildring` i `src/app/app.routes.ts`.
- **Sitemap:** `scripts/lag-sitemap.mjs` lagar `sitemap.xml` og `robots.txt` etter bygginga. Arrangement som er over og døme-oppføringar vert ikkje tekne med.
- **Domene:** adressa står i `NETTSTAD_URL` i `src/app/seo.ts` (no `https://buigloppen.vercel.app`). Byt ho ut når sida får eige domene.
- **Ikon:** `public/favicon.svg` er kjelda. PNG-ane (`apple-touch-icon.png`, `icon-*.png`), `favicon.ico` og `delingsbilete.png` (1200×630) er laga frå han.
