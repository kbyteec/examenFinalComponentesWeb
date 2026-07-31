import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Equipo } from '../models/equipo';

@Injectable({
  providedIn: 'root',
})
export class Equipos {
  private readonly apiUrl = 'http://127.0.0.1:3000/equipos';

  constructor(private http: HttpClient) {}

  getEquipos(): Observable<Equipo[]> {
    console.log('[Servicio Equipos] GET consultar todos los equipos');
    return this.http.get<Equipo[]>(this.apiUrl);
  }

  getEquipoPorCodigo(codigo: number): Observable<Equipo> {
    console.log('[Servicio Equipos] GET consultar equipo por codigo:', codigo);
    return this.http.get<Equipo>(`${this.apiUrl}/${codigo}`);
  }

  registrarEquipo(equipo: Equipo): Observable<{ mensaje: string; equipo: Equipo }> {
    console.log('[Servicio Equipos] POST registrar equipo:', equipo);
    return this.http.post<{ mensaje: string; equipo: Equipo }>(this.apiUrl, equipo);
  }

  actualizarEstado(
    codigo: number,
    estado: string
  ): Observable<{ mensaje: string; codigo: number; estado: string }> {
    console.log('[Servicio Equipos] PUT actualizar estado:', { codigo, estado });
    return this.http.put<{ mensaje: string; codigo: number; estado: string }>(
      `${this.apiUrl}/${codigo}/estado`,
      { estado }
    );
  }
}
