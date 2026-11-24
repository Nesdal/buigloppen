import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AktivitetKort } from '../components/aktivitet-kort';
import {
  Aktivitet,
  AKTIVITET_KATEGORIAR,
  AktivitetKategori,
  AktivitetKategoriId,
  MALGRUPPER,
} from '../models/aktivitet';
import { STADER } from '../models/bedrift';
import { AktivitetService, grener } from '../services/aktivitet.service';
import { normaliser } from '../services/bedrift.service';

type Endring = {
  sok?: string;
  gren?: string;
  kategori?: string;
  stad?: string;
  malgruppe?: string;
};

/** Idrett kjem først, resten i vanleg rekkjefølgje. */
const KATEGORI_REKKJEFOLGJE: readonly AktivitetKategoriId[] = [
  'idrett',
  ...AKTIVITET_KATEGORIAR.map((k) => k.id).filter((id) => id !== 'idrett'),
];

/**
 * Trening og fritid: lag, klubbar, treningar og andre faste aktivitetar som går att.
 * Enkeltarrangement ligg under «Kva skjer». Filtra ligg i adressa.
 */
@Component({
  selector: 'app-fritid',
  // Innhaldet avheng av dagens dato, så det vert teikna på nytt i nettlesaren.
  host: { ngSkipHydration: 'true' },
  imports: [AktivitetKort, RouterLink],
  template: `
    <div class="innhald seksjon">
      <h1>Trening og fritid</h1>
      <p class="ingress">
        Lag, klubbar og faste treningar i Gloppen, frå fotball og handball til turn, dart og golf.
        Her finn du det som går att kvar veke. Kampar, konsertar og andre enkeltarrangement finn du
        under <a routerLink="/aktivitetar">Kva skjer</a>.
      </p>

      @if (grenliste().length > 0) {
        <ul class="gren-val" aria-label="Vel idrett eller hobby">
          <li>
            <a
              [routerLink]="[]"
              [queryParams]="{ gren: null }"
              queryParamsHandling="merge"
              [class.aktiv]="!grenNamn()"
              [attr.aria-current]="!grenNamn() ? 'true' : null"
              >Alle</a
            >
          </li>
          @for (g of grenliste(); track g.namn) {
            <li>
              <a
                [routerLink]="[]"
                [queryParams]="{ gren: g.namn }"
                queryParamsHandling="merge"
                [class.aktiv]="g.namn === grenNamn()"
                [attr.aria-current]="g.namn === grenNamn() ? 'true' : null"
                >{{ g.namn }} <span class="gren-tal">{{ g.tal }}</span></a
              >
            </li>
          }
        </ul>
      }

      <form class="filter filter-4" role="search" (submit)="$event.preventDefault()">
        <div class="felt felt-brei">
          <label for="sok">Søk</label>
          <input
            id="sok"
            type="search"
            [value]="sok() ?? ''"
            (input)="oppdater({ sok: $any($event.target).value })"
            placeholder="T.d. fotball, turn, kor, sjakk …"
            autocomplete="off"
          />
        </div>
        <div class="felt">
          <label for="kategori">Kategori</label>
          <select id="kategori" (change)="oppdater({ kategori: $any($event.target).value })">
            <option value="" [selected]="!kategoriId()">Alle kategoriar</option>
            @for (k of kategoriar(); track k.id) {
              <option [value]="k.id" [selected]="k.id === kategoriId()">{{ k.namn }}</option>
            }
          </select>
        </div>
        <div class="felt">
          <label for="stad">Stad</label>
          <select id="stad" (change)="oppdater({ stad: $any($event.target).value })">
            <option value="" [selected]="!stadNamn()">Heile Gloppen</option>
            @for (s of stader; track s) {
              <option [value]="s" [selected]="s === stadNamn()">{{ s }}</option>
            }
          </select>
        </div>
        <div class="felt">
          <label for="malgruppe">For</label>
          <select id="malgruppe" (change)="oppdater({ malgruppe: $any($event.target).value })">
            <option value="" [selected]="!malgruppeId()">Alle</option>
            @for (m of malgrupper; track m.id) {
              <option [value]="m.id" [selected]="m.id === malgruppeId()">{{ m.namn }}</option>
            }
          </select>
        </div>
      </form>

      <p class="treff" aria-live="polite">{{ resultat().length }} treff</p>

      @if (resultat().length === 0) {
        <div class="boks">
          <p>Fann ingenting som passar. Prøv eit anna søkjeord eller fjern eit filter.</p>
          <button type="button" class="knapp" (click)="nullstill()">Vis alle</button>
        </div>
      }

      @for (g of grupper(); track g.kategori.id) {
        <h2>
          <span aria-hidden="true">{{ g.kategori.ikon }}</span> {{ g.kategori.namn }}
        </h2>
        @for (gren of g.grener; track gren.namn) {
          @if (gren.namn || g.grener.length > 1) {
            <h3 class="gren-overskrift">
              {{ gren.namn ?? 'Anna' }}
              <span class="gren-tal">{{ gren.aktivitetar.length }}</span>
            </h3>
          }
          <ul class="kort-liste">
            @for (a of gren.aktivitetar; track a.id) {
              <li><app-aktivitet-kort [aktivitet]="a" /></li>
            }
          </ul>
        }
      }

      <p class="kjelde">
        Treningstider og stader kan endre seg gjennom sesongen. Sjekk gjerne med laget før du dreg.
      </p>

      <h2>Kampar og bruk av hallar og banar</h2>
      <p>
        Det finst ingen felles kalender for hallane og banane i Gloppen. Kampane ligg hjå
        særforbunda, og hallane vert booka hjå Trivselshagen.
      </p>
      <ul class="snarvegar-liste">
        @for (l of kamplenkjer; track l.url) {
          <li>
            <a [href]="l.url" target="_blank" rel="noopener">{{ l.tittel }}</a>
            <span class="kort-meta">{{ l.tekst }}</span>
          </li>
        }
      </ul>

      @if (kampar().length > 0) {
        <div class="seksjon-topp">
          <h2>Kampar og stemne</h2>
          <a routerLink="/aktivitetar" [queryParams]="{ kategori: 'idrett' }">Alle kampar →</a>
        </div>
        <ul class="kort-liste">
          @for (a of kampar(); track a.id) {
            <li><app-aktivitet-kort [aktivitet]="a" /></li>
          }
        </ul>
      }

      <div class="boks tips">
        <h2>Manglar laget ditt?</h2>
        <p>
          Driv du eit lag, ein klubb eller ei gruppe som møtest fast? Send oss namnet, kva de driv
          med, kvar og når de møtest og kven det er for, så legg vi det inn.
        </p>
        <a class="knapp" [href]="tipsLenkje" target="_blank" rel="noopener">Tips oss om eit lag</a>
      </div>
    </div>
  `,
})
export class Fritid {
  private readonly router = inject(Router);
  private readonly service = inject(AktivitetService);

  // Kjem frå query-parametrane via withComponentInputBinding().
  readonly sok = input<string>();
  readonly gren = input<string>();
  readonly kategori = input<string>();
  readonly stad = input<string>();
  readonly malgruppe = input<string>();

  /** Eksterne terminlister og booking. Sjekka 2026-11-24. */
  protected readonly kamplenkjer = [
    {
      tittel: 'Trivselshagen Bad & Idrett – booking',
      tekst: 'Bookingkalenderen for hallane i Trivselshagen.',
      url: 'https://gloppen.goactivebooking.com/',
    },
    {
      tittel: 'Gloppen Handballklubb',
      tekst: 'Nyheiter med helgas kampar i Trivselshallen, og terminlister for kvart lag.',
      url: 'https://ghk.klubbnettside.no',
    },
    {
      tittel: 'Handball: Gloppen herrar',
      tekst: 'Terminliste på handball.no.',
      url: 'https://www.handball.no/system/kamper/lag/?lagid=224214',
    },
    {
      tittel: 'Handball: Gloppen kvinner',
      tekst: 'Terminliste på handball.no.',
      url: 'https://www.handball.no/system/kamper/lag/?lagid=439874',
    },
    {
      tittel: 'Fotball: Sandane Idrettspark',
      tekst: 'Alle kampar på bana, på fotball.no.',
      url: 'https://www.fotball.no/fotballdata/anlegg/hjem?fiksId=14841',
    },
    {
      tittel: 'Fotball: Sandane TIL',
      tekst: 'Alle laga og kampane deira, på fotball.no.',
      url: 'https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=977',
    },
  ];

  protected readonly stader = STADER;
  protected readonly malgrupper = MALGRUPPER;
  protected readonly tipsLenkje =
    'https://github.com/Nesdal/buigloppen/issues/new?title=' +
    encodeURIComponent('Nytt lag eller ny trening: ');

  private readonly alleFaste = computed(() => this.service.sok({ type: 'fast' }));

  protected readonly grenliste = computed(() => grener(this.alleFaste()));

  /** Berre kategoriar som har noko i seg. */
  protected readonly kategoriar = computed(() => {
    const brukte = new Set(this.alleFaste().map((a) => a.kategori));
    return KATEGORI_REKKJEFOLGJE.filter((id) => brukte.has(id)).map((id) =>
      AKTIVITET_KATEGORIAR.find((k) => k.id === id)!,
    );
  });

  protected readonly grenNamn = computed(() => {
    const verdi = normaliser(this.gren() ?? '');
    return this.grenliste().find((g) => normaliser(g.namn) === verdi)?.namn ?? null;
  });
  protected readonly kategoriId = computed(() =>
    gyldig(
      this.kategori(),
      AKTIVITET_KATEGORIAR.map((k) => k.id),
    ),
  );
  protected readonly stadNamn = computed(() => gyldig(this.stad(), STADER));
  protected readonly malgruppeId = computed(() =>
    gyldig(
      this.malgruppe(),
      MALGRUPPER.map((m) => m.id),
    ),
  );

  protected readonly resultat = computed(() =>
    this.service.sok({
      type: 'fast',
      sok: this.sok(),
      gren: this.grenNamn(),
      kategori: this.kategoriId(),
      stad: this.stadNamn(),
      malgruppe: this.malgruppeId(),
    }),
  );

  /**
   * Resultata gruppert per kategori og så per gren, så t.d. alle handball- og skytelag står
   * saman. Det som manglar gren, kjem til slutt under «Anna».
   */
  protected readonly grupper = computed(() =>
    KATEGORI_REKKJEFOLGJE.map((id) => ({
      kategori: AKTIVITET_KATEGORIAR.find((k) => k.id === id) as AktivitetKategori,
      grener: grupperPerGren(this.resultat().filter((a) => a.kategori === id)),
    })).filter((g) => g.grener.length > 0),
  );

  protected readonly kampar = computed(() => this.service.nesteKampar(6));

  protected oppdater(endring: Endring): void {
    const neste: Required<Endring> = {
      sok: this.sok() ?? '',
      gren: this.grenNamn() ?? '',
      kategori: this.kategoriId() ?? '',
      stad: this.stadNamn() ?? '',
      malgruppe: this.malgruppeId() ?? '',
      ...endring,
    };
    this.router.navigate([], {
      queryParams: {
        sok: neste.sok.trim() || null,
        gren: neste.gren || null,
        kategori: neste.kategori || null,
        stad: neste.stad || null,
        malgruppe: neste.malgruppe || null,
      },
      replaceUrl: true,
    });
  }

  protected nullstill(): void {
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }
}

/** Grupperer på gren (alfabetisk, «Anna» sist) og sorterer kvar gruppe på tittel. */
export function grupperPerGren(
  aktivitetar: readonly Aktivitet[],
): { namn: string | null; aktivitetar: Aktivitet[] }[] {
  const grupper = new Map<string, { namn: string | null; aktivitetar: Aktivitet[] }>();
  for (const a of aktivitetar) {
    const namn = a.gren?.trim() || null;
    const nokkel = namn ? normaliser(namn) : '';
    const gruppe = grupper.get(nokkel) ?? { namn, aktivitetar: [] };
    gruppe.aktivitetar.push(a);
    grupper.set(nokkel, gruppe);
  }
  for (const g of grupper.values()) {
    g.aktivitetar.sort((a, b) => a.tittel.localeCompare(b.tittel, 'nn'));
  }
  return [...grupper.values()].sort((a, b) => {
    if (!a.namn) return 1;
    if (!b.namn) return -1;
    return a.namn.localeCompare(b.namn, 'nn');
  });
}

function gyldig<T extends string>(verdi: string | undefined, lovlege: readonly T[]): T | null {
  return (lovlege as readonly string[]).includes(verdi ?? '') ? (verdi as T) : null;
}
