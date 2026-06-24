export class CalculatePricing {
  execute(cup) {
    // PV_mayor = CUP * 1.30 (Margen plano del 30%)
    const pvMayor = cup * 1.30;
    
    // PV_cuarta = PV_mayor * 1.15 (Recargo del 15%)
    const pvCuarta = pvMayor * 1.15;
    
    // PV_unidad = PV_mayor * 1.30 (Recargo del 30%)
    const pvUnidad = pvMayor * 1.30;

    return {
      mayor: Number(pvMayor.toFixed(2)),
      cuarta: Number(pvCuarta.toFixed(2)),
      unidad: Number(pvUnidad.toFixed(2))
    };
  }
}