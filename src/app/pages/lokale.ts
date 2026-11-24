import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { LokaleKort } from '../components/lokale-kort';
import { STADER, Stad } from '../models/bedrift';
import { FASILITETAR, Fasilitet, GJESTAR } from '../models/lokale';
import { LokaleService } from '../services/lokale.service';

type Endring = { stad?: string; gjester?: string; har?: string };

const MELD_INN =
  'https://github.com/Nesdal/buigloppen/issues/new?title=' +
  encodeURIComponent('Lokale: ') +
  '&body=' +
  encodeURIComponent(
    [
      'Namn på lokalet:',
      'Stad i Gloppen:',
      'Kor mange er det plass til (ved bord / totalt):',
      'Fasilitetar (kjøkken, servise, scene, lyd, prosjektor, overnatting …):',
      'Kven leiger ut, og kven skal ein kontakte:',
      'Telefon / e-post / nettstad / bookinglenkje:',
      'Adresse:',
    ].join('\n\n'),
  );

/**
 * Lokale til leige i Gloppen: grendehus, samfunnshus, kulturhus og selskapslokale.
 * Filtra ligg i adressa (?stad=&gjester=&har=), same som på dei andre oversiktene.
 */
@Component({
  selector: 'app-lokale',
  // Innhaldet avheng av dagens dato, så det vert teikna på nytt i nettlesaren.
  host: { ngSkipHydration: 'true' },
  imports: [LokaleKort],
  template: `
    <div class="innhald seksjon">
      <h1>Lokale til leige</h1>
      <p class="ingress">
        Skal du ha bursdag, konfirmasjon, minnesamvær eller møte? Her er grendehus, samfunnshus og
        selskapslokale i Gloppen, kor mange det er plass til, og kven du skal ta kontakt med.
      </p>

      <form class="filter" (submit)="$event.preventDefault()">
        <div class="felt">
          <label for="gjester">Kor mange gjester?</label>
          <select id="gjester" (change)="oppdater({ gjester: $any($event.target).value })">
            <option value="" [selected]="!gjesterTal()">Same kor mange</option>
            @for (g of gjestar; track g) {
              <option [value]="g" [selected]="g === gjesterTal()">{{ g }} eller fleire</option>
            }
          </select>
        </div>
        <div class="felt">
          <label for="har">Må ha</label>
          <select id="har" (change)="oppdater({ har: $any($event.target).value })">
            <option value="" [selected]="!fasilitetId()">Ingen krav</option>
            @for (f of fasilitetar; track f.id) {
              <option [value]="f.id" [selected]="f.id === fasilitetId()">{{ f.namn }}</option>
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
      </form>

      <p class="treff" aria-live="polite">
        {{ resultat().length }} treff
        @if (utanStorleik() > 0) {
          · {{ utanStorleik() }} lokale utan oppgitt storleik er ikkje med
        }
      </p>

      @if (resultat().length > 0) {
        <ul class="kort-liste lokale-liste">
          @for (l of resultat(); track l.id) {
            <li><app-lokale-kort [lokale]="l" /></li>
          }
        </ul>
      } @else {
        <div class="boks">
          <p>Fann ingen lokale som passar. Prøv å fjerne eit filter.</p>
          <button type="button" class="knapp" (click)="nullstill()">Vis alle</button>
        </div>
      }
    </div>

    <section class="innhald seksjon">
      <div class="lokalmat-tips">
        <div>
          <h2>Før du leiger</h2>
          <dl class="fakta">
            <dt>Ver tidleg ute</dt>
            <dd>
              Konfirmasjonshelgane i mai og juni og helgane før jul går fort. Mange grendehus vert
              leigde ut eitt år fram i tid.
            </dd>
            <dt>Spør kva som er med</dt>
            <dd>
              Servise, duker, vask og straum er ikkje alltid med i leiga. Spør òg om det er
              kjøkkenutstyr nok til å lage mat til alle.
            </dd>
            <dt>Opplysningane kan vere gamle</dt>
            <dd>
              Kontaktpersonar i grendalag byter ofte. Står det ikkje rett person her, prøv
              Facebook-sida til grendalaget eller spør nokon i bygda.
            </dd>
          </dl>
        </div>
        <div class="boks">
          <h2>Leiger du ut eit lokale?</h2>
          <p>
            Manglar lokalet ditt, eller har det byta kontaktperson? Send oss opplysningane, så legg
            vi det inn – gratis.
          </p>
          <a class="knapp" [href]="meldInn" target="_blank" rel="noopener">Meld inn lokale</a>
        </div>
      </div>
    </section>
  `,
})
export class LokaleOversikt {
  private readonly router = inject(Router);
  private readonly service = inject(LokaleService);

  // Kjem frå query-parametrane via withComponentInputBinding().
  readonly stad = input<string>();
  readonly gjester = input<string>();
  readonly har = input<string>();

  protected readonly stader = STADER;
  protected readonly gjestar = GJESTAR;
  protected readonly fasilitetar = FASILITETAR;
  protected readonly meldInn = MELD_INN;

  protected readonly stadNamn = computed(() => {
    const s = this.stad();
    return (STADER as readonly string[]).includes(s ?? '') ? (s as Stad) : null;
  });

  protected readonly gjesterTal = computed(() => {
    const g = Number(this.gjester());
    return (GJESTAR as readonly number[]).includes(g) ? g : null;
  });

  protected readonly fasilitetId = computed(() => {
    const f = this.har();
    return FASILITETAR.some((x) => x.id === f) ? (f as Fasilitet) : null;
  });

  protected readonly resultat = computed(() =>
    this.service.sok({
      stad: this.stadNamn(),
      gjester: this.gjesterTal(),
      fasilitet: this.fasilitetId(),
    }),
  );

  /** Lokale som elles ville passa, men som fell vekk fordi storleiken ikkje er kjend. */
  protected readonly utanStorleik = computed(() => {
    if (!this.gjesterTal()) return 0;
    return this.service
      .sok({ stad: this.stadNamn(), fasilitet: this.fasilitetId() })
      .filter((l) => !l.plassar).length;
  });

  protected oppdater(endring: Endring): void {
    const neste = {
      stad: this.stadNamn() ?? '',
      gjester: this.gjesterTal()?.toString() ?? '',
      har: this.fasilitetId() ?? '',
      ...endring,
    };
    this.router.navigate([], {
      queryParams: {
        stad: neste.stad || null,
        gjester: neste.gjester || null,
        har: neste.har || null,
      },
      replaceUrl: true,
    });
  }

  protected nullstill(): void {
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }
}
