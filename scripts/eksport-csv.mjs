// Eksporterer bedriftslista, aktivitetane, oppslaga og lokala til CSV, t.d. for import i Wix CMS (visit-gloppen.no).
// Køyr: npm run eksport:csv  → skriv til dist/bedrifter.csv, dist/aktivitetar.csv, dist/oppslag.csv og dist/lokale.csv
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const celle = (verdi) => {
  const tekst = Array.isArray(verdi) ? verdi.join('; ') : (verdi ?? '').toString();
  return /[",\n\r]/.test(tekst) ? `"${tekst.replaceAll('"', '""')}"` : tekst;
};

function eksporter(namn, kolonner) {
  const liste = JSON.parse(readFileSync(resolve(rot, `src/app/data/${namn}.json`), 'utf8'));
  const ekte = liste.filter((x) => !x.eksempel);
  const rader = [kolonner.join(','), ...ekte.map((x) => kolonner.map((k) => celle(x[k])).join(','))];

  const ut = resolve(rot, `dist/${namn}.csv`);
  mkdirSync(dirname(ut), { recursive: true });
  // BOM gjer at Excel les æ, ø og å rett.
  writeFileSync(ut, '﻿' + rader.join('\r\n') + '\r\n', 'utf8');
  console.log(`Skreiv ${ekte.length} ${namn} til ${ut} (hoppa over ${liste.length - ekte.length} døme).`);
}

eksporter('bedrifter', [
  'id',
  'namn',
  'type',
  'kategori',
  'ekstraKategoriar',
  'stad',
  'kortSkildring',
  'skildring',
  'tilbyr',
  'praktisk',
  'adresse',
  'telefon',
  'epost',
  'nettstad',
  'opningstider',
  'stikkord',
  'lokalmat',
  'sal',
  'kjopTekst',
  'sesong',
  'kjelde',
  'sjekka',
]);

eksporter('aktivitetar', [
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
  'gren',
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
]);

eksporter('oppslag', ['id', 'bedriftId', 'type', 'tittel', 'tekst', 'fra', 'til', 'lenkje', 'kjelde']);

eksporter('lokale', [
  'id',
  'namn',
  'slag',
  'stad',
  'bygd',
  'kortSkildring',
  'plassar',
  'plassarTekst',
  'fasilitetar',
  'praktisk',
  'utleigar',
  'kontakt',
  'telefon',
  'epost',
  'nettstad',
  'booking',
  'adresse',
  'kjelde',
  'sjekka',
]);
