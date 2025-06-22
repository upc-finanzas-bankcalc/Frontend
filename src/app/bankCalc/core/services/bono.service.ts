import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Bono, FlujoCaja, IndicadorFinanciero } from '../models/bono.model';

@Injectable({
  providedIn: 'root'
})
export class BonoService {

  constructor(private apiService: ApiService) { }

  create(bono: Bono): Observable<Bono> {
    return this.apiService.post('/bonos', bono);
  }

  getById(bonoId: number): Observable<Bono> {
    return this.apiService.get(`/bonos/${bonoId}`);
  }

  getByUserId(userId: number): Observable<Bono[]> {
    return this.apiService.get(`/bonos/usuario/${userId}`);
  }

  getFlujoCaja(bonoId: number): Observable<FlujoCaja[]> {
    return this.apiService.get(`/bonos/${bonoId}/flujo-caja`);
  }

  getIndicadores(bonoId: number): Observable<IndicadorFinanciero> {
    return this.apiService.get(`/bonos/${bonoId}/indicadores-financieros`);
  }
} 