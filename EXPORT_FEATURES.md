# Funciones de Exportación - Sistema de Análisis de Bonos

## Descripción General

Se han implementado las funciones de exportación a PDF y Excel para el análisis de bonos. Estas funciones permiten a los usuarios exportar todos los datos del análisis de un bono, incluyendo información básica, indicadores financieros y flujo de caja detallado.

## Características Implementadas

### 1. Exportación a PDF
- **Formato**: Documento PDF profesional con múltiples secciones
- **Contenido incluido**:
  - Información básica del bono (moneda, valores, tasas, etc.)
  - Indicadores financieros (TCEA, TREA, duración, convexidad, etc.)
  - Tabla detallada del flujo de caja por período
  - Formato de moneda apropiado según la moneda del bono
  - Numeración de páginas y fecha de generación

### 2. Exportación a Excel
- **Formato**: Archivo Excel (.xlsx) con múltiples hojas
- **Hojas incluidas**:
  - **Información del Bono**: Datos básicos y parámetros
  - **Indicadores Financieros**: Métricas de rendimiento y riesgo
  - **Flujo de Caja**: Tabla detallada con formato monetario
  - **Resumen Ejecutivo**: Métricas clave y análisis de riesgo

## Tecnologías Utilizadas

### Librerías
- **jsPDF**: Para generación de PDFs
- **xlsx**: Para generación de archivos Excel
- **Chart.js**: Para gráficos (ya implementado)

### Dependencias
```json
{
  "jspdf": "^3.0.1",
  "xlsx": "^0.18.5"
}
```

## Estructura del Código

### Servicio de Exportación
**Archivo**: `Frontend/src/app/bankCalc/core/services/export.service.ts`

#### Métodos Principales:
1. `exportToPDF(bono: Bono, flujoCaja: FlujoCaja[], indicadores: IndicadorFinanciero)`
2. `exportToExcel(bono: Bono, flujoCaja: FlujoCaja[], indicadores: IndicadorFinanciero)`

#### Métodos Auxiliares:
- `formatCurrency(amount: number, currency: string)`: Formatea valores monetarios
- `getFrecuenciaPago(frecuencia: number)`: Convierte códigos de frecuencia a texto

### Integración en el Componente
**Archivo**: `Frontend/src/app/bankCalc/dashboard/presentation/pages/bono_resultado/bono-resultado/bono-resultado.ts`

#### Cambios Realizados:
1. Importación del `ExportService`
2. Inyección del servicio en el constructor
3. Actualización de las funciones `exportToPDF()` y `exportToExcel()`

## Funcionalidades Específicas

### Exportación a PDF
- **Diseño**: Layout profesional con encabezados, secciones y tablas
- **Formato de moneda**: Símbolos apropiados según la moneda (S/, $, €, £, ¥)
- **Tabla de flujo de caja**: Formato tabular con columnas alineadas
- **Paginación**: Manejo automático de múltiples páginas
- **Pie de página**: Numeración y fecha de generación

### Exportación a Excel
- **Múltiples hojas**: Organización clara de la información
- **Formato de celdas**: 
  - Encabezados con fondo gris y texto en negrita
  - Valores monetarios con formato de números
  - Alineación centrada para encabezados
- **Resumen ejecutivo**: Métricas clave y análisis de riesgo
- **Información del usuario**: Datos del usuario que realizó el análisis

## Uso de las Funciones

### En el Componente
```typescript
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
```

### En el Template
```html
<button class="btn btn-success" (click)="exportToPDF()">Exportar PDF</button>
<button class="btn btn-primary" (click)="exportToExcel()">Exportar Excel</button>
```

## Formato de Archivos Generados

### Nomenclatura de Archivos
- **PDF**: `Bono_{idBono}_{fecha}.pdf`
- **Excel**: `Bono_{idBono}_{fecha}.xlsx`

### Ejemplo de Nombres
- `Bono_123_2024-01-15.pdf`
- `Bono_123_2024-01-15.xlsx`

## Características Técnicas

### Manejo de Errores
- Validación de datos antes de la exportación
- Manejo robusto de valores null, undefined y NaN
- Mensajes de alerta si no hay datos disponibles
- Validaciones en todos los campos numéricos y de texto
- Logs de error en consola para debugging

### Validaciones Implementadas
- **Datos requeridos**: Verificación de que bono e indicadores existan
- **Valores numéricos**: Manejo de null/undefined en todos los campos numéricos
- **Formato de moneda**: Validación antes de llamar toFixed()
- **Campos opcionales**: Valores por defecto para campos opcionales
- **Datos de usuario**: Validación con operador de encadenamiento opcional

### Compatibilidad
- **PDF**: Compatible con todos los lectores de PDF
- **Excel**: Compatible con Excel, Google Sheets, LibreOffice Calc

### Rendimiento
- Generación asíncrona de archivos
- No bloquea la interfaz de usuario
- Manejo eficiente de grandes volúmenes de datos
- Validaciones optimizadas para evitar errores en tiempo de ejecución

## Mejoras Futuras Sugeridas

1. **Personalización**: Permitir al usuario seleccionar qué secciones exportar
2. **Plantillas**: Diferentes estilos de plantillas para PDF
3. **Filtros**: Exportar solo ciertos períodos del flujo de caja
4. **Gráficos**: Incluir gráficos en las exportaciones
5. **Compartir**: Funcionalidad para compartir archivos generados
6. **Programación**: Exportación automática programada

## Consideraciones de Seguridad

- Los archivos se generan en el cliente (navegador)
- No se almacenan en el servidor
- Los datos se procesan localmente
- No hay transmisión de datos sensibles

## Soporte de Monedas

El sistema soporta las siguientes monedas con sus símbolos correspondientes:
- **PEN**: S/ (Soles peruanos)
- **USD**: $ (Dólares estadounidenses)
- **EUR**: € (Euros)
- **GBP**: £ (Libras esterlinas)
- **JPY**: ¥ (Yenes japoneses) 