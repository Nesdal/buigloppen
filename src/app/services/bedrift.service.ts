import { Injectable } from '@angular/core';
import { Bedrift, BedriftType, harKategori, KategoriId, Stad } from '../models/bedrift';
import bedrifterData from '../data/bedrifter.json';

export interface Filter {
  sok?: string;
  kategori?: KategoriId | null;
  stad?: Stad | null;
  type?: BedriftType | null;
}

/** Gjer tekst samanliknbar: små bokstavar og utan diakritiske teikn (é → e). æ, ø og å vert ikkje endra. */
export function normaliser(tekst: string): string {
  return tekst
    .toLocaleLowerCase('nn')
    .normalize('NFD')
    // Fjern alle kombinerande teikn unntatt ring over (U+030A), så å vert verande å.
    .replace(/[̀-̉̋-ͯ]/g, '')
    .normalize('NFC')
    .trim();
}

export function filtrer(bedrifter: readonly Bedrift[], filter: Filter): Bedrift[] {
  const ord = normaliser(filter.sok ?? '')
    .split(/\s+/)
    .filter(Boolean);

  return bedrifter
    .filter((b) => !filter.kategori || harKategori(b, filter.kategori))
    .filter((b) => !filter.stad || b.stad === filter.stad)
    .filter((b) => !filter.type || b.type === filter.type)
    .filter((b) => {
      if (ord.length === 0) return true;
      const tekst = normaliser(
        [b.namn, b.kortSkildring, b.skildring, b.stad, b.adresse, ...b.tilbyr, ...(b.stikkord ?? [])]
          .filter(Boolean)
          .join(' '),
      );
      return ord.every((o) => tekst.includes(o));
    })
    .sort((a, b) => a.namn.localeCompare(b.namn, 'nn'));
}

@Injectable({ providedIn: 'root' })
export class BedriftService {
  private readonly bedrifter: readonly Bedrift[] = bedrifterData as Bedrift[];

  alle(): readonly Bedrift[] {
    return this.bedrifter;
  }

  hent(id: string): Bedrift | undefined {
    return this.bedrifter.find((b) => b.id === id);
  }

  sok(filter: Filter): Bedrift[] {
    return filtrer(this.bedrifter, filter);
  }

  tal(kategori: KategoriId): number {
    return this.bedrifter.filter((b) => harKategori(b, kategori)).length;
  }
}
