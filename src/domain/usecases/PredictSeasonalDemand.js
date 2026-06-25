export class PredictSeasonalDemand {
  constructor() {
    // Multiplicadores estacionales según la demanda real del mercado boliviano //[cite: 2]
    this.seasonalFactors = {
      bajo_verano: 0.6,    // Enero - Marzo: Retracción post-fiestas y escolar //[cite: 2]
      pico_invierno: 1.8,  // Abril - Julio/Agosto: Alta demanda de fardos de Frizado //[cite: 2]
      transicion: 0.9,     // Agosto - Octubre: Media estación //[cite: 2]
      excelente_navidad: 2.2 // Noviembre - Diciembre: Campaña máxima //[cite: 2]
    };
  }

  getFactorByMonth(monthIndex) {
    const month = monthIndex + 1; // 1 = Enero, 12 = Diciembre
    
    if (month >= 1 && month <= 3) return this.seasonalFactors.bajo_verano; //[cite: 2]
    if (month >= 4 && month <= 7) return this.seasonalFactors.pico_invierno; //[cite: 2]
    if (month >= 8 && month <= 10) return this.seasonalFactors.transicion; //[cite: 2]
    return this.seasonalFactors.excelente_navidad; // Noviembre y Diciembre //[cite: 2]
  }

  // Proyecta la cantidad de rollos cerrados de tela requeridos para reabastecimiento continuo //[cite: 2]
  calculateRequiredRolls(ventasBaseSemanales, monthIndex) {
    const factor = this.getFactorByMonth(monthIndex);
    const ventasProyectadas = ventasBaseSemanales * factor;
    
    // Suponiendo un rendimiento promedio de 2.5 metros por trazo para optimizar el stock //[cite: 2]
    // Cada rollo cerrado cuenta con un metraje promedio estandarizado de 80 metros //[cite: 2]
    const metrosNecesarios = (ventasProyectadas / 6) * 2.5; 
    const rollosCalculados = Math.ceil(metrosNecesarios / 80);

    // El Blueprint exige compras en lotes mayoristas estandarizados de 12 a 14 rollos //[cite: 2]
    return {
      ventasProyectadas: Math.round(ventasProyectadas),
      rollosSugeridos: Math.max(12, Math.min(14, rollosCalculados)), //[cite: 2]
      factorAplicado: factor
    };
  }
}