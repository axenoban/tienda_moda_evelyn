export class CalculateCUP {
  execute(batch, costs) {
    const { nModelos, rColor, cTotal, lCorte, pTela } = batch;
    const { cCostura, cVarios, cAdorno } = costs;

    // 1. Rendimiento total del lote de corte
    const tPrendas = nModelos * rColor * cTotal;

    if (tPrendas === 0) throw new Error("El rendimiento total no puede ser cero.");

    // 2. Costo Unitario de Tela con Factor de Merma (1%)
    const totalMetraje = lCorte * cTotal;
    const cuTela = ((totalMetraje * pTela) / tPrendas) * 1.01;

    // 3. Costo Unitario de Producción Total
    const cup = cuTela + cCostura + cVarios + cAdorno;

    return {
      tPrendas,
      cuTela: Number(cuTela.toFixed(2)),
      cup: Number(cup.toFixed(2))
    };
  }
}