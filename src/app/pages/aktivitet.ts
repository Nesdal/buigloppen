import { Component, computed, inject, input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finnAktivitetKategori, malgruppeTekst } from '../models/aktivitet';
import {
  AktivitetService,
  datoTekst,
  erAktuell,
  isoDato,
  lagIcs,
  tidTekst,
} from '../services/aktivitet.service';
import { BedriftService } from '../services/bedrift.service';
import { nynorskDato } from '../dato';

@Component({
  selector: 'app-aktivitet',
  // Innhaldet avheng av dagens dato, så det vert teikna på nytt i nettlesaren.
  host: { ngSkipHydration: 'true' },
  imports: [RouterLink],
  template: `
    <div class="innhald seksjon smal">
      @if (aktivitet()?.type === 'fast') {
        <a routerLink="/fritid" class="tilbake">← Trening og fritid</a>
      } @else {
        <a routerLink="/aktivitetar" class="tilbake">← Kva skjer i Gloppen</a>
      }

      @if (aktivitet(); as a) {
        <article>
          <p class="kort-meta">
            {{ kategori()?.ikon }} {{ a.gren ?? kategori()?.namn }} · {{ a.stad }}
          </p>
          <h1>
            {{ a.tittel }}
            @if (a.eksempel) {
              <span class="merke">Døme</span>
            }
          </h1>
          <p class="ingress">{{ a.kortSkildring }}</p>

          @if (erOver()) {
            <p class="boks">Dette arrangementet er over.</p>
          }

          @if (a.skildring) {
            <p>{{ a.skildring }}</p>
          }

          <dl class="fakta">
            @if (a.type === 'arrangement') {
              <dt>Dato</dt>
              <dd>{{ dato() }}</dd>
              @if (tid()) {
                <dt>Tid</dt>
                <dd>{{ tid() }}</dd>
              }
            } @else {
              <dt>Når</dt>
              <dd>
                {{ a.naar }}
                @if (a.sesong) {
                  <br /><span class="kort-meta">{{ a.sesong }}</span>
                }
              </dd>
            }
            <dt>Stad</dt>
            <dd>
              {{ stad() }} · <a [href]="kartlenkje()" target="_blank" rel="noopener">Vis på kart</a>
            </dd>
            <dt>For</dt>
            <dd>{{ malgruppe() }}</dd>
            @if (a.arrangor || bedrift()) {
              <dt>Arrangør</dt>
              <dd>
                @if (bedrift(); as b) {
                  <a [routerLink]="['/bedrift', b.id]">{{ a.arrangor ?? b.namn }}</a>
                } @else {
                  {{ a.arrangor }}
                }
              </dd>
            }
            @if (a.telefon) {
              <dt>Telefon</dt>
              <dd>
                <a [href]="telefonlenkje()">{{ a.telefon }}</a>
              </dd>
            }
            @if (a.epost) {
              <dt>E-post</dt>
              <dd>
                <a [href]="'mailto:' + a.epost">{{ a.epost }}</a>
              </dd>
            }
            @if (a.nettstad) {
              <dt>Nettstad</dt>
              <dd>
                <a [href]="a.nettstad" target="_blank" rel="noopener">{{ a.nettstad }}</a>
              </dd>
            }
          </dl>

          @if (!erOver() && (a.pamelding || ics())) {
            <p class="handlingar">
              @if (a.pamelding) {
                <a class="knapp" [href]="a.pamelding" target="_blank" rel="noopener">
                  Påmelding og billettar
                </a>
              }
              @if (ics()) {
                <a class="knapp knapp-sekundar" [href]="ics()" [download]="a.id + '.ics'">
                  Legg til i kalenderen
                </a>
              }
            </p>
          }

          <p class="kjelde">
            Tid og stad kan endre seg. Sjekk gjerne med arrangøren før du dreg.
            @if (a.sjekka) {
              Sist sjekka {{ sjekka() }}.
            }
            @if (a.kjelde) {
              <a [href]="a.kjelde" target="_blank" rel="noopener">Kjelde</a> ·
            }
            <a [href]="meldFeil()" target="_blank" rel="noopener">Meld frå om feil</a>
          </p>
        </article>
      } @else {
        <h1>Fann ikkje aktiviteten</h1>
        <p>Aktiviteten finst ikkje, eller han har fått ny adresse.</p>
      }
    </div>
  `,
})
export class AktivitetSide {
  private readonly service = inject(AktivitetService);
  private readonly bedrifter = inject(BedriftService);
  private readonly document = inject(DOCUMENT);

  /** Frå ruteparameteren :id. */
  readonly id = input.required<string>();

  protected readonly aktivitet = computed(() => this.service.hent(this.id()));
  protected readonly kategori = computed(() => {
    const a = this.aktivitet();
    return a ? finnAktivitetKategori(a.kategori) : undefined;
  });
  protected readonly bedrift = computed(() => {
    const id = this.aktivitet()?.bedriftId;
    return id ? this.bedrifter.hent(id) : undefined;
  });
  protected readonly erOver = computed(() => {
    const a = this.aktivitet();
    return !!a && !erAktuell(a, isoDato());
  });
  protected readonly dato = computed(() => {
    const a = this.aktivitet();
    return a ? datoTekst(a, true) : '';
  });
  protected readonly tid = computed(() => {
    const a = this.aktivitet();
    return a ? tidTekst(a) : '';
  });
  protected readonly stad = computed(() => {
    const a = this.aktivitet();
    return a ? [a.lokale, a.stad].filter(Boolean).join(', ') : '';
  });
  protected readonly malgruppe = computed(() => malgruppeTekst(this.aktivitet()?.malgruppe));
  protected readonly ics = computed(() => {
    const a = this.aktivitet();
    const ics = a ? lagIcs(a, this.document.location?.href ?? '') : '';
    return ics ? 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics) : '';
  });
  protected readonly sjekka = computed(() => {
    const dato = this.aktivitet()?.sjekka;
    if (!dato) return '';
    return nynorskDato(dato, { aar: true });
  });
  protected readonly meldFeil = computed(
    () =>
      'https://github.com/Nesdal/buigloppen/issues/new?title=' +
      encodeURIComponent(`Feil i aktiviteten: ${this.aktivitet()?.tittel ?? ''}`),
  );
  protected readonly telefonlenkje = computed(
    () => 'tel:' + (this.aktivitet()?.telefon ?? '').replace(/[^\d+]/g, ''),
  );
  protected readonly kartlenkje = computed(
    () =>
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(this.stad() + ', Gloppen'),
  );
}
