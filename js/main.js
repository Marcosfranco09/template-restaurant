/**
 * main.js — Lógica del sitio público (index.html)
 * Depende de: config.js (cargado primero)
 */

/* ─── Toast Global ────────────────────────────────────────────────────────────── */
window.showToast = function(message, type = 'info', duration = 3500) {
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  // Crear contenedor si no existe
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `site-toast site-toast--${type}`;
  toast.innerHTML = `
    <span class="site-toast__icon">${icons[type] || icons.info}</span>
    <span class="site-toast__msg">${message}</span>
    <button class="site-toast__close" onclick="this.closest('.site-toast').remove()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="site-toast__progress"></div>
  `;

  container.appendChild(toast);

  // Animar la barra de progreso
  const bar = toast.querySelector('.site-toast__progress');
  bar.style.animationDuration = `${duration}ms`;
  bar.classList.add('running');

  // Auto-eliminar
  const timer = setTimeout(() => {
    toast.classList.add('site-toast--out');
    setTimeout(() => toast.remove(), 400);
  }, duration);

  // Click para cerrar inmediatamente
  toast.querySelector('.site-toast__close').addEventListener('click', () => {
    clearTimeout(timer);
    toast.classList.add('site-toast--out');
    setTimeout(() => toast.remove(), 400);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHero();
  initBranches();
  initProductsPreview();
  initContact();
  initFooter();
  initRevealAnimations();

  // Fallback: Ocultar preloader después de 5s por si Firebase falla
  setTimeout(() => {
    const preloader = document.getElementById('site-preloader');
    if (preloader && !preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
    }
  }, 5000);
});

// Escuchar cambios en tiempo real desde Firebase y refrescar la UI
window.addEventListener('app-config-updated', (e) => {
  console.log(`[Main] Sincronización detectada (${e.detail.key}), actualizando interfaz...`);
  const cfg = window.App.config;

  initNavbar();
  initHero();
  initBranches();
  initProductsPreview();
  initContact();
  initFooter();
  
  // Re-activar animaciones para los nuevos elementos creados
  initRevealAnimations();
});

// ═══════════════════════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════════════════════
function initNavbar() {
  const cfg = window.App.config;

  // Logo
  const logoImg  = document.getElementById('nav-logo-img');
  const logoText = document.getElementById('nav-logo-text');
  if (cfg.logoImage && logoImg) {
    logoImg.src = cfg.logoImage;
    logoImg.style.display = 'block';
  } else if (logoImg) {
    logoImg.style.display = 'none';
  }
  
  if (logoText) {
    logoText.textContent = cfg.restaurantName;
    logoText.style.display = cfg.showLogoText ? 'block' : 'none';
    logoText.style.fontFamily = cfg.logoFontFamily;
  }

  // Scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Hamburger toggle
  const hamburger = document.querySelector('.navbar__hamburger');
  const mobileMenu = document.querySelector('.navbar__mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });
    // Cerrar al hacer click en un link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Floating WhatsApp
  const waNumber = cfg.whatsappNumber;
  const waFloat = document.getElementById('whatsapp-float');
  if (waFloat && waNumber) {
    waFloat.href = `https://wa.me/${waNumber}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════════
function initHero() {
  const cfg = window.App.config;

  // Fondo
  const heroBg = document.querySelector('.hero__bg');
  if (heroBg && cfg.heroBgImage) {
    heroBg.style.backgroundImage = `url('${cfg.heroBgImage}')`;
  }

  // Textos
  setTextContent('hero-title',    cfg.heroTitle);
  setTextContent('hero-subtitle', cfg.heroSubtitle);

  // Botones
  const btn1 = document.getElementById('hero-btn1');
  const btn2 = document.getElementById('hero-btn2');
  if (btn1) { btn1.textContent = cfg.heroBtn1Text; btn1.href = cfg.heroBtn1Link; }
  if (btn2) { btn2.textContent = cfg.heroBtn2Text; btn2.href = cfg.heroBtn2Link; }

  // Redes sociales
  const socialInsta = document.getElementById('social-instagram');
  const socialFb    = document.getElementById('social-facebook');
  const socialTk    = document.getElementById('social-tiktok');
  if (socialInsta) {
    cfg.socialInstagram ? (socialInsta.href = cfg.socialInstagram) : socialInsta.remove();
  }
  if (socialFb) {
    cfg.socialFacebook ? (socialFb.href = cfg.socialFacebook) : socialFb.remove();
  }
  if (socialTk) {
    cfg.socialTiktok ? (socialTk.href = cfg.socialTiktok) : socialTk.remove();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCALES
// ═══════════════════════════════════════════════════════════════════════════════
function initBranches() {
  const cfg      = window.App.config;
  const branches = window.App.getBranches(true); // solo activos

  setTextContent('branches-title',    cfg.branchesTitle);
  setTextContent('branches-subtitle', cfg.branchesSubtitle);

  const grid = document.getElementById('branches-grid');
  if (!grid) return;

  if (branches.length === 0) {
    grid.innerHTML = `
      <div class="products-empty" style="grid-column:1/-1;color:var(--site-text-muted)">
        <p>Próximamente abriremos nuevos locales.</p>
      </div>`;
    return;
  }

  grid.innerHTML = branches.map(branch => createBranchCard(branch)).join('');
}

function createBranchCard(branch) {
  const imgHTML = branch.image
    ? `<img src="${branch.image}" alt="${branch.name}" loading="lazy">`
    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--color-primary-dark),var(--site-surface));display:flex;align-items:center;justify-content:center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.5)" stroke-width="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>`;

  return `
    <div class="branch-card reveal">
      <div class="branch-card__img">
        ${imgHTML}
        <div class="branch-card__name">${escapeHTML(branch.name)}</div>
      </div>
      <div class="branch-card__info">
        ${branch.address ? `
        <div class="branch-card__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>${escapeHTML(branch.address)}</span>
        </div>` : ''}
        ${branch.phone ? `
        <div class="branch-card__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.62 19.79 19.79 0 01.22 1 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.56-1.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
          <span>${escapeHTML(branch.phone)}</span>
        </div>` : ''}
        ${branch.hours ? `
        <div class="branch-card__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>${escapeHTML(branch.hours)}</span>
        </div>` : ''}
        
        <a href="${formatMapsUrl(branch.mapsUrl || branch.address)}" target="_blank" class="btn-maps">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Cómo llegar
        </a>
      </div>
    </div>`;
}

function formatMapsUrl(destination) {
  if (!destination) return 'https://www.google.com/maps';
  // Si ya es un enlace completo de direcciones, lo dejamos así
  if (destination.includes('google.com/maps/dir')) return destination;
  // De lo contrario, forzamos el modo de navegación/direcciones
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISTA PREVIA DE PRODUCTOS (reemplaza testimonios)
// ═══════════════════════════════════════════════════════════════════════════════
function initProductsPreview() {
  const cfg   = window.App.config;
  const count = parseInt(cfg.productsPreviewCount) || 4;

  setTextContent('products-preview-title',    cfg.productsTitle);
  setTextContent('products-preview-subtitle', cfg.productsSubtitle);

  // Botón "Ver todos"
  const btnMore = document.getElementById('btn-ver-todos');
  if (btnMore) btnMore.href = 'productos.html';

  const grid = document.getElementById('products-preview-grid');
  if (!grid) return;

  const products = window.App.getFeaturedProducts(count);

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="products-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 7H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
        </svg>
        <p>Los productos se agregarán desde el panel de administración.</p>
      </div>`;
    return;
  }

  grid.innerHTML = products.map(p => createProductCard(p)).join('');
}

function createProductCard(product) {
  const categoryName = window.App.getCategoryName(product.category);
  const priceStr     = window.App.formatPrice(product.price);

  const imgHTML = product.image
    ? `<img src="${product.image}" alt="${escapeHTML(product.name)}" loading="lazy">`
    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--color-primary),var(--color-primary-dark));display:flex;align-items:center;justify-content:center;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.5)" stroke-width="1.5">
            <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
        </div>`;

  const featuredBadge = product.featured
    ? `<span class="product-card__badge">Destacado</span>`
    : '';

  return `
    <div class="product-card reveal" onclick="window.openProductModal('${product.id}')">
      <div class="product-card__img">
        ${imgHTML}
        ${featuredBadge}
      </div>
      <div class="product-card__body">
        ${categoryName ? `<p class="product-card__category">${escapeHTML(categoryName)}</p>` : ''}
        <h3 class="product-card__name">${escapeHTML(product.name)}</h3>
        ${product.description ? `<p class="product-card__desc">${escapeHTML(product.description)}</p>` : ''}
        <div class="product-card__footer">
          <span class="product-card__price">${priceStr}</span>
          <button class="btn-add-cart" onclick="event.stopPropagation(); window.quickAdd('${product.id}', event)" title="Añadir al carrito">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGICA DE MODAL Y CARRITO
// ═══════════════════════════════════════════════════════════════════════════════
window.openProductModal = function(productId) {
  const product = window.App.getProductById(productId);
  if (!product) return;

  const modal = document.getElementById('product-modal');
  if (!modal) return;

  const img = document.getElementById('modal-product-img');
  const name = document.getElementById('modal-product-name');
  const cat = document.getElementById('modal-product-category');
  const desc = document.getElementById('modal-product-desc');
  const price = document.getElementById('modal-product-price');
  const qtyInput = document.getElementById('modal-product-qty');
  const addBtn = document.getElementById('modal-add-btn');

  if (img) img.src = product.image || 'img/logo.png';
  if (name) name.textContent = product.name;
  if (cat) cat.textContent = window.App.getCategoryName(product.category);
  if (desc) desc.textContent = product.description || 'Sin descripción disponible.';
  if (price) price.textContent = window.App.formatPrice(product.price);
  if (qtyInput) qtyInput.value = 1;

  if (addBtn) {
    addBtn.onclick = (e) => window.Cart.add(product, parseInt(document.getElementById('modal-product-qty').value), e);
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeProductModal = function() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
};

window.changeQty = function(delta) {
  const input = document.getElementById('modal-product-qty');
  if (!input) return;
  let val = parseInt(input.value) + delta;
  if (val < 1) val = 1;
  input.value = val;
};

window.quickAdd = function(productId, e) {
  const product = window.App.getProductById(productId);
  if (product) window.Cart.add(product, 1, e);
};

window.addToCart = function(product, qty) {
  window.Cart.add(product, qty);
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACTO
// ═══════════════════════════════════════════════════════════════════════════════
function initContact() {
  const cfg = window.App.config;

  setTextContent('contact-title',    cfg.contactTitle);
  setTextContent('contact-subtitle', cfg.contactSubtitle);

  const contactBg = document.querySelector('.contact__banner-bg');
  if (contactBg && cfg.contactBgImage) {
    contactBg.style.backgroundImage = `url('${cfg.contactBgImage}')`;
    contactBg.style.opacity = '1';
  }

  // Formulario → WhatsApp
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre  = form.querySelector('#contact-name')?.value || '';
      const mensaje = form.querySelector('#contact-message')?.value || '';
      const texto   = `Hola! Soy ${nombre}. ${mensaje}`;
      const number  = cfg.whatsappNumber || '595000000000';
      const url     = `https://wa.me/${number}?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank');
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════════
function initFooter() {
  const cfg = window.App.config;

  // Logo en footer
  const footerLogoImg  = document.getElementById('footer-logo-img-new');
  if (footerLogoImg) {
    footerLogoImg.src = cfg.logoImage || '';
    footerLogoImg.style.display = cfg.logoImage ? 'block' : 'none';
  }

  // Contacto dinámico
  setTextContent('footer-phone', cfg.contactPhone);
  setTextContent('footer-whatsapp-text', cfg.whatsappNumber);
  setTextContent('footer-email-text', cfg.contactEmail);

  // Copyright con año dinámico
  const copyright = document.getElementById('footer-copyright');
  if (copyright) {
    const year = new Date().getFullYear();
    copyright.textContent = `Copyright © ${year} ${cfg.restaurantName}. ${cfg.footerCopyright || 'Todos los derechos reservados.'}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMACIONES DE REVEAL (Intersection Observer)
// ═══════════════════════════════════════════════════════════════════════════════
function initRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════
function setTextContent(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) el.textContent = value;
}

function setHref(id, href) {
  const el = document.getElementById(id);
  if (!el) return;
  if (href) { el.href = href; el.style.display = ''; }
  else { el.style.display = 'none'; }
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
