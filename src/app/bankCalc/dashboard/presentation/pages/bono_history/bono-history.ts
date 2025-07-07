import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BonoService } from '../../../../core/services/bono.service';
import { Bono } from '../../../../core/models/bono.model';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-bono-history',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './bono-history.html',
  styleUrls: ['./bono-history.scss']
})
export class BonoHistory implements OnInit {
  bonos: Bono[] = [];
  loading = true;

  currencies = [
    { code: 'PEN', name: 'Sol Peruano' },
    { code: 'USD', name: 'Dólar Americano' },
    { code: 'EUR', name: 'Euro' }
  ];

  // Filtros
  searchText: string = '';
  searchDate: string = '';
  searchCurrency: string = '';

  constructor(
    private bonoService: BonoService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBonos();
  }

  loadBonos(): void {
    this.loading = true;
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.bonoService.getByUserId(currentUser.idUsuario).subscribe({
        next: (data: Bono[]) => {
          this.bonos = data;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching bonos:', error);
          this.loading = false;
        }
      });
    } else {
      // Handle case where user is not logged in
      this.loading = false;
      this.router.navigate(['/sign-in']);
    }
  }

  filteredBonos(): Bono[] {
    return this.bonos.filter(bono => {
      const bonoFecha = bono.fechaCreacion ? new Date(bono.fechaCreacion) : new Date();
      const matchesName = bono.valorNominal.toString().toLowerCase().includes(this.searchText.toLowerCase()); // Assuming name is not available, using valorNominal
      const matchesDate = this.searchDate ? (bonoFecha.toISOString().slice(0, 10) === this.searchDate) : true;
      const matchesCurrency = this.searchCurrency ? bono.moneda === this.searchCurrency : true;
      return matchesName && matchesDate && matchesCurrency;
    });
  }

  clearFilters() {
    this.searchText = '';
    this.searchDate = '';
    this.searchCurrency = '';
  }

  verDetalle(bono: Bono) {
    this.router.navigate(['/dashboard/bond/resultado', bono.idBono]);
  }

  exportar(bono: Bono) {
    alert('Exportar bono: ' + bono.idBono);
  }
}
