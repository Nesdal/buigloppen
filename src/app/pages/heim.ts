import { Component, inject } from '@angular/core';
import { AktivitetKort } from '../components/aktivitet-kort';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { KATEGORIAR } from '../models/bedrift';
import { OppslagKort } from '../components/oppslag-kort';
import { TING_A_GJERE } from '../data/ting-a-gjere';
import { AktivitetService } from '../services/aktivitet.service';
import { BedriftService } from '../services/bedrift.service';
import { LokalmatService } from '../services/lokalmat.service';
import { OppslagService } from '../services/oppslag.service';
import { harSalskanal } from '../models/lokalmat';

@Component({
  selector: 'app-heim',
  imports: [FormsModule, RouterLink, AktivitetKort, OppslagKort],
  template: `
    <section class="hero">
      <div class="innhald">
        <p class="hero-merkelapp">Inst i Nordfjord</p>
        <h1>Handle lokalt i Gloppen</h1>
        <p class="ingress">
          Finn butikkar, kafear, handverkarar og andre bedrifter i Sandane, Byrkjelo, Breim, Hyen
          og resten av Gloppen – anten du har budd her heile livet eller nettopp har flytta hit.
        </p>
        <form class="sok" role="search" (ngSubmit)="sok()">
          <label class="skjult" for="heim-sok">Søk etter bedrift eller teneste</label>
          <input
            id="heim-sok"
            type="search"
            name="sok"
            [(ngModel)]="sokeord"
            placeholder="Kva leitar du etter? T.d. frisør, kaffi, dekk …"
            autocomplete="off"
          />
          <button type="submit">Søk</button>
        </form>
        <p class="snarvegar">
          <a [routerLink]="['/bedrifter']" [queryParams]="{ type: 'butikk' }">Alle butikkar →</a>
          <a [routerLink]="['/bedrifter']" [queryParams]="{ type: 'servering' }">Kafear og restaurantar →</a>
          <a [routerLink]="['/bedrifter']" [queryParams]="{ type: 'bedrift' }">Alle bedrifter og tenester →</a>
        </p>
      </div>
      <svg
        class="landskap"
        viewBox="0 0 1440 220"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        focusable="false"
      >
        <path
          class="fjell-fjern"
          d="M0 150 80 110l70 18 90-66 60 34 60-16 90 40 90-50 60 22 90-52 70 48 60-12 80 36 80-54 70 36 70-22 80 32 90-54 70 40 80-20v150H0Z"
        />
        <path class="fjell-sno" d="m221 76 19-14 25 14-11-4-8 8-10-7-8 6Z" />
        <path class="fjell-sno" d="m659 58 31-18 26 18-12-4-10 8-10-8-12 6Z" />
        <path class="fjell-sno" d="m959 72 21-14 27 14-10-3-9 7-9-7-11 5Z" />
        <path class="fjell-sno" d="m1263 66 27-16 28 16-12-4-10 8-12-8-10 6Z" />
        <path
          class="fjell-naer"
          d="M0 170c60-20 120-50 190-42s110-18 180-24 130 36 210 32 140-36 220-26 130 40 210 30 130-36 210-28 150 38 220 28v80H0Z"
        />
        <rect class="fjordvatn" x="0" y="172" width="1440" height="48" />
        <path class="fjordglans" d="M520 184h120M700 192h70M860 186h150M610 200h60M1040 196h80" />
        <path class="bakke" d="M0 220v-36c80-10 200-6 300 10 40 6 80 12 140 26Z" />
        <path class="bakke-mork" d="M1440 220v-46c-100-6-220 6-320 26-40 8-80 14-130 20Z" />
        <path class="grunn" d="M0 220v-6c360-14 1080 12 1440-8v14Z" />
      </svg>
    </section>

    <section class="innhald seksjon">
      <div class="seksjon-topp">
        <h2>Ting å gjere</h2>
        <a [routerLink]="['/bedrifter']" [queryParams]="{ kategori: 'opplevingar' }">
          Fleire opplevingar →
        </a>
      </div>
      <ul class="framheving-rutenett">
        @for (f of framhevingar; track f.bedriftId) {
          <li>
            <a class="framheving" [routerLink]="['/bedrift', f.bedriftId]">
              <span class="framheving-ikon" aria-hidden="true">{{ f.ikon }}</span>
              <span class="framheving-tittel">{{ f.overskrift }}</span>
              <span class="framheving-tekst">{{ f.tekst }}</span>
              @if (f.opningstider) {
                <span class="framheving-meta">{{ f.opningstider }}</span>
              }
            </a>
          </li>
        }
        <li>
          <a
            class="framheving"
            [routerLink]="['/bedrifter']"
            [queryParams]="{ kategori: 'mat-og-servering' }"
          >
            <span class="framheving-ikon" aria-hidden="true">☕</span>
            <span class="framheving-tittel">Kafé og restaurant</span>
            <span class="framheving-tekst">
              {{ talServering }} stader å ete, drikke kaffi og møtast i Gloppen.
            </span>
            @if (talServeringMedNytt > 0) {
              <span class="framheving-meta framheving-nytt">
                {{ talServeringMedNytt }} har noko nytt no
              </span>
            }
          </a>
        </li>
        <li>
          <a class="framheving framheving-lokalmat" routerLink="/lokalmat">
            <span class="framheving-ikon" aria-hidden="true">🧺</span>
            <span class="framheving-tittel">Lokalmat og gardsutsal</span>
            <span class="framheving-tekst">
              Kjøp ost, kjøt, frukt og saft rett frå {{ talLokalmat }} gardar og produsentar.
            </span>
            @if (talPaGarden > 0) {
              <span class="framheving-meta">{{ talPaGarden }} har sal på garden</span>
            }
          </a>
        </li>
      </ul>
    </section>

    @if (oppslag.length > 0) {
      <section class="innhald seksjon">
        <div class="seksjon-topp">
          <h2>Nytt og verdt eit besøk</h2>
          <a routerLink="/nytt">Alt som er nytt →</a>
        </div>
        <p class="seksjon-ingress">
          Ny meny, ein spesialitet eller noko anna som er verdt å få med seg hos kafear,
          restaurantar og andre bedrifter.
        </p>
        <ul class="kort-liste">
          @for (o of oppslag; track o.id) {
            <li><app-oppslag-kort [oppslag]="o" /></li>
          }
        </ul>
      </section>
    }

    <section class="innhald seksjon">
      <div class="seksjon-topp">
        <h2>Kva skjer i Gloppen?</h2>
        <a routerLink="/aktivitetar">Alle aktivitetar →</a>
      </div>
      @if (neste.length > 0) {
        <ul class="kort-liste">
          @for (a of neste; track a.id) {
            <li><app-aktivitet-kort [aktivitet]="a" /></li>
          }
        </ul>
      } @else {
        <p>
          Ingen arrangement er lagde inn akkurat no. Sjå
          <a [routerLink]="['/aktivitetar']" [queryParams]="{ type: 'fast' }">faste aktivitetar</a>
          som lag, klubbar og treffpunkt.
        </p>
      }
    </section>

    <section class="innhald seksjon">
      <h2>Kategoriar</h2>
      <ul class="kategori-rutenett">
        @for (k of kategoriar; track k.id) {
          <li>
            <a [routerLink]="['/bedrifter']" [queryParams]="{ kategori: k.id }" class="kategori">
              <span class="kategori-ikon" aria-hidden="true">{{ k.ikon }}</span>
              <span class="kategori-namn">{{ k.namn }}</span>
              <span class="kategori-tal">{{ tal(k.id) }}</span>
            </a>
          </li>
        }
      </ul>
    </section>

    <section class="innhald seksjon">
      <div class="boks boks-velkomen">
        <svg class="boks-velkomen-fjell" viewBox="0 0 480 200" aria-hidden="true" focusable="false">
          <path
            fill="#ffffff"
            fill-opacity=".08"
            d="M0 200 110 90l50 40 90-110 70 80 40-30 120 130Z"
          />
          <path fill="#ffffff" fill-opacity=".85" d="m225 51 25-31 26 32-12-6-11 10-12-9Z" />
          <path
            fill="#ffffff"
            fill-opacity=".12"
            d="M40 200c60-40 110-70 170-60s100 20 150-10 90-10 120 10v60Z"
          />
          <path fill="#8fcac4" fill-opacity=".35" d="M0 200c120-24 300-28 480-14v14Z" />
        </svg>
        <h2>Ny i Gloppen?</h2>
        <p>
          Velkomen! Vi har samla nyttige lenker og tips for deg som nettopp har flytta hit, eller som
          vurderer å gjere det.
        </p>
        <a routerLink="/ny-i-gloppen" class="knapp">Les meir</a>
      </div>
    </section>
  `,
})
export class Heim {
  private readonly router = inject(Router);
  private readonly service = inject(BedriftService);

  private readonly oppslagService = inject(OppslagService);

  protected readonly neste = inject(AktivitetService).neste(3);
  protected readonly oppslag = this.oppslagService.aktive().slice(0, 4);

  protected readonly framhevingar = TING_A_GJERE.map((f) => ({
    ...f,
    opningstider: this.service.hent(f.bedriftId)?.opningstider,
  }));
  private readonly servering = this.service.sok({ kategori: 'mat-og-servering' });
  protected readonly talServering = this.servering.length;
  protected readonly talServeringMedNytt = this.servering.filter(
    (b) => this.oppslagService.forBedrift(b.id).length > 0,
  ).length;

  private readonly lokalmat = inject(LokalmatService).alle();
  protected readonly talLokalmat = this.lokalmat.length;
  protected readonly talPaGarden = this.lokalmat.filter((b) => harSalskanal(b.sal, 'gardsutsal')).length;

  protected readonly kategoriar = KATEGORIAR;
  protected sokeord = '';

  protected tal(id: (typeof KATEGORIAR)[number]['id']): number {
    return this.service.tal(id);
  }

  protected sok(): void {
    const sok = this.sokeord.trim();
    this.router.navigate(['/bedrifter'], { queryParams: sok ? { sok } : {} });
  }
}
