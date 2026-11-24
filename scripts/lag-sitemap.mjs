// Lagar sitemap.xml og robots.txt etter at sida er bygd og førehandsrendra.
// Køyrer automatisk som del av `npm run build`.
// Adressa til nettstaden vert henta frå NETTSTAD_URL i src/app/seo.ts.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ut = resolve(rot, 'dist/buigloppen');
const les = (sti) => JSON.parse(readFileSync(resolve(rot, sti), 'utf8'));

const nettstad = /NETTSTAD_URL = '([^']+)'/.exec(
  readFileSync(resolve(rot, 'src/app/seo.ts'), 'utf8'),
)?.[1];
if (!nettstad) throw new Error('Fann ikkje NETTSTAD_URL i src/app/seo.ts');

const idag = new Date().toISOString().slice(0, 10);
const bedrifter = new Map(les('src/app/data/bedrifter.json').map((b) => [b.id, b]));
const aktivitetar = new Map(les('src/app/data/aktivitetar.json').map((a) => [a.id, a]));

/** Returnerer lastmod-dato, eller null dersom sida ikkje skal med i sitemap. */
function vurder(sti) {
  const [, type, id] = sti.split('/');
  if (type === 'bedrift') {
    const b = bedrifter.get(id);
    return b && !b.eksempel ? (b.sjekka ?? idag) : null;
  }
  if (type === 'aktivitet') {
    const a = aktivitetar.get(id);
    if (!a || a.eksempel) return null;
    // Arrangement som er over, er ikkje interessante for søkjemotorar.
    if (a.type === 'arrangement' && (a.sluttdato ?? a.dato ?? '') < idag) return null;
    return a.sjekka ?? idag;
  }
  return idag;
}

const ruter = Object.keys(les('dist/buigloppen/prerendered-routes.json').routes).sort();
const oppføringar = ruter
  .map((sti) => ({ sti, lastmod: vurder(sti) }))
  .filter((r) => r.lastmod)
  .map(
    ({ sti, lastmod }) => `  <url><loc>${nettstad}${sti}</loc><lastmod>${lastmod}</lastmod></url>`,
  );

writeFileSync(
  resolve(ut, 'browser/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${oppføringar.join('\n')}\n</urlset>\n`,
);
writeFileSync(
  resolve(ut, 'browser/robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${nettstad}/sitemap.xml\n`,
);
console.log(`sitemap.xml: ${oppføringar.length} av ${ruter.length} sider`);
