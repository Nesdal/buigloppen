import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
  TitleStrategy,
} from '@angular/router';
import { Aktivitet } from './models/aktivitet';
import { Bedrift } from './models/bedrift';
import { AktivitetService, datoTekst } from './services/aktivitet.service';
import { BedriftService } from './services/bedrift.service';

/**
 * Full adresse til nettstaden, utan skråstrek til slutt. Vert brukt i kanoniske lenkjer,
 * delingskort (Open Graph), sitemap.xml og robots.txt. Byt ut her (og i
 * `scripts/lag-sitemap.mjs`) når sida får eige domene.
 */
export const NETTSTAD_URL = 'https://buigloppen.vercel.app';
export const NETTSTAD_NAMN = 'Bu i Gloppen';
export const STANDARD_SKILDRING =
  'Finn butikkar, kafear, handverkarar, arrangement og fritidsaktivitetar i Gloppen – frå Sandane og Byrkjelo til Breim og Hyen.';
const DELINGSBILETE = `${NETTSTAD_URL}/delingsbilete.png`;

/** Det ei side kan setje i `data` eller resolve-a som `seo`. */
export interface Seo {
  skildring?: string;
  /** "website" er standard. Detaljsider kan vere "article" e.l. */
  ogType?: string;
  /** Strukturerte data (schema.org) som vert lagde i ein JSON-LD-blokk. */
  jsonLd?: object;
  /** true for sider søkjemotorar ikkje skal ta med, t.d. 404. */
  noindex?: boolean;
}

/** Kortar ned tekst til om lag `maks` teikn utan å kutte midt i eit ord. */
export function kortTekst(tekst: string, maks = 160): string {
  const rein = tekst.replace(/\s+/g, ' ').trim();
  if (rein.length <= maks) return rein;
  const kutt = rein.slice(0, maks - 1);
  return (
    kutt.slice(0, Math.max(kutt.lastIndexOf(' '), maks - 20)).replace(/[\s,.;:–-]+$/, '') + '…'
  );
}

/** Deler "Industrivegen 23, 6823 Sandane" i gateadresse, postnummer og stad. */
export function delAdresse(adresse: string, stad: string) {
  const delar = adresse.split(',').map((d) => d.trim());
  const post = delar.length > 1 ? /^(\d{4})\s+(.+)$/.exec(delar[delar.length - 1]) : null;
  return {
    '@type': 'PostalAddress',
    streetAddress: post ? delar.slice(0, -1).join(', ') : adresse,
    ...(post ? { postalCode: post[1], addressLocality: post[2] } : { addressLocality: stad }),
    addressRegion: 'Vestland',
    addressCountry: 'NO',
  };
}

const SCHEMA_TYPE: Record<Bedrift['type'], string> = {
  butikk: 'Store',
  servering: 'FoodEstablishment',
  bedrift: 'LocalBusiness',
};

export function bedriftJsonLd(b: Bedrift): object {
  return {
    '@context': 'https://schema.org',
    '@type': SCHEMA_TYPE[b.type],
    name: b.namn,
    description: b.skildring ?? b.kortSkildring,
    url: `${NETTSTAD_URL}/bedrift/${b.id}`,
    ...(b.nettstad ? { sameAs: [b.nettstad] } : {}),
    ...(b.telefon ? { telephone: b.telefon } : {}),
    ...(b.epost ? { email: b.epost } : {}),
    address: b.adresse
      ? delAdresse(b.adresse, b.stad)
      : { '@type': 'PostalAddress', addressLocality: b.stad, addressCountry: 'NO' },
    areaServed: 'Gloppen',
  };
}

/** Event-data for arrangement. Faste aktivitetar har ingen fast dato og får ikkje dette. */
export function aktivitetJsonLd(a: Aktivitet): object | undefined {
  if (a.type !== 'arrangement' || !a.dato) return undefined;
  const tid = (dato: string, klokka?: string) => (klokka ? `${dato}T${klokka}` : dato);
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: a.tittel,
    description: a.skildring ?? a.kortSkildring,
    url: `${NETTSTAD_URL}/aktivitet/${a.id}`,
    startDate: tid(a.dato, a.starttid),
    ...(a.sluttdato || a.sluttid ? { endDate: tid(a.sluttdato ?? a.dato, a.sluttid) } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: a.lokale ?? a.stad,
      address: {
        '@type': 'PostalAddress',
        addressLocality: a.stad,
        addressRegion: 'Vestland',
        addressCountry: 'NO',
      },
    },
    ...(a.arrangor ? { organizer: { '@type': 'Organization', name: a.arrangor } } : {}),
  };
}

const ikkjeFunnen: Seo = { noindex: true, skildring: 'Sida finst ikkje.' };

export const bedriftTittel: ResolveFn<string> = (route) => {
  const b = inject(BedriftService).hent(route.paramMap.get('id') ?? '');
  return b ? `${b.namn}, ${b.stad} – ${NETTSTAD_NAMN}` : `Fann ikkje bedrifta – ${NETTSTAD_NAMN}`;
};

export const bedriftSeo: ResolveFn<Seo> = (route) => {
  const b = inject(BedriftService).hent(route.paramMap.get('id') ?? '');
  if (!b) return ikkjeFunnen;
  // Oppdikta døme skal ikkje dukke opp i søk.
  if (b.eksempel) return { skildring: kortTekst(b.kortSkildring), noindex: true };
  return { skildring: kortTekst(b.kortSkildring), jsonLd: bedriftJsonLd(b) };
};

export const aktivitetTittel: ResolveFn<string> = (route) => {
  const a = inject(AktivitetService).hent(route.paramMap.get('id') ?? '');
  if (!a) return `Fann ikkje aktiviteten – ${NETTSTAD_NAMN}`;
  const naar = a.type === 'arrangement' ? datoTekst(a) : '';
  return `${a.tittel}${naar ? `, ${naar}` : ''} – ${NETTSTAD_NAMN}`;
};

export const aktivitetSeo: ResolveFn<Seo> = (route) => {
  const a = inject(AktivitetService).hent(route.paramMap.get('id') ?? '');
  if (!a) return ikkjeFunnen;
  if (a.eksempel) return { skildring: kortTekst(a.kortSkildring), noindex: true };
  return { skildring: kortTekst(a.kortSkildring), jsonLd: aktivitetJsonLd(a) };
};

/** Strukturerte data for framsida: kva nettstaden er. */
const NETTSTAD_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: NETTSTAD_NAMN,
  url: `${NETTSTAD_URL}/`,
  inLanguage: 'nn',
  description: STANDARD_SKILDRING,
};

/**
 * Set sidetittel og metadata for søkjemotorar og delingskort kvar gong ruta endrar seg.
 * Skildringa kjem frå `data.skildring` på ruta, eller frå `data.seo` (statisk eller resolve).
 */
@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const tittel = this.buildTitle(snapshot) ?? NETTSTAD_NAMN;
    let rute: ActivatedRouteSnapshot = snapshot.root;
    while (rute.firstChild) rute = rute.firstChild;

    const seo: Seo = { ...(rute.data['seo'] as Seo | undefined) };
    seo.skildring ??= (rute.data['skildring'] as string | undefined) ?? STANDARD_SKILDRING;
    const sti = snapshot.url.split(/[?#]/)[0];
    if (sti === '/' || sti === '') seo.jsonLd ??= NETTSTAD_JSON_LD;
    const url = NETTSTAD_URL + (sti === '/' ? '/' : sti.replace(/\/$/, ''));

    this.title.setTitle(tittel);
    // Delingskort viser ofte sidenamnet separat, så det treng ikkje stå i og:title.
    const kortTittel = tittel.replace(` – ${NETTSTAD_NAMN}`, '');
    for (const [namn, innhald] of [
      ['description', seo.skildring],
      ['robots', seo.noindex ? 'noindex' : 'index, follow'],
    ]) {
      this.meta.updateTag({ name: namn, content: innhald });
    }
    for (const [eigenskap, innhald] of [
      ['og:title', kortTittel],
      ['og:description', seo.skildring],
      ['og:url', url],
      ['og:type', seo.ogType ?? 'website'],
      ['og:image', DELINGSBILETE],
    ]) {
      this.meta.updateTag({ property: eigenskap, content: innhald });
    }
    this.settKanonisk(seo.noindex ? null : url);
    this.settJsonLd(seo.jsonLd);
  }

  private settKanonisk(url: string | null): void {
    let lenkje = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) {
      lenkje?.remove();
      return;
    }
    if (!lenkje) {
      lenkje = this.document.createElement('link');
      lenkje.setAttribute('rel', 'canonical');
      this.document.head.appendChild(lenkje);
    }
    lenkje.setAttribute('href', url);
  }

  private settJsonLd(data: object | undefined): void {
    let skript = this.document.head.querySelector<HTMLScriptElement>('script#strukturerte-data');
    if (!data) {
      skript?.remove();
      return;
    }
    if (!skript) {
      skript = this.document.createElement('script');
      skript.id = 'strukturerte-data';
      skript.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(skript);
    }
    // Hindrar at "</script>" i ein tekst kan bryte ut av blokka.
    skript.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  }
}
