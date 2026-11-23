import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bedrift, finnKategori } from '../models/bedrift';

@Component({
  selector: 'app-bedrift-kort',
  imports: [RouterLink],
  template: `
    <a class="kort" [routerLink]="['/bedrift', bedrift().id]">
      <span class="kort-ikon" aria-hidden="true">{{ kategori().ikon }}</span>
      <span class="kort-innhald">
        <span class="kort-tittel">
          {{ bedrift().namn }}
          @if (bedrift().eksempel) {
            <span class="merke">Døme</span>
          }
        </span>
        <span class="kort-meta">{{ kategori().namn }} · {{ bedrift().stad }}</span>
        <span class="kort-tekst">{{ bedrift().kortSkildring }}</span>
      </span>
    </a>
  `,
})
export class BedriftKort {
  readonly bedrift = input.required<Bedrift>();
  protected readonly kategori = computed(() => finnKategori(this.bedrift().kategori));
}
