import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finnKategori } from '../models/bedrift';
import { BedriftService } from '../services/bedrift.service';

@Component({
  selector: 'app-bedrift',
  imports: [RouterLink],
  template: `
    <div class="innhald seksjon smal">
      <a routerLink="/bedrifter" class="tilbake">← Alle bedrifter</a>

      @if (bedrift(); as b) {
        <article>
          <p class="kort-meta">{{ kategori()?.ikon }} {{ kategori()?.namn }} · {{ b.stad }}</p>
          <h1>
            {{ b.namn }}
            @if (b.eksempel) {
              <span class="merke">Døme</span>
            }
          </h1>
          <p class="ingress">{{ b.kortSkildring }}</p>
          @if (b.skildring) {
            <p>{{ b.skildring }}</p>
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

  /** Frå ruteparameteren :id. */
  readonly id = input.required<string>();

  protected readonly bedrift = computed(() => this.service.hent(this.id()));
  protected readonly kategori = computed(() => {
    const b = this.bedrift();
    return b ? finnKategori(b.kategori) : undefined;
  });
  protected readonly telefonlenkje = computed(
    () => 'tel:' + (this.bedrift()?.telefon ?? '').replace(/[^\d+]/g, ''),
  );
  protected readonly kartlenkje = computed(
    () =>
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(this.bedrift()?.adresse ?? ''),
  );
}
