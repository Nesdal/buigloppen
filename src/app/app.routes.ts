import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Bu i Gloppen – butikkar, bedrifter og aktivitetar i Gloppen',
    loadComponent: () => import('./pages/heim').then((m) => m.Heim),
  },
  {
    path: 'bedrifter',
    title: 'Bedrifter – Bu i Gloppen',
    loadComponent: () => import('./pages/bedrifter').then((m) => m.Bedrifter),
  },
  {
    path: 'bedrift/:id',
    title: 'Bedrift – Bu i Gloppen',
    loadComponent: () => import('./pages/bedrift').then((m) => m.BedriftSide),
  },
  {
    path: 'aktivitetar',
    title: 'Kva skjer i Gloppen – Bu i Gloppen',
    loadComponent: () => import('./pages/aktivitetar').then((m) => m.Aktivitetar),
  },
  {
    path: 'aktivitet/:id',
    title: 'Aktivitet – Bu i Gloppen',
    loadComponent: () => import('./pages/aktivitet').then((m) => m.AktivitetSide),
  },
  {
    path: 'lokalmat',
    title: 'Lokalmat og gardsutsal i Gloppen – Bu i Gloppen',
    loadComponent: () => import('./pages/lokalmat').then((m) => m.Lokalmat),
  },
  {
    path: 'nytt',
    title: 'Nytt hos kafear og bedrifter – Bu i Gloppen',
    loadComponent: () => import('./pages/nytt').then((m) => m.Nytt),
  },
  {
    path: 'ny-i-gloppen',
    title: 'Ny i Gloppen – Bu i Gloppen',
    loadComponent: () => import('./pages/ny-i-gloppen').then((m) => m.NyIGloppen),
  },
  {
    path: 'om',
    title: 'Om – Bu i Gloppen',
    loadComponent: () => import('./pages/om').then((m) => m.Om),
  },
  {
    path: '**',
    title: 'Fann ikkje sida – Bu i Gloppen',
    loadComponent: () => import('./pages/ikkje-funnen').then((m) => m.IkkjeFunnen),
  },
];
