import { CalculateCascadeFlow } from '../../domain/usecases/CalculateCascadeFlow.js';
import { OPEX_CONSTANTS } from '../../core/constants.js';

export class MonthlyBalanceView {
  constructor() {
    this.cascadeCalculator = new CalculateCascadeFlow();
  }

  render(container) {
    container.innerHTML = `
      <div style="padding: 16px;">
        <h2 style="margin-top:0;">Balance y Flujo Cascada</h2>
        <p style="color:var(--text-muted); font-size:0.9rem;">Estructura Fija OPEX Base: <strong>${OPEX_CONSTANTS.TOTAL_OPEX_OBLIGATORIO} Bs./mes</strong></p>
        
        <form id="balance-form" style="margin-top:15px;">
          <div class="form-group">
            <label>Ingresos Brutos de Caja (Ventas/QR)</label>
            <input type="number" inputmode="decimal" id="ingresosCaja" class="form-control" placeholder="0.00" required>
          </div>
          
          <div class="form-group">
            <label>Costos de Producción de Lotes Vendidos</label>
            <input type="number" inputmode="decimal" id="costosLotes" class="form-control" placeholder="0.00" required>
          </div>

          <div class="form-group">
            <label>Gastos Familiares del Mes Acumulados</label>
            <input type="number" inputmode="decimal" id="gastosFam" class="form-control" placeholder="0.00" required>
          </div>

          <button type="submit" class="btn-submit">CALCULAR LIQUIDACIÓN</button>
        </form>

        <div id="cascade-results" style="margin-top:20px; display:none;">
          <!-- Resultados dinámicos renderizados por el motor de cascada -->
        </div>
      </div>
    `;

    container.querySelector('#balance-form').addEventListener('submit', (e) => this._handleCalculate(e, container));
  }

  _handleCalculate(e, container) {
    e.preventDefault();
    
    const ingresosCaja = parseFloat(container.querySelector('#ingresosCaja').value) || 0;
    const costosProduccionlotes = parseFloat(container.querySelector('#costosLotes').value) || 0;
    const egresosFamiliaresAcumulados = parseFloat(container.querySelector('#gastosFam').value) || 0;

    const output = this.cascadeCalculator.execute({
      ingresosCaja,
      costosProduccionlotes,
      egresosFamiliaresAcumulados
    });

    const resultsDiv = container.querySelector('#cascade-results');
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
      <h3>Distribución en Cascada</h3>
      <table style="width:100%; color:white; border-collapse:collapse; font-size:0.95rem;">
        <tr style="border-bottom:1px solid #333;"><td style="padding:8px 0;">Costos de Producción:</td><td style="text-align:right; color:var(--accent-color); font-weight:bold;">+${output.resumenCubierto.cogs} Bs.</td></tr>
        <tr style="border-bottom:1px solid #333;"><td style="padding:8px 0;">Gastos Operativos (OPEX):</td><td style="text-align:right; color:var(--accent-color); font-weight:bold;">+${output.resumenCubierto.opex} Bs.</td></tr>
        <tr style="border-bottom:1px solid #333;"><td style="padding:8px 0;">Préstamo Bancario:</td><td style="text-align:right; color:var(--accent-color); font-weight:bold;">+${output.resumenCubierto.prestamo} Bs.</td></tr>
        <tr style="border-bottom:1px solid #333;"><td style="padding:8px 0;">Sustento Familiar:</td><td style="text-align:right; color:var(--accent-color); font-weight:bold;">+${output.resumenCubierto.familiar} Bs.</td></tr>
        <tr><td style="padding:12px 0; font-weight:bold; font-size:1.1rem;">Excedente Líquido Neto:</td><td style="text-align:right; font-weight:bold; font-size:1.1rem; color:#2196f3;">${output.excedenteNeto} Bs.</td></tr>
      </table>
      
      ${output.excedenteNeto > 0 
        ? `<div style="background:#1565c0; padding:10px; border-radius:6px; margin-top:12px; font-size:0.85rem;">Mecánica de Reinversión: Saldo disponible para adquisición de nuevos rollos de tela o fondos de reserva.</div>`
        : ''
      }
    `;
    
    if (navigator.vibrate) navigator.vibrate(50); // Confirmación hápitca de cálculo realizado
  }
}