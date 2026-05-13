/* ─── Lógica del Carrito ────────────────────────────────────────────────────── */
(function() {
  const CART_KEY = 'restaurant_cart';
  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

  const cartDrawer = `
    <div class="cart-overlay" id="cart-overlay" onclick="window.Cart.close()"></div>
    <div class="cart-sidebar" id="cart-sidebar">
      <div class="cart-header">
        <div class="cart-header-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <h2>Resumen de tu Pedido</h2>
        </div>
        <button class="cart-close" onclick="window.Cart.close()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="cart-items" id="cart-items-container">
        <!-- Items dinámicos -->
      </div>
      <div class="cart-footer" id="cart-footer">
        <div class="cart-total">
          <span>Total:</span>
          <span id="cart-total-amount">0 Gs.</span>
        </div>
        <button class="cart-checkout" onclick="window.Cart.checkout()">
          Finalizar Pedido
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
    <div class="cart-handle" id="cart-handle" onclick="window.Cart.toggle()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </div>
  `;

  function init() {
    if (!document.getElementById('cart-sidebar')) {
      const div = document.createElement('div');
      div.innerHTML = cartDrawer;
      document.body.appendChild(div);
    }
    render();
  }

  function save() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    render();
  }

  function render() {
    const container = document.getElementById('cart-items-container');
    const handle = document.getElementById('cart-handle');
    const totalEl = document.getElementById('cart-total-amount');
    const footer = document.getElementById('cart-footer');

    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
          </svg>
          <p>Tu carrito está vacío.<br>¡Agregá algo rico!</p>
        </div>
      `;
      footer.style.display = 'none';
      if (handle) handle.classList.remove('visible');
    } else {
      footer.style.display = 'block';
      if (handle) handle.classList.add('visible');

      let total = 0;
      container.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        return `
          <div class="cart-item">
            <img src="${item.image || 'img/logo.png'}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <p>${window.App.formatPrice(item.price * item.qty)}</p>
              <div class="cart-qty-ctrl">
                <button class="cart-qty-btn" onclick="window.Cart.updateQty('${item.id}', -1)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span class="cart-qty-val">${item.qty}</span>
                <button class="cart-qty-btn" onclick="window.Cart.updateQty('${item.id}', 1)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>
            <button class="cart-item-remove" onclick="window.Cart.remove('${item.id}')" title="Eliminar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        `;
      }).join('');

      totalEl.textContent = window.App.formatPrice(total);
    }
  }

  function animateFly(startEl, imgUrl) {
    if (!startEl) return;
    const rect = startEl.getBoundingClientRect();
    const flyEl = document.createElement('img');
    flyEl.src = imgUrl || 'img/logo.png';
    flyEl.className = 'fly-item';
    
    // Posición inicial (encima de la card)
    flyEl.style.left = `${rect.left}px`;
    flyEl.style.top = `${rect.top}px`;
    flyEl.style.width = `${rect.width}px`;
    flyEl.style.height = `${rect.height}px`;
    flyEl.style.borderRadius = '20px';
    flyEl.style.opacity = '1';
    flyEl.style.transition = 'none'; // Reset para el inicio
    
    document.body.appendChild(flyEl);

    const target = document.getElementById('cart-handle');
    const targetRect = target.getBoundingClientRect();

    // Efecto de "desprendimiento" (pequeño salto antes de volar)
    requestAnimationFrame(() => {
      flyEl.style.transition = 'all 1.2s cubic-bezier(0.165, 0.84, 0.44, 1)';
      
      setTimeout(() => {
        // Volar hacia el carrito haciéndose pequeño
        flyEl.style.left = `${targetRect.left}px`;
        flyEl.style.top = `${targetRect.top + 25}px`;
        flyEl.style.width = '40px';
        flyEl.style.height = '40px';
        flyEl.style.borderRadius = '50%';
        flyEl.style.transform = 'rotate(720deg) scale(0.1)';
        flyEl.style.opacity = '0';
      }, 50);
    });

    setTimeout(() => flyEl.remove(), 1250);
  }

  window.Cart = {
    add: function(product, qty, event) {
      const isFirstItem = cart.length === 0;

      // Animación
      const startEl = event ? (event.target.closest('.product-card') || event.target.closest('.modal-container') || event.target) : null;
      animateFly(startEl, product.image);

      const existing = cart.find(item => item.id === product.id);
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty: qty
        });
      }
      save();
      
      // Abrir SOLO si es el primer producto (esperando a que termine la animación lenta)
      if (isFirstItem) {
        setTimeout(() => this.open(), 1100);
      }
    },

    remove: function(id) {
      cart = cart.filter(item => item.id !== id);
      save();
    },

    updateQty: function(id, delta) {
      const item = cart.find(i => i.id === id);
      if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
          this.remove(id);
        } else {
          save();
        }
      }
    },

    toggle: function() {
      const isOpen = document.getElementById('cart-sidebar').classList.contains('open');
      if (isOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    open: function() {
      document.getElementById('cart-sidebar').classList.add('open');
      document.getElementById('cart-overlay').classList.add('active');
      document.body.classList.add('locked');
      document.documentElement.classList.add('locked');
    },

    close: function() {
      document.getElementById('cart-sidebar').classList.remove('open');
      document.getElementById('cart-overlay').classList.remove('active');
      document.body.classList.remove('locked');
      document.documentElement.classList.remove('locked');
    },

    checkout: function() {
      if (cart.length === 0) return;
      
      const cfg = window.App.config;
      let message = `*Nuevo Pedido - ${cfg.restaurantName}*\n\n`;
      let total = 0;

      cart.forEach(item => {
        message += `• ${item.qty}x ${item.name} - ${window.App.formatPrice(item.price * item.qty)}\n`;
        total += item.price * item.qty;
      });

      message += `\n*Total: ${window.App.formatPrice(total)}*`;
      message += `\n\n_Pedido enviado desde la web_`;

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/${cfg.whatsappNumber}?text=${encoded}`, '_blank');
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
