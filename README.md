# Bu i Gloppen

Ei oversikt over butikkar og bedrifter i Gloppen – for folk som bur her, og for dei som nettopp har flytta hit.

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
  "kategori": "mat-og-servering",
  "stad": "Sandane",
  "kortSkildring": "Ferskt brød og kaker kvar dag.",
  "skildring": "Lengre tekst om bedrifta (valfri).",
  "adresse": "Gata 1, 6823 Sandane",
  "telefon": "+47 00 00 00 00",
  "epost": "post@example.no",
  "nettstad": "https://example.no",
  "opningstider": "Måndag–fredag 8–16",
  "stikkord": ["brød", "kaker"]
}
```

- **Obligatoriske felt:** `id`, `namn`, `kategori`, `stad`, `kortSkildring`. Resten er valfrie.
- **`kategori`** og **`stad`** må vere ein av verdiane i [`src/app/models/bedrift.ts`](src/app/models/bedrift.ts).
- **`id`** vert brukt i adressa (`/bedrift/sandane-bakeri`) og kan berre innehalde a–z, 0–9 og bindestrek.
- Oppføringane med `"eksempel": true` er oppdikta døme. Slett dei når ekte bedrifter er lagde inn.

`npm test` sjekkar at fila er gyldig (unike id-ar, kjende kategoriar og stader).

## Deling med Visit Gloppen

[visit-gloppen.no](https://www.visit-gloppen.no) er laga i Wix. Koden her kan ikkje flyttast inn i Wix, men **dataa** kan:

```bash
npm run eksport:csv
```

skriv `dist/bedrifter.csv` (utan døme-oppføringane). CSV-fila kan importerast i Wix CMS som ei samling.

## Kommandoar

| Kommando | Kva han gjer |
| --- | --- |
| `npm start` | Utviklingsserver på port 4200 |
| `npm run build` | Produksjonsbygg til `dist/buigloppen/browser` |
| `npm test` | Einingstestar (Vitest) |
| `npm run eksport:csv` | Eksporterer bedriftene til CSV |

## Publisering

Prosjektet er sett opp for Vercel (sjå `vercel.json`). Kopla repoet til eit Vercel-prosjekt, eller køyr `vercel` frå denne mappa.
