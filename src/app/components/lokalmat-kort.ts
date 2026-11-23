import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bedrift } from '../models/bedrift';
import { finnMatslag, finnSalskanal } from '../models/lokalmat';

/** Kort for ein lokalmatprodusent: kva dei lagar, og korleis du får kjøpt det. */
@Component({
  selector: 'app-lokalmat-kort',
  imports: [RouterLink],
  template: `
    <a class="kort lokalmat-kort" [routerLink]="['/bedrift', bedrift().id]">
      <span class="kort-ikon" aria-hidden="true">{{ matslag()[0].ikon }}</span>
      <span class="kort-innhald">
        <span class="kort-tittel">{{ bedrift().namn }}</span>
        <span class="kort-meta">{{ matslagTekst() }} · {{ bedrift().stad }}</span>
        <span class="kort-tekst">{{ bedrift().kortSkildring }}</span>
        @if (sal().length) {
          <span class="brikker">
            <span class="skjult">Kjøp:</span>
            @for (s of sal(); track s.id) {
              <span class="brikke brikke-sal brikke-{{ s.id }}">{{ s.namn }}</span>
            }
          </span>
        }
        @if (bedrift().sesong) {
          <span class="kort-sesong">Sesong: {{ bedrift().sesong }}</span>
        }
      </span>
    </a>
  `,
})
export class LokalmatKort {
  readonly bedrift = input.required<Bedrift>();

  protected readonly matslag = computed(() =>
    (this.bedrift().lokalmat ?? ['anna']).map(finnMatslag),
  );
  protected readonly matslagTekst = computed(() =>
    this.matslag()
      .map((m, i) => (i === 0 ? m.namn : m.namn.toLocaleLowerCase('nn')))
      .join(', '),
  );
  protected readonly sal = computed(() => (this.bedrift().sal ?? []).map(finnSalskanal));
}
