import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Router } from '@angular/router';

interface CashFlowData {
  period: number;
  totalPayment: number;
  interest: number;
  amortization: number;
  balance: number;
  netFlow: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  constructor(private router: Router) {}

  private cashFlowData: CashFlowData[] = [
    { period: 0, totalPayment: 0, interest: 0, amortization: 0, balance: 1000000, netFlow: -950000 },
    { period: 1, totalPayment: 42500, interest: 42500, amortization: 0, balance: 1000000, netFlow: 42500 },
    { period: 2, totalPayment: 142500, interest: 42500, amortization: 100000, balance: 900000, netFlow: 142500 },
    { period: 3, totalPayment: 138250, interest: 38250, amortization: 100000, balance: 800000, netFlow: 138250 },
    { period: 4, totalPayment: 134000, interest: 34000, amortization: 100000, balance: 700000, netFlow: 134000 },
    { period: 5, totalPayment: 129750, interest: 29750, amortization: 100000, balance: 600000, netFlow: 129750 },
    { period: 6, totalPayment: 125500, interest: 25500, amortization: 100000, balance: 500000, netFlow: 125500 },
    { period: 7, totalPayment: 121250, interest: 21250, amortization: 100000, balance: 400000, netFlow: 121250 },
    { period: 8, totalPayment: 117000, interest: 17000, amortization: 100000, balance: 300000, netFlow: 117000 },
    { period: 9, totalPayment: 112750, interest: 12750, amortization: 100000, balance: 200000, netFlow: 112750 },
    { period: 10, totalPayment: 108500, interest: 8500, amortization: 100000, balance: 100000, netFlow: 108500 },
    { period: 11, totalPayment: 104250, interest: 4250, amortization: 100000, balance: 0, netFlow: 104250 }
  ];

  ngOnInit(): void {
    this.populateCashFlowTable();
    this.createCashFlowChart();
    this.createPaymentCompositionChart();
    setTimeout(() => this.animateNumbers(), 500);
  }

  private populateCashFlowTable(): void {
    const tableBody = document.getElementById('cashFlowTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    this.cashFlowData.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.period}</td>
        <td>S/ ${row.totalPayment.toLocaleString()}</td>
        <td>S/ ${row.interest.toLocaleString()}</td>
        <td>S/ ${row.amortization.toLocaleString()}</td>
        <td>S/ ${row.balance.toLocaleString()}</td>
        <td class="${row.netFlow < 0 ? 'negative' : 'positive'}">S/ ${row.netFlow.toLocaleString()}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  private createCashFlowChart(): void {
    const ctx = document.getElementById('cashFlowChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.cashFlowData.map(d => `P${d.period}`),
        datasets: [{
          label: 'Flujo Neto',
          data: this.cashFlowData.map(d => d.netFlow),
          borderColor: 'rgb(52, 152, 219)',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(tickValue: string | number): string {
                const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                return 'S/ ' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  private createPaymentCompositionChart(): void {
    const ctx = document.getElementById('paymentCompositionChart') as HTMLCanvasElement;
    if (!ctx) return;

    const totalInterest = this.cashFlowData.reduce((sum, row) => sum + row.interest, 0);
    const totalAmortization = this.cashFlowData.reduce((sum, row) => sum + row.amortization, 0);
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Intereses', 'Amortización'],
        datasets: [{
          data: [totalInterest, totalAmortization],
          backgroundColor: [
            'rgba(231, 76, 60, 0.8)',
            'rgba(46, 204, 113, 0.8)'
          ],
          borderColor: [
            'rgb(231, 76, 60)',
            'rgb(46, 204, 113)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private animateNumbers(): void {
    const kpiValues = document.querySelectorAll('.kpi-value');
    kpiValues.forEach(element => {
      const targetValue = parseFloat(element.textContent?.replace(/,/g, '') || '0');
      let currentValue = 0;
      const increment = targetValue / 50;
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
          currentValue = targetValue;
          clearInterval(timer);
        }
        element.textContent = currentValue.toLocaleString(undefined, {
          minimumFractionDigits: currentValue < 100 ? 2 : 0,
          maximumFractionDigits: currentValue < 100 ? 2 : 0
        });
      }, 50);
    });
  }

  navigateTo(route: string): void {
    switch (route) {
      case 'register':
        this.router.navigate(['/bond/register']);
        break;
      case 'result':
        this.router.navigate(['/bond/result']);
        break;
      case 'history':
        this.router.navigate(['/bond/history']);
        break;
      case 'help':
        this.router.navigate(['/help']);
        break;
      case 'report':
        this.router.navigate(['/bond/report']);
        break;
    }
  }
}