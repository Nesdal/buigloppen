import { Component } from '@angular/core';

@Component({
  selector: 'app-om',
  template: `
    <div class="innhald seksjon smal">
      <h1>Om Bu i Gloppen</h1>
      <p class="ingress">
        Bu i Gloppen er ei oversikt over butikkar og bedrifter i Gloppen, laga for folk som bur
        her og for dei som nettopp har flytta hit.
      </p>

      <h2>Manglar bedrifta di?</h2>
      <p>
        Vil du ha bedrifta di med, eller er noko feil? Meld frå via
        <a href="https://github.com/Nesdal/buigloppen/issues" target="_blank" rel="noopener">GitHub</a>.
      </p>

      <h2>Opne data</h2>
      <p>
        Bedriftslista er lagra i eit enkelt format som kan eksporterast til CSV, slik at ho kan
        delast med andre lokale nettstader.
      </p>
    </div>
  `,
})
export class Om {}
