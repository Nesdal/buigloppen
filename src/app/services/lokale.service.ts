import { Injectable } from '@angular/core';
import { Stad } from '../models/bedrift';
import { Fasilitet, Lokale } from '../models/lokale';
import lokaleData from '../data/lokale.json';

export interface LokaleFilter {
  stad?: Stad | null;
  /** Minst så mange plassar. Lokale utan oppgitt storleik fell då vekk. */
  gjester?: number | null;
  fasilitet?: Fasilitet | null;
}

/** Lokale som passar filteret, alfabetisk. */
export function filtrerLokale(lokale: readonly Lokale[], filter: LokaleFilter): Lokale[] {
  return lokale
    .filter((l) => !filter.stad || l.stad === filter.stad)
    .filter((l) => !filter.gjester || (l.plassar ?? 0) >= filter.gjester)
    .filter((l) => !filter.fasilitet || (l.fasilitetar ?? []).includes(filter.fasilitet))
    .sort((a, b) => a.namn.localeCompare(b.namn, 'nn'));
}

@Injectable({ providedIn: 'root' })
export class LokaleService {
  private readonly lokale = lokaleData as Lokale[];

  alle(): Lokale[] {
    return filtrerLokale(this.lokale, {});
  }

  sok(filter: LokaleFilter): Lokale[] {
    return filtrerLokale(this.lokale, filter);
  }
}
