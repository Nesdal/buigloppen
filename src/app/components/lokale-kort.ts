import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Lokale, finnFasilitet, finnLokaleSlag } from '../models/lokale';
import { nynorskDato } from '../dato';

/**
 * Kort for eit lokale til leige. Kontaktinformasjonen står rett på kortet,
 * sidan det er han folk er ute etter.
 */
@Component({
  selector: 'app-lokale-kort',
  imports: [RouterLink],
  template: `
    <article class="kort lokale-kort">
      <span class="kort-ikon" aria-hidden="true">{{ slag().ikon }}</span>
      <div class="kort-innhald">
        <h3 class="kort-tittel">{{ lokale().namn }}</h3>
        <p class="kort-meta">{{ slag().namn }} · {{ stadTekst() }}</p>
        @if (lokale().plassar || lokale().plassarTekst) {
          <p class="lokale-plassar">
            <span aria-hidden="true">👥</span>
            {{ lokale().plassarTekst ?? 'ca. ' + lokale().plassar + ' personar' }}
          </p>
        }
        <p class="kort-tekst">{{ lokale().kortSkildring }}</p>

        @if (fasilitetar().length) {
          <ul class="brikker" aria-label="Fasilitetar">
            @for (f of fasilitetar(); track f.id) {
              <li class="brikke">{{ f.namn }}</li>
            }
          </ul>
        }

        @if (lokale().praktisk?.length) {
          <ul class="lokale-praktisk">
            @for (p of lokale().praktisk; track p) {
              <li>{{ p }}</li>
            }
          </ul>
        }

        <dl class="lokale-kontakt">
          @if (lokale().utleigar) {
            <dt>Utleigar</dt>
            <dd>
              @if (lokale().bedriftId) {
                <a [routerLink]="['/bedrift', lokale().bedriftId]">{{ lokale().utleigar }}</a>
              } @else {
                {{ lokale().utleigar }}
              }
            </dd>
          }
          @if (lokale().kontakt) {
            <dt>Kontakt</dt>
            <dd>{{ lokale().kontakt }}</dd>
          }
          @if (lokale().telefon) {
            <dt>Telefon</dt>
            <dd>
              <a [href]="'tel:' + lokale().telefon!.replace(/\\s/g, '')">{{ lokale().telefon }}</a>
            </dd>
          }
          @if (lokale().epost) {
            <dt>E-post</dt>
            <dd>
              <a [href]="'mailto:' + lokale().epost">{{ lokale().epost }}</a>
            </dd>
          }
          @if (lokale().adresse) {
            <dt>Adresse</dt>
            <dd>{{ lokale().adresse }}</dd>
          }
        </dl>

        @if (lokale().booking || lokale().nettstad) {
          <p class="lokale-lenkjer">
            @if (lokale().booking) {
              <a class="knapp knapp-liten" [href]="lokale().booking" target="_blank" rel="noopener"
                >Sjekk ledige datoar</a
              >
            }
            @if (lokale().nettstad) {
              <a [href]="lokale().nettstad" target="_blank" rel="noopener">Nettstad</a>
            }
          </p>
        }

        <p class="lokale-kjelde">
          <a [href]="lokale().kjelde" target="_blank" rel="noopener">Kjelde</a>, sjekka
          {{ sjekkaTekst() }}
        </p>
      </div>
    </article>
  `,
})
export class LokaleKort {
  readonly lokale = input.required<Lokale>();

  protected readonly slag = computed(() => finnLokaleSlag(this.lokale().slag));
  protected readonly fasilitetar = computed(() =>
    (this.lokale().fasilitetar ?? []).map(finnFasilitet),
  );
  protected readonly stadTekst = computed(() => {
    const { stad, bygd } = this.lokale();
    return bygd && bygd !== stad ? `${bygd}, ${stad}` : stad;
  });
  protected readonly sjekkaTekst = computed(() => nynorskDato(this.lokale().sjekka, { aar: true }));
}
