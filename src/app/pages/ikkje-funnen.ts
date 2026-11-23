import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ikkje-funnen',
  imports: [RouterLink],
  template: `
    <div class="innhald seksjon smal">
      <h1>Fann ikkje sida</h1>
      <p>Sida du leitar etter finst ikkje.</p>
      <a routerLink="/" class="knapp">Til framsida</a>
    </div>
  `,
})
export class IkkjeFunnen {}
