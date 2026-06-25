import { CalculateCUP } from '../../domain/usecases/CalculateCUP.js';
import { CalculatePricing } from '../../domain/usecases/CalculatePricing.js';
import { FinancialRepository } from '../../data/repositories/FinancialRepository.js';

export class CuttingBatchView {
  constructor() {
    this.repository = new FinancialRepository();
    this.cupCalculator = new CalculateCUP();
    this.pricingCalculator = new CalculatePricing();
  }

  render(container) {
    container.innerHTML = `
      <div style="padding: 16px;">
        <h2 style="margin-top:0;">Mesa de Corte</h2>
        
        <form id="cutting-form">
          <div class="form-group">
            <label>Largo del Trazo (Metros - Promedio: 2.5)</label>
            <input type="number" step="0.1" inputmode="decimal" id="lCorte" class="form-control" value="2.5" required>
          </div>
          
          <div class="form-group">
            <label>Modelos en Tizada (Mínimo: 2, Promedio: 3)</label>
            <input type="number" inputmode="numeric" id="nModelos" class="form-control" value="3" required>
          </div>
          
          <div class="form-group">
            <label>Prendas por Modelo/Color (Rendimiento)</label>
            <input type="number" inputmode="numeric" id="rColor" class="form-control" value="6" required>
          </div>
          
          <div class="form-group">
            <label>Cantidad Total de Colores (Capas)</label>
            <input type="number" inputmode="numeric" id="cTotal" class="form-control" value="12" required>
          </div>
          
          <div class="form-group">
            <label>Precio Adquisición Tela (Bs. por Metro)</label>
            <input type="number" step="0.1" inputmode="decimal" id="pTela" class="form-control" value="25.0" required>
          </div>

          <div id="batch-preview" style="background:#1e1e1e; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid var(--accent-color);">
            <!-- Cálculos reactivos instantáneos -->
          </div>

          <button type="submit" class="btn-submit">GUARDAR LOTE DE PRODUCCIÓN</button>
        </form>
      </div>
    `;

    // Adjuntar escuchas de eventos para cálculos reactivos y guardado
    const form = container.querySelector('#cutting-form');
    form.addEventListener('input', () => this._calculateLive(container));
    form.addEventListener('submit', (e) => this._handleSubmit(e, container));

    this._calculateLive(container);
  }

  _calculateLive(container) {
    const lCorte = parseFloat(container.querySelector('#lCorte').value) || 0;
    const nModelos = parseInt(container.querySelector('#nModelos').value) || 0;
    const rColor = parseInt(container.querySelector('#rColor').value) || 0;
    const cTotal = parseInt(container.querySelector('#cTotal').value) || 0;

    const tPrendas = nModelos * rColor * cTotal;
    container.querySelector('#batch-preview').innerHTML = `
      <p style="margin:0 0 4px 0;">Prendas a enviar a costura: <strong>${tPrendas} unidades</strong></p>
      <small style="color:var(--text-muted)">Formato estándar: Docenas balanceadas (11 surtidos / 1 negro obligatorio)</small>
    `;
  }

  async _handleSubmit(e, container) {
    e.preventDefault();
    try {
      const batchData = {
        lCorte: parseFloat(container.querySelector('#lCorte').value),
        nModelos: parseInt(container.querySelector('#nModelos').value),
        rColor: parseInt(container.querySelector('#rColor').value),
        cTotal: parseInt(container.querySelector('#cTotal').value),
        pTela: parseFloat(container.querySelector('#pTela').value)
      };

      // Costos predeterminados del Blueprint de Moda Evelyn
      const standardCosts = { cCostura: 3.5, cVarios: 2.0, cAdorno: 9.0 };

      const outputCUP = this.cupCalculator.execute(batchData, standardCosts);
      const outputPrices = this.pricingCalculator.execute(outputCUP.cup);

      const id = Date.now().toString();
      await this.repository.saveCuttingBatch(id, batchData, { ...outputCUP, ...outputPrices });

      if (navigator.vibrate) navigator.vibrate([40, 40]); // Confirmación hápitca nativa exitosa
      alert(`Lote de corte registrado offline.\nTotal prendas: ${outputCUP.tPrendas}\nCUP calculado: ${outputCUP.cup} Bs.\nPrecio Mayorista: ${outputPrices.mayor} Bs.`);
    } catch (err) {
      alert(`Error en validación: ${err.message}`);
    }
  }
}