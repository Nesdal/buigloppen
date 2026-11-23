// Eksporterer bedriftslista til CSV, t.d. for import i Wix CMS (visit-gloppen.no).
// Køyr: npm run eksport:csv  → skriv til dist/bedrifter.csv
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bedrifter = JSON.parse(readFileSync(resolve(rot, 'src/app/data/bedrifter.json'), 'utf8'));

const kolonner = [
  'id',
  'namn',
  'kategori',
  'stad',
  'kortSkildring',
  'skildring',
  'adresse',
  'telefon',
  'epost',
  'nettstad',
  'opningstider',
  'stikkord',
];

const celle = (verdi) => {
  const tekst = Array.isArray(verdi) ? verdi.join(', ') : (verdi ?? '').toString();
  return /[",\n\r]/.test(tekst) ? `"${tekst.replaceAll('"', '""')}"` : tekst;
};

const ekte = bedrifter.filter((b) => !b.eksempel);
const rader = [kolonner.join(','), ...ekte.map((b) => kolonner.map((k) => celle(b[k])).join(','))];

const ut = resolve(rot, 'dist/bedrifter.csv');
mkdirSync(dirname(ut), { recursive: true });
// BOM gjer at Excel les æ, ø og å rett.
writeFileSync(ut, '﻿' + rader.join('\r\n') + '\r\n', 'utf8');
console.log(`Skreiv ${ekte.length} bedrifter til ${ut} (hoppa over ${bedrifter.length - ekte.length} døme).`);
