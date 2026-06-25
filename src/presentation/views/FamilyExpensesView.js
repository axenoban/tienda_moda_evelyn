import { FinancialRepository } from '../../data/repositories/FinancialRepository.js';

export class FamilyExpensesView {
  constructor() {
    this.repository = new FinancialRepository();
  }

  render(container) {
    container.innerHTML = `
      <div style="padding: 16px;">
        <h2 style="margin-top:0;">Egresos Familiares</h2>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:20px;">
          Registra los retiros cotidianos para el sustento del hogar.
        </p>

        <form id="expense-form">
          <div class="form-group">
            <label>Subcategoría del Gasto Familiar</label>
            <select id="category" class="form-control" required>
              <option value="Alimentación diaria y mercado">Alimentación diaria y mercado</option>
              <option value="Salud y medicamentos">Salud y medicamentos</option>
              <option value="Educación/colegios">Educación/colegios</option>
              <option value="Ocio y gastos varios del hogar">Ocio y gastos varios del hogar</option>
            </select>
          </div>

          <div class="form-group">
            <label>Monto del Retiro (Bs.)</label>
            <input type="number" step="0.1" inputmode="decimal" id="amount" class="form-control" placeholder="0.00" required>
          </div>

          <div class="form-group">
            <label>Detalle / Glosa (Opcional)</label>
            <input type="text" id="description" class="form-control" placeholder="Ej: Compra de abastos para la semana">
          </div>

          <button type="submit" class="btn-submit" style="background-color: #ff5252; color: white;">
            REGISTRAR GASTO FAMILIAR
          </button>
        </form>
      </div>
    `;

    const form = container.querySelector('#expense-form');
    form.addEventListener('submit', (e) => this._handleSubmit(e, container));
  }

  async _handleSubmit(e, container) {
    e.preventDefault();
    try {
      const expenseData = {
        category: container.querySelector('#category').value,
        amount: parseFloat(container.querySelector('#amount').value),
        description: container.querySelector('#description').value || 'Sin detalle'
      };

      if (isNaN(expenseData.amount) || expenseData.amount <= 0) {
        throw new Error("El monto debe ser un valor mayor a cero.");
      }

      const id = Date.now().toString();
      await this.repository.saveExpense(id, expenseData);

      if (navigator.vibrate) navigator.vibrate([40, 40]); // Confirmación táctil hápitca
      
      alert(`Gasto familiar registrado con éxito (${expenseData.amount} Bs.).`);
      container.querySelector('#amount').value = '';
      container.querySelector('#description').value = '';
    } catch (err) {
      alert(`Error al guardar: ${err.message}`);
    }
  }
}