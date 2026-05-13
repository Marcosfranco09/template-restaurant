/**
 * busqueda.js — Lógica de búsqueda de productos para productos.html
 * Depende de: config.js (cargado primero)
 */

document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initSearchWhatsApp();
});

// ═══════════════════════════════════════════════════════════════════════════════
// BÚSQUEDA EN TIEMPO REAL
// ═══════════════════════════════════════════════════════════════════════════════
function initSearch() {
  const inputs = document.querySelectorAll('.navbar__search-input');
  if (inputs.length === 0) return;

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();

      // Sincronizar el valor entre todos los inputs de búsqueda (escritorio y móvil)
      inputs.forEach(other => { if (other !== input) other.value = input.value; });

      if (typeof renderProductsWithSearch === 'function') {
        renderProductsWithSearch(query);
      }
    });

    // Limpiar al presionar Escape
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        input.value = '';
        inputs.forEach(other => other.value = '');
        if (typeof renderProductsWithSearch === 'function') renderProductsWithSearch('');
        input.blur();
      }
    });
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// BOTÓN WHATSAPP DE LA BARRA DE BÚSQUEDA
// ═══════════════════════════════════════════════════════════════════════════════
function initSearchWhatsApp() {
  const btn = document.getElementById('search-whatsapp-btn');
  if (!btn) return;

  // Esperar a que App.config esté disponible
  const cfg = window.App?.config;
  if (cfg?.whatsappNumber) {
    btn.href = `https://wa.me/${cfg.whatsappNumber}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILTRADO DE PRODUCTOS CON BÚSQUEDA
// (Expuesto globalmente para integración con el filtro de categorías)
// ═══════════════════════════════════════════════════════════════════════════════
window.getSearchQuery = function () {
  const input = document.getElementById('search-input');
  return input ? input.value.trim().toLowerCase() : '';
};
