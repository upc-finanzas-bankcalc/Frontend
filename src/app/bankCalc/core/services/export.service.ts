import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Bono, FlujoCaja, IndicadorFinanciero } from '../models/bono.model';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  exportToPDF(bono: Bono, flujoCaja: FlujoCaja[], indicadores: IndicadorFinanciero): void {
    // Validar que los datos requeridos estén disponibles
    if (!bono || !indicadores) {
      console.error('Datos requeridos no disponibles para exportar a PDF');
      return;
    }

    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Título principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Análisis de Bono', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Información del bono
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Bono', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const bonoInfo = [
      `Moneda: ${bono.moneda || 'N/A'}`,
      `Valor Nominal: ${this.formatCurrency(bono.valorNominal, bono.moneda)}`,
      `Valor Comercial: ${this.formatCurrency(bono.valorComercial, bono.moneda)}`,
      `Frecuencia de Pago: ${this.getFrecuenciaPago(bono.frecuenciaPago || 1)}`,
      `Número de Años: ${bono.numeroAnios || 0}`,
      `Tipo de Tasa: ${bono.tipoTasa || 'N/A'}`,
      `Tasa Anual: ${bono.tasaAnual || 0}%`,
      `Capitalización: ${bono.capitalizacion || 'N/A'}`,
      `Tasa de Impuesto: ${bono.tasaImpuesto ? bono.tasaImpuesto + '%' : 'N/A'}`,
      `Plazo de Gracia: ${bono.plazoGracia || 0} períodos`,
      `Tipo de Gracia: ${bono.tipoGracia || 'Ninguno'}`,
      `Gastos Iniciales: ${bono.gastosIniciales ? this.formatCurrency(bono.gastosIniciales, bono.moneda) : 'N/A'}`,
      `Gastos Finales: ${bono.gastosFinales ? this.formatCurrency(bono.gastosFinales, bono.moneda) : 'N/A'}`
    ];

    bonoInfo.forEach(info => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(info, margin, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Indicadores financieros
    if (indicadores) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Indicadores Financieros', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const indicadoresInfo = [
        `TCEA: ${(indicadores.tcea || 0).toFixed(4)}%`,
        `TREA: ${(indicadores.trea || 0).toFixed(4)}%`,
        `Duración: ${(indicadores.duracion || 0).toFixed(4)}`,
        `Duración Modificada: ${(indicadores.duracionModificada || 0).toFixed(4)}`,
        `Convexidad: ${(indicadores.convexidad || 0).toFixed(4)}`,
        `Precio Máximo: ${this.formatCurrency(indicadores.precioMaximo, bono.moneda)}`
      ];

      indicadoresInfo.forEach(info => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(info, margin, yPosition);
        yPosition += 7;
      });

      yPosition += 10;
    }

    // Flujo de caja (tabla)
    if (flujoCaja && flujoCaja.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Flujo de Caja', margin, yPosition);
      yPosition += 10;

      // Crear tabla de flujo de caja
      const headers = ['Período', 'Cuota', 'Interés', 'Amortización', 'Saldo Pendiente'];
      const columnWidths = [25, 35, 35, 35, 35];
      const startX = margin;

      // Encabezados de la tabla
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      let xPosition = startX;
      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      yPosition += 5;

      // Datos de la tabla
      doc.setFont('helvetica', 'normal');
      flujoCaja.forEach(flujo => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        xPosition = startX;
        doc.text(flujo.periodo?.toString() || 'N/A', xPosition, yPosition);
        xPosition += columnWidths[0];
        
        doc.text(this.formatCurrency(flujo.cuota, bono.moneda), xPosition, yPosition);
        xPosition += columnWidths[1];
        
        doc.text(this.formatCurrency(flujo.interes, bono.moneda), xPosition, yPosition);
        xPosition += columnWidths[2];
        
        doc.text(this.formatCurrency(flujo.amortizacion, bono.moneda), xPosition, yPosition);
        xPosition += columnWidths[3];
        
        doc.text(this.formatCurrency(flujo.saldoPendiente, bono.moneda), xPosition, yPosition);
        
        yPosition += 5;
      });
    }

    // Pie de página
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, 290, { align: 'center' });
      doc.text(`Generado el: ${new Date().toLocaleDateString()}`, margin, 290);
    }

    // Guardar el PDF
    const fileName = `Bono_${bono.idBono}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  exportToExcel(bono: Bono, flujoCaja: FlujoCaja[], indicadores: IndicadorFinanciero): void {
    // Validar que los datos requeridos estén disponibles
    if (!bono || !indicadores) {
      console.error('Datos requeridos no disponibles para exportar a Excel');
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Hoja 1: Información del Bono
    const bonoData: (string | number)[][] = [
      ['INFORMACIÓN DEL BONO'],
      [''],
      ['Campo', 'Valor'],
      ['Moneda', bono.moneda || 'N/A'],
      ['Valor Nominal', bono.valorNominal || 0],
      ['Valor Comercial', bono.valorComercial || 0],
      ['Frecuencia de Pago', this.getFrecuenciaPago(bono.frecuenciaPago || 1)],
      ['Número de Años', bono.numeroAnios || 0],
      ['Tipo de Tasa', bono.tipoTasa || 'N/A'],
      ['Tasa Anual (%)', bono.tasaAnual || 0],
      ['Capitalización', bono.capitalizacion || 'N/A'],
      ['Tasa de Impuesto (%)', bono.tasaImpuesto || 'N/A'],
      ['Plazo de Gracia', bono.plazoGracia || 0],
      ['Tipo de Gracia', bono.tipoGracia || 'Ninguno'],
      ['Gastos Iniciales', bono.gastosIniciales || 'N/A'],
      ['Gastos Finales', bono.gastosFinales || 'N/A'],
      ['Fecha de Creación', bono.fechaCreacion ? new Date(bono.fechaCreacion).toLocaleDateString() : 'N/A']
    ];

    const bonoSheet = XLSX.utils.aoa_to_sheet(bonoData);
    XLSX.utils.book_append_sheet(workbook, bonoSheet, 'Información del Bono');

    // Hoja 2: Indicadores Financieros
    if (indicadores) {
      const indicadoresData: (string | number)[][] = [
        ['INDICADORES FINANCIEROS'],
        [''],
        ['Indicador', 'Valor'],
        ['TCEA (%)', indicadores.tcea || 0],
        ['TREA (%)', indicadores.trea || 0],
        ['Duración', indicadores.duracion || 0],
        ['Duración Modificada', indicadores.duracionModificada || 0],
        ['Convexidad', indicadores.convexidad || 0],
        ['Precio Máximo', indicadores.precioMaximo || 0]
      ];

      const indicadoresSheet = XLSX.utils.aoa_to_sheet(indicadoresData);
      XLSX.utils.book_append_sheet(workbook, indicadoresSheet, 'Indicadores Financieros');
    }

    // Hoja 3: Flujo de Caja
    if (flujoCaja && flujoCaja.length > 0) {
      const flujoHeaders = ['Período', 'Cuota', 'Interés', 'Amortización', 'Saldo Pendiente', 'Fecha de Pago'];
      const flujoData: (string | number)[][] = [flujoHeaders];

      flujoCaja.forEach(flujo => {
        flujoData.push([
          flujo.periodo || 0,
          flujo.cuota || 0,
          flujo.interes || 0,
          flujo.amortizacion || 0,
          flujo.saldoPendiente || 0,
          flujo.fechaPago ? new Date(flujo.fechaPago).toLocaleDateString() : 'N/A'
        ]);
      });

      const flujoSheet = XLSX.utils.aoa_to_sheet(flujoData);
      
      // Aplicar formato a la tabla de flujo de caja
      const range = XLSX.utils.decode_range(flujoSheet['!ref'] || 'A1');
      
      // Formato para encabezados
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!flujoSheet[cellAddress]) continue;
        
        flujoSheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "CCCCCC" } },
          alignment: { horizontal: "center" }
        };
      }

      // Formato para valores monetarios
      for (let row = 1; row <= range.e.r; row++) {
        for (let col = 1; col <= 4; col++) { // Columnas de valores monetarios
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!flujoSheet[cellAddress]) continue;
          
          flujoSheet[cellAddress].s = {
            numFmt: '#,##0.00'
          };
        }
      }

      XLSX.utils.book_append_sheet(workbook, flujoSheet, 'Flujo de Caja');
    }

    // Hoja 4: Resumen Ejecutivo
    const resumenData: (string | number)[][] = [
      ['RESUMEN EJECUTIVO'],
      [''],
      ['Métricas Clave', 'Valor'],
      ['Valor Nominal', bono.valorNominal || 0],
      ['Valor Comercial', bono.valorComercial || 0],
      ['Diferencia', (bono.valorComercial || 0) - (bono.valorNominal || 0)],
      ['TCEA (%)', indicadores ? indicadores.tcea || 0 : 'N/A'],
      ['TREA (%)', indicadores ? indicadores.trea || 0 : 'N/A'],
      ['Duración', indicadores ? indicadores.duracion || 0 : 'N/A'],
      ['Precio Máximo', indicadores ? indicadores.precioMaximo || 0 : 'N/A'],
      [''],
      ['Análisis de Riesgo'],
      ['Duración Modificada', indicadores ? indicadores.duracionModificada || 0 : 'N/A'],
      ['Convexidad', indicadores ? indicadores.convexidad || 0 : 'N/A'],
      [''],
      ['Información del Usuario'],
      ['Usuario', bono.usuario?.nombre || 'N/A'],
      ['Email', bono.usuario?.correo || 'N/A']
    ];

    const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen Ejecutivo');

    // Guardar el archivo Excel
    const fileName = `Bono_${bono.idBono}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  private formatCurrency(amount: number | null | undefined, currency: string): string {
    // Validar que amount sea un número válido
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'N/A';
    }

    const currencySymbols: { [key: string]: string } = {
      'PEN': 'S/',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol} ${amount.toFixed(2)}`;
  }

  private getFrecuenciaPago(frecuencia: number): string {
    const options = [
      { value: 1, label: 'Anual' },
      { value: 2, label: 'Semestral' },
      { value: 4, label: 'Trimestral' },
      { value: 12, label: 'Mensual' }
    ];
    const option = options.find(o => o.value === frecuencia);
    return option ? option.label : 'Desconocido';
  }
} 