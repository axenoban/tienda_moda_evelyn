export class ProcessSale {
  execute({ tipoCliente, cantidadDocenas, cantidadUnidades, cup }) {
    // Fórmulas oficiales del Blueprint de precios
    const pvMayor = cup * 1.30;
    const pvCuarta = pvMayor * 1.15;
    const pvUnidad = pvMayor * 1.30;

    let total = 0;
    let desgloseColores = { surtidos: 0, negroRepetido: 0 };

    // Regla de distribución mayorista por docenas surtidas
    if (cantidadDocenas > 0) {
      total += cantidadDocenas * 12 * pvMayor;
      desgloseColores.surtidos += cantidadDocenas * 11;
      desgloseColores.negroRepetido += cantidadDocenas * 1;
    }

    // Regla para prendas sueltas o al raleo
    if (cantidadUnidades > 0) {
      if (tipoCliente === 'cuarta') {
        total += cantidadUnidades * pvCuarta;
      } else {
        total += cantidadUnidades * pvUnidad;
      }
    }

    return {
      total: Number(total.toFixed(2)),
      desgloseColores,
      preciosAplicados: {
        mayor: Number(pvMayor.toFixed(2)),
        cuarta: Number(pvCuarta.toFixed(2)),
        unidad: Number(pvUnidad.toFixed(2))
      }
    };
  }
}