import { test, expect, describe } from 'vitest';
import { ProcessSale } from './ProcessSale.js';

describe('Pruebas del Módulo Comercial y Distribución de Docenas', () => {
  test('Debe calcular con precisión los montos y validar la regla del color negro repetido', () => {
    const processor = new ProcessSale();
    const cupBase = 18.01; // CUP obtenido en el lote estándar anterior

    const resultado = processor.execute({
      tipoCliente: 'mayorista',
      cantidadDocenas: 2, // 2 docenas = 24 prendas en total
      cantidadUnidades: 0,
      cup: cupBase
    });

    // PV_mayor = 18.01 * 1.30 = 23.413 Bs. Total (24 unidades) = 561.91 Bs.
    expect(resultado.total).toBeCloseTo(561.91, 1);
    
    // Regla de empaque: 11 surtidos y 1 negro por docena (x2 docenas = 22 y 2)
    expect(resultado.desgloseColores.surtidos).toBe(22);
    expect(resultado.desgloseColores.negroRepetido).toBe(2);
  });
});