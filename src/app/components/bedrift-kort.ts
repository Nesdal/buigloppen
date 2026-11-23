import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bedrift, finnKategori, typeNamn } from '../models/bedrift';
import { finnOppslagType } from '../models/oppslag';
import { OppslagService } from '../services/oppslag.service';

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
        @if (nytt(); as o) {
          <span class="kort-nytt">{{ nyttType()?.ikon }} {{ nyttType()?.namn }}: {{ o.tittel }}</span>
        }
        <span class="kort-meta">
          <span class="type type-{{ bedrift().type }}">{{ type() }}</span>
          {{ kategori().namn }} · {{ bedrift().stad }}
        </span>
        <span class="kort-tekst">{{ bedrift().kortSkildring }}</span>
        @if (bedrift().tilbyr.length) {
          <span class="brikker">
            @for (t of bedrift().tilbyr.slice(0, 4); track t) {
              <span class="brikke">{{ t }}</span>
            }
          </span>
        }
      </span>
    </a>
  `,
})
export class BedriftKort {
  readonly bedrift = input.required<Bedrift>();
  protected readonly kategori = computed(() => finnKategori(this.bedrift().kategori));
  protected readonly type = computed(() => typeNamn(this.bedrift().type));

  private readonly oppslagService = inject(OppslagService);
  protected readonly nytt = computed(() => this.oppslagService.nyasteForBedrift(this.bedrift().id));
  protected readonly nyttType = computed(() => {
    const o = this.nytt();
    return o ? finnOppslagType(o.type) : undefined;
  });
}
