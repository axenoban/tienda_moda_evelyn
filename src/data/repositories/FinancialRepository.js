import { LocalDataSource } from '../datasources/LocalDataSource.js';

export class FinancialRepository {
  constructor() {
    this.localDb = new LocalDataSource();
  }

  // Guarda un lote de corte marcándolo como pendiente de sincronización
  async saveCuttingBatch(batchId, batchData, financialResults) {
    const record = {
      id: batchId,
      metadata: batchData,
      results: financialResults,
      synced: false,
      createdAt: new Date().toISOString()
    };

    return await this.localDb.setItem(`batch_${batchId}`, record);
  }

  // Guarda los egresos operativos o familiares del taller
  async saveExpense(expenseId, expenseData) {
    const record = {
      id: expenseId,
      ...expenseData,
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

  // Guarda una nueva variante de producto en el almacenamiento local
  async saveVariant(variantId, variantData) {
    const record = {
      id: variantId,
      ...variantData,
      synced: false,
      createdAt: new Date().toISOString()
    };

    return await this.localDb.setItem(`variant_${variantId}`, record);
  }

  // Recupera todas las variantes registradas en el inventario offline
  async getAllVariants() {
    const keys = await this.localDb.getAllKeys();
    const variants = [];

    for (const key of keys) {
      if (key.startsWith('variant_')) {
        const record = await this.localDb.getItem(key);
        if (record) variants.push(record);
      }
    }
    return variants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}