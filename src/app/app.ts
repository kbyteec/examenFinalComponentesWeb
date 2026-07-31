import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

import { Equipo } from './models/equipo';
import { Equipos } from './services/equipos';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  titulo = 'Lísta de Equipos - Examen final';
  private readonly localStorageKey = 'inventario_equipos_ultima_consulta';
  private readonly temaStorageKey = 'inventario_equipos_tema_oscuro';
  equipos: Equipo[] = [];
  equipoEncontrado?: Equipo;
  mensaje = '';
  error = '';
  cargando = false;
  estadoOnline = navigator.onLine;
  temaOscuro = false;
  codigoBusqueda?: number;
  codigoActualizar?: number;
  nuevoEstado = '';

  nuevoEquipo: Equipo = {
    nombre: '',
    categoria: '',
    laboratorio: '',
    estado: 'Disponible',
    responsable: '',
  };

  constructor(
    private equiposService: Equipos,
    private detectorCambios: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('[App] Pagina cargada. Consultando equipos automaticamente...');
    this.cargarTemaGuardado();
    this.cargarEquiposDesdeLocalStorage();
    this.cargarEquipos();
  }

  @HostListener('window:online')
  cuandoVuelveInternet(): void {
    this.estadoOnline = true;
    console.log('[App] Conexion restaurada. Actualizando listado desde backend...');
    this.cargarEquipos();
  }

  @HostListener('window:offline')
  cuandoPierdeInternet(): void {
    this.estadoOnline = false;
    console.log('[App] Sin conexion. Usando ultima consulta guardada en LocalStorage.');
    this.cargarEquiposDesdeLocalStorage();
  }

  cambiarTema(): void {
    this.temaOscuro = !this.temaOscuro;
    localStorage.setItem(this.temaStorageKey, String(this.temaOscuro));
    console.log('[App] Tema actualizado:', this.temaOscuro ? 'oscuro' : 'claro');
  }

  cargarEquipos(): void {
    console.log('[App] Iniciando consulta asincrona del listado de equipos');
    this.cargando = true;

    this.equiposService
      .getEquipos()
      .pipe(
        timeout(5000),
        finalize(() => {
          this.cargando = false;
          this.detectorCambios.detectChanges();
        })
      )
      .subscribe({
      next: (data) => {
        console.log('[App] Respuesta recibida desde el backend:', data);
        this.equipos = data;
        this.guardarEquiposEnLocalStorage(data);
        console.log('[App] Tabla actualizada sin recargar la pagina. Total:', this.equipos.length);
        this.error = '';
        this.detectorCambios.detectChanges();
      },
      error: () => {
        console.error('[App] Error al consultar equipos');
        this.cargarEquiposDesdeLocalStorage();
        this.mostrarError('No se pudo consultar el backend. Se muestra la ultima informacion guardada.');
        this.detectorCambios.detectChanges();
      },
    });
  }

  buscarEquipo(): void {
    if (!this.codigoBusqueda) {
      this.mostrarError('Ingrese un codigo para buscar.');
      return;
    }

    this.equiposService.getEquipoPorCodigo(this.codigoBusqueda).subscribe({
      next: (equipo) => {
        console.log('[App] Equipo encontrado desde Angular:', equipo);
        this.equipoEncontrado = equipo;
        this.mensaje = 'Equipo encontrado correctamente.';
        this.error = '';
      },
      error: () => {
        console.error('[App] No se encontro equipo con codigo:', this.codigoBusqueda);
        this.equipoEncontrado = undefined;
        this.mostrarError('No se encontro un equipo con ese codigo.');
      },
    });
  }

  registrarEquipo(): void {
    if (!this.formularioValido()) {
      this.mostrarError('Complete todos los campos del equipo.');
      return;
    }

    this.equiposService.registrarEquipo(this.nuevoEquipo).subscribe({
      next: (respuesta) => {
        console.log('[App] Equipo registrado desde Angular:', respuesta);
        this.mensaje = respuesta.mensaje;
        this.error = '';
        this.equipos = [...this.equipos, respuesta.equipo];
        console.log('[App] Lista actualizada inmediatamente sin recargar la pagina:', this.equipos);
        this.limpiarFormulario();
        this.cargarEquipos();
      },
      error: () => {
        console.error('[App] Error al registrar equipo');
        this.mostrarError('No se pudo registrar el equipo.');
      },
    });
  }

  actualizarEstado(): void {
    if (!this.codigoActualizar || !this.nuevoEstado.trim()) {
      this.mostrarError('Ingrese el codigo y el nuevo estado.');
      return;
    }

    this.equiposService.actualizarEstado(this.codigoActualizar, this.nuevoEstado).subscribe({
      next: (respuesta) => {
        console.log('[App] Estado actualizado desde Angular:', respuesta);
        this.mensaje = respuesta.mensaje;
        this.error = '';
        this.codigoActualizar = undefined;
        this.nuevoEstado = '';
        console.log('[App] Recargando listado despues de actualizar estado, sin recargar navegador');
        this.cargarEquipos();
      },
      error: () => {
        console.error('[App] Error al actualizar estado');
        this.mostrarError('No se pudo actualizar el estado del equipo.');
      },
    });
  }

  private formularioValido(): boolean {
    return Boolean(
      this.nuevoEquipo.nombre.trim() &&
        this.nuevoEquipo.categoria.trim() &&
        this.nuevoEquipo.laboratorio.trim() &&
        this.nuevoEquipo.estado.trim() &&
        this.nuevoEquipo.responsable.trim()
    );
  }

  private limpiarFormulario(): void {
    this.nuevoEquipo = {
      nombre: '',
      categoria: '',
      laboratorio: '',
      estado: 'Disponible',
      responsable: '',
    };
  }

  private limpiarMensajes(): void {
    this.mensaje = '';
    this.error = '';
  }

  private mostrarError(mensaje: string): void {
    this.error = mensaje;
    this.mensaje = '';
  }

  private guardarEquiposEnLocalStorage(equipos: Equipo[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(equipos));
    console.log('[App] Ultima consulta guardada en LocalStorage:', equipos.length);
  }

  private cargarEquiposDesdeLocalStorage(): void {
    const datosGuardados = localStorage.getItem(this.localStorageKey);

    if (!datosGuardados) {
      console.log('[App] No existen equipos guardados en LocalStorage.');
      return;
    }

    try {
      this.equipos = JSON.parse(datosGuardados) as Equipo[];
      console.log('[App] Equipos recuperados desde LocalStorage:', this.equipos.length);
    } catch (error) {
      console.error('[App] Error al leer LocalStorage:', error);
      localStorage.removeItem(this.localStorageKey);
    }
  }

  private cargarTemaGuardado(): void {
    this.temaOscuro = localStorage.getItem(this.temaStorageKey) === 'true';
    console.log('[App] Tema cargado:', this.temaOscuro ? 'oscuro' : 'claro');
  }
}
