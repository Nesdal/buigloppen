import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Kart, KartNamn } from '../models/kart';

let neste = 0;

/**
 * Enkelt, statisk kart teikna som inline SVG frå data i `data/kart-*.ts`.
 * Einaste eksterne fil er eit lite skuggerelieff-bilete i `public/kart/`, så kartet treng
 * ingen kartteneste eller nøkkel.
 */
@Component({
  selector: 'app-kart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let k = kart();
    <figure class="kart kart-{{ k.id }}">
      <svg
        [attr.viewBox]="'0 0 ' + k.breidd + ' ' + k.hogd"
        role="img"
        [attr.aria-labelledby]="uid + '-tittel'"
      >
        <title [attr.id]="uid + '-tittel'">{{ k.tittel }}: {{ namneliste() }}</title>

        <rect class="land" [attr.width]="k.breidd" [attr.height]="k.hogd" />
        @if (k.skugge) {
          <mask [attr.id]="uid + '-skugge'">
            <image
              [attr.href]="k.skugge"
              [attr.width]="k.breidd"
              [attr.height]="k.hogd"
              preserveAspectRatio="none"
            />
          </mask>
          <rect
            class="skugge"
            [attr.width]="k.breidd"
            [attr.height]="k.hogd"
            [attr.mask]="'url(#' + uid + '-skugge)'"
          />
        }
        @if (k.relieff) {
          <image
            class="relieff"
            [attr.href]="k.relieff"
            [attr.width]="k.breidd"
            [attr.height]="k.hogd"
            preserveAspectRatio="none"
          />
        }
        @if (k.koter) {
          <path class="kote" [attr.d]="k.koter" />
        }
        @if (k.koterHundre) {
          <path class="kote kote-hundre" [attr.d]="k.koterHundre" />
        }

        <path class="sjo" [attr.d]="k.sjo" />
        @if (k.innsjoar) {
          <path class="sjo" [attr.d]="k.innsjoar" />
        }
        @if (k.holmar) {
          <path class="land" [attr.d]="k.holmar" />
        }
        @if (k.elvar) {
          <path class="elv" [attr.d]="k.elvar" />
        }
        @if (k.smavegar) {
          <path class="smaveg" [attr.d]="k.smavegar" />
        }
        @if (k.vegar) {
          <path class="veg" [attr.d]="k.vegar" />
        }
        @if (k.hovudvegar) {
          <path class="hovudveg" [attr.d]="k.hovudvegar" />
        }

        @if (k.grense) {
          <path
            class="utanfor"
            fill-rule="evenodd"
            [attr.d]="'M0,0H' + k.breidd + 'V' + k.hogd + 'H0Z' + k.grense"
          />
          <path class="grense" [attr.d]="k.grense" />
        }

        @for (s of k.skilt ?? []; track s.tekst) {
          <g
            class="skilt"
            [attr.transform]="'translate(' + s.x + ' ' + s.y + ')'"
            aria-hidden="true"
          >
            <rect x="-26" y="-15" width="52" height="30" rx="5" />
            <text>{{ s.tekst }}</text>
          </g>
        }

        @for (n of k.namn; track n.namn) {
          @if (n.prikk) {
            <circle
              class="prikk prikk-{{ n.type }}"
              [attr.cx]="n.x"
              [attr.cy]="n.y"
              [attr.r]="n.type === 'sentrum' ? 7 : 4.5"
            />
          }
          <text
            class="namn namn-{{ n.type }}"
            [attr.x]="tekstX(n)"
            [attr.y]="tekstY(n)"
            [attr.text-anchor]="n.prikk ? (n.anker ?? 'middle') : 'middle'"
            [attr.transform]="n.rot ? 'rotate(' + n.rot + ' ' + n.x + ' ' + n.y + ')' : null"
          >
            {{ n.namn }}
          </text>
        }

        <g
          class="nord"
          [attr.transform]="'translate(' + (k.breidd - 40) + ' 56)'"
          aria-hidden="true"
        >
          <path d="M0,-30 L12,9 L0,2 L-12,9 Z" />
          <text y="32">N</text>
        </g>

        <g
          class="malestokk"
          [attr.transform]="'translate(24 ' + (k.hogd - 24) + ')'"
          aria-hidden="true"
        >
          <rect x="-8" y="-30" [attr.width]="strek() + 16" height="44" rx="6" />
          <path [attr.d]="'M0,0 H' + strek() + ' M0,-7 V7 M' + strek() + ',-7 V7'" />
          <text [attr.x]="strek() / 2" y="-14">{{ k.malestokk.tekst }}</text>
        </g>
      </svg>
      <figcaption>
        Kartdata ©
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener"
          >OpenStreetMap</a
        >-bidragsytarar. Stadnamn og terreng frå
        <a href="https://www.kartverket.no" target="_blank" rel="noopener">Kartverket</a>.
        {{ k.merknad }}
      </figcaption>
    </figure>
  `,
  styles: `
    :host {
      display: block;
      --kart-land: #f1ede2;
      --kart-sjo: #bcd6df;
      --kart-elv: #7fb0c8;
      --kart-veg: #ffffff;
      --kart-hovudveg: #e2a64e;
      --kart-tekst: #1d2426;
      --kart-svak-tekst: #6b7678;
      --kart-vatn-tekst: #1f4e5a;
      --kart-halo: #f1ede2;
      --kart-kote: #8c7552;
      --kart-skugge: #19282d;
      --kart-skugge-opasitet: 0.6;
      --kart-relieff-opasitet: 1;
      --kart-utanfor: var(--bakgrunn);
      --kart-grense: #1f4e5a;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --kart-land: #1e2629;
        --kart-sjo: #1c3a44;
        --kart-elv: #3f7489;
        --kart-veg: #3a4649;
        --kart-hovudveg: #a7793a;
        --kart-tekst: #e7ecec;
        --kart-svak-tekst: #8d999b;
        --kart-vatn-tekst: #9fd0dc;
        --kart-halo: #1e2629;
        --kart-kote: #8fa39a;
        --kart-skugge: #000000;
        --kart-skugge-opasitet: 0.75;
        --kart-relieff-opasitet: 0.8;
        --kart-utanfor: var(--bakgrunn);
        --kart-grense: #7fb8c4;
      }
    }

    .kart {
      margin: 1.5rem 0 0;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
      border: 1px solid var(--kant);
      border-radius: var(--radius);
      background: var(--kart-land);
    }

    .land {
      fill: var(--kart-land);
    }

    .sjo {
      fill: var(--kart-sjo);
    }

    .skugge {
      fill: var(--kart-skugge);
      opacity: var(--kart-skugge-opasitet);
    }

    .relieff {
      opacity: var(--kart-relieff-opasitet);
    }

    .kote {
      fill: none;
      stroke: var(--kart-kote);
      stroke-width: 1.2;
      stroke-linejoin: round;
      opacity: 0.45;
    }

    .kote-hundre {
      stroke-width: 2;
      opacity: 0.65;
    }

    .elv,
    .smaveg,
    .veg,
    .hovudveg,
    .grense {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .elv {
      stroke: var(--kart-elv);
      stroke-width: 3.5;
    }

    .smaveg {
      stroke: var(--kart-veg);
      stroke-width: 1.6;
    }

    .veg {
      stroke: var(--kart-veg);
      stroke-width: 6;
    }

    .hovudveg {
      stroke: var(--kart-hovudveg);
      stroke-width: 8;
    }

    .utanfor {
      fill: var(--kart-utanfor);
      opacity: 0.6;
    }

    .grense {
      stroke: var(--kart-grense);
      stroke-width: 1.6;
    }

    /* Oversiktskartet har mykje mindre målestokk, så strekane må vere tynnare. */
    .kart-gloppen .veg {
      stroke-width: 2.6;
    }

    .kart-gloppen .hovudveg {
      stroke-width: 3.5;
    }

    /* text-anchor for stadnamna kjem frå attributtet, så det er berre sett her for resten. */
    text {
      font-family: var(--font);
      dominant-baseline: central;
    }

    .skilt text,
    .nord text,
    .malestokk text {
      text-anchor: middle;
    }

    .namn {
      fill: var(--kart-tekst);
      font-size: 24px;
      font-weight: 600;
      paint-order: stroke;
      stroke: var(--kart-halo);
      stroke-width: 6px;
      stroke-linejoin: round;
    }

    .namn-sentrum {
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    .namn-felt {
      font-size: 20px;
      font-weight: 500;
    }

    .namn-tettstad {
      font-size: 19px;
    }

    .kart-gloppen .namn-sentrum {
      font-size: 24px;
    }

    .namn-bygd {
      font-size: 15px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      fill: var(--kart-svak-tekst);
    }

    .namn-terreng {
      fill: var(--kart-svak-tekst);
      font-size: 15px;
      font-style: italic;
      font-weight: 600;
      letter-spacing: 0.06em;
      stroke-width: 4px;
    }

    .namn-vatn {
      fill: var(--kart-vatn-tekst);
      stroke: var(--kart-sjo);
      font-style: italic;
      font-weight: 500;
      letter-spacing: 0.08em;
    }

    .kart-gloppen .namn-vatn {
      font-size: 15px;
      stroke-width: 4px;
    }

    .namn-nabo {
      fill: var(--kart-svak-tekst);
      stroke: var(--kart-utanfor);
      font-size: 17px;
      font-style: italic;
      font-weight: 500;
    }

    .prikk {
      fill: var(--kart-tekst);
      stroke: var(--kart-halo);
      stroke-width: 2px;
    }

    .skilt rect {
      fill: #2f7d4f;
      stroke: #fff;
      stroke-width: 2.5;
    }

    .skilt text {
      fill: #fff;
      font-size: 17px;
      font-weight: 700;
    }

    .nord path {
      fill: var(--kart-tekst);
    }

    .nord text,
    .malestokk text {
      fill: var(--kart-tekst);
      font-size: 18px;
      font-weight: 700;
    }

    .malestokk rect {
      fill: var(--kart-land);
      opacity: 0.85;
    }

    .malestokk path {
      stroke: var(--kart-tekst);
      stroke-width: 3;
      fill: none;
    }

    figcaption {
      margin-top: 0.4rem;
      font-size: 0.85rem;
      color: var(--tekst-svak);
    }

    /* På smale skjermar vert kartet lite: større tekst og berre dei viktigaste namna. */
    @media (max-width: 40rem) {
      .namn {
        font-size: 36px;
        stroke-width: 8px;
      }

      .namn-sentrum {
        font-size: 46px;
      }

      .namn-felt,
      .namn-nabo,
      .namn-bygd,
      .namn-terreng {
        display: none;
      }

      .kart-gloppen .namn-tettstad,
      .kart-gloppen .namn-sentrum {
        font-size: 30px;
      }

      .kart-gloppen .namn-vatn {
        font-size: 24px;
      }

      .prikk {
        r: 7px;
      }

      .nord text,
      .malestokk text {
        font-size: 28px;
      }
    }
  `,
})
export class KartVising {
  readonly kart = input.required<Kart>();

  protected readonly uid = `kart-${++neste}`;

  protected readonly namneliste = computed(() =>
    this.kart()
      .namn.filter((n) => n.type !== 'vatn' && n.type !== 'nabo' && n.type !== 'terreng')
      .map((n) => n.namn)
      .join(', '),
  );

  protected readonly strek = computed(() => (this.kart().km * this.kart().malestokk.meter) / 1000);

  protected tekstX(n: KartNamn): number {
    if (!n.prikk || !n.anker || n.anker === 'middle') return n.x;
    return n.anker === 'start' ? n.x + 11 : n.x - 11;
  }

  protected tekstY(n: KartNamn): number {
    return n.prikk && (!n.anker || n.anker === 'middle') ? n.y - 18 : n.y;
  }
}
