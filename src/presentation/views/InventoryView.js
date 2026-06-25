import { FinancialRepository } from '../../data/repositories/FinancialRepository.js';
import { ProductVariant } from '../../domain/entities/Variant.js';

export class InventoryView {
  constructor() {
    this.repository = new FinancialRepository(); //
  }

  async render(container) {
    container.innerHTML = `
      <div style="padding: 16px; margin-bottom: 40px;">
        <h2 style="margin-top:0;">Inventario de SKUs</h2>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:20px;">
          Clasificación basada en la matriz de 4 atributos obligatorios del negocio.
        </p>

        <form id="variant-form" style="background: var(--bg-surface); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color);">
          <h3 style="margin-top:0; color:var(--accent-color); font-size:1.1rem;">Registrar Prenda</h3>
          
          <div class="form-group">
            <label>Modelo (Ej: Morley Clásico)</label>
            <input type="text" id="vModelo" class="form-control" placeholder="Nombre del modelo" required>
          </div>
          
          <div class="form-group">
            <label>Talla (Ej: Talla M)</label>
            <input type="text" id="vTalla" class="form-control" placeholder="M, L, XL, etc." required>
          </div>
          
          <div class="form-group">
            <label>Detalle / Aplique (Ej: Con Brillo)</label>
            <input type="text" id="vDetalle" class="form-control" placeholder="Con Brillo, Liso, Tachas" required>
          </div>
          
          <div class="form-group">
            <label>Tela Core o Temporada (Ej: Morley Rib Delgado)</label>
            <input type="text" id="vTela" class="form-control" placeholder="Morley Rib, Frizado, etc." required>
          </div>

          <button type="submit" class="btn-submit">AÑADIR VARIANTE</button>
        </form>

        <h3 style="margin-top:25px; font-size:1.2rem;">Variantes Registradas</h3>
        <div id="variants-list" style="margin-top:12px;">
          <p style="color:var(--text-muted);">Cargando inventario local...</p>
        </div>
      </div>
    `;

    const form = container.querySelector('#variant-form');
    form.addEventListener('submit', (e) => this._handleSubmit(e, container));

    await this._loadVariantsList(container);
  }

  async _loadVariantsList(container) {
    const listDiv = container.querySelector('#variants-list');
    try {
      // Removida la fuga de sintaxis externa que bloqueaba a Vite
      const items = await this.repository.getAllVariants(); //

      if (items.length === 0) {
        listDiv.innerHTML = `<p style="color:var(--text-muted); font-style:italic;">No hay variantes registradas en este dispositivo.</p>`;
        return;
      }

      listDiv.innerHTML = items.map(item => `
        <div style="background:#252525; padding:12px; border-radius:6px; margin-bottom:8px; border-left:4px solid #9c27b0; font-size:0.95rem;">
          <div style="display:flex; justify-content:space-between; font-weight:bold; color:white;">
            <span>${item.modelo} · ${item.talla}</span>
            <span style="font-size:0.8rem; color:var(--text-muted); font-weight:normal;">ID: ${item.id}</span>
          </div>
          <div style="margin-top:4px; color:var(--text-muted); font-size:0.85rem;">
            Atributos: <span style="color:#e0e0e0;">${item.detalle}</span> | Tela: <span style="color:#e0e0e0;">${item.tela}</span>
          </div>
        </div>
      `).join('');
    } catch (err) {
      listDiv.innerHTML = `<p style="color:#ff5252;">Error al leer inventario: ${err.message}</p>`;
    }
  }

  async _handleSubmit(e, container) {
    e.preventDefault();
    try {
      const variantData = {
        modelo: container.querySelector('#vModelo').value.trim(),
        talla: container.querySelector('#vTalla').value.trim(),
        detalle: container.querySelector('#vDetalle').value.trim(),
        tela: container.querySelector('#vTela').value.trim()
      };

      const variantEntity = new ProductVariant(variantData); //[cite: 1]
      if (!variantEntity.isValid()) {
        throw new Error("Todos los campos de la matriz son obligatorios."); //[cite: 2]
      }

      const id = 'sku_' + Date.now().toString().slice(-6);
      await this.repository.saveVariant(id, variantData); //[cite: 1]

      if (navigator.vibrate) navigator.vibrate([40, 40]); //[cite: 1]
      
      container.querySelector('#variant-form').reset();
      await this._loadVariantsList(container);
    } catch (err) {
      alert(`Error de Inventario: ${err.message}`);
    }
  }
}