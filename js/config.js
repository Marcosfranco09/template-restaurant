// ─── Inicialización de Firebase ───────────────────────────────────────────────
if (typeof firebase !== 'undefined' && window.firebaseConfig && window.firebaseConfig.apiKey !== 'TU_API_KEY') {
  firebase.initializeApp(window.firebaseConfig);
  console.log('Firebase Inicializado');
}

const db = (typeof firebase !== 'undefined' && firebase.apps.length > 0) ? firebase.database() : null;

// ─── Claves / Rutas de DB ──────────────────────────────────────────────────────
const KEYS = {
  CONFIG:      'config',
  PRODUCTS:    'products',
  CATEGORIES:  'categories',
  BRANCHES:    'branches',
};

// ─── Configuración por defecto ────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  // Identidad
  restaurantName:   'Elite Dining',
  logoText:         'Elite Dining',
  logoImage:        'images/logo.png',           // base64 o URL
  showLogoText:     false,                       // Mostrar texto junto al logo
  logoFontFamily:   "'Inter', sans-serif",       // Fuente del texto del logo
  logoScale:        1.5,                         // Escala del logo (0.5 a 3.0)
  logoX:            0,                           // Posición X del logo en nav
  logoY:            0,                           // Posición Y del logo en nav
  tagline:          'La excelencia en cada plato',

  // Hero
  heroTitle:        'Donde cada sabor cuenta una historia inolvidable',
  heroSubtitle:     'Descubrí una propuesta gastronómica única, elaborada con los ingredientes más exclusivos del mercado.',
  heroBgImage:      'images/hero-bg.png',           // base64 o URL de la imagen de fondo del hero
  heroBtn1Text:     'Ver Nuestra Carta',
  heroBtn1Link:     'productos.html',
  heroBtn2Text:     'Hacer Pedido Online',
  heroBtn2Link:     'https://wa.me/595000000000',
  heroFilterColor:  '#b40000',               // Rojo transparente por defecto
  heroFilterOpacity: 0.35,                   // Opacidad por defecto

  // Contacto
  contactTitle:     '¿Tenés alguna consulta?',
  contactSubtitle:  'Dejanos un mensaje',
  contactBgImage:   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=70',
  contactFilterColor: '#b40000',
  contactFilterOpacity: 0.75,
  whatsappNumber:   '595982300307',
  contactPhone:     '(0982) 300307',
  contactEmail:     'contacto@restaurante.com',
  email:            'contacto@restaurante.com',

  // Estilo Navbar
  navStyleMode:     'blur',                      // 'blur' o 'color'
  navColor:         '#000000',

  // Colores (CSS variables)
  colorPrimary:     '#1a1a1a',
  colorPrimaryDark: '#111111',
  colorAccent:      '#D4AF37',
  colorBgDark:      '#0a0a0a',
  colorBgLight:     '#f5f5f5',

  // Redes sociales
  socialInstagram:  '',
  socialFacebook:   '',
  socialTiktok:     '',
  socialWhatsapp:   '',

  // Footer
  footerTagline:    'La excelencia en cada plato',
  footerCopyright:  'Todos los derechos reservados.',
  footerLogoScale:  1.0,
  footerLogoX:      0,
  footerLogoY:      0,
  romaLogoScale:    2.7,
  romaLogoX:        10,
  romaLogoY:        2,

  // Sección locales
  branchesTitle:    'Nuestros Locales',
  branchesSubtitle: 'Encontranos en las mejores ubicaciones',

  // Sección productos
  productsTitle:    'Nuestros Productos',
  productsSubtitle: 'Una selección especial para vos',
  productsPreviewCount: 4,        // 4 u 8 tarjetas en el inicio
  theme:            'dark',      // 'light' o 'dark'
  navTextColor:     '#ffffff',
};

// ─── Locales por defecto ──────────────────────────────────────────────────────
const DEFAULT_BRANCHES = [
  {
    id: 'branch-1',
    name: 'Local Principal',
    address: 'Av. Principal 123, Centro',
    phone: '+595 21 000-000',
    hours: 'Lunes a domingo: 11:00 a 23:00hs',
    image: '',
    active: true,
  },
  {
    id: 'branch-2',
    name: 'Shopping Central',
    address: 'Shopping Central, Local 45',
    phone: '+595 21 000-001',
    hours: 'Lunes a domingo: 10:00 a 22:00hs',
    image: '',
    active: true,
  },
  {
    id: 'branch-3',
    name: 'Sucursal Norte',
    address: 'Av. Norte 456, Barrio Norte',
    phone: '+595 21 000-002',
    hours: 'Lunes a sábado: 12:00 a 22:00hs',
    image: '',
    active: true,
  },
];

// ─── Categorías por defecto ───────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Platos Principales', slug: 'principales', active: true },
  { id: 'cat-2', name: 'Entradas',           slug: 'entradas',    active: true },
  { id: 'cat-3', name: 'Postres',            slug: 'postres',     active: true },
  { id: 'cat-4', name: 'Bebidas',            slug: 'bebidas',     active: true },
];

// ─── Productos por defecto ────────────────────────────────────────────────────
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Plato Especial de la Casa',
    description: 'Nuestra especialidad preparada con ingredientes frescos y seleccionados del día.',
    price: 85000,
    category: 'cat-1',
    image: '',
    featured: true,
    available: true,
  },
  {
    id: 'prod-2',
    name: 'Combinado Premium',
    description: 'Una combinación perfecta de sabores que deleitará tu paladar.',
    price: 95000,
    category: 'cat-1',
    image: '',
    featured: true,
    available: true,
  },
  {
    id: 'prod-3',
    name: 'Entrada Clásica',
    description: 'La entrada perfecta para comenzar tu experiencia gastronómica.',
    price: 35000,
    category: 'cat-2',
    image: '',
    featured: false,
    available: true,
  },
  {
    id: 'prod-4',
    name: 'Postre del Chef',
    description: 'Postre artesanal elaborado diariamente con ingredientes premium.',
    price: 25000,
    category: 'cat-3',
    image: '',
    featured: false,
    available: true,
  },
  {
    id: 'prod-5',
    name: 'Plato Vegetariano',
    description: 'Opción saludable y deliciosa para los amantes de la cocina vegetariana.',
    price: 70000,
    category: 'cat-1',
    image: '',
    featured: false,
    available: true,
  },
  {
    id: 'prod-6',
    name: 'Bebida Especial',
    description: 'Refrescante bebida preparada con frutas frescas de temporada.',
    price: 18000,
    category: 'cat-4',
    image: '',
    featured: false,
    available: true,
  },
  {
    id: 'prod-7',
    name: 'Tabla de Entradas',
    description: 'Selección variada de entradas para compartir en buena compañía.',
    price: 55000,
    category: 'cat-2',
    image: '',
    featured: true,
    available: true,
  },
  {
    id: 'prod-8',
    name: 'Postre Clásico',
    description: 'El postre de siempre, con la calidad que nos caracteriza.',
    price: 20000,
    category: 'cat-3',
    image: '',
    featured: false,
    available: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CLASE PRINCIPAL — AppConfig
// ═══════════════════════════════════════════════════════════════════════════════
class AppConfig {

  constructor() {
    this.config     = this._load(KEYS.CONFIG,     DEFAULT_CONFIG);
    this.products   = this._load(KEYS.PRODUCTS,   DEFAULT_PRODUCTS);
    this.categories = this._load(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    this.branches   = this._load(KEYS.BRANCHES,   DEFAULT_BRANCHES);
    this._applyTheme();

    if (db) {
      this._syncFromFirebase();
    }
  }

  // ─── Cargar desde localStorage o usar defecto ────────────────────────────
  _load(key, defaults) {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return structuredClone(defaults);
      // Para config, mergear con defaults para mantener nuevas claves
      if (key === KEYS.CONFIG) {
        return Object.assign({}, structuredClone(defaults), JSON.parse(saved));
      }
      return JSON.parse(saved);
    } catch (e) {
      console.warn(`[AppConfig] Error al cargar ${key}:`, e);
      return structuredClone(defaults);
    }
  }

  // ─── Guardar en localStorage ─────────────────────────────────────────────
  _save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`[AppConfig] Error al guardar local ${key}:`, e);
    }

    if (db) {
      db.ref(key).set(data).catch(e => {
        console.error(`[AppConfig] Error al guardar en Firebase ${key}:`, e);
      });
    }
  }

  // ─── Sincronización en tiempo real desde Firebase ────────────────────────
  _syncFromFirebase() {
    const loadedKeys = new Set();
    const totalKeys = Object.keys(KEYS).length;

    Object.values(KEYS).forEach(key => {
      db.ref(key).on('value', snapshot => {
        const data = snapshot.val();
        
        // Solo actualizamos si hay datos válidos y NO están vacíos
        const hasData = data && (
          (Array.isArray(data) && data.length > 0) || 
          (typeof data === 'object' && Object.keys(data).length > 0)
        );

        if (hasData) {
          console.log(`[AppConfig] Sincronizado ${key} desde Firebase`);
          if (key === KEYS.CONFIG) {
            this.config = Object.assign({}, DEFAULT_CONFIG, data);
            this._applyTheme();
          }
          if (key === KEYS.PRODUCTS)   this.products = data;
          if (key === KEYS.CATEGORIES) this.categories = data;
          if (key === KEYS.BRANCHES)   this.branches = data;

          window.dispatchEvent(new CustomEvent('app-config-updated', { detail: { key } }));
        } else {
          console.log(`[AppConfig] Firebase vacío o incompleto para ${key}. Ignorando para evitar borrado.`);
          
          firebase.auth().onAuthStateChanged(user => {
            if (user) {
              console.log(`[AppConfig] Admin detectado. Subiendo datos locales a Firebase para ${key}...`);
              const localData = (key === KEYS.CONFIG) ? this.config : 
                               (key === KEYS.PRODUCTS) ? this.products :
                               (key === KEYS.CATEGORIES) ? this.categories : this.branches;
              this._save(key, localData);
            }
          });
        }

        // Marcar llave como procesada para el preloader
        loadedKeys.add(key);
        if (loadedKeys.size >= totalKeys) {
          console.log('[AppConfig] Sincronización inicial completa');
          setTimeout(() => {
            const preloader = document.getElementById('site-preloader');
            if (preloader) preloader.classList.add('hidden');
          }, 300);
        }
      });
    });
  }

  // ─── Aplicar variables CSS dinámicamente ─────────────────────────────────
  _applyTheme() {
    const root = document.documentElement;
    const c = this.config;

    // Aplicar Tema (Claro / Oscuro)
    if (c.theme === 'light') root.classList.add('light');
    else root.classList.remove('light');

    root.style.setProperty('--color-primary',      c.colorPrimary     || '#D32F2F');
    root.style.setProperty('--color-primary-dark',  c.colorPrimaryDark || '#B71C1C');
    root.style.setProperty('--color-accent',        c.colorAccent      || '#FFC107');
    root.style.setProperty('--color-bg-dark',       c.colorBgDark      || '#1a1a1a');
    root.style.setProperty('--color-bg-medium',     c._colorBgMedium   || '#242424');
    root.style.setProperty('--color-bg-light',      c.colorBgLight     || '#f5f5f5');

    root.style.setProperty('--nav-text-color',     c.navTextColor     || '#ffffff');

    // Logo Nav
    root.style.setProperty('--nav-logo-scale', c.logoScale || 1);
    root.style.setProperty('--nav-logo-x', (c.logoX || 0) + 'px');
    root.style.setProperty('--nav-logo-y', (c.logoY || 0) + 'px');

    // Logo Footer Cliente
    root.style.setProperty('--footer-logo-scale', c.footerLogoScale || 1);
    root.style.setProperty('--footer-logo-x', (c.footerLogoX || 0) + 'px');
    root.style.setProperty('--footer-logo-y', (c.footerLogoY || 0) + 'px');

    // Logo RomaTech
    root.style.setProperty('--roma-logo-scale', c.romaLogoScale || 1);
    root.style.setProperty('--roma-logo-x', (c.romaLogoX || 0) + 'px');
    root.style.setProperty('--roma-logo-y', (c.romaLogoY || 0) + 'px');

    // Hero Filter
    root.style.setProperty('--hero-filter-color',   c.heroFilterColor || '#000000');
    root.style.setProperty('--hero-filter-opacity', c.heroFilterOpacity || 0.5);

    // Contact Filter
    root.style.setProperty('--contact-filter-color',   c.contactFilterColor || '#000000');
    root.style.setProperty('--contact-filter-opacity', c.contactFilterOpacity || 0.7);

    // Navbar Style
    if (c.navStyleMode === 'color') {
      root.style.setProperty('--nav-bg', c.navColor || '#000000');
      root.style.setProperty('--nav-blur', '0px');
    } else {
      root.style.setProperty('--nav-bg', 'rgba(0, 0, 0, 0.45)');
      root.style.setProperty('--nav-blur', '15px');
    }
  }

  // ─── Actualizar configuración ────────────────────────────────────────────
  updateConfig(updates) {
    Object.assign(this.config, updates);
    this._save(KEYS.CONFIG, this.config);
    this._applyTheme();
  }

  resetConfig() {
    this.config = structuredClone(DEFAULT_CONFIG);
    this._save(KEYS.CONFIG, this.config);
    this._applyTheme();
  }

  // ─── CRUD Productos ───────────────────────────────────────────────────────
  getProducts(onlyActive = false) {
    if (onlyActive) return this.products.filter(p => p.available);
    return this.products;
  }

  getFeaturedProducts(limit = 4) {
    const featured = this.products.filter(p => p.available && p.featured);
    // Si no hay suficientes destacados, completar con los demás
    if (featured.length >= limit) return featured.slice(0, limit);
    const rest = this.products.filter(p => p.available && !p.featured);
    return [...featured, ...rest].slice(0, limit);
  }

  getProductById(id) {
    return this.products.find(p => p.id === id) || null;
  }

  saveProduct(product) {
    if (!product.id) {
      // Nuevo producto
      product.id = 'prod-' + Date.now();
      this.products.push(product);
    } else {
      // Editar existente
      const idx = this.products.findIndex(p => p.id === product.id);
      if (idx !== -1) this.products[idx] = product;
    }
    this._save(KEYS.PRODUCTS, this.products);
    return product;
  }

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this._save(KEYS.PRODUCTS, this.products);
  }

  // ─── CRUD Categorías ──────────────────────────────────────────────────────
  getCategories(onlyActive = false) {
    if (onlyActive) return this.categories.filter(c => c.active);
    return this.categories;
  }

  saveCategory(category) {
    if (!category.id) {
      category.id = 'cat-' + Date.now();
      this.categories.push(category);
    } else {
      const idx = this.categories.findIndex(c => c.id === category.id);
      if (idx !== -1) this.categories[idx] = category;
    }
    this._save(KEYS.CATEGORIES, this.categories);
    return category;
  }

  deleteCategory(id) {
    this.categories = this.categories.filter(c => c.id !== id);
    this._save(KEYS.CATEGORIES, this.categories);
  }

  // ─── CRUD Locales ─────────────────────────────────────────────────────────
  getBranches(onlyActive = false) {
    if (onlyActive) return this.branches.filter(b => b.active);
    return this.branches;
  }

  saveBranch(branch) {
    if (!branch.id) {
      branch.id = 'branch-' + Date.now();
      this.branches.push(branch);
    } else {
      const idx = this.branches.findIndex(b => b.id === branch.id);
      if (idx !== -1) this.branches[idx] = branch;
    }
    this._save(KEYS.BRANCHES, this.branches);
    return branch;
  }

  deleteBranch(id) {
    this.branches = this.branches.filter(b => b.id !== id);
    this._save(KEYS.BRANCHES, this.branches);
  }

  // ─── Formato de precio ────────────────────────────────────────────────────
  formatPrice(price) {
    if (!price && price !== 0) return '';
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      maximumFractionDigits: 0,
    }).format(price);
  }

  // ─── Obtener categoría por ID ─────────────────────────────────────────────
  getCategoryName(categoryId) {
    const cat = this.categories.find(c => c.id === categoryId);
    return cat ? cat.name : '';
  }
}

// ─── Instancia global ─────────────────────────────────────────────────────────
window.App = new AppConfig();
