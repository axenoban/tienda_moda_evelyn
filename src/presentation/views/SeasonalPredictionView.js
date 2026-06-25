import { PredictSeasonalDemand } from '../../domain/usecases/PredictSeasonalDemand.js';

export class SeasonalPredictionView {
  constructor() {
    this.predictor = new PredictSeasonalDemand();
  }

  render(container) {
    container.innerHTML = `
      <div style="padding: 16px; margin-bottom: 40px;">
        <h2 style="margin-top:0;">Panel de Proyección Estacional</h2>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:20px;">
          Simulador del ciclo estacional textil de Bolivia para optimización de stock de materia prima.[cite: 2]
        </p>

        <form id="seasonal-form" style="background: var(--bg-surface); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color);">
          <div class="form-group">
            <label>Ventas Semanales Históricas Base (Unidades)</label>
            <input type="number" id="ventasBase" class="form-control" value="100" inputmode="numeric" required>
          </div>

          <div class="form-group">
            <label>Mes de Planificación Operativa</label>
            <select id="mesPlanificacion" class="form-control" required>
              <option value="0">Enero (Temporada Baja)</option>
              <option value="1">Febrero (Temporada Baja)</option>
              <option value="2">Marzo (Temporada Baja)</option>
              <option value="3">Abril (Pico de Invierno)</option>
              <option value="4">Mayo (Pico de Invierno)</option>
              <option value="5">Junio (Pico de Invierno)</option>
              <option value="6">Julio (Pico de Invierno)</option>
              <option value="7">Agosto (Transición / Baja)</option>
              <option value="8">Septiembre (Transición / Baja)</option>
              <option value="9">Octubre (Transición / Baja)</option>
              <option value="10">Noviembre (Excelente / Campaña Máxima)</option>
              <option value="11">Diciembre (Excelente / Campaña Máxima)</option>
            </select>
          </div>

          <button type="submit" class="btn-submit" style="background-color: #9c27b0; color: white;">
            CALCULAR DEMANDA PROYECTADA
          </button>
        </form>

        <div id="seasonal-results" style="margin-top:20px; display:none; background:#1a102f; padding:16px; border-radius:8px; border-left:4px solid #9c27b0;">
          <!-- Resultados analíticos inyectados dinámicamente -->
        </div>
      </div>
    `;

    const form = container.querySelector('#seasonal-form');
    form.addEventListener('submit', (e) => this._handleSubmit(e, container));
  }

  _handleSubmit(e, container) {
    e.preventDefault();
    
    const ventasBase = parseInt(container.querySelector('#ventasBase').value) || 0;
    const monthIndex = parseInt(container.querySelector('#mesPlanificacion').value);

    // Consumo del caso de uso puro de dominio
    const projection = this.predictor.calculateRequiredRolls(ventasBase, monthIndex);
    
    let descripcionPeriodo = "";
    // Detalle analítico de la curva de demanda según el Blueprint formal[cite: 2]
    if (monthIndex >= 0 && monthIndex <= 2) {
      descripcionPeriodo = "Enero - Marzo (Bajo): Retracción del mercado tras las fiestas de fin de año. Consumo básico de prendas escolares o liquidaciones.[cite: 2]";
    } else if (monthIndex >= 3 && monthIndex <= 6) {
      descripcionPeriodo = "Abril - Julio/Agosto (Invierno - Pico de Ventas): Transición a prendas pesadas de abrigo (Frizado). Ventas masivas.[cite: 2]";
    } else if (monthIndex >= 7 && monthIndex <= 9) {
      descripcionPeriodo = "Agosto - Octubre (Bajo): Periodo de transición de telas y diseños de media estación. Ventas regulares.[cite: 2]";
    } else {
      descripcionPeriodo = "Noviembre - Diciembre (Excelente - Pico de Ventas): Campaña navideña y de fin de año. Máxima rotación de Morley Rib delgado.[cite: 2]";
    }

    const resultsDiv = container.querySelector('#seasonal-results');
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
      <h3 style="margin-top:0; color:#e040fb; font-size:1.1rem;">Resultado de la Proyección</h3>
      <p style="font-size:0.95rem; line-height:1.4; color:#e0e0e0; margin-bottom:12px;">${descripcionPeriodo}</p>
      
      <table style="width:100%; color:white; border-collapse:collapse; font-size:0.95rem; margin-top:10px;">
        <tr style="border-bottom:1px solid #333;"><td style="padding:6px 0;">Multiplicador Estacional:</td><td style="text-align:right; font-weight:bold; color:#e040fb;">x${projection.factorAplicado}</td></tr>
        <tr style="border-bottom:1px solid #333;"><td style="padding:6px 0;">Ventas Proyectadas:</td><td style="text-align:right; font-weight:bold; color:var(--accent-color); font-size:1.1rem;">${projection.ventasProyectadas} prendas</td></tr>
        <tr><td style="padding:8px 0; font-weight:bold;">Sugerencia de Abastecimiento:</td><td style="text-align:right; font-weight:bold; color:#2196f3; font-size:1.1rem;">${projection.rollosSugeridos} Rollos</td></tr>
      </table>
      
      <div style="background:#25163f; padding:10px; border-radius:6px; margin-top:12px; font-size:0.85rem; color:var(--text-muted); border: 1px solid #4a148c;">
        <strong>Mecánica del Negocio:</strong> Las adquisiciones se rigen bajo parámetros de rollos cerrados con un metraje promedio de 80 metros, comprados en lotes estandarizados de 12 a 14 rollos surtidos para mantener la mesa operando continuamente.[cite: 2]
      </div>
    `;

    if (navigator.vibrate) navigator.vibrate(50); // Confirmación hápitca de cálculo de simulación
  }
}