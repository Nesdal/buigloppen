import { Routes } from '@angular/router';
import { aktivitetSeo, aktivitetTittel, bedriftSeo, bedriftTittel } from './seo';

export const routes: Routes = [
  {
    path: '',
    title: 'Bu i Gloppen – butikkar, bedrifter og aktivitetar i Gloppen',
    data: {
      skildring:
        'Finn butikkar, kafear, handverkarar, arrangement og fritidsaktivitetar i Gloppen – frå Sandane og Byrkjelo til Breim og Hyen.',
    },
    loadComponent: () => import('./pages/heim').then((m) => m.Heim),
  },
  {
    path: 'bedrifter',
    title: 'Bedrifter – Bu i Gloppen',
    data: {
      skildring:
        'Butikkar, kafear, handverkarar og andre bedrifter i Gloppen, med adresse, opningstider og kontaktinfo. Søk og filtrer på kategori og stad.',
    },
    loadComponent: () => import('./pages/bedrifter').then((m) => m.Bedrifter),
  },
  {
    path: 'bedrift/:id',
    title: bedriftTittel,
    resolve: { seo: bedriftSeo },
    loadComponent: () => import('./pages/bedrift').then((m) => m.BedriftSide),
  },
  {
    path: 'aktivitetar',
    title: 'Kva skjer i Gloppen – Bu i Gloppen',
    data: {
      skildring:
        'Konsertar, marknader, kampar, møte og andre arrangement i Gloppen dei neste vekene.',
    },
    loadComponent: () => import('./pages/aktivitetar').then((m) => m.Aktivitetar),
  },
  {
    path: 'fritid',
    title: 'Trening og fritid i Gloppen – Bu i Gloppen',
    data: {
      skildring:
        'Idrettslag, kor, korps og andre faste fritidsaktivitetar for barn, unge og vaksne i Gloppen.',
    },
    loadComponent: () => import('./pages/fritid').then((m) => m.Fritid),
  },
  {
    path: 'aktivitet/:id',
    title: aktivitetTittel,
    resolve: { seo: aktivitetSeo },
    loadComponent: () => import('./pages/aktivitet').then((m) => m.AktivitetSide),
  },
  {
    path: 'kino',
    title: 'Kinoprogram og kultursal i Trivselshagen – Bu i Gloppen',
    data: {
      skildring:
        'Kinoprogrammet i Trivselshagen på Sandane: filmar, visingstider og billettar, og arrangement i kultursalen.',
    },
    loadComponent: () => import('./pages/kino').then((m) => m.Kino),
  },
  {
    path: 'for-deg',
    title: 'Tips for deg – Bu i Gloppen',
    data: {
      skildring:
        'Skriv inn alderen din og få tips om lag, nettverk og arrangement i Gloppen som passar for deg.',
    },
    loadComponent: () => import('./pages/for-deg').then((m) => m.ForDeg),
  },
  {
    path: 'lokalmat',
    title: 'Lokalmat og gardsutsal i Gloppen – Bu i Gloppen',
    data: {
      skildring:
        'Kjøp lokalmat direkte frå gardar og produsentar i Gloppen – gardsutsal, sjølvbetening, REKO-ring og marknader.',
    },
    loadComponent: () => import('./pages/lokalmat').then((m) => m.Lokalmat),
  },
  {
    path: 'lokale',
    title: 'Lokale til leige i Gloppen – Bu i Gloppen',
    data: {
      skildring:
        'Grendehus, samfunnshus og selskapslokale til leige i Gloppen – til bursdag, konfirmasjon, minnesamvær og møte.',
    },
    loadComponent: () => import('./pages/lokale').then((m) => m.LokaleOversikt),
  },
  {
    path: 'nytt',
    title: 'Nytt hos kafear og bedrifter – Bu i Gloppen',
    data: {
      skildring: 'Nye menyar, tilbod og anna nytt frå kafear, butikkar og bedrifter i Gloppen.',
    },
    loadComponent: () => import('./pages/nytt').then((m) => m.Nytt),
  },
  {
    path: 'ny-i-gloppen',
    title: 'Ny i Gloppen – Bu i Gloppen',
    data: {
      skildring:
        'Nyflytta til Gloppen? Her er nokre stader å starte når du skal finne deg til rette – lag, tenester og kvardagen i bygda.',
    },
    loadComponent: () => import('./pages/ny-i-gloppen').then((m) => m.NyIGloppen),
  },
  {
    path: 'om',
    title: 'Om – Bu i Gloppen',
    data: {
      skildring:
        'Om Bu i Gloppen: ei oversikt over butikkar, bedrifter og aktivitetar i Gloppen, og korleis du legg til eller rettar opplysningar.',
    },
    loadComponent: () => import('./pages/om').then((m) => m.Om),
  },
  {
    path: '**',
    title: 'Fann ikkje sida – Bu i Gloppen',
    data: { seo: { noindex: true, skildring: 'Sida finst ikkje.' } },
    loadComponent: () => import('./pages/ikkje-funnen').then((m) => m.IkkjeFunnen),
  },
];
