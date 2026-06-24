import { CalculateCUP } from '../../domain/usecases/CalculateCUP.js';
import { CalculatePricing } from '../../domain/usecases/CalculatePricing.js';
import { FinancialRepository } from '../../data/repositories/FinancialRepository.js';
import { TactileKeyboard } from '../components/TactileKeyboard.js';

export class CuttingBatchView {
  constructor() {
    this.repository = new FinancialRepository();
    this.cupCalculator = new CalculateCUP();
    this.pricingCalculator = new CalculatePricing();
    
    // Estado de carga predeterminado (Sugerencias predictivas del Blueprint)
    this.state = {
      lCorte: '2.5',   // Promedio estandarizado en metros
      nModelos: '3',   // Promedio óptimo en tizada
      rColor: '6',     // Rendimiento estándar
      cTotal: '12',    // Cantidad total de colores común
      pTela: '25.0',   // Precio base Morley Rib
      activeField: 'pTela' 
    };
  }

  async init() {
    const app = document.getElementById('app') || document.body;
    app.innerHTML = `
      <div style="padding: 16px; margin-bottom: 320px;">
        <h2>FinaPro · Orden de Corte</h2>
        <div style="background:#1e1e1e; padding:12px; border-radius:8px; margin-bottom:12px;">
          <p>Variable Activa: <strong style="color:var(--accent-color)">${this.state.activeField}</strong></p>
          <p style="font-size:2rem; margin:0;" id="display-value">${this.state[this.state.activeField]}</p>
        </div>
        <div id="results-preview" style="background:#252525; padding:12px; border-radius:8px; font-size:0.9rem;">
          <!-- Los cálculos en tiempo real aparecerán aquí -->
        </div>
      </div>
    `;

    // Inyectar teclado predictivo táctil
    const keyboard = new TactileKeyboard(
      (num) => this._handleKeyPress(num),
      () => this._handleDelete(),
      () => this._handleSave()
    );
    app.appendChild(keyboard.render());
    this._updateUI();
  }

  _handleKeyPress(char) {
    this.state[this.state.activeField] += char;
    this._updateUI();
  }

  _handleDelete() {
    this.state[this.state.activeField] = this.state[this.state.activeField].slice(0, -1);
    this._updateUI();
  }

  async _handleSave() {
    try {
      const batchData = {
        lCorte: parseFloat(this.state.lCorte),
        nModelos: parseInt(this.state.nModelos),
        rColor: parseInt(this.state.rColor),
        cTotal: parseInt(this.state.cTotal),
        pTela: parseFloat(this.state.pTela)
      };

      // Costos operativos base asignados por defecto del Blueprint
      const standardCosts = { cCostura: 3.5, cVarios: 2.0, cAdorno: 9.0 };

      // Ejecución limpia de reglas financieras del dominio
      const outputCUP = this.cupCalculator.execute(batchData, standardCosts);
      const outputPrices = this.pricingCalculator.execute(outputCUP.cup);

      const id = Date.now().toString();
      await this.repository.saveCuttingBatch(id, batchData, { ...outputCUP, ...outputPrices });

      alert(`Lote guardado OFFLINE. Total prendas: ${outputCUP.tPrendas}. CUP: ${outputCUP.cup} Bs.`);
    } catch (err) {
      alert(`Error en validación: ${err.message}`);
    }
  }

  _updateUI() {
    document.getElementById('display-value').innerText = this.state[this.state.activeField] || '0';
    
    // Cálculo en tiempo real simulado para la vista rápida del operario
    try {
      const tPrendas = parseInt(this.state.nModelos) * parseInt(this.state.rColor) * parseInt(this.state.cTotal);
      document.getElementById('results-preview').innerHTML = `
        <p>Prendas Proyectadas: <strong>${isNaN(tPrendas) ? 0 : tPrendas} unidades</strong></p>
        <p style="color:var(--text-muted)">Preajustado: Surtido de 11 colores y 1 color negro obligatorio.</p>
      `;
    } catch { /* Absorber errores de tipado transitorio en pantalla */ }
  }
}