// Hentar programmet til kinoen og kultursalen i Trivselshagen frå eBillett.
//
// Køyr:  npm run import:trivselshagen
//        npm run import:trivselshagen -- --prov   (vis kva som ville endra seg, skriv ikkje)
//
// Kva skriptet gjer:
// - Kinoframsyningane («Kino» på eBillett) vert skrivne til src/app/data/kino.json, gruppert
//   per film. Fila vert skriven heilt på nytt kvar gong.
// - Arrangementa («Arrangement» på eBillett: konsertar, teater, foredrag …) vert lagde inn i
//   src/app/data/aktivitetar.json, på same måte som importen frå visit-gloppen.no. Felt du har
//   retta for hand (kategori, stad, lokale, målgruppe, arrangør, bedriftId, stikkord)
//   vert ikkje overskrivne. Arrangement som er over eller borte frå eBillett, vert fjerna.
// - Står arrangementet alt i fila frå ei anna kjelde (same dato, same starttid og eit felles
//   ord i tittelen), vert det ikkje lagt inn på nytt. Då får den gamle oppføringa berre
//   billettlenkja frå eBillett i `pamelding` om ho mangla.
//
// Køyr skriptet etter import:visit-gloppen (eller bruk `npm run import`), så vert dobbeltoppføringar
// rydda bort.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AKTIVITETAR = resolve(rot, 'src/app/data/aktivitetar.json');
const KINO = resolve(rot, 'src/app/data/kino.json');
const SIDE = 'https://ebillett.no/trivselshagen';
const KINO_URL = `${SIDE}/events/daily`;
const ARRANGEMENT_URL = `${SIDE}/events/monthly/grid`;
const PAUSE_MS = 300;
const MAKS_SIDER = 20;

const prov = process.argv.slice(2).includes('--prov');

const idag = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo' }).format(new Date());

// ---------- Henting ----------

const vent = (ms) => new Promise((r) => setTimeout(r, ms));

async function hent(url) {
  const svar = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Bu i Gloppen import)',
      // Nynorsk tekst på sidene, t.d. «Norsk tale» og «Original tale».
      Cookie: 'ebillett_locale=nn',
    },
  });
  if (!svar.ok) throw new Error(`${svar.status} for ${url}`);
  await vent(PAUSE_MS);
  return svar.text();
}

/** Alle JSON-LD-objekt i sida. Ugyldige blokker vert hoppa over. */
function jsonLd(html) {
  const ut = [];
  for (const [, tekst] of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    try {
      ut.push(JSON.parse(tekst));
    } catch {
      // eBillett har av og til eit komma for mykje. Ikkje viktig nok til å stoppe importen.
    }
  }
  return ut;
}

/** Event-objekta i lista på ei oversiktsside. */
function hendingarISide(html) {
  return jsonLd(html).flatMap((j) => (Array.isArray(j['@graph']) ? j['@graph'] : []));
}

/** Datoane med noko på programmet, frå datoveljaren på sida. */
function datoarISide(html) {
  const m = html.match(/eventDates:\s*\[([^\]]*)\]/) ?? html.match(/enabledDates:\s*\[([^\]]*)\]/);
  return [...(m?.[1] ?? '').matchAll(/"(\d{4}-\d{2}-\d{2})"/g)].map((x) => x[1]);
}

const dekodeTabell = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  aring: 'å',
  Aring: 'Å',
  oslash: 'ø',
  Oslash: 'Ø',
  aelig: 'æ',
  AElig: 'Æ',
  eacute: 'é',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  laquo: '«',
  raquo: '»',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
};

function dekode(tekst) {
  return tekst
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (heile, namn) => dekodeTabell[namn] ?? heile);
}

const rydd = (t) =>
  dekode(t ?? '')
    .replace(/\s+/g, ' ')
    .trim();

/** HTML → avsnitt med rein tekst. */
function tilAvsnitt(html) {
  return dekode(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h\d|li)>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/** Detaljane frå sida til ei framsyning eller eit arrangement. */
function lesDetaljside(html) {
  const ev = jsonLd(html).find((j) => j['@type'] === 'Event') ?? {};
  const sal = rydd(html.match(/<address>[\s\S]*?<\/h4>([\s\S]*?)<\/address>/)?.[1]);
  const sjanger = rydd(html.match(/<span class="genre">([\s\S]*?)<\/span>/)?.[1]) || undefined;
  // Filmar: «12 • 2t 38min • 2D • Original tale • Norsk tekst»
  const meta = (
    html.match(/<span class="duration">([\s\S]*?)<\/span>\s*(?:<button|<\/div>)/)?.[1] ?? ''
  )
    .split(/<span class="bullet"><\/span>/)
    .map(rydd)
    .filter(Boolean);
  const omtaleHtml =
    html.match(/<h1>Omtale<\/h1>([\s\S]*?)<\/div>\s*<\/div>/)?.[1] ??
    html.match(/class="panel panel-default synopsis[^"]*">([\s\S]*?)<\/div>\s*<\/div>/)?.[1] ??
    '';
  const omtale = tilAvsnitt(omtaleHtml).filter((l) => l !== 'Omtale');
  const plakat = typeof ev.image === 'string' ? ev.image.replace(/\?.*$/, '?width=300') : undefined;
  return {
    sluttid: typeof ev.endDate === 'string' ? ev.endDate.slice(11, 16) : undefined,
    sal: sal || undefined,
    sjanger,
    meta,
    omtale,
    plakat,
    utselt: /SoldOut/i.test(ev.offers?.availability ?? ''),
  };
}

// ---------- Lokale og stad ----------

// Salnamn frå eBillett → lokale og stad i aktivitetar.json. Andre namn vert «Trivselshagen».
const SALAR = {
  Kultursalen: ['Trivselshagen kultursal', 'Sandane'],
  'Gloppen Kino': ['Trivselshagen kino', 'Sandane'],
  'Foajeen inkl kjøken': ['Trivselshagen, foajeen', 'Sandane'],
  'Vereide Kyrkje': ['Vereide kyrkje', 'Vereide'],
  Gimle: ['Grendehuset Gimle', 'Anna stad i Gloppen'],
};
const lokaleOgStad = (sal) => SALAR[sal] ?? ['Trivselshagen', 'Sandane'];

// ---------- Kino ----------

/** «2t 38min» → 158. «116» (berre tal over 18) vert òg lese som minutt. */
function minutt(tekst) {
  if (/^\d{2,3}$/.test(tekst) && Number(tekst) > 18) return Number(tekst);
  const m = tekst.match(/^(?:(\d+)\s*t)?\s*(?:(\d+)\s*min)?$/);
  if (!m || (!m[1] && !m[2])) return undefined;
  return Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0);
}

/** Les «12 • 2t 38min • 2D • Original tale • Norsk tekst» til felt. */
function lesFilmMeta(meta) {
  const ut = {};
  for (const del of meta) {
    if (/^(A|for alle|tillatt for alle)$/i.test(del)) ut.aldersgrense = 'A';
    else if (/^\d{1,2}$/.test(del) && Number(del) <= 18) ut.aldersgrense = del;
    else if (minutt(del)) ut.lengd = minutt(del);
    else if (/^\d+D$|IMAX|HFR/i.test(del)) ut.format = del;
    else if (/tale$/i.test(del)) ut.tale = del;
    else if (/tekst$/i.test(del)) ut.tekst = del;
  }
  return ut;
}

const lagId = (tittel) =>
  tittel
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function hentKino() {
  console.log(`Hentar kinoprogrammet frå ${KINO_URL} …`);
  const forside = await hent(KINO_URL);
  const datoar = [...new Set([idag, ...datoarISide(forside)])].filter((d) => d >= idag).sort();
  const framsyningar = new Map();
  for (const dato of datoar) {
    const html = dato === idag ? forside : await hent(`${KINO_URL}?date=${dato}`);
    for (const e of hendingarISide(html)) {
      if (typeof e.url === 'string' && e.startDate?.startsWith(dato)) framsyningar.set(e.url, e);
    }
  }
  console.log(`  ${framsyningar.size} framsyningar på ${datoar.length} dagar. Hentar detaljane …`);

  const filmar = new Map();
  for (const e of framsyningar.values()) {
    const d = lesDetaljside(await hent(e.url));
    const tittel = rydd(e.name);
    const meta = lesFilmMeta(d.meta);
    const id = lagId(tittel);
    if (!filmar.has(id)) {
      const film = { id, tittel };
      if (d.sjanger) film.sjanger = d.sjanger;
      if (meta.aldersgrense) film.aldersgrense = meta.aldersgrense;
      if (meta.lengd) film.lengd = meta.lengd;
      if (d.omtale.length) film.omtale = d.omtale.join('\n\n');
      if (d.plakat) film.plakat = d.plakat;
      film.visingar = [];
      filmar.set(id, film);
    }
    const v = { dato: e.startDate.slice(0, 10), tid: e.startDate.slice(11, 16) };
    if (d.sluttid) v.sluttid = d.sluttid;
    if (d.sal) v.sal = d.sal;
    if (meta.format) v.format = meta.format;
    if (meta.tale) v.tale = meta.tale;
    if (meta.tekst) v.tekst = meta.tekst;
    if (d.utselt) v.utselt = true;
    v.billett = e.url;
    filmar.get(id).visingar.push(v);
  }

  const forste = (f) => f.visingar[0].dato + f.visingar[0].tid;
  for (const f of filmar.values()) {
    f.visingar.sort((a, b) => (a.dato + a.tid).localeCompare(b.dato + b.tid));
  }
  return [...filmar.values()].sort((a, b) => forste(a).localeCompare(forste(b)));
}

// ---------- Arrangement ----------

function kategori(tittel, tekst) {
  const t = `${tittel} ${tekst}`.toLowerCase();
  if (/senioruniversitet|foredrag|kurs|seminar/.test(t)) return 'kurs';
  if (/folkemøte|informasjonsmøte/.test(t)) return 'samfunn';
  return 'kultur';
}

function malgruppe(tittel) {
  const t = tittel.toLowerCase();
  if (/senioruniversitet/.test(t)) return ['seniorar'];
  return undefined;
}

function stikkord(tittel, tekst) {
  const t = `${tittel} ${tekst}`.toLowerCase();
  const ord = [];
  if (/\bjul|advent|nisse/.test(t)) ord.push('jul');
  if (/konsert|band|kor\b|korps|musikk/.test(t)) ord.push('musikk');
  if (/teater|forestilling|framsyning|revy/.test(t)) ord.push('teater');
  if (/dans|kompani/.test(t)) ord.push('dans');
  if (/stand-?up|humor|komikar/.test(t)) ord.push('humor');
  return ord;
}

/** Korte linjer utan punktum er overskrifter, dato eller namn, ikkje brødtekst. */
const erOverskrift = (l) => l.length < 90 && !/[.!?…]$/.test(l);

/** Første setning(ar) av omtalen, maks om lag 200 teikn. */
function kortTekst(avsnitt, tittel) {
  const brodtekst = avsnitt.filter((l) => !erOverskrift(l));
  const tekst = (brodtekst.length ? brodtekst : avsnitt).join(' ');
  if (!tekst) return tittel;
  const setningar = tekst.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [tekst];
  let ut = '';
  for (const s of setningar) {
    if (ut && (ut + s).length > 200) break;
    ut += s;
  }
  ut = ut.trim();
  return ut.length > 240 ? ut.slice(0, 237).replace(/\s+\S*$/, '') + ' …' : ut;
}

const ebillettId = (e) => Number(e.url.split('/').pop()) || 0;

async function hentArrangement() {
  console.log(`Hentar arrangementa frå ${ARRANGEMENT_URL} …`);
  const funne = new Map();
  for (let side = 1; side <= MAKS_SIDER; side++) {
    const html = await hent(side === 1 ? ARRANGEMENT_URL : `${ARRANGEMENT_URL}?page=${side}`);
    const nye = hendingarISide(html).filter((e) => typeof e.url === 'string' && !funne.has(e.url));
    if (nye.length === 0) break;
    for (const e of nye) funne.set(e.url, e);
    if (!html.includes(`grid?page=${side + 1}`)) break;
  }
  console.log(`  ${funne.size} arrangement. Hentar detaljane …`);

  const ut = [];
  // Middagsshow vert selde som eitt «arrangement» per bord. Vi tek berre med det første.
  const sett = new Set();
  const etterId = [...funne.values()].sort((a, b) => ebillettId(a) - ebillettId(b));
  for (const e of etterId) {
    const dato = e.startDate?.slice(0, 10);
    if (!dato || dato < idag) continue;
    const nokkel = `${rydd(e.name)}|${e.startDate}`;
    if (sett.has(nokkel)) continue;
    sett.add(nokkel);
    const d = lesDetaljside(await hent(e.url));
    const tittel = rydd(e.name);
    const [lokale, stad] = lokaleOgStad(d.sal);
    const a = {
      id: `trivselshagen-${ebillettId(e)}`,
      tittel,
      type: 'arrangement',
      kategori: kategori(tittel, d.omtale.join(' ')),
      stad,
      lokale,
      kortSkildring: kortTekst(d.omtale, tittel),
    };
    if (d.omtale.length > 1 || a.kortSkildring !== d.omtale.join(' ')) {
      a.skildring = d.omtale.join('\n\n');
    }
    a.dato = dato;
    a.starttid = e.startDate.slice(11, 16);
    if (d.sluttid && d.sluttid !== a.starttid) a.sluttid = d.sluttid;
    const mg = malgruppe(tittel);
    if (mg) a.malgruppe = mg;
    a.pamelding = e.url;
    a.nettstad = e.url;
    const ord = stikkord(tittel, d.omtale.join(' '));
    if (ord.length) a.stikkord = ord;
    a.kjelde = e.url;
    a.sjekka = idag;
    ut.push(a);
  }
  return ut;
}

// ---------- Fletting inn i aktivitetar.json ----------

const HANDFELT = ['kategori', 'stad', 'lokale', 'malgruppe', 'arrangor', 'bedriftId', 'stikkord'];

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

const erImportert = (a) => a.kjelde?.startsWith(SIDE + '/');
const erKomande = (a) => (a.sluttdato ?? a.dato ?? '') >= idag;

const ord = (t) =>
  new Set(
    t
      .toLowerCase()
      .split(/[^a-zæøå0-9]+/)
      .filter((o) => o.length >= 5),
  );

/** Same arrangement frå ei anna kjelde: same dato og tid, og minst eitt felles ord i tittelen. */
function finnDuplikat(a, andre) {
  const mine = ord(a.tittel);
  return andre.find(
    (b) =>
      b.type === 'arrangement' &&
      b.dato === a.dato &&
      b.starttid === a.starttid &&
      [...ord(b.tittel)].some((o) => mine.has(o)),
  );
}

async function skrivJson(fil, data) {
  let tekst = JSON.stringify(data, null, 2) + '\n';
  try {
    const prettier = await import('prettier');
    tekst = await prettier.format(tekst, { ...(await prettier.resolveConfig(fil)), filepath: fil });
  } catch {
    // Prettier er ikkje installert. Fila vert likevel gyldig JSON.
  }
  writeFileSync(fil, tekst, 'utf8');
}

// ---------- Hovudløp ----------

const filmar = await hentKino();
const henta = await hentArrangement();

const eksisterande = JSON.parse(readFileSync(AKTIVITETAR, 'utf8'));
const gamle = new Map(eksisterande.filter(erImportert).map((a) => [a.id, a]));
const andre = eksisterande.filter((a) => !erImportert(a));

const nye = new Map();
const flettaInn = [];
for (const a of henta) {
  const dup = finnDuplikat(a, andre);
  if (dup) {
    if (!dup.pamelding) {
      dup.pamelding = a.pamelding;
      flettaInn.push(dup);
    }
    continue;
  }
  const gammal = gamle.get(a.id);
  if (gammal) {
    for (const k of HANDFELT) {
      if (gammal[k] !== undefined) a[k] = gammal[k];
      else delete a[k];
    }
  }
  nye.set(a.id, sorterFelt(a));
}

// Resten av fila står urørd først, så kjem arrangementa frå eBillett etter dato.
const importerte = [...nye.values()]
  .filter(erKomande)
  .sort(
    (a, b) =>
      a.dato.localeCompare(b.dato) ||
      (a.starttid ?? '').localeCompare(b.starttid ?? '') ||
      a.id.localeCompare(b.id),
  );
const resultat = [...andre, ...importerte];

const lagt = importerte.filter((a) => !gamle.has(a.id));
const fjerna = [...gamle.keys()].filter((id) => !nye.has(id));

const visingar = filmar.reduce((sum, f) => sum + f.visingar.length, 0);
console.log(`\nKino: ${filmar.length} filmar og ${visingar} framsyningar.`);
for (const f of filmar) console.log(`  ${f.tittel} (${f.visingar.length})`);
console.log(`\nArrangement: ${importerte.length} komande frå eBillett.`);
for (const a of lagt) console.log(`  + ${a.dato} ${a.tittel}`);
for (const id of fjerna) console.log(`  - ${gamle.get(id).dato} ${gamle.get(id).tittel}`);
for (const a of flettaInn) console.log(`  ~ ${a.dato} ${a.tittel} (fekk billettlenkje)`);
console.log(`${lagt.length} nye, ${fjerna.length} fjerna, ${flettaInn.length} fekk billettlenkje.`);

if (prov) {
  console.log('\n--prov: skreiv ikkje noko.');
} else {
  await skrivJson(KINO, { henta: idag, kjelde: KINO_URL, filmar });
  await skrivJson(AKTIVITETAR, resultat);
  console.log(`\nSkreiv ${KINO} og ${resultat.length} oppføringar til ${AKTIVITETAR}.`);
}
