import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ny-i-gloppen',
  imports: [RouterLink],
  template: `
    <div class="innhald seksjon smal">
      <h1>Ny i Gloppen</h1>
      <p class="ingress">
        Velkomen til Gloppen! Her er nokre stader å starte når du skal finne deg til rette.
      </p>

      <h2>Kommunale tenester</h2>
      <p>
        Barnehage, skule, legeteneste, renovasjon, byggesaker og anna kommunalt finn du hos
        <a href="https://www.gloppen.kommune.no" target="_blank" rel="noopener">Gloppen kommune</a>.
      </p>

      <h2>Handle lokalt</h2>
      <p>
        I <a routerLink="/bedrifter">bedriftsoversikta</a> finn du butikkar, kafear, handverkarar
        og tenester i heile kommunen. Du kan søkje på det du treng, eller filtrere på bygd.
      </p>

      <h2>Opplevingar og fritid</h2>
      <p>
        Turar, festivalar, arrangement og overnatting finn du på
        <a href="https://www.visit-gloppen.no" target="_blank" rel="noopener">Visit Gloppen</a>.
      </p>
    </div>
  `,
})
export class NyIGloppen {}
