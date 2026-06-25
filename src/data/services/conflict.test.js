import { test, expect, describe } from 'vitest';
import { ConflictResolver } from './ConflictResolver.js';

describe('Pruebas del Módulo de Resolución de Conflictos Multi-Socio', () => {
  test('Debe priorizar el registro con la marca de tiempo más reciente para evitar duplicidades', () => {
    const resolver = new ConflictResolver();

    const localRecord = { id: '123', amount: 50, createdAt: '2026-06-24T10:00:00.000Z' };
    const remoteRecord = { id: '123', amount: 100, createdAt: '2026-06-24T10:05:00.000Z' }; // Más nuevo

    const winner = resolver.resolve(localRecord, remoteRecord);
    expect(winner.amount).toBe(100);
    expect(winner.synced).toBe(true);
  });
});