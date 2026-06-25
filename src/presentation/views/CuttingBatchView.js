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
      <div style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h2 style="margin:0;">Mesa de Corte</h2>
          <button id="btn-voice" class="btn-submit" style="margin:0; width:auto; padding:10px 15px; background-color:#2196f3; color:white;">
            🎤 Dictar Datos
          </button>
        </div>
        
        <form id="cutting-form">
          <div class="form-group">
            <label>Largo del Trazo (Metros)</label>
            <input type="number" step="0.1" inputmode="decimal" id="lCorte" class="form-control" value="2.5" required>
          </div>
          
          <div class="form-group">
            <label>Modelos en Tizada</label>
            <input type="number" inputmode="numeric" id="nModelos" class="form-control" value="3" required>
          </div>
          
          <div class="form-group">
            <label>Prendas por Modelo/Color</label>
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

          <div id="batch-preview" style="background:#1e1e1e; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid var(--accent-color);"></div>

          <button type="submit" class="btn-submit">GUARDAR LOTE DE PRODUCCIÓN</button>
        </form>
      </div>
    `;

    const form = container.querySelector('#cutting-form');
    const voiceBtn = container.querySelector('#btn-voice');

    form.addEventListener('input', () => this._calculateLive(container));
    form.addEventListener('submit', (e) => this._handleSubmit(e, container));

    // Inicializar el puente de Inteligencia de Experiencia de Usuario (UXI) //
    this.voiceController = new VoiceController((field, value) => {
      const input = container.querySelector(`#${field}`);
      if (input) {
        input.value = value;
        this._calculateLive(container);
        if (navigator.vibrate) navigator.vibrate(30); //
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
    const nModelos = parseInt(container.querySelector('#nModelos').value) || 0;
    const rColor = parseInt(container.querySelector('#rColor').value) || 0;
    const cTotal = parseInt(container.querySelector('#cTotal').value) || 0;

    const tPrendas = nModelos * rColor * cTotal;
    container.querySelector('#batch-preview').innerHTML = `
      <p style="margin:0 0 4px 0;">Prendas Proyectadas: <strong>${tPrendas} unidades</strong></p>
      <small style="color:var(--text-muted)">Estructura formal: Docenas con 11 colores variados y 1 negro obligatorio.</small>
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

      const standardCosts = { cCostura: 3.5, cVarios: 2.0, cAdorno: 9.0 };
      const outputCUP = this.cupCalculator.execute(batchData, standardCosts);
      const outputPrices = this.pricingCalculator.execute(outputCUP.cup);

      const id = Date.now().toString();
      await this.repository.saveCuttingBatch(id, batchData, { ...outputCUP, ...outputPrices });

      if (navigator.vibrate) navigator.vibrate([40, 40]);
      alert(`Lote guardado offline con comandos de voz.\nTotal: ${outputCUP.tPrendas} prendas.\nCUP: ${outputCUP.cup} Bs.`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }
}