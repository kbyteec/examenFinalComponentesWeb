import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { Equipos } from './equipos';

describe('Equipos', () => {
  let service: Equipos;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(Equipos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
