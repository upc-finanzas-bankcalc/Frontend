import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Register all controllers, elements, scales and plugins for Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-bono-resultado',
  standalone: true,
  imports: [CommonModule],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './bono-resultado.html',
  styleUrls: ['./bono-resultado.scss']
})
export class BonoResultado implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('cashFlowChart') private chartRef!: ElementRef<HTMLCanvasElement>;

  public bondData: any = {
    moneda: 'PEN',
    valorNominal: 1000,
    valorComercial: 950,
    numeroAnos: 5,
    frecuenciaPago: 2, // Semestral
    tasaInteresAnual: 12,
    tasaDescuento: 10,
    tasaImpuesto: 5,
    tipoGracia: 'ninguno',
    plazoGracia: 0,
    gastosIniciales: 50,
    gastosFinales: 25
  };

  public currencySymbols: { [key: string]: string } = {
    'PEN': 'S/',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥'
  };

  public cashFlowData: any[] = [];
  public bondMetrics: any = {};
  public loading = false;
  private chart!: Chart;
  private autoBackupInterval: any;

  constructor(
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
    ) {}

  ngOnInit(): void {
    this.loadBondData();
    if (this.validateBondData()) {
        this.calculateAll();
        this.autoBackupInterval = setInterval(() => this.autoBackup(), 300000);
    }
  }

  ngAfterViewInit(): void {
      this.createCashFlowChart();
  }

  ngOnDestroy(): void {
      if (this.autoBackupInterval) {
          clearInterval(this.autoBackupInterval);
      }
      if(this.chart) {
          this.chart.destroy();
      }
  }

  calculateAll(): void {
    this.calculateBondMetrics();
    this.generateCashFlow();
    if (this.chartRef) {
        this.createCashFlowChart();
    }
  }

  loadBondData(): void {
    if (typeof window !== 'undefined' && localStorage) {
      const savedData = localStorage.getItem('bondCalculationData');
      if (savedData) {
        this.bondData = { ...this.bondData, ...JSON.parse(savedData) };
      }
    }
  }

  calculateBondMetrics(): void {
    const periodos = this.bondData.numeroAnos * this.bondData.frecuenciaPago;
    const tasaPeriodo = this.bondData.tasaInteresAnual / 100 / this.bondData.frecuenciaPago;
    const tasaDescuentoPeriodo = this.bondData.tasaDescuento / 100 / this.bondData.frecuenciaPago;

    const cuotaPeriodica = this.calculatePMT(tasaPeriodo, periodos, this.bondData.valorNominal);

    const trea = this.calculateTREA(cuotaPeriodica, periodos, tasaPeriodo);
    const tcea = this.calculateTCEA(cuotaPeriodica, periodos);
    const duracion = this.calculateDuration(cuotaPeriodica, periodos, tasaDescuentoPeriodo);
    const duracionModificada = duracion / (1 + tasaDescuentoPeriodo);
    const convexidad = this.calculateConvexity(cuotaPeriodica, periodos, tasaDescuentoPeriodo);
    const precioMaximo = this.calculateMaxPrice(cuotaPeriodica, periodos);

    this.bondMetrics = {
      trea: trea,
      tcea: tcea,
      duracion: duracion,
      duracionModificada: duracionModificada,
      convexidad: convexidad,
      precioMaximo: precioMaximo,
      cuotaPeriodica: cuotaPeriodica
    };
  }

  calculatePMT(rate: number, nper: number, pv: number): number {
    if (rate === 0) return pv / nper;
    return (pv * rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1);
  }

  calculateTREA(cuotaPeriodica: number, periodos: number, tasaPeriodo: number): number {
    let flujos = [-this.bondData.valorComercial - this.bondData.gastosIniciales];
    for (let i = 1; i <= periodos; i++) {
      let flujo = cuotaPeriodica;
      if (i === periodos) {
        flujo += this.bondData.gastosFinales;
      }
      const impuesto = (cuotaPeriodica * tasaPeriodo) * (this.bondData.tasaImpuesto / 100);
      flujo -= impuesto;
      flujos.push(flujo);
    }
    const tirPeriodica = this.calculateIRR(flujos);
    const treaAnual = Math.pow(1 + tirPeriodica, this.bondData.frecuenciaPago) - 1;
    return treaAnual * 100;
  }

  calculateTCEA(cuotaPeriodica: number, periodos: number): number {
    let flujos = [this.bondData.valorNominal - this.bondData.gastosIniciales];
    for (let i = 1; i <= periodos; i++) {
      let flujo = -cuotaPeriodica;
      if (i === periodos) {
        flujo -= this.bondData.gastosFinales;
      }
      flujos.push(flujo);
    }
    const tirPeriodica = this.calculateIRR(flujos);
    const tceaAnual = Math.pow(1 + tirPeriodica, this.bondData.frecuenciaPago) - 1;
    return tceaAnual * 100;
  }

  calculateDuration(cuotaPeriodica: number, periodos: number, tasaDescuentoPeriodo: number): number {
    let valorPresente = 0;
    let duracionNumerador = 0;
    for (let t = 1; t <= periodos; t++) {
      const flujo = cuotaPeriodica;
      const vp = flujo / Math.pow(1 + tasaDescuentoPeriodo, t);
      valorPresente += vp;
      duracionNumerador += (t / this.bondData.frecuenciaPago) * vp;
    }
    return duracionNumerador / valorPresente;
  }

  calculateConvexity(cuotaPeriodica: number, periodos: number, tasaDescuentoPeriodo: number): number {
    let valorPresente = 0;
    let convexidadNumerador = 0;
    for (let t = 1; t <= periodos; t++) {
      const flujo = cuotaPeriodica;
      const vp = flujo / Math.pow(1 + tasaDescuentoPeriodo, t);
      valorPresente += vp;
      convexidadNumerador += (t * (t + 1) / Math.pow(this.bondData.frecuenciaPago, 2)) * vp;
    }
    return convexidadNumerador / (valorPresente * Math.pow(1 + tasaDescuentoPeriodo, 2));
  }

  calculateMaxPrice(cuotaPeriodica: number, periodos: number): number {
    const tasaObjetivo = 0.08 / this.bondData.frecuenciaPago; // 8% anual objetivo
    let precioMaximo = 0;
    for (let t = 1; t <= periodos; t++) {
      precioMaximo += cuotaPeriodica / Math.pow(1 + tasaObjetivo, t);
    }
    return precioMaximo;
  }

  calculateIRR(flujos: number[]): number {
    let tir = 0.1;
    const precision = 0.000001;
    const maxIteraciones = 100;
    for (let i = 0; i < maxIteraciones; i++) {
      let vpn = 0;
      let derivada = 0;
      for (let t = 0; t < flujos.length; t++) {
        vpn += flujos[t] / Math.pow(1 + tir, t);
        if (t > 0) {
          derivada -= t * flujos[t] / Math.pow(1 + tir, t + 1);
        }
      }
      if (Math.abs(vpn) < precision) break;
      if (Math.abs(derivada) < precision) break;
      tir = tir - vpn / derivada;
    }
    return tir;
  }

  generateCashFlow(): void {
    const periodos = this.bondData.numeroAnos * this.bondData.frecuenciaPago;
    const tasaPeriodo = this.bondData.tasaInteresAnual / 100 / this.bondData.frecuenciaPago;
    const cuotaPeriodica = this.bondMetrics.cuotaPeriodica;
    let saldoPendiente = this.bondData.valorNominal;
    let flujoInicial = -(this.bondData.valorComercial + this.bondData.gastosIniciales);

    this.cashFlowData = [];
    this.cashFlowData.push({
      periodo: 0,
      fecha: this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      cuota: 0,
      interes: 0,
      amortizacion: 0,
      saldoPendiente: saldoPendiente,
      flujoNeto: flujoInicial
    });

    for (let i = 1; i <= periodos; i++) {
      const interesPeriodo = saldoPendiente * tasaPeriodo;
      const amortizacionPeriodo = cuotaPeriodica - interesPeriodo;
      saldoPendiente = Math.max(0, saldoPendiente - amortizacionPeriodo);
      let flujoNeto = cuotaPeriodica;
      if (i === periodos) {
        flujoNeto += this.bondData.gastosFinales;
      }
      const impuesto = interesPeriodo * (this.bondData.tasaImpuesto / 100);
      const flujoNetoFinal = flujoNeto - impuesto;
      this.cashFlowData.push({
        periodo: i,
        fecha: this.calculatePaymentDate(i),
        cuota: cuotaPeriodica,
        interes: interesPeriodo,
        amortizacion: amortizacionPeriodo,
        saldoPendiente: saldoPendiente,
        flujoNeto: flujoNetoFinal,
        impuesto: impuesto
      });
    }
  }

  calculatePaymentDate(period: number): string | null {
    const today = new Date();
    const monthsToAdd = (12 / this.bondData.frecuenciaPago) * period;
    const paymentDate = new Date(today.setMonth(today.getMonth() + monthsToAdd));
    return this.datePipe.transform(paymentDate, 'dd/MM/yyyy');
  }

  formatCurrency(amount: number): string {
    return this.currencyPipe.transform(amount, this.bondData.moneda, 'symbol', '1.2-2') || '';
  }

  getFrecuenciaPago(frecuencia: number): string {
    const frecuencias: { [key: number]: string } = { 1: 'Anual', 2: 'Semestral', 4: 'Trimestral', 12: 'Mensual' };
    return frecuencias[frecuencia] || 'Personalizada';
  }

  createCashFlowChart(): void {
    if (this.chart) {
        this.chart.destroy();
    }
    
    if (!this.chartRef) {
        return;
    }

    const context = this.chartRef.nativeElement.getContext('2d');
    if (!context) {
        return;
    }

    const dataForChart = this.cashFlowData.filter(item => item.periodo > 0);
    const labels = dataForChart.map(item => `P${item.periodo}`);
    const intereses = dataForChart.map(item => item.interes);
    const amortizaciones = dataForChart.map(item => item.amortizacion);
    const flujos = dataForChart.map(item => item.flujoNeto);

    this.chart = new Chart(context, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Interés',
            data: intereses,
            backgroundColor: 'rgba(52, 152, 219, 0.7)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Amortización',
            data: amortizaciones,
            backgroundColor: 'rgba(39, 174, 96, 0.7)',
            borderColor: 'rgba(39, 174, 96, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Flujo Neto',
            data: flujos,
            type: 'line',
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            borderColor: 'rgba(231, 76, 60, 1)',
            borderWidth: 3,
            fill: false,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            title: { display: true, text: 'Períodos de Pago' },
            grid: { display: true, color: 'rgba(0, 0, 0, 0.1)' }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: `Componentes de Cuota (${this.bondData.moneda})` },
            grid: { display: true, color: 'rgba(0, 0, 0, 0.1)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: `Flujo Neto (${this.bondData.moneda})` },
            grid: { drawOnChartArea: false }
          }
        },
        plugins: {
          title: { display: true, text: 'Análisis de Flujos de Caja por Período', font: { size: 16, weight: 'bold' } },
          legend: { display: true, position: 'top' },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += this.formatCurrency(context.parsed.y);
                return label;
              }
            }
          }
        }
      }
    });
  }

  goBack(): void {
    if (confirm('¿Desea realizar un nuevo análisis? Se perderán los resultados actuales.')) {
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.removeItem('bondCalculationData');
      }
      window.history.back();
    }
  }

  exportToPDF(): void {
    this.loading = true;
    setTimeout(() => {
        const doc = new jsPDF();
        doc.text('ANÁLISIS DE BONO - BANK CALC', 10, 10);
        doc.text(`Fecha: ${this.datePipe.transform(new Date(), 'dd/MM/yyyy')}`, 10, 20);
        
        // Add more content...
        
        doc.save('analisis_bono.pdf');
        this.loading = false;
        alert('Reporte PDF generado exitosamente.');
    }, 2000);
  }

  exportToExcel(): void {
    this.loading = true;
    setTimeout(() => {
        const worksheet = XLSX.utils.json_to_sheet(this.cashFlowData);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        XLSX.writeFile(workbook, 'analisis_bono.xlsx');
        this.loading = false;
        alert('Archivo Excel generado exitosamente.');
    }, 1500);
  }
  
  printResults(): void {
      window.print();
  }
  
  recalculate(): void {
      if(this.validateBondData()) {
          this.calculateAll();
          alert('Análisis recalculado exitosamente.');
      }
  }
  
  showPeriodDetails(periodo: number): void {
      if (periodo === 0) return;
      const data = this.cashFlowData.find(item => item.periodo === periodo);
      if (data) {
          const details = `
            DETALLE DEL PERÍODO ${periodo}
            
            Fecha de Pago: ${data.fecha}
            Cuota: ${this.formatCurrency(data.cuota)}
            Interés: ${this.formatCurrency(data.interes)}
            Amortización: ${this.formatCurrency(data.amortizacion)}
            Saldo Pendiente: ${this.formatCurrency(data.saldoPendiente)}
            Flujo Neto: ${this.formatCurrency(data.flujoNeto)}
            ${data.impuesto ? `Impuesto: ${this.formatCurrency(data.impuesto)}` : ''}
          `;
          alert(details);
      }
  }

  validateBondData(): boolean {
    const errors = [];
    if (this.bondData.valorNominal <= 0) errors.push('El valor nominal debe ser mayor a 0');
    if (this.bondData.valorComercial <= 0) errors.push('El valor comercial debe ser mayor a 0');
    if (this.bondData.tasaInteresAnual <= 0) errors.push('La tasa de interés debe ser mayor a 0');
    if (this.bondData.numeroAnos <= 0) errors.push('El número de años debe ser mayor a 0');
    if (![1, 2, 4, 12].includes(this.bondData.frecuenciaPago)) errors.push('La frecuencia de pago debe ser 1, 2, 4 o 12');
    
    if (errors.length > 0) {
      alert('Errores en los datos:\n' + errors.join('\n'));
      return false;
    }
    return true;
  }
  
  autoBackup(): void {
      if (typeof window !== 'undefined' && localStorage) {
          const backupData = {
              bondData: this.bondData,
              cashFlowData: this.cashFlowData,
              bondMetrics: this.bondMetrics,
              timestamp: new Date().toISOString()
          };
          localStorage.setItem('bondCalculatorBackup', JSON.stringify(backupData));
      }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
      this.printResults();
    }
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        this.exportToPDF();
    }
    if (event.key === 'F5') {
        event.preventDefault();
        this.recalculate();
    }
  }
}
