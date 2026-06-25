import { CalculateCUP } from '../../domain/usecases/CalculateCUP.js';
import { CalculatePricing } from '../../domain/usecases/CalculatePricing.js';
import { FinancialRepository } from '../../data/repositories/FinancialRepository.js';
import { VoiceController } from '../components/VoiceController.js';

export class CuttingBatchView {
  constructor() {
    this.repository = new FinancialRepository();
    this.cupCalculator = new CalculateCUP();
    this.pricingCalculator = new CalculatePricing();
    this.voiceController = null;
  }

  render(container) {
    container.innerHTML = `
      <div style="padding: 16px; margin-bottom: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h2 style="margin:0;">Mesa de Corte</h2>
          <button id="btn-voice" class="btn-submit" style="margin:0; width:auto; padding:10px 15px; background-color:#2196f3; color:white;">
            🎤 Dictar Datos
          </button>
        </div>
        
        <form id="cutting-form">
          <h3 style="color: var(--accent-color); margin: 10px 0;">1. Parámetros de la Tizada</h3>
          
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
            <label>Precio de la Tela (Bs. por Metro)</label>
            <input type="number" step="0.1" inputmode="decimal" id="pTela" class="form-control" value="25.0" required>
          </div>

          <h3 style="color: var(--accent-color); margin: 20px 0 10px 0;">2. Costos Variables de Confección</h3>

          <div class="form-group">
            <label>Mano de Obra / Tallerista (Bs. por Prenda [3.0 - 4.0])</label>
            <input type="number" step="0.1" inputmode="decimal" id="cCostura" class="form-control" value="3.5" required>
          </div>

          <div class="form-group">
            <label>Logística y Pasajes (Bs. por Prenda [1.0 - 3.0])</label>
            <input type="number" step="0.1" inputmode="decimal" id="cVarios" class="form-control" value="2.0" required>
          </div>

          <div class="form-group">
            <label>Costo de Adorno / Apliques (Bs. por Prenda [4.5 - 10.0])</label>
            <input type="number" step="0.1" inputmode="decimal" id="cAdorno" class="form-control" value="9.0" required>
          </div>

          <div id="batch-preview" style="background:#1e1e1e; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid var(--accent-color); font-size:0.95rem;">
            <!-- Proyecciones matemáticas en vivo -->
          </div>

          <button type="submit" class="btn-submit">GUARDAR LOTE EN DISPOSITIVO</button>
        </form>
      </div>
    `;

    const form = container.querySelector('#cutting-form');
    const voiceBtn = container.querySelector('#btn-voice');

    form.addEventListener('input', () => this._calculateLive(container));
    form.addEventListener('submit', (e) => this._handleSubmit(e, container));

    // Inicializar el puente de Inteligencia de Experiencia de Usuario (UXI) por Voz
    this.voiceController = new VoiceController((field, value) => {
      const input = container.querySelector(`#${field}`);
      if (input) {
        input.value = value;
        this._calculateLive(container);
        if (navigator.vibrate) navigator.vibrate(30);
      }
    });

    voiceBtn.addEventListener('click', () => {
      this.voiceController.toggleListening((isListening) => {
        voiceBtn.style.backgroundColor = isListening ? '#ff5252' : '#2196f3';
        voiceBtn.innerText = isListening ? '🛑 Escuchando...' : '🎤 Dictar Datos';
      });
    });

    this._calculateLive(container);
  }

  _calculateLive(container) {
    const lCorte = parseFloat(container.querySelector('#lCorte').value) || 0;
    const nModelos = parseInt(container.querySelector('#nModelos').value) || 0;
    const rColor = parseInt(container.querySelector('#rColor').value) || 0;
    const cTotal = parseInt(container.querySelector('#cTotal').value) || 0;
    const pTela = parseFloat(container.querySelector('#pTela').value) || 0;

    const cCostura = parseFloat(container.querySelector('#cCostura').value) || 0;
    const cVarios = parseFloat(container.querySelector('#cVarios').value) || 0;
    const cAdorno = parseFloat(container.querySelector('#cAdorno').value) || 0;

    try {
      const batchData = { lCorte, nModelos, rColor, cTotal, pTela };
      const costData = { cCostura, cVarios, cAdorno };

      // Invocar el caso de uso del dominio de forma reactiva para la vista previa
      const outputCUP = this.cupCalculator.execute(batchData, costData);

      container.querySelector('#batch-preview').innerHTML = `
        <p style="margin:0 0 6px 0;">Prendas a confeccionar: <strong>${outputCUP.tPrendas} unidades</strong></p>
        <p style="margin:0 0 6px 0;">Costo de Tela Unitario (1% Merma): <strong>${outputCUP.cuTela} Bs.</strong></p>
        <p style="margin:0; color: var(--accent-color);">CUP Estimado en Vivo: <strong>${outputCUP.cup} Bs. por prenda</strong></p>
      `;
    } catch (err) {
      container.querySelector('#batch-preview').innerHTML = `<span style="color:#ff5252;">${err.message}</span>`;
    }
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

      const customCosts = {
        cCostura: parseFloat(container.querySelector('#cCostura').value),
        cVarios: parseFloat(container.querySelector('#cVarios').value),
        cAdorno: parseFloat(container.querySelector('#cAdorno').value)
      };

      // Cálculo formal con los costos variables ingresados por el usuario
      const outputCUP = this.cupCalculator.execute(batchData, customCosts);
      const outputPrices = this.pricingCalculator.execute(outputCUP.cup);

      const id = Date.now().toString();
      await this.repository.saveCuttingBatch(id, batchData, { ...outputCUP, ...outputPrices });

      if (navigator.vibrate) navigator.vibrate([40, 40]);
      alert(`Lote guardado con éxito.\nTotal: ${outputCUP.tPrendas} unidades.\nCUP Real: ${outputCUP.cup} Bs.\nPrecio Mayorista base: ${outputPrices.mayor} Bs.`);
    } catch (err) {
      alert(`Error en el cálculo: ${err.message}`);
    }
  }
}