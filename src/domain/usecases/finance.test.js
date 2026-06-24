import { test, expect, describe } from 'vitest';
// Se añaden de forma estricta las extensiones .js para la resolución de módulos
import { CuttingBatch } from '../entities/CuttingBatch.js';
import { CalculateCUP } from './CalculateCUP.js';
import { CalculatePricing } from './CalculatePricing.js';

describe('Pruebas del Motor de Ingeniería Financiera FinaPro', () => {
  
  test('Debe calcular con precisión milimétrica el CUP y el Pricing Mayorista', () => {
    const batch = new CuttingBatch({
      lCorte: 2.5,
      nModelos: 3,
      rColor: 6,
      cTotal: 12,
      pTela: 25.0
    });

    const costs = {
      cCostura: 3.5,
      cVarios: 2.0,
      cAdorno: 9.0
    };

    const cupCalculator = new CalculateCUP();
    const resultCUP = cupCalculator.execute(batch, costs);

    expect(resultCUP.tPrendas).toBe(216); 
    expect(resultCUP.cuTela).toBe(3.51);
    expect(resultCUP.cup).toBe(18.01);

    const pricingCalculator = new CalculatePricing();
    const prices = pricingCalculator.execute(resultCUP.cup);

    expect(prices.mayor).toBe(23.41);
  });
});