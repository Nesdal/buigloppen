import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finnOppslagType, Oppslag } from '../models/oppslag';
import { isoDato } from '../services/aktivitet.service';
import { BedriftService } from '../services/bedrift.service';
import { erFerskt, kortDato } from '../services/oppslag.service';

/**
 * Viser eit oppslag («Ny meny», «Tilbod» …). Med `visBedrift` (standard) peikar kortet
 * til sida til bedrifta; på sjølve bedriftssida vert det vist utan lenkje.
 */
@Component({
  selector: 'app-oppslag-kort',
  imports: [RouterLink],
  template: `
    <article class="oppslag" [class.oppslag-ferskt]="ferskt()">
      <p class="oppslag-topp">
        <span class="oppslag-type">{{ type().ikon }} {{ type().namn }}</span>
        @if (ferskt()) {
          <span class="merke merke-nytt">Nytt!</span>
        }
        @if (oppslag().eksempel) {
          <span class="merke">Døme</span>
        }
      </p>
      <h3 class="oppslag-tittel">{{ oppslag().tittel }}</h3>
      @if (visBedrift() && bedrift(); as b) {
        <p class="oppslag-bedrift">
          <a [routerLink]="['/bedrift', b.id]">{{ b.namn }}</a> · {{ b.stad }}
        </p>
      }
      <p class="oppslag-tekst">{{ oppslag().tekst }}</p>
      <p class="oppslag-dato">
        Lagt ut {{ fra() }}
        @if (oppslag().til) {
          · gjeld til {{ til() }}
        }
        @if (oppslag().lenkje; as lenkje) {
          · <a [href]="lenkje" target="_blank" rel="noopener">Les meir</a>
        }
      </p>
    </article>
  `,
})
export class OppslagKort {
  readonly oppslag = input.required<Oppslag>();
  readonly visBedrift = input(true);

  private readonly bedriftService = inject(BedriftService);

  protected readonly type = computed(() => finnOppslagType(this.oppslag().type));
  protected readonly bedrift = computed(() => this.bedriftService.hent(this.oppslag().bedriftId));
  protected readonly ferskt = computed(() => erFerskt(this.oppslag(), isoDato()));
  protected readonly fra = computed(() => kortDato(this.oppslag().fra));
  protected readonly til = computed(() => {
    const til = this.oppslag().til;
    return til ? kortDato(til) : '';
  });
}
