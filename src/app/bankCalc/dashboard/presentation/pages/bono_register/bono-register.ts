import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

@Component({
  selector: 'app-bono-register',
  templateUrl: './bono-register.html',
  styleUrls: ['./bono-register.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class BonoRegisterComponent implements OnInit {
  bondForm: FormGroup;
  loading = false;
  showValidationSummary = false;
  validationErrors: string[] = [];

  currencies: Currency[] = [
    { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
    { code: 'USD', symbol: '$', name: 'Dólar Americano' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'Libra Esterlina' },
    { code: 'JPY', symbol: '¥', name: 'Yen Japonés' }
  ];

  frequencyOptions = [
    { value: 1, label: 'Anual', description: '1 pago/año' },
    { value: 2, label: 'Semestral', description: '2 pagos/año' },
    { value: 4, label: 'Trimestral', description: '4 pagos/año' },
    { value: 12, label: 'Mensual', description: '12 pagos/año' }
  ];

  rateTypes = [
    { value: 'efectiva', label: 'Efectiva' },
    { value: 'nominal', label: 'Nominal' }
  ];

  graceTypes = [
    { value: 'ninguno', label: 'Ninguno' },
    { value: 'total', label: 'Total' },
    { value: 'parcial', label: 'Parcial' }
  ];

  constructor(private fb: FormBuilder) {
    this.bondForm = this.fb.group({
      moneda: ['PEN', [Validators.required]],
      valorNominal: [1000, [Validators.required, Validators.min(0.01)]],
      valorComercial: [1000, [Validators.required, Validators.min(0.01)]],
      numeroAños: [5, [Validators.required, Validators.min(1)]],
      frecuenciaPago: [1, [Validators.required]],
      tipoTasaInteres: ['efectiva', [Validators.required]],
      capitalizacion: [''],
      tasaInteresAnual: [10, [Validators.required, Validators.min(0.01), Validators.max(100)]],
      tasaImpuesto: [5, [Validators.min(0), Validators.max(100)]],
      tipoGracia: ['ninguno', [Validators.required]],
      plazoGracia: [1],
      gastosIniciales: [0, [Validators.min(0)]],
      gastosFinales: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.setupFormListeners();
  }

  private setupFormListeners(): void {
    // Listen for rate type changes
    this.bondForm.get('tipoTasaInteres')?.valueChanges.subscribe(value => {
      const capitalizacionControl = this.bondForm.get('capitalizacion');
      if (value === 'nominal') {
        capitalizacionControl?.setValidators([Validators.required]);
      } else {
        capitalizacionControl?.clearValidators();
      }
      capitalizacionControl?.updateValueAndValidity();
    });

    // Listen for grace type changes
    this.bondForm.get('tipoGracia')?.valueChanges.subscribe(value => {
      const plazoGraciaControl = this.bondForm.get('plazoGracia');
      if (value !== 'ninguno') {
        plazoGraciaControl?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        plazoGraciaControl?.clearValidators();
      }
      plazoGraciaControl?.updateValueAndValidity();
    });
  }

  get showCapitalizacion(): boolean {
    return this.bondForm.get('tipoTasaInteres')?.value === 'nominal';
  }

  get showPlazoGracia(): boolean {
    return this.bondForm.get('tipoGracia')?.value !== 'ninguno';
  }

  getCurrencySymbol(code: string): string {
    return this.currencies.find(c => c.code === code)?.symbol || '';
  }

  onSubmit(): void {
    if (this.bondForm.valid) {
      this.loading = true;
      const formData = this.bondForm.value;
      
      // Simulate API call
      setTimeout(() => {
        console.log('Bond data:', formData);
        this.loading = false;
        // Here you would typically navigate to the results page
      }, 2000);
    } else {
      this.showValidationSummary = true;
      this.validationErrors = this.getValidationErrors();
    }
  }

  private getValidationErrors(): string[] {
    const errors: string[] = [];
    Object.keys(this.bondForm.controls).forEach(key => {
      const control = this.bondForm.get(key);
      if (control?.errors) {
        const label = this.getFieldLabel(key);
        errors.push(label);
      }
    });
    return errors;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      moneda: 'Moneda',
      valorNominal: 'Valor Nominal',
      valorComercial: 'Valor Comercial',
      numeroAños: 'Número de Años',
      frecuenciaPago: 'Frecuencia de Pago',
      tipoTasaInteres: 'Tipo de Tasa',
      capitalizacion: 'Frecuencia de Capitalización',
      tasaInteresAnual: 'Tasa de Interés Anual',
      tasaImpuesto: 'Tasa de Impuesto',
      tipoGracia: 'Tipo de Gracia',
      plazoGracia: 'Períodos de Gracia',
      gastosIniciales: 'Gastos Iniciales',
      gastosFinales: 'Gastos Finales'
    };
    return labels[fieldName] || fieldName;
  }

  resetForm(): void {
    if (confirm('¿Estás seguro de que deseas restablecer todos los campos?')) {
      this.bondForm.reset({
        moneda: 'PEN',
        valorNominal: 1000,
        valorComercial: 1000,
        numeroAños: 5,
        frecuenciaPago: 1,
        tipoTasaInteres: 'efectiva',
        tasaInteresAnual: 10,
        tasaImpuesto: 5,
        tipoGracia: 'ninguno',
        gastosIniciales: 0,
        gastosFinales: 0
      });
      this.showValidationSummary = false;
    }
  }
}
