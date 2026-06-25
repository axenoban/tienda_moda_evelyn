import { test, expect, describe } from 'vitest';
import { CalculateCascadeFlow } from './CalculateCascadeFlow.js';

describe('Pruebas del Motor de Liquidación en Cascada FinaPro', () => {
  test('Debe liquidar las obligaciones en el orden correcto y calcular el excedente neto', () => {
    const liquidacion = new CalculateCascadeFlow();
    
    const resultado = liquidacion.execute({
      ingresosCaja: 15000,                 // Ingresos totales de ferias y QR[cite: 2]
      costosProduccionlotes: 4000,          // Costo total de fabricación acumulada[cite: 2]
      egresosFamiliaresAcumulados: 2500     // Retiros del mes para sustento familiar[cite: 2]
    });

    // 15000 - 4000 (COGS) = 11000
    expect(resultado.resumenCubierto.cogs).toBe(4000);
    // 11000 - 3470 (OPEX Estructural) = 7530
    expect(resultado.resumenCubierto.opex).toBe(3470);
    // 7530 - 1700 (Préstamo) = 5830
    expect(resultado.resumenCubierto.prestamo).toBe(1700);
    // 5830 - 2500 (Familiar) = 3330 Bs. de Excedente Neto[cite: 2]
    expect(resultado.resumenCubierto.familiar).toBe(2500);
    expect(resultado.excedenteNeto).toBe(3330);
    
    // Las obligaciones se cubrieron por completo, no debe haber faltantes
    expect(resultado.faltantes.opex).toBe(0);
    expect(resultado.faltantes.prestamo).toBe(0);
  });
});