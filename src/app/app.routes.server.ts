import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { AktivitetService } from './services/aktivitet.service';
import { BedriftService } from './services/bedrift.service';

/**
 * Alle sider vert førehandsrendra til statisk HTML ved `npm run build`, slik at
 * søkjemotorar og delingskort (Facebook, Messenger …) ser innhaldet utan å køyre JavaScript.
 * Nye bedrifter og aktivitetar i JSON-filene kjem med automatisk ved neste bygging.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'bedrift/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      inject(BedriftService)
        .alle()
        .map((b) => ({ id: b.id })),
  },
  {
    path: 'aktivitet/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      inject(AktivitetService)
        .alle()
        .map((a) => ({ id: a.id })),
  },
  // Framsida og oversiktssidene. Ukjende adresser får index.csr.html (sjå vercel.json),
  // og 404-sida vert då teikna i nettlesaren.
  { path: '**', renderMode: RenderMode.Prerender },
];
