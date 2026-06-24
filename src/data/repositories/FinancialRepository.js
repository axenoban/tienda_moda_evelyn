import { LocalDataSource } from '../datasources/LocalDataSource.js';

export class FinancialRepository {
  constructor() {
    this.localDb = new LocalDataSource();
  }

  // Guarda un lote de corte marcándolo como pendiente de sincronización en la nube
  async saveCuttingBatch(batchId, batchData, financialResults) {
    const record = {
      id: batchId,
      metadata: batchData, // Contiene tizadas, modelos, telas, etc.
      results: financialResults,   // Contiene el CUP y precios calculados
      synced: false,               // Control para Supabase/Firebase
      createdAt: new Date().toISOString()
    };

    return await this.localDb.setItem(`batch_${batchId}`, record);
  }

  // Guarda los egresos operativos o familiares del taller
  async saveExpense(expenseId, expenseData) {
    const record = {
      id: expenseId,
      ...expenseData,             // Categoría, monto (Bs.), descripción
      synced: false,
      createdAt: new Date().toISOString()
    };

    return await this.localDb.setItem(`expense_${expenseId}`, record);
  }

  // Recupera un lote específico para su visualización offline
  async getCuttingBatch(batchId) {
    return await this.localDb.getItem(`batch_${batchId}`);
  }

  // Obtiene todos los registros locales pendientes de subida a la nube
  async getPendingSyncRecords() {
    const keys = await this.localDb.getAllKeys();
    const pending = [];

    for (const key of keys) {
      const record = await this.localDb.getItem(key);
      if (record && record.synced === false) {
        pending.push({ key, record });
      }
    }
    return pending;
  }
}