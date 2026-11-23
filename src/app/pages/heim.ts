import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { KATEGORIAR } from '../models/bedrift';
import { BedriftService } from '../services/bedrift.service';

@Component({
  selector: 'app-heim',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="hero">
      <div class="innhald">
        <h1>Handle lokalt i Gloppen</h1>
        <p class="ingress">
          Finn butikkar, kafear, handverkarar og andre bedrifter i Sandane, Byrkjelo, Breim, Hyen
          og resten av Gloppen – anten du har budd her heile livet eller nettopp har flytta hit.
        </p>
        <form class="sok" role="search" (ngSubmit)="sok()">
          <label class="skjult" for="heim-sok">Søk etter bedrift eller teneste</label>
          <input
            id="heim-sok"
            type="search"
            name="sok"
            [(ngModel)]="sokeord"
            placeholder="Kva leitar du etter? T.d. frisør, kaffi, dekk …"
            autocomplete="off"
          />
          <button type="submit">Søk</button>
        </form>
      </div>
    </section>

    <section class="innhald seksjon">
      <h2>Kategoriar</h2>
      <ul class="kategori-rutenett">
        @for (k of kategoriar; track k.id) {
          <li>
            <a [routerLink]="['/bedrifter']" [queryParams]="{ kategori: k.id }" class="kategori">
              <span class="kategori-ikon" aria-hidden="true">{{ k.ikon }}</span>
              <span class="kategori-namn">{{ k.namn }}</span>
              <span class="kategori-tal">{{ tal(k.id) }}</span>
            </a>
          </li>
        }
      </ul>
    </section>

    <section class="innhald seksjon">
      <div class="boks">
        <h2>Ny i Gloppen?</h2>
        <p>
          Velkomen! Vi har samla nyttige lenker og tips for deg som nettopp har flytta hit, eller som
          vurderer å gjere det.
        </p>
        <a routerLink="/ny-i-gloppen" class="knapp">Les meir</a>
      </div>
    </section>
  `,
})
export class Heim {
  private readonly router = inject(Router);
  private readonly service = inject(BedriftService);

  protected readonly kategoriar = KATEGORIAR;
  protected sokeord = '';

  protected tal(id: (typeof KATEGORIAR)[number]['id']): number {
    return this.service.tal(id);
  }

  protected sok(): void {
    const sok = this.sokeord.trim();
    this.router.navigate(['/bedrifter'], { queryParams: sok ? { sok } : {} });
  }
}
