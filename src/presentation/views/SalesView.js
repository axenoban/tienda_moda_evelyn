import { ProcessSale } from '../../domain/usecases/ProcessSale.js';
import { FinancialRepository } from '../../data/repositories/FinancialRepository.js';

export class SalesView {
  constructor() {
    this.repository = new FinancialRepository();
    this.salesProcessor = new ProcessSale();
  }

  render(container) {
    container.innerHTML = `
      <div style="padding: 16px;">
        <h2 style="margin-top:0;">Registro de Ventas</h2>
        
        <form id="sales-form">
          <div class="form-group">
            <label>Canal de Distribución</label>
            <select id="canalVenta" class="form-control" required>
              <option value="tienda_central">Tienda Física Central (Miércoles/Sábados)</option>
              <option value="venta_mananera">Venta Mañanera / Madrugadora (5:00 AM)</option>
              <option value="whatsapp">WhatsApp y Preventa Digital (0% Comisión)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Tipo de Cliente / Tarifa</label>
            <select id="tipoCliente" class="form-control" required>
              <option value="mayorista">Mayorista (Venta por Docenas)</option>
              <option value="cuarta">Formato por Cuarta</option>
              <option value="unidad">Al Detalle / Unidad Suesta</option>
            </select>
          </div>

          <div class="form-group">
            <label>Cantidad de Docenas Vendidas</label>
            <input type="number" inputmode="numeric" id="cantDocenas" class="form-control" value="0" min="0">
          </div>

          <div class="form-group">
            <label>Prendas Sueltas / Adicionales</label>
            <input type="number" inputmode="numeric" id="cantUnidades" class="form-control" value="0" min="0">
          </div>

          <div id="sales-preview" style="background:#1e1e1e; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid #2196f3;">
            <!-- Proyección de empaque y colores en tiempo real -->
          </div>

          <button type="submit" class="btn-submit">REGISTRAR TRANSACCIÓN</button>
        </form>
      </div>
    `;

    const form = container.querySelector('#sales-form');
    form.addEventListener('input', () => this._updatePreview(container));
    form.addEventListener('submit', (e) => this._handleSubmit(e, container));
    this._updatePreview(container);
  }

  _updatePreview(container) {
    const docenas = parseInt(container.querySelector('#cantDocenas').value) || 0;
    const totalPrendas = docenas * 12;
    const surtidos = docenas * 11;
    const negros = docenas * 1;

    const previewDiv = container.querySelector('#sales-preview');
    previewDiv.innerHTML = `
      <p style="margin:0 0 4px 0;">Total prendas en lote: <strong>${totalPrendas} unidades</strong></p>
      <small style="color:var(--text-muted)">Validación de Stock: ${surtidos} surtidos / ${negros} negro(s) repetido(s) obligatorio(s).</small>
    `;
  }

  async _handleSubmit(e, container) {
    e.preventDefault();
    try {
      const salesData = {
        canal: container.querySelector('#canalVenta').value,
        tipoCliente: container.querySelector('#tipoCliente').value,
        cantidadDocenas: parseInt(container.querySelector('#cantDocenas').value) || 0,
        cantidadUnidades: parseInt(container.querySelector('#cantUnidades').value) || 0,
        cup: 18.01 // CUP de control por prenda
      };

      const result = this.salesProcessor.execute(salesData);
      const id = Date.now().toString();
      
      // Persistencia resiliente offline-first
      await this.repository.localDb.setItem(`sale_${id}`, { 
        id, 
        ...salesData, 
        result, 
        synced: false, 
        createdAt: new Date().toISOString() 
      });

      if (navigator.vibrate) navigator.vibrate([40, 40]);
      alert(`Venta guardada localmente.\nTotal cobro: ${result.total} Bs.\nEmpaque: ${result.desgloseColores.surtidos} surtidos y ${result.desgloseColores.negroRepetido} negro.`);
      
      container.querySelector('#cantDocenas').value = '0';
      container.querySelector('#cantUnidades').value = '0';
      this._updatePreview(container);
    } catch (err) {
      alert(`Error comercial: ${err.message}`);
    }
  }
}