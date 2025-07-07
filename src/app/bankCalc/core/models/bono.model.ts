import { Usuario } from './usuario.model';

export interface TasaMercado {
  idTasa: number;
  nombre: string;
  valor: number;
  fecha: Date;
}

export interface FlujoCaja {
  idFlujo: number;
  periodo: number;
  cuota: number;
  interes: number;
  amortizacion: number;
  saldoPendiente: number;
  fechaPago?: Date;
}

export interface IndicadorFinanciero {
  idIndicador: number;
  idBono: number;
  tcea: number;
  trea: number;
  duracion: number;
  duracionModificada: number;
  convexidad: number;
  precioMaximo: number;
}

export interface Bono {
  idBono?: number;
  usuario: Usuario;
  tasaMercado?: TasaMercado;
  moneda: string;
  valorNominal: number;
  valorComercial: number;
  frecuenciaPago: number;
  numeroAnios: number;
  tipoTasa: 'efectiva' | 'nominal';
  tasaAnual: number;
  capitalizacion?: string;
  tasaImpuesto?: number;
  plazoGracia?: number;
  tipoGracia?: 'total' | 'parcial' | 'ninguno';
  gastosIniciales?: number;
  gastosFinales?: number;
  fechaCreacion?: Date;
  flujosCaja?: FlujoCaja[];
  indicadorFinanciero?: IndicadorFinanciero;
} 