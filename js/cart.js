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
    if (!document.getElementById('payment-modal')) {
      const pDiv = document.createElement('div');
      pDiv.innerHTML = paymentModalHTML;
      document.body.appendChild(pDiv);
      initPaymentEvents();
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
      footer.classList.add('collapsed');
      if (handle) handle.classList.remove('visible');
    } else {
      footer.classList.remove('collapsed');
      if (handle) handle.classList.add('visible');

      let total = 0;
      container.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        return `
          <div class="cart-item" data-id="${item.id}">
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
      const itemEl = document.querySelector(`.cart-item[data-id="${id}"]`);
      if (itemEl) {
        itemEl.classList.add('removing');
        setTimeout(() => {
          cart = cart.filter(item => item.id !== id);
          save();
        }, 350); // Coincide con la duración de la transición CSS
      } else {
        cart = cart.filter(item => item.id !== id);
        save();
      }
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
      window.Payment.open();
    }
  };

  /* ─── LÓGICA DE PAGO ONLINE PREMIUM ────────────────────────────────────────── */
  const brandLogos = {
    visa: `<svg width="50" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7.5L9 9h1.5l-1.5 8zm7.5-6.8c-.3-.2-.7-.3-1.1-.3-.9 0-1.6.5-1.6 1.3 0 1.4 2 1.2 2 2.1 0 .5-.4.8-1 .8-.5 0-.9-.2-1.2-.4l-.3.9c.3.2.8.3 1.3.3.9 0 1.7-.5 1.7-1.3 0-1.5-2-1.3-2-2.1 0-.4.3-.7.8-.7.4 0 .7.1.9.3l.5-.9zm3.5-1.2H18c-.4 0-.7.2-.9.6l-2.1 6.4h1.6l.3-.9h2l.2.9h1.4L20 9zm-1.8 5.1.7-2.1.4 2.1h-1.1zm-7.6-5.1h-2L6.1 17h1.6l2.1-5.1.8 5.1h1.5l-2.6-8z" fill="#D4AF37"/></svg>`,
    mastercard: `<svg width="40" height="24" viewBox="0 0 24 24"><circle cx="8" cy="12" r="8" fill="#eb001b" opacity="0.9"/><circle cx="16" cy="12" r="8" fill="#ff5f00" opacity="0.9"/></svg>`,
    amex: `<svg width="45" height="24" viewBox="0 0 100 40"><rect width="100" height="40" rx="4" fill="#007bc1"/><text x="10" y="27" fill="#fff" font-size="20" font-weight="bold" font-family="Arial">AMEX</text></svg>`,
    generic: `<svg width="35" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`
  };

  function detectCardBrand(number) {
    const clean = number.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
    if (/^(34|37)/.test(clean)) return 'amex';
    return 'generic';
  }

  function initPaymentEvents() {
    const cardNumberInput = document.getElementById('pay-card-number');
    const cardHolderInput = document.getElementById('pay-card-holder');
    const cardExpiryInput = document.getElementById('pay-card-expiry');
    const cardCvvInput = document.getElementById('pay-card-cvv');
    const innerCard = document.getElementById('payment-card-inner');

    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
          if (i > 0 && i % 4 === 0) formatted += ' ';
          formatted += value[i];
        }
        e.target.value = formatted;
        document.getElementById('card-preview-number').textContent = formatted || '•••• •••• •••• ••••';
        
        const brand = detectCardBrand(formatted);
        const logoHtml = brandLogos[brand] || brandLogos.generic;
        document.getElementById('card-logo-front').innerHTML = logoHtml;
        document.getElementById('card-logo-back').innerHTML = logoHtml;
      });
    }

    if (cardHolderInput) {
      cardHolderInput.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase();
        e.target.value = value;
        document.getElementById('card-preview-holder').textContent = value || 'Nombre Completo';
      });
    }

    if (cardExpiryInput) {
      cardExpiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
          e.target.value = value.slice(0, 2) + '/' + value.slice(2, 4);
        } else {
          e.target.value = value;
        }
        document.getElementById('card-preview-expiry').textContent = e.target.value || 'MM/YY';
      });
    }

    if (cardCvvInput) {
      cardCvvInput.addEventListener('focus', () => {
        innerCard.classList.add('flipped');
      });
      cardCvvInput.addEventListener('blur', () => {
        innerCard.classList.remove('flipped');
      });
      cardCvvInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value;
        document.getElementById('card-preview-cvv').textContent = '•'.repeat(value.length) || '•••';
      });
    }
  }

  function loadLeaflet(callback) {
    if (window.L) {
      callback();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = callback;
    document.head.appendChild(script);
  }

  window.Payment = {
    method: 'online',
    orderType: 'delivery',
    step: 1,
    total: 0,
    gpsLink: '',
    map: null,
    marker: null,

    updateWarningVisibility: function() {
      const warning = document.getElementById('payment-demo-warning');
      if (warning) {
        if (this.step === 2 && this.method === 'online') {
          warning.classList.add('visible');
        } else {
          warning.classList.remove('visible');
        }
      }
    },

    open: function() {
      let total = 0;
      cart.forEach(item => {
        total += item.price * item.qty;
      });
      this.total = total;
      
      const submitBtnText = document.getElementById('pay-btn-text');
      if (submitBtnText) {
        submitBtnText.textContent = `Confirmar y Pagar (${window.App.formatPrice(total)})`;
      }

      this.gpsLink = '';

      // Cargar sucursales dinámicamente desde Firebase
      const select = document.getElementById('pay-branch-select');
      if (select) {
        select.innerHTML = '<option value="">Cargando sucursales...</option>';
        if (db) {
          db.ref('branches').once('value').then(snap => {
            const val = snap.val();
            if (val) {
              select.innerHTML = '';
              Object.keys(val).forEach(key => {
                const b = val[key];
                select.innerHTML += `<option value="${b.name}">${b.name} - ${b.address}</option>`;
              });
            } else {
              this.fallbackBranches(select);
            }
          }).catch(() => {
            this.fallbackBranches(select);
          });
        } else {
          this.fallbackBranches(select);
        }
      }
      
      // Auto-relleno de perfil de Firebase si está logueado
      if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
        const user = firebase.auth().currentUser;
        if (db) {
          db.ref(`users/${user.uid}`).once('value').then(snap => {
            const val = snap.val();
            if (val) {
              const holderInput = document.getElementById('pay-card-holder');
              const contactNameInput = document.getElementById('pay-contact-name');
              const contactPhoneInput = document.getElementById('pay-contact-phone');
              const delAddrInput = document.getElementById('pay-delivery-address');
              
              if (holderInput && !holderInput.value) {
                holderInput.value = val.name ? val.name.toUpperCase() : '';
                holderInput.dispatchEvent(new Event('input'));
              }
              if (contactNameInput && !contactNameInput.value) {
                contactNameInput.value = val.name || '';
              }
              if (contactPhoneInput && !contactPhoneInput.value) {
                contactPhoneInput.value = val.phone || '';
              }
              if (delAddrInput && !delAddrInput.value) {
                delAddrInput.value = val.address || '';
              }
            }
          });
        }
      }
      
      // Resetear estados del modal y situar en Paso 1
      document.getElementById('payment-loading-overlay').classList.remove('active');
      document.getElementById('payment-success-overlay').classList.remove('active');
      
      const gpsBtn = document.getElementById('pay-gps-btn');
      const gpsBtnText = document.getElementById('pay-gps-btn-text');
      const gpsBadge = document.getElementById('pay-gps-success-badge');
      if (gpsBtn && gpsBtnText && gpsBadge) {
        gpsBtn.removeAttribute('style');
        gpsBtnText.textContent = '📍 Seleccionar Ubicación desde Maps';
        gpsBadge.style.display = 'none';
      }

      this.setOrderType('delivery');
      this.setStep(1);
      this.closeMapPicker(); // Asegurar que empiece cerrado
      
      // Mostrar modal
      document.body.style.overflow = 'hidden';
      document.getElementById('payment-modal').classList.add('active');
    },

    fallbackBranches: function(select) {
      if (select) {
        select.innerHTML = `
          <option value="Local Principal">Local Principal - Av. Principal 123</option>
          <option value="Sucursal Shopping">Sucursal Shopping - Shopping Center, Planta Baja</option>
        `;
      }
    },

    openMapPicker: function() {
      const picker = document.getElementById('payment-map-picker-modal');
      const parent = document.getElementById('payment-modal');

      if (parent) {
        parent.classList.add('map-active');
      }

      if (picker) {
        // Calcular la posición del botón que dispara la animación
        const btn = document.getElementById('pay-gps-btn');
        if (btn) {
          const rect = btn.getBoundingClientRect();
          const btnCenterX = rect.left + rect.width / 2;
          const btnCenterY = rect.top + rect.height / 2;

          // El modal se centra en la pantalla — calculamos el offset desde el centro de la pantalla al botón
          const vpCenterX = window.innerWidth / 2;
          const vpCenterY = window.innerHeight / 2;

          const offsetX = btnCenterX - vpCenterX;
          const offsetY = btnCenterY - vpCenterY;

          // Pasamos el offset como variables CSS para que la animación nazca desde el botón
          picker.style.setProperty('--map-origin-x', `${offsetX}px`);
          picker.style.setProperty('--map-origin-y', `${offsetY}px`);
        }

        // Forzar el estado inicial antes de añadir .active para que la transición arranque desde el botón
        picker.classList.remove('active');
        void picker.offsetWidth; // reflow para resetear la transición
        picker.classList.add('active');
      }

      loadLeaflet(() => {
        let lat = -25.2867;
        let lng = -57.6111;

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
              this.initMap(lat, lng);
            },
            () => {
              this.initMap(lat, lng);
            },
            { timeout: 4000 }
          );
        } else {
          this.initMap(lat, lng);
        }
      });
    },

    initMap: function(lat, lng) {
      const container = document.getElementById('leaflet-map-container');
      if (!container) return;

      if (this.map) {
        this.map.remove();
      }

      this.map = L.map('leaflet-map-container').setView([lat, lng], 15);

      const isLight = document.documentElement.classList.contains('light') || document.body.classList.contains('light');
      const tilesUrl = isLight 
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tilesUrl, {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.marker = L.marker([lat, lng], {
        draggable: true
      }).addTo(this.map);

      this.map.on('click', (e) => {
        if (this.marker) {
          this.marker.setLatLng(e.latlng);
        }
      });

      // Solucionar renderizado de celdas en contenedores dinámicos
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 350);
    },

    locateUser: function() {
      if (!navigator.geolocation) {
        window.showToast('La geolocalización no es compatible con tu navegador.', 'warning');
        return;
      }
      
      const btn = document.querySelector('[onclick="window.Payment.locateUser()"] span');
      if (btn) btn.textContent = "Obteniendo GPS...";

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          if (this.map && this.marker) {
            this.map.setView([lat, lng], 17);
            this.marker.setLatLng([lat, lng]);
          }
          if (btn) btn.textContent = "Usar mi Ubicación Actual";
        },
        (error) => {
          console.error(error);
          if (btn) btn.textContent = "Usar mi Ubicación Actual";
          window.showToast('No pudimos acceder a tu ubicación GPS. Activa el GPS o arrastra el marcador manualmente.', 'warning');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    },

    confirmMapLocation: function() {
      if (this.marker) {
        const latlng = this.marker.getLatLng();
        this.gpsLink = `https://www.google.com/maps?q=${latlng.lat},${latlng.lng}`;

        const btnText = document.getElementById('pay-gps-btn-text');
        const badge = document.getElementById('pay-gps-success-badge');
        const btn = document.getElementById('pay-gps-btn');

        if (btnText && badge && btn) {
          btnText.textContent = "📍 Ubicación Maps Guardada";
          btn.style.borderColor = "#4caf50";
          btn.style.color = "#4caf50";
          badge.style.display = "flex";
        }
      }
      this.closeMapPicker();
    },

    closeMapPicker: function() {
      const picker = document.getElementById('payment-map-picker-modal');
      if (picker) {
        picker.classList.remove('active');
      }
      const parent = document.getElementById('payment-modal');
      if (parent) {
        parent.classList.remove('map-active');
      }
    },

    close: function() {
      document.body.style.overflow = '';
      document.getElementById('payment-modal').classList.remove('active');
      this.closeMapPicker(); // Asegurar que el selector de mapa se cierre si estaba abierto
      this.setStep(1); // Restablecer al Paso 1
    },

    /* Muestra/oculta un elemento con transición suave de altura + opacidad.
       Retorna una Promise que resuelve al terminar. */
    _animateSection: function(el, show, displayType = 'block') {
      return new Promise(resolve => {
        if (!el) { resolve(); return; }

        const isHidden = el.style.display === 'none' || getComputedStyle(el).display === 'none';

        // Evitar animar si ya está en el estado deseado
        if (show && !isHidden) { resolve(); return; }
        if (!show && isHidden) { resolve(); return; }

        // Cancelar transición anterior si la hay
        el.style.transition = '';
        clearTimeout(el._animTimer);

        if (show) {
          el.style.display = displayType;
          el.style.overflow = 'hidden';
          el.style.opacity = '0';
          el.style.maxHeight = '0px';
          void el.offsetWidth; // reflow
          el.style.transition = 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s ease';
          el.style.maxHeight = el.scrollHeight + 'px';
          el.style.opacity = '1';
          el._animTimer = setTimeout(() => {
            el.style.maxHeight = '';
            el.style.overflow  = '';
            el.style.transition = '';
            resolve();
          }, 420);
        } else {
          el.style.overflow = 'hidden';
          el.style.maxHeight = el.scrollHeight + 'px';
          el.style.opacity = '1';
          void el.offsetWidth; // reflow
          el.style.transition = 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.26s ease';
          el.style.maxHeight = '0px';
          el.style.opacity = '0';
          el._animTimer = setTimeout(() => {
            el.style.display = 'none';
            el.style.maxHeight = '';
            el.style.overflow  = '';
            el.style.transition = '';
            resolve();
          }, 360);
        }
      });
    },

    setStep: function(num) {
      this.step = num;
      const s1 = document.getElementById('payment-step-1');
      const s2 = document.getElementById('payment-step-2');
      const step1Indicator = document.getElementById('step-indicator-1');
      const step2Indicator = document.getElementById('step-indicator-2');
      const container = document.querySelector('#payment-modal .payment-modal-container');

      // Bloquear overflow durante la transición → elimina el flash de scrollbar
      if (container) {
        container.style.overflowY = 'hidden';
        clearTimeout(this._overflowTimer);
        // 800ms > suma de las dos animaciones (360 + 420)
        this._overflowTimer = setTimeout(() => {
          container.style.overflowY = '';
        }, 820);
      }

      if (num === 1) {
        // Actualizar indicadores inmediatamente
        step1Indicator.classList.add('active');
        step1Indicator.classList.remove('completed');
        step2Indicator.classList.remove('active');
        if (container) container.classList.add('step1-active');
        // Ocultar s2 primero, luego mostrar s1
        this._animateSection(s2, false).then(() => this._animateSection(s1, true));
      } else {
        // Actualizar indicadores inmediatamente
        step1Indicator.classList.add('completed');
        step1Indicator.classList.remove('active');
        step2Indicator.classList.add('active');
        if (container) container.classList.remove('step1-active');
        // Ocultar s1 primero, luego mostrar s2
        this._animateSection(s1, false).then(() => this._animateSection(s2, true));
      }
      this.updateWarningVisibility();
    },

    nextStep: function() {
      const name = document.getElementById('pay-contact-name').value.trim();
      const phone = document.getElementById('pay-contact-phone').value.trim();
      
      if (!name) {
        window.showToast('Por favor ingresa tu nombre de contacto.', 'warning');
        return;
      }
      if (phone.length < 6) {
        window.showToast('Por favor ingresa un teléfono de contacto válido.', 'warning');
        return;
      }
      
      if (this.orderType === 'delivery') {
        const address = document.getElementById('pay-delivery-address').value.trim();
        if (!address && !this.gpsLink) {
          window.showToast('Por favor agrega tu ubicación desde Maps (GPS) o ingresa indicaciones de entrega.', 'warning');
          return;
        }
      } else {
        const branch = document.getElementById('pay-branch-select').value;
        if (!branch) {
          window.showToast('Por favor selecciona una sucursal para retirar tu pedido.', 'warning');
          return;
        }
      }
      
      this.setStep(2);
    },

    prevStep: function() {
      this.setStep(1);
    },

    setOrderType: function(type) {
      this.orderType = type;
      const btnDom = document.getElementById('delivery-opt-domicilio');
      const btnLoc = document.getElementById('delivery-opt-local');
      const grpAddress = document.getElementById('pay-delivery-address-group');
      const grpBranch = document.getElementById('pay-branch-select-group');
      
      if (type === 'delivery') {
        btnDom.classList.add('active');
        btnLoc.classList.remove('active');
        this._animateSection(grpBranch, false);
        this._animateSection(grpAddress, true);
      } else {
        btnDom.classList.remove('active');
        btnLoc.classList.add('active');
        this._animateSection(grpAddress, false);
        this._animateSection(grpBranch, true);
      }
    },

    setMethod: function(method) {
      this.method = method;
      const btnOnline = document.getElementById('pay-method-online');
      const btnDelivery = document.getElementById('pay-method-delivery');
      const secOnline = document.getElementById('payment-online-section');
      const secDelivery = document.getElementById('payment-delivery-section');
      const submitBtnText = document.getElementById('pay-btn-text');
      
      if (method === 'online') {
        btnOnline.classList.add('active');
        btnDelivery.classList.remove('active');
        this._animateSection(secDelivery, false, 'flex');
        this._animateSection(secOnline, true, 'flex');
        submitBtnText.textContent = `Confirmar y Pagar (${window.App.formatPrice(this.total)})`;
      } else {
        btnOnline.classList.remove('active');
        btnDelivery.classList.add('active');
        this._animateSection(secOnline, false, 'flex');
        this._animateSection(secDelivery, true, 'flex');
        submitBtnText.textContent = `Finalizar por WhatsApp (${window.App.formatPrice(this.total)})`;
      }
      this.updateWarningVisibility();
    },

    submit: async function() {
      const cfg = window.App.config;
      let orderId = db ? db.ref('orders').push().key : 'order_' + Date.now();
      const name = document.getElementById('pay-contact-name').value.trim();
      const phone = document.getElementById('pay-contact-phone').value.trim();
      const address = this.orderType === 'delivery' ? document.getElementById('pay-delivery-address').value.trim() : '';
      const branch = this.orderType === 'pickup' ? document.getElementById('pay-branch-select').value : '';

      if (this.method === 'online') {
        const number = document.getElementById('pay-card-number').value.trim();
        const holder = document.getElementById('pay-card-holder').value.trim();
        const expiry = document.getElementById('pay-card-expiry').value.trim();
        const cvv = document.getElementById('pay-card-cvv').value.trim();
        
        if (number.length < 15) {
          window.showToast('Por favor ingresa un número de tarjeta válido.', 'error');
          return;
        }
        if (!holder) {
          window.showToast('Por favor ingresa el nombre del titular.', 'error');
          return;
        }
        if (expiry.length < 5) {
          window.showToast('Por favor ingresa la fecha de vencimiento (MM/YY).', 'error');
          return;
        }
        if (cvv.length < 3) {
          window.showToast('Por favor ingresa un código CVV válido.', 'error');
          return;
        }
        
        // Simulación de carga segura
        document.getElementById('payment-loading-overlay').classList.add('active');
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Guardar orden pagada en Firebase
        const orderData = {
          id: orderId,
          items: cart,
          total: this.total,
          orderType: this.orderType,
          contactName: name,
          contactPhone: phone,
          shippingAddress: address,
          gpsLink: this.gpsLink,
          pickupBranch: branch,
          paymentMethod: 'online',
          paymentDetails: {
            cardBrand: detectCardBrand(number),
            last4: number.replace(/\s+/g, '').slice(-4),
            holderName: holder
          },
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          status: 'paid',
          userId: firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'guest'
        };
        
        if (db) {
          await db.ref(`orders/${orderId}`).set(orderData);
        }
        
        document.getElementById('payment-loading-overlay').classList.remove('active');
        document.getElementById('payment-success-overlay').classList.add('active');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mensaje formateado para WhatsApp indicando pago realizado
        let message = `*Pedido PAGADO ONLINE - ${cfg.restaurantName}*\n`;
        message += `*ID de Transacción:* #${orderId.substring(1, 8).toUpperCase()}\n\n`;
        
        cart.forEach(item => {
          message += `• ${item.qty}x ${item.name} - ${window.App.formatPrice(item.price * item.qty)}\n`;
        });
        
        message += `\n*Total Pagado:* ${window.App.formatPrice(this.total)}\n`;
        message += `*Método:* Pago Online (Tarjeta terminada en ${number.slice(-4)})\n`;
        message += `*Titular:* ${holder}\n\n`;
        
        message += `*Detalles de Entrega:*\n`;
        message += `• *Contacto:* ${name}\n`;
        message += `• *Teléfono:* ${phone}\n`;
        if (this.orderType === 'delivery') {
          if (address) message += `• *Dirección:* ${address}\n`;
          if (this.gpsLink) message += `• *Ubicación Maps:* ${this.gpsLink}\n`;
        } else {
          message += `• *Retiro en:* ${branch}\n`;
        }
        message += `\n_Pago procesado y acreditado de forma segura_`;
        
        cart = [];
        save();
        this.close();
        window.Cart.close();
        
        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/${cfg.whatsappNumber}?text=${encoded}`, '_blank');
        
      } else {
        // Guardar orden contra entrega en Firebase
        const orderData = {
          id: orderId,
          items: cart,
          total: this.total,
          orderType: this.orderType,
          contactName: name,
          contactPhone: phone,
          shippingAddress: address,
          gpsLink: this.gpsLink,
          pickupBranch: branch,
          paymentMethod: 'delivery',
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          status: 'pending',
          userId: firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'guest'
        };
        
        if (db) {
          await db.ref(`orders/${orderId}`).set(orderData);
        }
        
        let message = `*Nuevo Pedido Contra Entrega - ${cfg.restaurantName}*\n`;
        message += `*ID de Pedido:* #${orderId.substring(1, 8).toUpperCase()}\n\n`;
        
        cart.forEach(item => {
          message += `• ${item.qty}x ${item.name} - ${window.App.formatPrice(item.price * item.qty)}\n`;
        });
        
        message += `\n*Total a Pagar:* ${window.App.formatPrice(this.total)}\n`;
        message += `*Método:* Pago Contra Entrega\n\n`;
        
        message += `*Detalles de Entrega:*\n`;
        message += `• *Contacto:* ${name}\n`;
        message += `• *Teléfono:* ${phone}\n`;
        if (this.orderType === 'delivery') {
          if (address) message += `• *Dirección:* ${address}\n`;
          if (this.gpsLink) message += `• *Ubicación Maps:* ${this.gpsLink}\n`;
        } else {
          message += `• *Retiro en:* ${branch}\n`;
        }
        message += `\n_Pedido enviado desde la web_`;
        
        cart = [];
        save();
        this.close();
        window.Cart.close();
        
        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/${cfg.whatsappNumber}?text=${encoded}`, '_blank');
      }
    }
  };

  const paymentModalHTML = `
    <div class="payment-modal" id="payment-modal">
      <div class="payment-modal-overlay" onclick="window.Payment.close()"></div>
      <div class="demo-warning-banner" id="payment-demo-warning">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        <span>Versión Demo. No ingresar datos reales o sensibles.</span>
      </div>
      <div class="payment-modal-container">
        <button class="payment-modal-close" onclick="window.Payment.close()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h2 class="payment-title">Completar Pedido</h2>
        
        <!-- Indicador de Pasos -->
        <div class="payment-steps">
          <div class="payment-step active" id="step-indicator-1">
            <div class="payment-step-num">1</div>
            <span>Ubicación</span>
          </div>
          <div class="payment-steps-line"></div>
          <div class="payment-step" id="step-indicator-2">
            <div class="payment-step-num">2</div>
            <span>Pago</span>
          </div>
        </div>
        
        <!-- PASO 1: DATOS DE ENTREGA -->
        <div id="payment-step-1" class="payment-form-section">
          <!-- Tipo de Entrega -->
              <div class="delivery-options" style="margin-bottom: 1.2rem;">
                <button class="delivery-option-btn active" id="delivery-opt-domicilio" onclick="window.Payment.setOrderType('delivery')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  <span>A Domicilio</span>
                </button>
                <button class="delivery-option-btn" id="delivery-opt-local" onclick="window.Payment.setOrderType('pickup')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span>Retiro en Local</span>
                </button>
              </div>

              <!-- Nombre de Contacto -->
              <div class="payment-input-group">
                <label for="pay-contact-name">Nombre de Contacto</label>
                <div class="payment-input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input type="text" id="pay-contact-name" placeholder="Tu nombre completo">
                </div>
              </div>

              <!-- Teléfono de Contacto -->
              <div class="payment-input-group">
                <label for="pay-contact-phone">Teléfono de Contacto</label>
                <div class="payment-input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <input type="tel" id="pay-contact-phone" placeholder="Ej: 0981 123456">
                </div>
              </div>

              <!-- Dirección / Ubicación de Entrega -->
              <div class="payment-input-group" id="pay-delivery-address-group">
                <label>Ubicación de Entrega</label>
                <div style="margin-bottom: 0.8rem;">
                  <button type="button" class="gps-maps-btn" id="pay-gps-btn" onclick="window.Payment.openMapPicker()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span id="pay-gps-btn-text">📍 Seleccionar Ubicación desde Maps</span>
                  </button>
                  <div id="pay-gps-success-badge" style="display: none; align-items: center; justify-content: center; gap: 6px; color: #4caf50; font-size: 0.85rem; font-weight: 600; margin-top: 6px; animation: slideDown 0.3s;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>¡Ubicación cargada con éxito! (Solo visible por el local)</span>
                  </div>
                </div>
                <div class="payment-input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                  <input type="text" id="pay-delivery-address" placeholder="Indicaciones adicionales (Ej: Casa de dos pisos, portón azul)">
                </div>
              </div>

              <!-- Sucursal de Retiro -->
              <div class="payment-input-group" id="pay-branch-select-group" style="display: none;">
                <label for="pay-branch-select">Seleccionar Sucursal de Retiro</label>
                <select id="pay-branch-select" class="payment-select-branch">
                  <!-- Cargado dinámicamente -->
                </select>
              </div>

              <button class="payment-btn-submit" onclick="window.Payment.nextStep()" style="margin-top: 1rem;">
                <span>Continuar al Pago</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>

        <!-- PASO 2: DATOS DE PAGO -->
        <div id="payment-step-2" class="payment-form-section" style="display: none;">
          <div class="payment-methods" style="margin-bottom: 1.2rem;">
            <button class="pay-method-btn active" id="pay-method-online" onclick="window.Payment.setMethod('online')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <span>Pago Online</span>
            </button>
            <button class="pay-method-btn" id="pay-method-delivery" onclick="window.Payment.setMethod('delivery')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              <span>Contra Entrega</span>
            </button>
          </div>
          
          <!-- Sección de Pago Online -->
          <div id="payment-online-section" class="payment-form-section">
            <div class="payment-card-container">
              <div class="payment-card-inner" id="payment-card-inner">
                <!-- Cara frontal -->
                <div class="payment-card-face payment-card-front">
                  <div class="card-chip"></div>
                  <div class="card-logo" id="card-logo-front"></div>
                  <div class="card-number" id="card-preview-number">•••• •••• •••• ••••</div>
                  <div class="card-extra">
                    <div class="card-holder">
                      <span class="card-label">Titular</span>
                      <span class="card-value" id="card-preview-holder">Nombre Completo</span>
                    </div>
                    <div class="card-expiry">
                      <span class="card-label">Expira</span>
                      <span class="card-value" id="card-preview-expiry">MM/YY</span>
                    </div>
                  </div>
                </div>
                <!-- Cara trasera -->
                <div class="payment-card-face payment-card-back">
                  <div class="card-magnetic-strip"></div>
                  <div class="card-signature-area">
                    <span class="card-label" style="color: #fff; margin-left: 5px;">CVV</span>
                    <div class="card-signature-bar" id="card-preview-cvv">•••</div>
                  </div>
                  <div class="card-logo" id="card-logo-back" style="bottom: 1.5rem; top: auto; right: 1.5rem;"></div>
                </div>
              </div>
            </div>
            
            <div class="payment-input-group">
              <label for="pay-card-number">Número de Tarjeta</label>
              <div class="payment-input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                <input type="text" id="pay-card-number" placeholder="4000 1234 5678 9010" maxlength="19" autocomplete="cc-number">
              </div>
            </div>
            
            <div class="payment-input-group">
              <label for="pay-card-holder">Nombre del Titular</label>
              <div class="payment-input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input type="text" id="pay-card-holder" placeholder="Ej: JUAN PEREZ" maxlength="25">
              </div>
            </div>
            
            <div class="payment-form-row">
              <div class="payment-input-group">
                <label for="pay-card-expiry">Vencimiento</label>
                <div class="payment-input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <input type="text" id="pay-card-expiry" placeholder="MM/YY" maxlength="5">
                </div>
              </div>
              <div class="payment-input-group">
                <label for="pay-card-cvv">Código CVV</label>
                <div class="payment-input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input type="password" id="pay-card-cvv" placeholder="•••" maxlength="4">
                </div>
              </div>
            </div>
          </div>
          
          <!-- Sección de Contra Entrega -->
          <div id="payment-delivery-section" class="payment-form-section" style="display: none;">
            <p style="color: var(--site-text-muted); font-size: 0.9rem; line-height: 1.6; text-align: center; margin: 0.5rem 0;">
              Al elegir <strong>Contra Entrega</strong>, coordinarás los detalles del envío y pagarás al repartidor en efectivo o tarjeta física cuando recibas tu pedido.
            </p>
          </div>

          <!-- Botones de Acción Paso 2 -->
          <div class="payment-footer-row" style="margin-top: 1.5rem;">
            <button class="payment-btn-back" onclick="window.Payment.prevStep()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              <span>Atrás</span>
            </button>
            <button class="payment-btn-submit" onclick="window.Payment.submit()" style="margin: 0;">
              <span id="pay-btn-text">Confirmar y Pagar (0 Gs.)</span>
            </button>
          </div>
        </div>
        
        <!-- Cargador / Éxito Overlays -->
        <div class="payment-status-overlay" id="payment-loading-overlay">
          <div class="payment-spinner"></div>
          <h3>Procesando Pago</h3>
          <p>Estamos autorizando la transacción con tu banco de forma segura. No cierres esta ventana.</p>
        </div>
        
        <div class="payment-status-overlay" id="payment-success-overlay">
          <div class="checkmark-circle">
            <div class="checkmark-kick"></div>
            <div class="checkmark-stem"></div>
          </div>
          <h3>¡Pago Exitoso!</h3>
          <p>Tu orden ha sido procesada correctamente y el pago está acreditado. Redirigiéndote a WhatsApp para confirmar los detalles de entrega...</p>
        </div>
      </div>
    </div>

    <!-- Buscador de Ubicación Interactivo (Leaflet) - MODAL COMPLETAMENTE SEPARADO -->
    <div id="payment-map-picker-modal" class="payment-modal" style="z-index: 6000;">
      <div class="payment-modal-overlay" onclick="window.Payment.closeMapPicker()"></div>
      <div class="payment-modal-container" style="max-width: 500px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; height: 80vh; max-height: 600px; position: relative;">
        <button class="payment-modal-close" onclick="window.Payment.closeMapPicker()" style="top: 1.2rem; right: 1.2rem; background: none; border: none; color: var(--site-text-muted); cursor: pointer; transition: color 0.2s;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <p style="color: var(--site-text-muted); font-size: 0.85rem; margin: 0; line-height: 1.4; padding-right: 2rem; margin-top: 0.5rem;">
          Arrastra el marcador rojo exacto sobre tu casa o haz clic en tu posición. Puedes hacer zoom en tu barrio.
        </p>
        
        <button type="button" class="gps-maps-btn" onclick="window.Payment.locateUser()" style="padding: 0.65rem; font-size: 0.85rem; background: rgba(212, 175, 55, 0.1); border-color: rgba(212, 175, 55, 0.35); color: var(--color-accent); height: auto; min-height: 0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>Usar mi Ubicación Actual</span>
        </button>
        
        <!-- Lienzo del Mapa -->
        <div id="leaflet-map-container" style="flex: 1; min-height: 280px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; background: #222;"></div>
        
        <button class="payment-btn-submit" onclick="window.Payment.confirmMapLocation()" style="margin: 0;">
          <span>Confirmar esta Ubicación</span>
        </button>
      </div>
    </div>
  `;

  document.addEventListener('DOMContentLoaded', init);
})();
