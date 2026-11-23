import { Injectable, inject } from '@angular/core';
import { Aktivitet } from '../models/aktivitet';
import { Bedrift, Stad } from '../models/bedrift';
import { Matslag, Salskanal, harSalskanal } from '../models/lokalmat';
import { AktivitetService, isoDato } from './aktivitet.service';
import { BedriftService } from './bedrift.service';

export interface LokalmatFilter {
  matslag?: Matslag | null;
  sal?: Salskanal | null;
  stad?: Stad | null;
}

/** Bedrifter som lagar eller sel lokalmat, dvs. har minst eitt matslag. */
export function erLokalmat(b: Bedrift): boolean {
  return (b.lokalmat?.length ?? 0) > 0;
}

/**
 * Lokalmat som passar filteret. Gardar ein kan køyre til og kjøpe på (gardsutsal
 * eller sjølvbetent) kjem først, så resten, alfabetisk innanfor kvar gruppe.
 */
export function filtrerLokalmat(bedrifter: readonly Bedrift[], filter: LokalmatFilter): Bedrift[] {
  const paGarden = (b: Bedrift) => (harSalskanal(b.sal, 'gardsutsal') ? 0 : 1);
  return bedrifter
    .filter(erLokalmat)
    .filter((b) => !filter.matslag || b.lokalmat!.includes(filter.matslag))
    .filter((b) => !filter.sal || harSalskanal(b.sal, filter.sal))
    .filter((b) => !filter.stad || b.stad === filter.stad)
    .sort((a, b) => paGarden(a) - paGarden(b) || a.namn.localeCompare(b.namn, 'nn'));
}

/**
 * Marknader, REKO-ringar og anna sal av lokalmat i aktivitetslista: aktivitetar med
 * stikkordet «lokalmat», eller som ein lokalmatprodusent står bak og er i kategorien marknad.
 */
export function erLokalmatAktivitet(a: Aktivitet, lokalmatIdar: ReadonlySet<string>): boolean {
  if (a.stikkord?.some((s) => s.toLocaleLowerCase('nn') === 'lokalmat')) return true;
  return a.kategori === 'marknad' && !!a.bedriftId && lokalmatIdar.has(a.bedriftId);
}

@Injectable({ providedIn: 'root' })
export class LokalmatService {
  private readonly bedrifter = inject(BedriftService);
  private readonly aktivitetService = inject(AktivitetService);

  alle(): Bedrift[] {
    return filtrerLokalmat(this.bedrifter.alle(), {});
  }

  sok(filter: LokalmatFilter): Bedrift[] {
    return filtrerLokalmat(this.bedrifter.alle(), filter);
  }

  /** Kor mange det finst av kvart matslag, til filterknappane. */
  talPerMatslag(): Map<Matslag, number> {
    const tal = new Map<Matslag, number>();
    for (const b of this.alle()) for (const m of b.lokalmat!) tal.set(m, (tal.get(m) ?? 0) + 1);
    return tal;
  }

  /** Aktuelle marknader og REKO-utleveringar, arrangement først. */
  aktivitetar(idag = isoDato()): Aktivitet[] {
    const idar = new Set(this.alle().map((b) => b.id));
    return this.aktivitetService.sok({}, idag).filter((a) => erLokalmatAktivitet(a, idar));
  }
}
