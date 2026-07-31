import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { App } from './app';
import { Equipos } from './services/equipos';

describe('App', () => {
  beforeEach(async () => {
    const equiposMock = {
      getEquipos: () => of([]),
      getEquipoPorCodigo: () => of({
        codigo: 1,
        nombre: 'Equipo de prueba',
        categoria: 'Prueba',
        laboratorio: 'Lab',
        estado: 'Disponible',
        responsable: 'Responsable',
      }),
      registrarEquipo: () => of({
        mensaje: 'Equipo registrado correctamente',
        equipo: {
          codigo: 1,
          nombre: 'Equipo de prueba',
          categoria: 'Prueba',
          laboratorio: 'Lab',
          estado: 'Disponible',
          responsable: 'Responsable',
        },
      }),
      actualizarEstado: () => of({
        mensaje: 'Estado actualizado correctamente',
        codigo: 1,
        estado: 'Disponible',
      }),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: Equipos,
          useValue: equiposMock,
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Lísta de Equipos - Examen final'
    );
  });
});
