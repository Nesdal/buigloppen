import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OppslagKort } from '../components/oppslag-kort';
import { OppslagService, sendInnLenkje } from '../services/oppslag.service';

@Component({
  selector: 'app-nytt',
  imports: [RouterLink, OppslagKort],
  template: `
    <div class="innhald seksjon">
      <h1>Nytt og verdt eit besøk</h1>
      <p class="ingress">
        Ny meny, ein spesialitet denne veka, eit tilbod eller ei nyopning – her ser du kva som er
        nytt hos kafear, restaurantar og andre bedrifter i Gloppen.
      </p>

      @if (oppslag.length > 0) {
        <ul class="kort-liste">
          @for (o of oppslag; track o.id) {
            <li><app-oppslag-kort [oppslag]="o" /></li>
          }
        </ul>
      } @else {
        <p>
          Ingen har lagt ut noko nytt akkurat no. Sjå alle
          <a [routerLink]="['/bedrifter']" [queryParams]="{ kategori: 'mat-og-servering' }">
            kafear og restaurantar</a
          >.
        </p>
      }

      <div class="boks tips">
        <h2>Har du kafé, restaurant eller butikk?</h2>
        <p>
          Fortel folk i Gloppen at det er noko nytt hos deg. Send inn ein kort tekst, så legg vi det
          ut her og på framsida. Oppslaget vert vist i 30 dagar om du ikkje skriv noko anna.
        </p>
        <a class="knapp" [href]="sendInn" target="_blank" rel="noopener">Send inn noko nytt</a>
      </div>
    </div>
  `,
})
export class Nytt {
  protected readonly oppslag = inject(OppslagService).aktive();
  protected readonly sendInn = sendInnLenkje();
}
