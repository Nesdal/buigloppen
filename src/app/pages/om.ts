import { Component } from '@angular/core';

@Component({
  selector: 'app-om',
  template: `
    <div class="innhald seksjon smal">
      <h1>Om Bu i Gloppen</h1>
      <p class="ingress">
        Bu i Gloppen er ei oversikt over butikkar, bedrifter og aktivitetar i Gloppen, laga for folk
        som bur her og for dei som nettopp har flytta hit.
      </p>

      <h2>Manglar bedrifta di?</h2>
      <p>
        Vil du ha bedrifta di med, eller er noko feil? Meld frå via
        <a href="https://github.com/Nesdal/buigloppen/issues" target="_blank" rel="noopener"
          >GitHub</a
        >.
      </p>

      <h2>Har du ein aktivitet?</h2>
      <p>
        Lag, foreiningar, bedrifter og kommunen kan få arrangement og faste aktivitetar med i
        oversikta. Send tittel, dato, stad og ei kort skildring via
        <a href="https://github.com/Nesdal/buigloppen/issues" target="_blank" rel="noopener"
          >GitHub</a
        >.
      </p>

      <h2>Opne data</h2>
      <p>
        Bedriftslista og aktivitetane er lagra i eit enkelt format som kan eksporterast til CSV,
        slik at dei kan delast med andre lokale nettstader.
      </p>
    </div>
  `,
})
export class Om {}
