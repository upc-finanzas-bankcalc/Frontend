import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BonoService } from '../../../../../core/services/bono.service';
import { ExportService } from '../../../../../core/services/export.service';
import { Bono, FlujoCaja, IndicadorFinanciero } from '../../../../../core/models/bono.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-bono-resultado',
  standalone: true,
  imports: [CommonModule],
  providers: [CurrencyPipe, DatePipe, PercentPipe],
  templateUrl: './bono-resultado.html',
  styleUrls: ['./bono-resultado.scss']
})
export class BonoResultado implements OnInit, OnDestroy, AfterViewInit {

  public bondData: Bono | null = null;
  public cashFlowData: FlujoCaja[] = [];
  public bondMetrics: IndicadorFinanciero | null = null;
  public loading = true;
  public error: string | null = null;
  private dataReady = false;

  private chart: Chart | null = null;

  public currencySymbols: { [key: string]: string } = {
    'PEN': 'S/',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bonoService: BonoService,
    private exportService: ExportService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const bonoId = this.route.snapshot.paramMap.get('id');
    if (bonoId) {
      this.loadAllData(+bonoId);
    } else {
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    // If data is already loaded, create the chart
    if (this.dataReady) {
      this.createCashFlowChart();
    }
  }

  loadAllData(bonoId: number): void {
    this.loading = true;
    this.error = null;

    this.bonoService.getById(bonoId).subscribe({
      next: (bono: Bono) => {
        this.bondData = bono;
        // Use forkJoin to load both cash flow and indicators simultaneously
        this.loadCashFlowAndIndicators(bonoId);
      },
      error: (e: HttpErrorResponse) => {
        this.error = `Error al cargar los datos del bono: ${e.message}`;
        this.loading = false;
      }
    });
  }

  loadCashFlowAndIndicators(bonoId: number): void {
    forkJoin({
      cashFlow: this.bonoService.getFlujoCaja(bonoId),
      indicators: this.bonoService.getIndicadores(bonoId)
    }).subscribe({
      next: (data) => {
        this.cashFlowData = data.cashFlow;
        this.bondMetrics = data.indicators;
        this.loading = false;
        this.dataReady = true;
        
        // Create chart after view is initialized
        setTimeout(() => this.createCashFlowChart(), 100);
      },
      error: (e: HttpErrorResponse) => {
        this.error = `Error al cargar los datos: ${e.message}`;
        this.loading = false;
      }
    });
  }

  loadCashFlow(bonoId: number): void {
    this.bonoService.getFlujoCaja(bonoId).subscribe({
      next: (data: FlujoCaja[]) => this.cashFlowData = data,
      error: (e: HttpErrorResponse) => this.error = `Error al cargar el flujo de caja: ${e.message}`
    });
  }

  loadIndicators(bonoId: number): void {
    this.bonoService.getIndicadores(bonoId).subscribe({
      next: (data: IndicadorFinanciero) => {
        this.bondMetrics = data;
        this.loading = false; // All data loaded
        
        // Use a timeout to ensure the view is updated before rendering the chart
        setTimeout(() => this.createCashFlowChart(), 0);
      },
      error: (e: HttpErrorResponse) => {
        this.error = `Error al cargar los indicadores: ${e.message}`;
        this.loading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    const currencyCode = this.bondData?.moneda || 'USD';
    return this.currencyPipe.transform(amount, currencyCode, 'symbol', '1.2-2') || '';
  }

  goToRegister(): void {
    this.router.navigate(['/dashboard/bond/register']);
  }

  goToHistory(): void {
    this.router.navigate(['/dashboard/bond/history']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/bond/history']);
  }

  // Helper and formatting methods
  getFrecuenciaPago(frecuencia: number): string {
    const option = [
      { value: 1, label: 'Anual' },
      { value: 2, label: 'Semestral' },
      { value: 4, label: 'Trimestral' },
      { value: 12, label: 'Mensual' }
    ].find(o => o.value === frecuencia);
    return option ? option.label : 'Desconocido';
  }

  showPeriodDetails(periodo: any): void {
    alert(`Detalles para el período ${periodo.periodo}`);
  }

  exportToPDF(): void {
    if (this.bondData && this.bondMetrics) {
      this.exportService.exportToPDF(this.bondData, this.cashFlowData, this.bondMetrics);
    } else {
      alert('No hay datos disponibles para exportar.');
    }
  }

  exportToExcel(): void {
    if (this.bondData && this.bondMetrics) {
      this.exportService.exportToExcel(this.bondData, this.cashFlowData, this.bondMetrics);
    } else {
      alert('No hay datos disponibles para exportar.');
    }
  }

  createCashFlowChart(): void {
    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Check if canvas element exists
    const canvas = document.getElementById('cashFlowChart') as HTMLCanvasElement;
    if (!canvas) {
      console.warn('Canvas element not found');
      return;
    }

    // Check if cash flow data is available
    if (!this.cashFlowData || this.cashFlowData.length === 0) {
      console.warn('Cash flow data not available');
      return;
    }

    // Filter data to exclude period 0 (initial period)
    const dataForChart = this.cashFlowData.filter(item => item.periodo > 0);
    
    if (dataForChart.length === 0) {
      console.warn('No valid data for chart');
      return;
    }
       
    const labels = dataForChart.map(item => `P${item.periodo}`);
    const intereses = dataForChart.map(item => item.interes);
    const amortizaciones = dataForChart.map(item => item.amortizacion);
    const cuotas = dataForChart.map(item => item.cuota);

    try {
      this.chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
              label: 'Interés',
              data: intereses,
              backgroundColor: 'rgba(52, 152, 219, 0.7)',
              borderColor: 'rgba(52, 152, 219, 1)',
              borderWidth: 1,
          }, {
              label: 'Amortización',
              data: amortizaciones,
              backgroundColor: 'rgba(39, 174, 96, 0.7)',
              borderColor: 'rgba(39, 174, 96, 1)',
              borderWidth: 1,
          }, {
              label: 'Cuota',
              data: cuotas,
              type: 'line',
              backgroundColor: 'rgba(231, 76, 60, 0.2)',
              borderColor: 'rgba(231, 76, 60, 1)',
              borderWidth: 3,
              fill: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
              mode: 'index',
              intersect: false,
          },
          scales: {
              x: {
                  title: {
                      display: true,
                      text: 'Períodos de Pago'
                  },
                  grid: {
                      display: true,
                      color: 'rgba(0, 0, 0, 0.1)'
                  }
              },
              y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                      display: true,
                      text: `Componentes de Cuota (${this.bondData?.moneda || 'USD'})`
                  },
                  grid: {
                      display: true,
                      color: 'rgba(0, 0, 0, 0.1)'
                  }
              }
          },
          plugins: {
              title: {
                  display: true,
                  text: 'Análisis de Flujos de Caja por Período',
                  font: {
                      size: 16,
                      weight: 'bold'
                  }
              },
              legend: {
                  display: true,
                  position: 'top'
              },
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
      
      console.log('Chart created successfully');
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  // Method to recreate chart when needed
  recreateChart(): void {
    if (this.cashFlowData && this.cashFlowData.length > 0 && this.bondMetrics) {
      setTimeout(() => this.createCashFlowChart(), 100);
    }
  }

  // Cleanup method for component destruction
  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
