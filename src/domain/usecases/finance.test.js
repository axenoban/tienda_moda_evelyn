import { test, expect } from 'vitest';

// Prueba de la fórmula formal de Rendimiento Total de Prendas (Documento de Especificación)
test('Calcular rendimiento total de prendas en base a modelos, colores y rendimiento', () => {
  const nModelos = 3;
  const rColor = 6;
  const cTotal = 12;
  
  // Fórmula formal: T_prendas = N_modelos * R_color * C_total
  const tPrendas = nModelos * rColor * cTotal; 
  
  expect(tPrendas).toBe(216);
});