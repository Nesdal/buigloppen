// Hentar komande arrangement frå arrangementkalenderen på visit-gloppen.no og oppdaterer
// src/app/data/aktivitetar.json.
//
// Køyr:  npm run import:visit-gloppen
//        npm run import:visit-gloppen -- --prov        (vis kva som ville endra seg, skriv ikkje)
//        npm run import:visit-gloppen -- --manader 24  (sjå lenger attende i sitemap, standard 12)
//
// Korleis:
// - Kalendersida viser berre dei første arrangementa, så skriptet les òg sitemap-fila over alle
//   arrangementssidene og hentar dei som er endra dei siste månadene. Arrangement som alt er
//   importerte og framleis er komande, vert alltid henta på nytt.
// - Arrangement som er importerte før, får ny dato, tid, tittel og kort skildring frå kjelda.
//   Felt du har retta for hand (kategori, stad, lokale, målgruppe, pris, arrangør, bedriftId,
//   stikkord, skildring, påmelding) vert ikkje overskrivne.
// - Importerte arrangement som ikkje lenger står i sitemap (avlyste/sletta), vert fjerna.
//   Arrangement som er over, vert fjerna. Alt anna i fila vert ikkje rørt.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIL = resolve(rot, 'src/app/data/aktivitetar.json');
const SIDE = 'https://www.visit-gloppen.no';
const KALENDER = `${SIDE}/arrangementkalender`;
const SITEMAP = `${SIDE}/event-pages-sitemap.xml`;
const DETALJ = `${SIDE}/event-details/`;
const PAUSE_MS = 400;

const argv = process.argv.slice(2);
const prov = argv.includes('--prov');
const manaderArg = argv.indexOf('--manader');
const manader = manaderArg >= 0 ? Number(argv[manaderArg + 1]) : 12;
if (!Number.isFinite(manader) || manader <= 0) {
  console.error('--manader må vere eit positivt tal.');
  process.exit(1);
}

// ---------- Tid ----------

const osloDel = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Oslo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** UTC-tid frå Wix → { dato: 'ÅÅÅÅ-MM-DD', tid: 'TT:MM', time: tal } i norsk tid. */
function oslo(iso) {
  const p = Object.fromEntries(osloDel.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return {
    dato: `${p.year}-${p.month}-${p.day}`,
    tid: `${p.hour}:${p.minute}`,
    time: Number(p.hour),
  };
}

function leggTilDagar(iso, dagar) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + dagar);
  return d.toISOString().slice(0, 10);
}

const idag = oslo(new Date().toISOString()).dato;

// ---------- Henting ----------

const vent = (ms) => new Promise((r) => setTimeout(r, ms));

async function hent(url) {
  const svar = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Bu i Gloppen import)' } });
  if (!svar.ok) throw new Error(`${svar.status} for ${url}`);
  return svar.text();
}

/** Finn alle arrangement-objekt i Wix-dataa som ligg innbaka i sida. */
function arrangementISide(html) {
  const m = html.match(/<script[^>]*id="wix-warmup-data"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return [];
  const funne = [];
  const gjennom = (o) => {
    if (Array.isArray(o)) o.forEach(gjennom);
    else if (o && typeof o === 'object') {
      if (typeof o.slug === 'string' && o.scheduling && typeof o.title === 'string') funne.push(o);
      else Object.values(o).forEach(gjennom);
    }
  };
  gjennom(JSON.parse(m[1]));
  return funne;
}

/** slug → lastmod (ÅÅÅÅ-MM-DD) frå sitemap. */
function lesSitemap(xml) {
  const ut = new Map();
  for (const blokk of xml.split('<url>').slice(1)) {
    const loc = blokk.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc?.startsWith(DETALJ)) continue;
    ut.set(loc.slice(DETALJ.length), blokk.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? '');
  }
  return ut;
}

// ---------- Omsetjing til Aktivitet ----------

// Første treff i lokalenamn eller adresse avgjer staden. Rekkjefølgja tel.
const STADER = [
  ['Gimmestad', 'Sørstranda'],
  ['Vereide', 'Vereide'],
  ['Sølvane Gard', 'Kandal'],
  ['Kandal', 'Kandal'],
  ['Hyen', 'Hyen'],
  ['Byrkjelo', 'Byrkjelo'],
  ['Hestenes', 'Hestenesøyri'],
  ['6827 Breim', 'Breim'],
  ['Breim', 'Breim'],
  ['6823 Sandane', 'Sandane'],
  ['Sandane', 'Sandane'],
  ['Sørstranda', 'Sørstranda'],
  ['Nordstranda', 'Nordstranda'],
  ['Gloppen', 'Anna stad i Gloppen'],
];

// Lokalenamn frå Wix som skal kortast ned. null = ikkje eit lokale (berre staden).
const LOKALE = {
  'Gloppen Hotell - by Classic Norway Hotel': 'Gloppen Hotell',
  'Sølvane Gard - overnatting og restaurant': 'Sølvane Gard',
  'Trivselshagen - kultursal, kino og bibli': 'Trivselshagen kultursal',
  'Norsk Countrytreff': 'Råd',
  Sandane: null,
  Gloppen: null,
};

// Treff i lokalenamn eller tittel → arrangør og eventuell bedrift i bedrifter.json.
const ARRANGOR = [
  ['Gloppen Hotell', 'Gloppen Hotell', 'gloppen-hotell'],
  ['Sølvane Matbar', 'Sølvane Matbar', 'solvane-matbar'],
  ['Sølvane Gard', 'Sølvane Gard', 'solvane-gard'],
  ['Lauget', 'Lauget Kaffibar', 'lauget-kaffibar'],
  ['Nordfjord Folkemuseum', 'Nordfjord Folkemuseum', undefined],
];

function kategori(tittel) {
  const t = tittel.toLowerCase();
  if (/strikk|kurs|foredrag|workshop/.test(t)) return 'kurs';
  if (/marknad|marked|landsbyfredag|julelåve|loppis/.test(t)) return 'marknad';
  if (/tur|sauna|fjellet|ski/.test(t)) return 'friluft';
  if (/konsert|julesong|museum|kino|teater|festival|veka|countrytreff|utstilling/.test(t)) {
    return 'kultur';
  }
  return 'sosialt';
}

function stikkord(tittel) {
  const t = tittel.toLowerCase();
  const ord = [];
  if (/jul|advent/.test(t)) ord.push('jul');
  if (/konsert|julesong/.test(t)) ord.push('musikk');
  if (/julebord|lunsj|middag|lutefisk/.test(t)) ord.push('mat');
  return ord;
}

const ryddTekst = (t) => (t ?? '').replace(/\s+/g, ' ').trim();

function tilAktivitet(e) {
  const c = e.scheduling.config;
  if (c.scheduleTbd || !c.startDate) return null;
  const start = oslo(c.startDate);
  const slutt = c.endDate ? oslo(c.endDate) : null;
  if ((slutt?.dato ?? start.dato) < idag) return null;

  const namn = ryddTekst(e.location?.name);
  const adresse = ryddTekst(e.location?.address);
  const stad = STADER.find(([k]) => namn.includes(k) || adresse.includes(k))?.[1];
  if (!stad) {
    console.warn(`  Hoppar over «${e.title}»: fann ikkje stad i Gloppen (${namn}, ${adresse}).`);
    return null;
  }
  const lokale = namn in LOKALE ? LOKALE[namn] : namn || null;
  const tittel = ryddTekst(e.title);
  const kort = ryddTekst(e.description) || tittel;
  const url = DETALJ + e.slug;

  const a = { id: e.slug, tittel, type: 'arrangement', kategori: kategori(tittel), stad };
  if (lokale) a.lokale = lokale;
  a.kortSkildring = kort;
  a.dato = start.dato;
  // Kveldsarrangement som sluttar før kl. 06 dagen etter, er eitt arrangement, ikkje to dagar.
  if (slutt && slutt.dato > start.dato) {
    const overNatta = slutt.dato === leggTilDagar(start.dato, 1) && slutt.time < 6;
    if (!overNatta) a.sluttdato = slutt.dato;
  }
  a.starttid = start.tid;
  if (slutt && !c.endDateHidden) a.sluttid = slutt.tid;
  if (/gratis/i.test(kort)) a.pris = 'Gratis';
  const arr = ARRANGOR.find(([k]) => namn.includes(k) || tittel.includes(k));
  if (arr) {
    a.arrangor = arr[1];
    if (arr[2]) a.bedriftId = arr[2];
  }
  a.nettstad = url;
  const ord = stikkord(tittel);
  if (ord.length) a.stikkord = ord;
  a.kjelde = url;
  a.sjekka = idag;
  return a;
}

// Felt som kan vere retta for hand og difor ikkje vert overskrivne ved ny import.
const HANDFELT = [
  'kategori',
  'stad',
  'lokale',
  'malgruppe',
  'pris',
  'arrangor',
  'bedriftId',
  'stikkord',
  'skildring',
  'pamelding',
];

// Same rekkjefølgje på felta som i resten av fila.
const FELTREKKJE = [
  'id',
  'tittel',
  'type',
  'kategori',
  'stad',
  'lokale',
  'kortSkildring',
  'skildring',
  'dato',
  'sluttdato',
  'starttid',
  'sluttid',
  'naar',
  'sesong',
  'malgruppe',
  'pris',
  'arrangor',
  'bedriftId',
  'pamelding',
  'nettstad',
  'telefon',
  'epost',
  'stikkord',
  'kjelde',
  'sjekka',
  'eksempel',
];
const sorterFelt = (a) =>
  Object.fromEntries(
    Object.keys(a)
      .sort((x, y) => (FELTREKKJE.indexOf(x) + 1 || 99) - (FELTREKKJE.indexOf(y) + 1 || 99))
      .map((k) => [k, a[k]]),
  );

// ---------- Hovudløp ----------

const erImportert = (a) => a.kjelde?.startsWith(DETALJ);
const erKomande = (a) => (a.sluttdato ?? a.dato ?? '') >= idag;

const eksisterande = JSON.parse(readFileSync(FIL, 'utf8'));
const gamleImporterte = new Map(eksisterande.filter(erImportert).map((a) => [a.id, a]));

console.log(`Hentar ${KALENDER} …`);
const funne = new Map(arrangementISide(await hent(KALENDER)).map((e) => [e.slug, e]));

console.log(`Hentar ${SITEMAP} …`);
const sitemap = lesSitemap(await hent(SITEMAP));
const grense = leggTilDagar(idag, -Math.round(manader * 30.4));
const skalHentast = [...sitemap]
  .filter(([slug, lastmod]) => {
    if (funne.has(slug)) return false;
    const gammal = gamleImporterte.get(slug);
    return lastmod >= grense || (gammal && erKomande(gammal));
  })
  .map(([slug]) => slug);
console.log(
  `${sitemap.size} arrangementssider i sitemap, hentar ${skalHentast.length} som er endra sidan ${grense} …`,
);

let feil = 0;
for (const [i, slug] of skalHentast.entries()) {
  try {
    for (const e of arrangementISide(await hent(DETALJ + slug)))
      if (!funne.has(e.slug)) funne.set(e.slug, e);
  } catch (err) {
    feil++;
    console.warn(`  ${err.message}`);
  }
  if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${skalHentast.length}`);
  await vent(PAUSE_MS);
}

const nye = new Map();
for (const e of funne.values()) {
  const a = tilAktivitet(e);
  if (!a || !erKomande(a)) continue;
  const gammal = gamleImporterte.get(a.id);
  if (gammal) {
    for (const k of HANDFELT) {
      if (gammal[k] !== undefined) a[k] = gammal[k];
      else delete a[k];
    }
  }
  nye.set(a.id, sorterFelt(a));
}

// Ein importert, komande oppføring som ikkje vart henta på grunn av ein nettverksfeil, vert behalden.
for (const [id, gammal] of gamleImporterte) {
  if (!nye.has(id) && feil > 0 && sitemap.has(id) && erKomande(gammal)) nye.set(id, gammal);
}

const andre = eksisterande.filter((a) => !erImportert(a) && !nye.has(a.id));
const importerte = [...nye.values()].sort(
  (a, b) =>
    a.dato.localeCompare(b.dato) ||
    (a.starttid ?? '').localeCompare(b.starttid ?? '') ||
    a.id.localeCompare(b.id),
);
const resultat = [...importerte, ...andre];

const lagt = importerte.filter((a) => !gamleImporterte.has(a.id));
const fjerna = [...gamleImporterte.keys()].filter((id) => !nye.has(id));
const endra = importerte.filter(
  (a) =>
    gamleImporterte.has(a.id) &&
    JSON.stringify({ ...gamleImporterte.get(a.id), sjekka: 0 }) !==
      JSON.stringify({ ...a, sjekka: 0 }),
);

console.log(`\n${importerte.length} komande arrangement frå visit-gloppen.no.`);
for (const a of lagt) console.log(`  + ${a.dato} ${a.tittel}`);
for (const a of endra) console.log(`  ~ ${a.dato} ${a.tittel}`);
for (const id of fjerna)
  console.log(`  - ${gamleImporterte.get(id).dato} ${gamleImporterte.get(id).tittel}`);
console.log(
  `${lagt.length} nye, ${endra.length} endra, ${fjerna.length} fjerna (over eller avlyste).`,
);
if (feil) console.warn(`${feil} sider kunne ikkje hentast. Køyr skriptet på nytt seinare.`);

if (prov) {
  console.log('\n--prov: skreiv ikkje noko.');
} else {
  let tekst = JSON.stringify(resultat, null, 2) + '\n';
  try {
    const prettier = await import('prettier');
    tekst = await prettier.format(tekst, { ...(await prettier.resolveConfig(FIL)), filepath: FIL });
  } catch {
    // Prettier er ikkje installert. Fila vert likevel gyldig JSON.
  }
  writeFileSync(FIL, tekst, 'utf8');
  console.log(`\nSkreiv ${resultat.length} oppføringar til ${FIL}.`);
}
