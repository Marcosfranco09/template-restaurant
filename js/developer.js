/**
 * developer.js — Lógica del panel de administración
 * Depende de: config.js
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  loadConfigForm();
  renderDashboard();
  renderProductsTable();
  renderCategoriesTable();
  renderBranchesTable();
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════════════════════
const AUTH = {
  user: 'admin',
  pass: 'admin123'
};

function initAuth() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Verificar sesión con Firebase
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        // Verificar si es administrador
        const isAdmin = await window.App.checkIsAdmin(user.uid);
        if (isAdmin) {
          showAdmin();
        } else {
          // No es admin: Cerrar sesión y avisar
          alert("Acceso Restringido: Tu cuenta no tiene permisos de administrador.");
          firebase.auth().signOut().then(() => {
            window.location.href = 'index.html';
          });
        }
      } else {
        showLogin();
      }
    });
  } else {
    // Fallback local legacy
    if (sessionStorage.getItem('dev_logged_in') === 'true') {
      showAdmin();
    }
  }
}

function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('login-user').value;
  const p = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');
  const btn = e.target.querySelector('button');

  // Si Firebase está configurado y no es el placeholder
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0 && window.firebaseConfig.apiKey !== 'TU_API_KEY') {
    btn.classList.add('btn-loading');
    firebase.auth().signInWithEmailAndPassword(u, p)
      .then(async (result) => {
        const isAdmin = await window.App.checkIsAdmin(result.user.uid);
        if (isAdmin) {
          console.log('Login exitoso: Admin detectado');
          // onAuthStateChanged se encargará de mostrar el panel
        } else {
          btn.classList.remove('btn-loading');
          err.textContent = 'Acceso denegado: No eres administrador.';
          firebase.auth().signOut();
        }
      })
      .catch(error => {
        btn.classList.remove('btn-loading');
        console.error('Error Firebase Auth:', error);
        err.textContent = 'Correo o contraseña incorrectos.';
        setTimeout(() => err.textContent = '', 4000);
      });
  } else {
    // Login local
    if (u === AUTH.user && p === AUTH.pass) {
      btn.classList.add('btn-loading');
      setTimeout(() => {
        sessionStorage.setItem('dev_logged_in', 'true');
        showAdmin();
      }, 800);
    } else {
      err.textContent = 'Usuario o contraseña incorrectos (Modo Local)';
      setTimeout(() => err.textContent = '', 3000);
    }
  }
}

function showAdmin() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').style.display = 'flex';
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-app').style.display = 'none';
}

function togglePasswordVisibility() {
  const passInput = document.getElementById('login-pass');
  const eyeIcon = document.getElementById('eye-icon');
  
  if (passInput.type === 'password') {
    passInput.type = 'text';
    // Cambiar a icono de ojo tachado
    eyeIcon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    `;
  } else {
    passInput.type = 'password';
    // Volver a icono de ojo normal
    eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    `;
  }
}

function logout() {
  document.getElementById('logout-screen').style.display = 'flex';
  
  setTimeout(() => {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      firebase.auth().signOut().then(() => {
        window.location.reload();
      });
    } else {
      sessionStorage.removeItem('dev_logged_in');
      window.location.reload();
    }
  }, 800);
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVEGACIÓN DE PANELES
// ═══════════════════════════════════════════════════════════════════════════════
function showPanel(id, btn) {
  // Ocultar todos los paneles
  document.querySelectorAll('.dev-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.dev-nav-item').forEach(b => b.classList.remove('active'));
  // Mostrar el seleccionado
  const panel = document.getElementById('panel-' + id);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
  // Actualizar topbar
  const titles = { dashboard: 'Dashboard', config: 'Configuración', productos: 'Productos', categorias: 'Categorías', locales: 'Locales' };
  document.getElementById('topbar-title').textContent = titles[id] || id;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function renderDashboard() {
  const products = window.App.getProducts();
  const categories = window.App.getCategories();
  const branches = window.App.getBranches();
  const featured = products.filter(p => p.featured).length;

  const grid = document.getElementById('stats-grid');
  grid.innerHTML = `
    ${statCard('Productos', products.length, '#7c5cbf', '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>')}
    ${statCard('Categorías', categories.length, '#3b82f6', '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>')}
    ${statCard('Locales', branches.length, '#22c55e', '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>')}
    ${statCard('Destacados', featured, '#f59e0b', '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>')}
  `;
}

function statCard(label, value, color, svgPaths) {
  return `<div class="dev-stat-card">
    <div class="dev-stat-card__icon" style="background:${color}22;color:${color}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${svgPaths}</svg>
    </div>
    <span class="dev-stat-card__value">${value}</span>
    <span class="dev-stat-card__label">${label}</span>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════
const CONFIG_FIELDS = [
  'name', 'tagline', 'heroTitle', 'heroSubtitle', 'heroBtn1Text', 'heroBtn1Link',
  'heroBtn2Text', 'heroBtn2Link', 'heroBgImage', 'heroFilterColor', 'heroFilterOpacity',
  'contactBgImage', 'contactFilterColor', 'contactFilterOpacity',
  'colorAccent', 'whatsappNumber', 'email', 'socialInstagram',
  'socialFacebook', 'socialTiktok', 'contactTitle', 'contactSubtitle', 'productsPreviewCount',
  'showLogoText', 'logoFontFamily', 'logoScale', 'logoX', 'logoY',
  'navStyleMode', 'navColor', 'theme', 'navTextColor'
];

// Mapeo campo form → clave de config (cfg-name → restaurantName)
const FIELD_MAP = {
  'name': 'restaurantName',
  'tagline': 'tagline',
  'email': 'email'
};

function getConfigKey(field) {
  return FIELD_MAP[field] || field;
}

function loadConfigForm() {
  const cfg = window.App.config;
  CONFIG_FIELDS.forEach(field => {
    const el = document.getElementById('cfg-' + field);
    if (!el) return;
    const key = getConfigKey(field);
    if (el.type === 'checkbox') {
      if (field === 'navStyleMode') {
        el.checked = cfg[key] === 'color';
      } else if (field === 'theme') {
        el.checked = cfg[key] === 'light';
        updateThemeLabel(el.checked);
      } else {
        el.checked = !!cfg[key];
      }
    } else {
      el.value = cfg[key] || '';
    }
    // Actualizar labels de valores de sliders si existen
    const valLabel = document.getElementById('val-' + field);
    if (valLabel) {
      valLabel.textContent = (typeof cfg[key] === 'number') ? cfg[key].toFixed(field.includes('Scale') ? 1 : 0) : cfg[key];
    }
  });
  // Colores: actualizar swatches y hex labels
  updateColorPreviews();
  updateLogoPreviews();
  toggleNavColorVisibility();

  // Actualizar previsualizaciones de cargadores
  updateImgPreview('logoImage', cfg.logoImage);
  updateImgPreview('heroBgImage', cfg.heroBgImage);
  updateImgPreview('contactBgImage', cfg.contactBgImage);
  syncFilterPreview('hero');
  syncFilterPreview('contact');

  // Sincronizar Controles Segmentados (NUEVO)
  const isLight = document.getElementById('cfg-theme').checked;
  setThemeModeUI(isLight ? 'light' : 'dark');
  
  const isColor = document.getElementById('cfg-navStyleMode').checked;
  setNavStyleUI(isColor ? 'color' : 'blur');
}

// Funciones Globales para los Botones (Segmented Controls)
function setThemeMode(mode) {
  const isLight = (mode === 'light');
  const input = document.getElementById('cfg-theme');
  if (input) {
    input.checked = isLight;
    setThemeModeUI(mode);
    if (typeof updateThemeLabel === 'function') updateThemeLabel(isLight);
    input.dispatchEvent(new Event('change'));
  }
}

function setThemeModeUI(mode) {
  const isLight = (mode === 'light');
  const btnDark = document.getElementById('btn-theme-dark');
  const btnLight = document.getElementById('btn-theme-light');
  if (btnDark && btnLight) {
    btnDark.classList.toggle('active', !isLight);
    btnLight.classList.toggle('active', isLight);
    const container = btnDark.parentElement;
    container.classList.toggle('state-right', isLight);
    container.classList.toggle('is-light', isLight);
  }
}

function setNavStyle(style) {
  const isColor = (style === 'color');
  const input = document.getElementById('cfg-navStyleMode');
  if (input) {
    input.checked = isColor;
    setNavStyleUI(style);
    input.dispatchEvent(new Event('change'));
  }
}

function setNavStyleUI(style) {
  const isColor = (style === 'color');
  const btnBlur = document.getElementById('btn-nav-blur');
  const btnSolid = document.getElementById('btn-nav-solid');
  if (btnBlur && btnSolid) {
    btnBlur.classList.toggle('active', !isColor);
    btnSolid.classList.toggle('active', isColor);
    const container = btnBlur.parentElement;
    container.classList.toggle('state-right', isColor);
    
    // Animación de aparición de la fila de color
    const colorField = document.getElementById('row-nav-color');
    if (colorField) colorField.classList.toggle('show-row', isColor);
  }
}

function saveConfig() {
  const btn = document.querySelector('.dev-topbar .dev-btn-primary');
  if (btn) btn.classList.add('btn-loading');

  const updates = {};
  CONFIG_FIELDS.forEach(field => {
    const el = document.getElementById('cfg-' + field);
    if (!el) return;
    const key = getConfigKey(field);
    if (el.type === 'checkbox') {
      if (field === 'navStyleMode') {
        updates[key] = el.checked ? 'color' : 'blur';
      } else if (field === 'theme') {
        updates[key] = el.checked ? 'light' : 'dark';
      } else {
        updates[key] = el.checked;
      }
    } else if (el.type === 'range' || el.type === 'number') {
      updates[key] = parseFloat(el.value);
    } else {
      updates[key] = el.value;
    }
  });

  window.App.updateConfig(updates);
  updateColorPreviews();
  toggleNavColorVisibility();

  setTimeout(() => {
    if (btn) btn.classList.remove('btn-loading');
    toast('Configuración guardada exitosamente', 'success');
  }, 600);
}

let resetConfirmTimeout = null;

function resetToDefaults() {
  const btn = document.getElementById('btn-reset');
  if (!btn) {
    // Fallback if button ID is not found
    if (!confirm('¿Restablecer configuración de fábrica?')) return;
    executeReset();
    return;
  }

  if (!resetConfirmTimeout) {
    // Primer clic: Pedir confirmación
    const originalText = btn.textContent;
    btn.textContent = '¡Click de nuevo para confirmar!';
    btn.style.backgroundColor = '#0bbe7dff'; // Un rojo más apagado y armonioso
    btn.style.color = '#fff';
    btn.style.borderColor = '#ffffffff';

    resetConfirmTimeout = setTimeout(() => {
      // Revertir si no se hace el segundo clic
      btn.textContent = originalText;
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.style.borderColor = '';
      resetConfirmTimeout = null;
    }, 3000);
  } else {
    // Segundo clic: Ejecutar reset
    clearTimeout(resetConfirmTimeout);
    resetConfirmTimeout = null;
    executeReset();
  }
}

function executeReset() {
  try {
    window.App.resetConfig();
    toast('Configuración restablecida. Recargando...', 'success');
    setTimeout(() => window.location.reload(), 1000);
  } catch (error) {
    console.error('Error in resetToDefaults:', error);
    toast('Error: ' + error.message, 'error');
  }
}

function updateColorPreviews() {
  const colors = [
    { id: 'accent', field: 'colorAccent' },
    { id: 'navColor', field: 'navColor' },
    { id: 'navTextColor', field: 'navTextColor' },
  ];
  colors.forEach(c => {
    const val = document.getElementById('cfg-' + c.field)?.value || '';
    const swatch = document.getElementById('swatch-' + c.id);
    const hex = document.getElementById('hex-' + c.id);
    if (swatch) swatch.style.background = val;
    if (hex) hex.textContent = val;
  });
  updateLogoPreviews();
}

function resetColors() {
  if (!confirm('¿Resetear colores a los valores por defecto?')) return;
  const defaults = { colorPrimary: '#D32F2F', colorPrimaryDark: '#B71C1C', colorAccent: '#FFC107', colorBgDark: '#1a1a1a' };
  Object.entries(defaults).forEach(([key, val]) => {
    const el = document.getElementById('cfg-' + key);
    if (el) el.value = val;
  });
  saveConfig();
}

function updateValLabel(id, val) {
  const label = document.getElementById('val-' + id);
  if (label) {
    const value = parseFloat(val);
    label.textContent = id.toLowerCase().includes('scale') ? value.toFixed(1) : value.toFixed(0);
  }
  updateLogoPreviews();
}

function changeVal(inputId, delta, labelId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  let val = parseFloat(input.value) + delta;

  const min = parseFloat(input.min);
  const max = parseFloat(input.max);
  if (val < min) val = min;
  if (val > max) val = max;

  input.value = val;
  updateValLabel(labelId, val);
}

function updateLogoPreviews() {
  const getV = (id) => parseFloat(document.getElementById('cfg-' + id)?.value) || 0;
  const getS = (id) => parseFloat(document.getElementById('cfg-' + id)?.value) || 1;
  const getStr = (id) => document.getElementById('cfg-' + id)?.value || '';

  const cfg = {
    logoImage: window.App.config.logoImage,
    logoScale: getS('logoScale'),
    logoX: getV('logoX'),
    logoY: getV('logoY'),
    colorPrimary: getStr('colorPrimary') || '#D32F2F',
    colorBgDark: getStr('colorBgDark') || '#1a1a1a',
    logoFontFamily: getStr('logoFontFamily') || 'Inter',
    restaurantName: getStr('name') || 'Mi Restaurante',
    showLogoText: document.getElementById('cfg-showLogoText')?.checked !== false
  };

  // Actualizar variables CSS en el :root para los transforms
  const root = document.documentElement;
  root.style.setProperty('--nav-logo-scale', cfg.logoScale);
  root.style.setProperty('--nav-logo-x', cfg.logoX + 'px');
  root.style.setProperty('--nav-logo-y', cfg.logoY + 'px');

  // Actualizar imágenes y textos
  const navImg = document.getElementById('preview-img-nav');
  if (navImg) {
    navImg.src = cfg.logoImage || '';
    navImg.style.display = cfg.logoImage ? 'block' : 'none';
  }

  const navText = document.getElementById('preview-nav-text');
  if (navText) {
    navText.textContent = cfg.restaurantName;
    navText.style.display = cfg.showLogoText ? 'inline' : 'none';
    navText.style.fontFamily = cfg.logoFontFamily;
  }
}




// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTOS — CRUD
// ═══════════════════════════════════════════════════════════════════════════════
function renderProductsTable() {
  const tbody = document.getElementById('products-tbody');
  const search = document.getElementById('search-products')?.value || '';
  let products = window.App.getProducts();
  
  if (search) {
    const normalize = (str) => {
      if (!str) return '';
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };
    const queryTokens = normalize(search).split(/\s+/).filter(t => t.length > 0);
    products = products.filter(p => {
      const combinedText = normalize(`${p.name} ${p.description} ${window.App.getCategoryName(p.category)}`);
      return queryTokens.every(token => combinedText.includes(token));
    });
  }

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="dev-empty"><p>No hay productos. Agregá el primero.</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => {
    const cat = window.App.getCategoryName(p.category);
    const price = window.App.formatPrice(p.price);
    const imgHtml = p.image
      ? `<div class="dev-table-img"><img src="${p.image}" alt=""></div>`
      : `<div class="dev-table-img"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>`;

    return `<tr>
      <td>${imgHtml}</td>
      <td><strong>${esc(p.name)}</strong></td>
      <td>${esc(cat)}</td>
      <td>${price}</td>
      <td>${p.featured ? '<span class="dev-badge dev-badge-yellow">★ Sí</span>' : '<span class="dev-badge" style="opacity:0.4">No</span>'}</td>
      <td>
        <label class="dev-toggle"><input type="checkbox" ${p.available ? 'checked' : ''} onchange="toggleProductAvail('${p.id}', this.checked)"><span class="dev-toggle-slider"></span></label>
      </td>
      <td><div class="dev-actions">
        <button class="dev-btn dev-btn-ghost" onclick="editProduct('${p.id}')">Editar</button>
        <button class="dev-btn dev-btn-danger" onclick="deleteProduct('${p.id}')">Eliminar</button>
      </div></td>
    </tr>`;
  }).join('');
}

function openProductModal(product) {
  document.getElementById('modal-product-title').textContent = product ? 'Editar Producto' : 'Agregar Producto';
  // Rellenar categorías
  const catSelect = document.getElementById('prod-category');
  const cats = window.App.getCategories();
  catSelect.innerHTML = '<option value="">Sin categoría</option>' + cats.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');

  if (product) {
    document.getElementById('prod-id').value = product.id;
    document.getElementById('prod-name').value = product.name || '';
    document.getElementById('prod-desc').value = product.description || '';
    document.getElementById('prod-price').value = product.price || '';
    catSelect.value = product.category || '';
    document.getElementById('prod-featured').checked = !!product.featured;
    document.getElementById('prod-available').checked = product.available !== false;
    document.getElementById('prod-image').value = product.image || '';
    updateImgPreview('prod-image', product.image);
  } else {
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-desc').value = '';
    document.getElementById('prod-price').value = '';
    catSelect.value = '';
    document.getElementById('prod-featured').checked = false;
    document.getElementById('prod-available').checked = true;
    document.getElementById('prod-image').value = '';
    updateImgPreview('prod-image', '');
  }
  openModal('modal-product');
}

function saveProduct() {
  const name = document.getElementById('prod-name').value.trim();
  if (!name) { toast('El nombre es obligatorio', 'error'); return; }
  const product = {
    id: document.getElementById('prod-id').value || '',
    name: name,
    description: document.getElementById('prod-desc').value.trim(),
    price: parseFloat(document.getElementById('prod-price').value) || 0,
    category: document.getElementById('prod-category').value,
    featured: document.getElementById('prod-featured').checked,
    available: document.getElementById('prod-available').checked,
    image: document.getElementById('prod-image').value,
  };
  window.App.saveProduct(product);
  closeModal('modal-product');
  renderProductsTable();
  renderDashboard();
  toast(product.id ? 'Producto actualizado' : 'Producto creado', 'success');
}

function editProduct(id) {
  const p = window.App.getProductById(id);
  if (p) openProductModal(p);
}

function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  window.App.deleteProduct(id);
  renderProductsTable();
  renderDashboard();
  toast('Producto eliminado', 'success');
}

function toggleProductAvail(id, val) {
  const p = window.App.getProductById(id);
  if (p) { p.available = val; window.App.saveProduct(p); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORÍAS — CRUD
// ═══════════════════════════════════════════════════════════════════════════════
function renderCategoriesTable() {
  const tbody = document.getElementById('categories-tbody');
  const cats = window.App.getCategories();

  if (cats.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4"><div class="dev-empty"><p>No hay categorías.</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = cats.map(c => `<tr>
    <td><strong>${esc(c.name)}</strong></td>
    <td><code style="font-size:0.78rem;color:var(--dev-text-muted)">${esc(c.slug)}</code></td>
    <td>${c.active !== false ? '<span class="dev-badge dev-badge-green">Activa</span>' : '<span class="dev-badge dev-badge-red">Inactiva</span>'}</td>
    <td><div class="dev-actions">
      <button class="dev-btn dev-btn-ghost" onclick="editCategory('${c.id}')">Editar</button>
      <button class="dev-btn dev-btn-danger" onclick="deleteCategory('${c.id}')">Eliminar</button>
    </div></td>
  </tr>`).join('');
}

function openCategoryModal(cat) {
  document.getElementById('modal-category-title').textContent = cat ? 'Editar Categoría' : 'Agregar Categoría';
  document.getElementById('cat-id').value = cat ? cat.id : '';
  document.getElementById('cat-name').value = cat ? cat.name : '';
  document.getElementById('cat-slug').value = cat ? cat.slug : '';
  openModal('modal-category');
}

function saveCategory() {
  const name = document.getElementById('cat-name').value.trim();
  if (!name) { toast('El nombre es obligatorio', 'error'); return; }
  let slug = document.getElementById('cat-slug').value.trim();
  if (!slug) slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const cat = {
    id: document.getElementById('cat-id').value || '',
    name: name,
    slug: slug,
    active: true,
  };
  window.App.saveCategory(cat);
  closeModal('modal-category');
  renderCategoriesTable();
  renderDashboard();
  toast(cat.id ? 'Categoría actualizada' : 'Categoría creada', 'success');
}

function editCategory(id) {
  const c = window.App.getCategories().find(x => x.id === id);
  if (c) openCategoryModal(c);
}

function deleteCategory(id) {
  if (!confirm('¿Eliminar esta categoría?')) return;
  window.App.deleteCategory(id);
  renderCategoriesTable();
  renderDashboard();
  toast('Categoría eliminada', 'success');
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCALES — CRUD
// ═══════════════════════════════════════════════════════════════════════════════
function renderBranchesTable() {
  const tbody = document.getElementById('branches-tbody');
  const branches = window.App.getBranches();

  if (branches.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="dev-empty"><p>No hay locales.</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = branches.map(b => {
    const imgHtml = b.image
      ? `<div class="dev-table-img"><img src="${b.image}" alt=""></div>`
      : `<div class="dev-table-img"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`;

    return `<tr>
      <td>${imgHtml}</td>
      <td><strong>${esc(b.name)}</strong></td>
      <td style="max-width:200px">${esc(b.address || '')}</td>
      <td>${esc(b.phone || '')}</td>
      <td>
        <label class="dev-toggle"><input type="checkbox" ${b.active !== false ? 'checked' : ''} onchange="toggleBranchActive('${b.id}', this.checked)"><span class="dev-toggle-slider"></span></label>
      </td>
      <td><div class="dev-actions">
        <button class="dev-btn dev-btn-ghost" onclick="editBranch('${b.id}')">Editar</button>
        <button class="dev-btn dev-btn-danger" onclick="deleteBranch('${b.id}')">Eliminar</button>
      </div></td>
    </tr>`;
  }).join('');
}

function openBranchModal(branch) {
  document.getElementById('modal-branch-title').textContent = branch ? 'Editar Local' : 'Agregar Local';
  document.getElementById('branch-id').value = branch ? branch.id : '';
  document.getElementById('branch-name').value = branch ? branch.name : '';
  document.getElementById('branch-address').value = branch ? (branch.address || '') : '';
  document.getElementById('branch-phone').value = branch ? (branch.phone || '') : '';
  document.getElementById('branch-hours').value = branch ? (branch.hours || '') : '';
  document.getElementById('branch-mapsUrl').value = branch ? (branch.mapsUrl || '') : '';
  document.getElementById('branch-image').value = branch ? (branch.image || '') : '';
  updateImgPreview('branch-image', branch ? branch.image : '');
  openModal('modal-branch');
}

function saveBranch() {
  const name = document.getElementById('branch-name').value.trim();
  if (!name) { toast('El nombre es obligatorio', 'error'); return; }
  const branch = {
    id: document.getElementById('branch-id').value || '',
    name: name,
    address: document.getElementById('branch-address').value.trim(),
    phone: document.getElementById('branch-phone').value.trim(),
    hours: document.getElementById('branch-hours').value.trim(),
    mapsUrl: document.getElementById('branch-mapsUrl').value.trim(),
    image: document.getElementById('branch-image').value,
    active: true,
  };
  window.App.saveBranch(branch);
  closeModal('modal-branch');
  renderBranchesTable();
  renderDashboard();
  toast(branch.id ? 'Local actualizado' : 'Local creado', 'success');
}

function editBranch(id) {
  const b = window.App.getBranches().find(x => x.id === id);
  if (b) openBranchModal(b);
}

function deleteBranch(id) {
  if (!confirm('¿Eliminar este local?')) return;
  window.App.deleteBranch(id);
  renderBranchesTable();
  renderDashboard();
  toast('Local eliminado', 'success');
}

function toggleBranchActive(id, val) {
  const b = window.App.getBranches().find(x => x.id === id);
  if (b) { b.active = val; window.App.saveBranch(b); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL y TOAST
// ═══════════════════════════════════════════════════════════════════════════════
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function toast(message, type) {
  // Eliminar toasts anteriores
  document.querySelectorAll('.dev-toast').forEach(t => t.remove());
  const icon = type === 'success'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  const t = document.createElement('div');
  t.className = `dev-toast ${type}`;
  t.innerHTML = `${icon}<span>${message}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// NUEVA GESTIÓN DE IMÁGENES
// ═══════════════════════════════════════════════════════════════════════════════
let currentImgField = null;
let currentImgPrev  = null;

function openImageActions(fieldId, prevId) {
  currentImgField = fieldId;
  currentImgPrev  = prevId;
  openModal('modal-image-actions');
}

function triggerImageUpload() {
  document.getElementById('global-image-input').click();
}

function handleGlobalUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validar tamaño (5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast('Imagen demasiado grande (máx 5MB)', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    
    // Actualizar el valor y la vista previa
    if (currentImgField === 'logoImage') {
      window.App.updateConfig({ logoImage: base64 });
      updateLogoPreviews();
    } else {
      const el = document.getElementById(currentImgField.includes('cfg-') ? currentImgField : 'cfg-' + currentImgField) 
               || document.getElementById(currentImgField);
      if (el) el.value = base64;
    }
    
    updateImgPreview(currentImgField, base64);
    closeModal('modal-image-actions');
    toast('Imagen cargada correctamente', 'success');
    
    // Si es del config, guardar automáticamente
    if (['logoImage', 'heroBgImage', 'contactBgImage'].includes(currentImgField)) {
      saveConfig();
    }
  };
  reader.readAsDataURL(file);
  event.target.value = ''; // Reset input
}

function removeCurrentImage() {
  if (currentImgField === 'logoImage') {
    window.App.updateConfig({ logoImage: '' });
    updateLogoPreviews();
  } else {
    const el = document.getElementById(currentImgField.includes('cfg-') ? currentImgField : 'cfg-' + currentImgField) 
             || document.getElementById(currentImgField);
    if (el) el.value = '';
  }
  
  updateImgPreview(currentImgField, '');
  closeModal('modal-image-actions');
  toast('Imagen eliminada', 'success');

  if (['logoImage', 'heroBgImage', 'contactBgImage'].includes(currentImgField)) {
    saveConfig();
  }
}

function updateImgPreview(id, src) {
  // Manejar prefijos cfg- si es necesario
  const prevId = id === 'logoImage' ? 'prev-logo' 
               : id === 'heroBgImage' ? 'prev-heroBgImage'
               : id === 'contactBgImage' ? 'prev-contactBgImage'
               : id.startsWith('prev-') ? id : 'prev-' + id;
               
  const wrapId = id === 'logoImage' ? 'wrap-logo'
               : id === 'heroBgImage' ? 'wrap-heroBgImage'
               : id === 'contactBgImage' ? 'wrap-contactBgImage'
               : id.startsWith('wrap-') ? id : 'wrap-' + id;

  const img = document.getElementById(prevId);
  const wrap = document.getElementById(wrapId);

  if (img) {
    img.src = src || '';
    img.style.display = src ? 'block' : 'none';
  }
  if (wrap) {
    if (src) wrap.classList.remove('empty');
    else wrap.classList.add('empty');
  }

  // Si actualizamos el fondo, también afectamos la previsualización del filtro si el modal está abierto
  if (id === 'heroBgImage' || id === 'contactBgImage') {
    const modalBg = document.getElementById('filter-modal-bg');
    if (modalBg && currentFilterTarget === (id === 'heroBgImage' ? 'hero' : 'contact')) {
      modalBg.src = src || '';
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GESTIÓN DE FILTROS (HERO / CONTACTO)
// ═══════════════════════════════════════════════════════════════════════════════
let currentFilterTarget = 'hero'; // 'hero' o 'contact'

function openFilterActions(target = 'hero') {
  currentFilterTarget = target;
  const prefix = target === 'hero' ? 'hero' : 'contact';
  
  const color = document.getElementById(`cfg-${prefix}FilterColor`).value || '#000000';
  const opacity = document.getElementById(`cfg-${prefix}FilterOpacity`).value || '0.5';
  const bg = document.getElementById(`cfg-${prefix}BgImage`).value || '';

  document.getElementById('filter-modal-color').value = color;
  document.getElementById('filter-modal-opacity').value = opacity;
  document.getElementById('filter-modal-bg').src = bg;
  
  liveUpdateFilter();
  openModal('modal-filter-actions');
}

function liveUpdateFilter() {
  const color = document.getElementById('filter-modal-color').value;
  const opacity = document.getElementById('filter-modal-opacity').value;
  
  document.getElementById('filter-modal-opacity-val').textContent = opacity;
  const overlay = document.getElementById('filter-modal-overlay');
  
  overlay.style.backgroundColor = color;
  overlay.style.opacity = opacity;
}

function applyFilterSettings() {
  const color = document.getElementById('filter-modal-color').value;
  const opacity = document.getElementById('filter-modal-opacity').value;
  const prefix = currentFilterTarget === 'hero' ? 'hero' : 'contact';

  document.getElementById(`cfg-${prefix}FilterColor`).value = color;
  document.getElementById(`cfg-${prefix}FilterOpacity`).value = opacity;

  syncFilterPreview(currentFilterTarget);
  saveConfig();
  closeModal('modal-filter-actions');
  toast('Filtro actualizado', 'success');
}

function syncFilterPreview(target = 'hero') {
  const prefix = target === 'hero' ? 'hero' : 'contact';
  const color = document.getElementById(`cfg-${prefix}FilterColor`).value || '#000000';
  const opacity = document.getElementById(`cfg-${prefix}FilterOpacity`).value || '0.5';
  const prev = document.getElementById(`prev-${prefix}Filter`);
  
  if (prev) {
    prev.style.backgroundColor = color;
    prev.style.opacity = opacity;
  }
}

function toggleNavColorVisibility() {
  const isColor = document.getElementById('cfg-navStyleMode')?.checked;
  const field = document.getElementById('nav-color-field');
  if (field) {
    field.style.display = isColor ? 'flex' : 'none';
  }
}

function updateThemeLabel(isLight) {
  const label = document.getElementById('theme-mode-label');
  if (label) {
    label.textContent = isLight ? 'Claro' : 'Oscuro';
  }
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLES SEGMENTADOS (THEME & NAVBAR)
// ═══════════════════════════════════════════════════════════════════════════════
function setThemeMode(mode) {
  const isLight = (mode === 'light');
  const input = document.getElementById('cfg-theme');
  input.checked = isLight;
  
  // Actualizar UI
  const btnDark = document.getElementById('btn-theme-dark');
  const btnLight = document.getElementById('btn-theme-light');
  const container = btnDark.parentElement;
  
  btnDark.classList.toggle('active', !isLight);
  btnLight.classList.toggle('active', isLight);
  container.classList.toggle('state-right', isLight);
  container.classList.toggle('is-light', isLight);
  
  // Disparar evento y lógica original
  if (typeof updateThemeLabel === 'function') updateThemeLabel(isLight);
  input.dispatchEvent(new Event('change'));
}

function setNavStyle(style) {
  const isColor = (style === 'color');
  const input = document.getElementById('cfg-navStyleMode');
  input.checked = isColor;
  
  // Actualizar UI
  const btnBlur = document.getElementById('btn-nav-blur');
  const btnSolid = document.getElementById('btn-nav-solid');
  const container = btnBlur.parentElement;
  
  btnBlur.classList.toggle('active', !isColor);
  btnSolid.classList.toggle('active', isColor);
  container.classList.toggle('state-right', isColor);
  
  // Animación de aparición
  const colorField = document.getElementById('row-nav-color');
  if (colorField) colorField.classList.toggle('show-row', isColor);

  // Disparar evento y lógica original
  input.dispatchEvent(new Event('change'));
}

// Extender loadConfigForm para sincronizar botones al cargar
const originalLoadConfigForm = window.loadConfigForm;
window.loadConfigForm = function() {
  if (originalLoadConfigForm) originalLoadConfigForm();
  
  // Sincronizar botones después de cargar valores en inputs
  setTimeout(() => {
    const isLight = document.getElementById('cfg-theme').checked;
    setThemeMode(isLight ? 'light' : 'dark');
    
    const isColor = document.getElementById('cfg-navStyleMode').checked;
    setNavStyle(isColor ? 'color' : 'blur');
  }, 100);
};
