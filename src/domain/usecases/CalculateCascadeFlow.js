import { OPEX_CONSTANTS } from '../../core/constants.js';

export class CalculateCascadeFlow {
  execute({ ingresosCaja, costosProduccionlotes, egresosFamiliaresAcumulados }) {
    let fondoDisponible = ingresosCaja;

    // Paso 1: Cubrir Costos de Producción (COGS) de la mercadería[cite: 2]
    const cogsCubierto = Math.min(fondoDisponible, costosProduccionlotes);
    fondoDisponible -= cogsCubierto;

    // Paso 2: Cubrir Gastos Operativos Fijos Mensuales (Sin el préstamo)[cite: 2]
    const opexEstructural = OPEX_CONSTANTS.TOTAL_OPEX_OBLIGATORIO - OPEX_CONSTANTS.PRESTAMO_BANCARIO;
    const opexCubierto = Math.min(fondoDisponible, opexEstructural);
    fondoDisponible -= opexCubierto;

    // Paso 3: Cubrir la Cuota del Préstamo Bancario Activo[cite: 2]
    const prestamoCubierto = Math.min(fondoDisponible, OPEX_CONSTANTS.PRESTAMO_BANCARIO);
    fondoDisponible -= prestamoCubierto;

    // Paso 4: Cubrir los Egresos Familiares registrados en el mes[cite: 2]
    const familiarCubierto = Math.min(fondoDisponible, egresosFamiliaresAcumulados);
    fondoDisponible -= familiarCubierto;

    // El remanente líquido es el excedente neto real del taller[cite: 2]
    const excedenteNeto = fondoDisponible;

    return {
      resumenCubierto: {
        cogs: Number(cogsCubierto.toFixed(2)),
        opex: Number(opexCubierto.toFixed(2)),
        prestamo: Number(prestamoCubierto.toFixed(2)),
        familiar: Number(familiarCubierto.toFixed(2))
      },
      faltantes: {
        cogs: Number(Math.max(0, costosProduccionlotes - cogsCubierto).toFixed(2)),
        opex: Number(Math.max(0, opexEstructural - opexCubierto).toFixed(2)),
        prestamo: Number(Math.max(0, OPEX_CONSTANTS.PRESTAMO_BANCARIO - prestamoCubierto).toFixed(2)),
        familiar: Number(Math.max(0, egresosFamiliaresAcumulados - familiarCubierto).toFixed(2))
      },
      excedenteNeto: Number(excedenteNeto.toFixed(2))
    };
  }
}