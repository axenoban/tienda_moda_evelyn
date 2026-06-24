export class CuttingBatch {
  constructor({ lCorte, nModelos, rColor, cTotal, pTela }) {
    this.lCorte = lCorte;     // Largo del trazo en metros [2.2, 2.6]
    this.nModelos = nModelos; // Modelos simultáneos (Mínimo 2, Promedio 3)
    this.rColor = rColor;     // Rendimiento de prendas por modelo/color
    this.cTotal = cTotal;     // Cantidad total de colores (capas)
    this.pTela = pTela;       // Precio de la tela por metro (Bs.)
  }
}