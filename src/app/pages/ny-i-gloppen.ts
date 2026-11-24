import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KartVising } from '../components/kart';
import { KART_GLOPPEN } from '../data/kart-gloppen';
import { KART_SANDANE } from '../data/kart-sandane';

@Component({
  selector: 'app-ny-i-gloppen',
  imports: [RouterLink, KartVising],
  template: `
    <div class="innhald seksjon smal">
      <h1>Ny i Gloppen</h1>
      <p class="ingress">
        Velkomen til Gloppen! Her er nokre stader å starte når du skal finne deg til rette.
      </p>

      <h2>Bygdene i Gloppen</h2>
      <p>
        Gloppen strekkjer seg frå Hyen og Hestenesøyri i vest til Byrkjelo og Egge i aust, med
        Sandane som kommunesenter inst i Gloppefjorden.
      </p>
      <app-kart [kart]="gloppen" />

      <h2>Kva heiter kvar på Sandane?</h2>
      <p>
        Når nokon seier at dei bur på Øyrane eller skal opp til Evebø, er det greitt å vite kvar det
        er. Her er namna folk brukar på dei ulike delane av Sandane.
      </p>
      <app-kart [kart]="sandane" />

      <h2>Kommunale tenester</h2>
      <p>
        Barnehage, skule, legeteneste, renovasjon, byggesaker og anna kommunalt finn du hos
        <a href="https://www.gloppen.kommune.no" target="_blank" rel="noopener">Gloppen kommune</a>.
      </p>

      <h2>Handle lokalt</h2>
      <p>
        I <a routerLink="/bedrifter">bedriftsoversikta</a> finn du butikkar, kafear, handverkarar og
        tenester i heile kommunen. Du kan søkje på det du treng, eller filtrere på bygd.
      </p>

      <h2>Bli kjend</h2>
      <p>
        Den beste måten å kome inn i bygda på er ofte å bli med på noko. Under
        <a routerLink="/aktivitetar">Kva skjer</a> finn du konsertar, kampar, marknader og
        folkemøte. Under <a routerLink="/fritid">Trening og fritid</a> finn du idrettslag, kor,
        klubbar og treffpunkt som møtest fast.
      </p>
      <p>
        Er du under 40, er <a routerLink="/aktivitet/gloppen-u40">Gloppen U40</a> ein god stad å
        starte. Det er eit nettverk for unge vaksne i Gloppen med treff, turar og sosiale kveldar,
        og ein enkel måte å bli kjend med folk på når du er ny.
      </p>
      <p>
        Under <a routerLink="/for-deg">For deg</a> kan du skrive inn alderen din og få tips om lag,
        nettverk og arrangement som passar.
      </p>

      <h2>Opplevingar og fritid</h2>
      <p>
        Turar, festivalar, arrangement og overnatting finn du på
        <a href="https://www.visit-gloppen.no" target="_blank" rel="noopener">Visit Gloppen</a>.
      </p>
    </div>
  `,
})
export class NyIGloppen {
  protected readonly gloppen = KART_GLOPPEN;
  protected readonly sandane = KART_SANDANE;
}
