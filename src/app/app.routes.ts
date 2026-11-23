import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Bu i Gloppen – butikkar og bedrifter i Gloppen',
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
