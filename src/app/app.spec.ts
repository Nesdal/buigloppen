import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('viser logo og hovudmeny', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.logo')?.textContent).toContain('Gloppen');
    const lenkjer = Array.from(el.querySelectorAll('nav a')).map((a) => a.textContent?.trim());
    expect(lenkjer).toEqual(['Bedrifter', 'Ny i Gloppen', 'Om']);
  });
});
