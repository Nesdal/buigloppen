import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Aktivitet, finnAktivitetKategori, malgruppeTekst } from '../models/aktivitet';
import { naarTekst } from '../services/aktivitet.service';

@Component({
  selector: 'app-aktivitet-kort',
  imports: [RouterLink],
  template: `
    <a class="kort" [routerLink]="['/aktivitet', aktivitet().id]">
      @if (dag(); as d) {
        <span class="datoblokk" aria-hidden="true">
          <span class="datoblokk-dag">{{ d.dag }}</span>
          <span class="datoblokk-manad">{{ d.manad }}</span>
        </span>
      } @else {
        <span class="kort-ikon" aria-hidden="true">{{ kategori().ikon }}</span>
      }
      <span class="kort-innhald">
        <span class="kort-tittel">
          {{ aktivitet().tittel }}
          @if (aktivitet().eksempel) {
            <span class="merke">Døme</span>
          }
        </span>
        <span class="kort-naar">{{ naar() }}</span>
        <span class="kort-meta">
          {{ kategori().namn }} · {{ stad() }}
        </span>
        <span class="kort-tekst">{{ aktivitet().kortSkildring }}</span>
        <span class="brikker">
          <span class="brikke">{{ malgruppe() }}</span>
          @if (aktivitet().pris; as pris) {
            <span class="brikke">{{ pris }}</span>
          }
        </span>
      </span>
    </a>
  `,
})
export class AktivitetKort {
  readonly aktivitet = input.required<Aktivitet>();

  protected readonly kategori = computed(() => finnAktivitetKategori(this.aktivitet().kategori));
  protected readonly naar = computed(() => naarTekst(this.aktivitet()));
  protected readonly stad = computed(() =>
    [this.aktivitet().lokale, this.aktivitet().stad].filter(Boolean).join(', '),
  );
  protected readonly malgruppe = computed(() => malgruppeTekst(this.aktivitet().malgruppe));
  protected readonly dag = computed(() => {
    const dato = this.aktivitet().dato;
    if (this.aktivitet().type !== 'arrangement' || !dato) return null;
    const d = new Date(dato + 'T12:00:00');
    return {
      dag: d.getDate(),
      manad: d.toLocaleDateString('nn-NO', { month: 'short' }).replace('.', ''),
    };
  });
}
