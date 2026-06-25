import { test, expect, describe } from 'vitest';
import { PredictSeasonalDemand } from './PredictSeasonalDemand.js';

describe('Pruebas de Proyección Estacional de Moda Evelyn', () => {
  test('Debe aplicar el multiplicador máximo en campaña navideña (Diciembre)', () => {
    const predictor = new PredictSeasonalDemand();
    const diciembreIndex = 11; // Index de diciembre (0-11)

    const proyeccion = predictor.calculateRequiredRolls(100, diciembreIndex);

    // Multiplicador excelente_navidad = 2.2 => 100 * 2.2 = 220 prendas //[cite: 2]
    expect(proyeccion.ventasProyectadas).toBe(220);
    // Debe mantenerse en el rango mayorista estandarizado de adquisición de 12 a 14 rollos //[cite: 2]
    expect(proyeccion.rollosSugeridos).toBeGreaterThanOrEqual(12);
    expect(proyeccion.rollosSugeridos).toBeLessThanOrEqual(14);
  });
});