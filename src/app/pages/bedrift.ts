import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AktivitetKort } from '../components/aktivitet-kort';
import { AktivitetService } from '../services/aktivitet.service';
import { delPraktisk, finnKategori, typeNamn } from '../models/bedrift';
import { finnMatslag, finnSalskanal } from '../models/lokalmat';
import { BedriftService } from '../services/bedrift.service';
import { OppslagKort } from '../components/oppslag-kort';
import { OppslagService, sendInnLenkje } from '../services/oppslag.service';

@Component({
  selector: 'app-bedrift',
  imports: [RouterLink, AktivitetKort, OppslagKort],
  template: `
    <div class="innhald seksjon smal">
      <a routerLink="/bedrifter" class="tilbake">← Alle bedrifter</a>

      @if (bedrift(); as b) {
        <article>
          <p class="kort-meta">
            <span class="type type-{{ b.type }}">{{ type() }}</span>
            {{ kategori()?.ikon }} {{ kategori()?.namn }} · {{ b.stad }}
          </p>
          <h1>
            {{ b.namn }}
            @if (b.eksempel) {
              <span class="merke">Døme</span>
            }
          </h1>
          <p class="ingress">{{ b.kortSkildring }}</p>
          @if (oppslag().length > 0) {
            <h2 class="skjult">Nytt hos {{ b.namn }}</h2>
            <ul class="oppslag-liste">
              @for (o of oppslag(); track o.id) {
                <li><app-oppslag-kort [oppslag]="o" [visBedrift]="false" /></li>
              }
            </ul>
          }
          @if (b.skildring) {
            <p>{{ b.skildring }}</p>
          }

          @if (b.tilbyr.length) {
            <h2>{{ b.type === 'butikk' ? 'Sel' : 'Tilbyr' }}</h2>
            <ul class="tilbyr">
              @for (t of b.tilbyr; track t) {
                <li>{{ t }}</li>
              }
            </ul>
          }

          @if (praktisk().length) {
            <h2>Praktisk informasjon</h2>
            <ul class="praktisk">
              @for (p of praktisk(); track p.tekst) {
                <li>
                  @if (p.overskrift) {
                    <strong>{{ p.overskrift }}:</strong>
                  }
                  {{ p.tekst }}
                </li>
              }
            </ul>
          }

          @if (b.lokalmat?.length) {
            <section class="lokalmat-boks">
              <h2>Lokalmat</h2>
              <p class="lokalmat-matslag">
                @for (m of matslag(); track m.id) {
                  <span><span aria-hidden="true">{{ m.ikon }}</span> {{ m.namn }}</span>
                }
              </p>
              @if (sal().length) {
                <h3>Slik får du kjøpt det</h3>
                <ul class="lokalmat-sal">
                  @for (s of sal(); track s.id) {
                    <li><strong>{{ s.namn }}:</strong> {{ s.forklaring }}</li>
                  }
                </ul>
              }
              @if (b.kjopTekst) {
                <p>{{ b.kjopTekst }}</p>
              }
              @if (b.sesong) {
                <p><strong>Sesong:</strong> {{ b.sesong }}</p>
              }
              <a routerLink="/lokalmat">Meir lokalmat i Gloppen →</a>
            </section>
          }

          <dl class="fakta">
            @if (b.adresse) {
              <dt>Adresse</dt>
              <dd>
                {{ b.adresse }}
                · <a [href]="kartlenkje()" target="_blank" rel="noopener">Vis på kart</a>
              </dd>
            }
            @if (b.opningstider) {
              <dt>Opningstider</dt>
              <dd>{{ b.opningstider }}</dd>
            }
            @if (b.telefon) {
              <dt>Telefon</dt>
              <dd><a [href]="telefonlenkje()">{{ b.telefon }}</a></dd>
            }
            @if (b.epost) {
              <dt>E-post</dt>
              <dd><a [href]="'mailto:' + b.epost">{{ b.epost }}</a></dd>
            }
            @if (b.nettstad) {
              <dt>Nettstad</dt>
              <dd><a [href]="b.nettstad" target="_blank" rel="noopener">{{ b.nettstad }}</a></dd>
            }
          </dl>

          @if (aktivitetar().length > 0) {
            <h2>Aktivitetar hos {{ b.namn }}</h2>
            <ul class="kort-liste">
              @for (a of aktivitetar(); track a.id) {
                <li><app-aktivitet-kort [aktivitet]="a" /></li>
              }
            </ul>
          }

          <p class="kjelde">
            Opningstider og annan informasjon kan endre seg. Sjekk gjerne med {{ b.namn }} før du
            dreg.
            @if (b.sjekka) {
              Sist sjekka {{ datoTekst() }}.
            }
            @if (b.kjelde) {
              <a [href]="b.kjelde" target="_blank" rel="noopener">Kjelde</a> ·
            }
            <a [href]="meldFeil()" target="_blank" rel="noopener">Meld frå om feil</a>
          </p>
          <p class="kjelde">
            Driv du {{ b.namn }}? Har de ny meny, ein spesialitet eller anna nytt,
            <a [href]="sendInn()" target="_blank" rel="noopener">send det inn her</a>, så vert det
            vist på framsida.
          </p>
        </article>
      } @else {
        <h1>Fann ikkje bedrifta</h1>
        <p>Bedrifta finst ikkje, eller ho har fått ny adresse.</p>
      }
    </div>
  `,
})
export class BedriftSide {
  private readonly service = inject(BedriftService);
  private readonly aktivitetService = inject(AktivitetService);
  private readonly oppslagService = inject(OppslagService);

  /** Frå ruteparameteren :id. */
  readonly id = input.required<string>();

  protected readonly bedrift = computed(() => this.service.hent(this.id()));
  protected readonly aktivitetar = computed(() => this.aktivitetService.forBedrift(this.id()));
  protected readonly oppslag = computed(() => this.oppslagService.forBedrift(this.id()));
  protected readonly praktisk = computed(() => (this.bedrift()?.praktisk ?? []).map(delPraktisk));
  protected readonly sendInn = computed(() => sendInnLenkje(this.bedrift()?.namn));
  protected readonly matslag = computed(() => (this.bedrift()?.lokalmat ?? []).map(finnMatslag));
  protected readonly sal = computed(() => (this.bedrift()?.sal ?? []).map(finnSalskanal));
  protected readonly kategori = computed(() => {
    const b = this.bedrift();
    return b ? finnKategori(b.kategori) : undefined;
  });
  protected readonly type = computed(() => {
    const b = this.bedrift();
    return b ? typeNamn(b.type) : '';
  });
  protected readonly datoTekst = computed(() => {
    const dato = this.bedrift()?.sjekka;
    if (!dato) return '';
    return new Date(dato + 'T12:00:00').toLocaleDateString('nn-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });
  protected readonly meldFeil = computed(
    () =>
      'https://github.com/Nesdal/buigloppen/issues/new?title=' +
      encodeURIComponent(`Feil i oppføringa: ${this.bedrift()?.namn ?? ''}`),
  );
  protected readonly telefonlenkje = computed(
    () => 'tel:' + (this.bedrift()?.telefon ?? '').replace(/[^\d+]/g, ''),
  );
  protected readonly kartlenkje = computed(
    () =>
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(this.bedrift()?.adresse ?? ''),
  );
}
