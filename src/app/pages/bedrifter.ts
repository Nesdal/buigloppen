import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { BedriftKort } from '../components/bedrift-kort';
import { KATEGORIAR, KategoriId, STADER, Stad } from '../models/bedrift';
import { BedriftService } from '../services/bedrift.service';

/**
 * Oversikt med søk og filter. Filtra ligg i adressa (?sok=&kategori=&stad=),
 * så eit søk kan delast som lenkje og tilbake-knappen fungerer.
 */
@Component({
  selector: 'app-bedrifter',
  imports: [BedriftKort],
  template: `
    <div class="innhald seksjon">
      <h1>Bedrifter i Gloppen</h1>

      <form class="filter" role="search" (submit)="$event.preventDefault()">
        <div class="felt felt-brei">
          <label for="sok">Søk</label>
          <input
            id="sok"
            type="search"
            [value]="sok() ?? ''"
            (input)="oppdater({ sok: $any($event.target).value })"
            placeholder="Namn, vare eller teneste"
            autocomplete="off"
          />
        </div>
        <div class="felt">
          <label for="kategori">Kategori</label>
          <select id="kategori" (change)="oppdater({ kategori: $any($event.target).value })">
            <option value="" [selected]="!kategoriId()">Alle kategoriar</option>
            @for (k of kategoriar; track k.id) {
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
      </form>

      <p class="treff" aria-live="polite">
        {{ resultat().length }} {{ resultat().length === 1 ? 'bedrift' : 'bedrifter' }}
      </p>

      @if (resultat().length > 0) {
        <ul class="kort-liste">
          @for (b of resultat(); track b.id) {
            <li><app-bedrift-kort [bedrift]="b" /></li>
          }
        </ul>
      } @else {
        <div class="boks">
          <p>Fann ingen bedrifter som passar. Prøv eit anna søkjeord eller fjern eit filter.</p>
          <button type="button" class="knapp" (click)="nullstill()">Vis alle</button>
        </div>
      }
    </div>
  `,
})
export class Bedrifter {
  private readonly router = inject(Router);
  private readonly service = inject(BedriftService);

  // Kjem frå query-parametrane via withComponentInputBinding().
  readonly sok = input<string>();
  readonly kategori = input<string>();
  readonly stad = input<string>();

  protected readonly kategoriar = KATEGORIAR;
  protected readonly stader = STADER;

  protected readonly kategoriId = computed(() => {
    const k = this.kategori();
    return KATEGORIAR.some((x) => x.id === k) ? (k as KategoriId) : null;
  });

  protected readonly stadNamn = computed(() => {
    const s = this.stad();
    return (STADER as readonly string[]).includes(s ?? '') ? (s as Stad) : null;
  });

  protected readonly resultat = computed(() =>
    this.service.sok({ sok: this.sok(), kategori: this.kategoriId(), stad: this.stadNamn() }),
  );

  protected oppdater(endring: { sok?: string; kategori?: string; stad?: string }): void {
    const neste = {
      sok: this.sok() ?? '',
      kategori: this.kategoriId() ?? '',
      stad: this.stadNamn() ?? '',
      ...endring,
    };
    this.router.navigate([], {
      queryParams: {
        sok: neste.sok.trim() || null,
        kategori: neste.kategori || null,
        stad: neste.stad || null,
      },
      replaceUrl: true,
    });
  }

  protected nullstill(): void {
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }
}
