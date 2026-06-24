export class ProductVariant {
  constructor({ modelo, talla, detalle, tela }) {
    this.modelo = modelo;   // Ej: 'Morley Clásico'
    this.talla = talla;     // Ej: 'M'
    this.detalle = detalle; // Ej: 'Con Brillo'
    this.tela = tela;       // Ej: 'Morley Rib Delgado'
  }

  isValid() {
    return !!(this.modelo && this.talla && this.detalle && this.tela);
  }
}