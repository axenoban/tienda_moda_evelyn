import { FinancialRepository } from '../../data/repositories/FinancialRepository.js';

export class LiquidationView {
  constructor() {
    this.repository = new FinancialRepository();
  }

  render(container) {
    container.innerHTML = `
      <div style="padding: 16px;">
        <h2 style="margin-top:0;">Estrategia de Saldos</h2>
        <p style="color:var(--text-muted); font-size:0.9rem;">
          Recuperación rápida de capital líquido para la adquisición de nuevos rollos de tela.
        </p>

        <div class="form-group">
          <label>Costo Unitario de Producción Base (CUP)</label>
          <input type="number" id="cupBaseLiq" class="form-control" value="18.01" step="0.01" inputmode="decimal">
        </div>

        <div class="form-group">
          <label>Prendas Inmovilizadas en Stock</label>
          <input type="number" id="prendasStock" class="form-control" value="50" inputmode="numeric">
        </div>

        <div class="form-group">
          <label>Porcentaje de Remate Extremo (Bajo el Costo)</label>
          <select id="porcentajeRemate" class="form-control">
            <option value="0">Precio Mayorista Básico (0% Descuento)</option>
            <option value="10">Venta al Costo Puro (Sin Utilidad)</option>
            <option value="25">Liquidación Agresiva (-25% del CUP)</option>
          </select>
        </div>

        <button id="btn-calcular-liq" class="btn-submit" style="background-color:#e65100; color:white;">
          PROYECTAR RECUPERACIÓN DE CAJA
        </button>

        <div id="liquidation-results" style="margin-top:20px; display:none; background:#2e1c0c; padding:12px; border-radius:8px; border-left:4px solid #ff9800;"></div>
      </div>
    `;

    container.querySelector('#btn-calcular-liq').addEventListener('click', () => this._processLiquidation(container));
  }

  _processLiquidation(container) {
    const cup = parseFloat(container.querySelector('#cupBaseLiq').value) || 0;
    const unidades = parseInt(container.querySelector('#prendasStock').value) || 0;
    const modo = container.querySelector('#porcentajeRemate').value;

    let precioLiquidacionUnidad = cup * 1.30; // Precio mayorista estándar base //[cite: 2]
    let estadoEstrategia = "Recuperación con Margen Normal";

    if (modo === "10") {
      precioLiquidacionUnidad = cup;
      estadoEstrategia = "Recuperación a Costo de Manufactura (Equilibrio)"; //[cite: 2]
    } else if (modo === "25") {
      precioLiquidacionUnidad = cup * 0.75;
      estadoEstrategia = "Liquidación Crítica por debajo del Costo (Remanente Extremo)"; //[cite: 2]
    }

    const efectivoRecuperado = unidades * precioLiquidacionUnidad;
    // Compra estándar: lotes de 12 a 14 rollos cerrados //[cite: 2]
    const capacidadRollos = Math.floor(efectivoRecuperado / (80 * 25)); 

    const resultsDiv = container.querySelector('#liquidation-results');
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
      <h3 style="margin-top:0; color:#ff9800;">Análisis de Liquidación</h3>
      <p>Estrategia: <strong>${estadoEstrategia}</strong></p>
      <p>Precio de Salida por Prenda: <strong>${precioLiquidacionUnidad.toFixed(2)} Bs.</strong></p>
      <p>Inyección Inmediata de Caja: <strong style="color:var(--accent-color); font-size:1.3rem;">+${efectivoRecuperado.toFixed(2)} Bs.</strong></p>
      <hr style="border-color:#444;">
      <small style="color:var(--text-muted);">
        Esta liquidez permite reabastecer de forma continua un estimado de <strong>${capacidadRollos} rollos cerrados</strong> de materia prima para reactivar la mesa de corte.
      </small>
    `;
    if (navigator.vibrate) navigator.vibrate(40); //[cite: 1]
  }
}