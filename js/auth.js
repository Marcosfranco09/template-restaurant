/**
 * auth.js — Lógica de autenticación y gestión de perfil
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

function setButtonLoading(btn, isLoading, originalText = null) {
  if (!btn) return;
  if (isLoading) {
    if (!btn.dataset.originalText) {
      btn.dataset.originalText = btn.innerHTML;
    }
    btn.disabled = true;
    btn.style.width = btn.offsetWidth + 'px'; // Mantiene el ancho exacto
    btn.innerHTML = `<span class="btn-spinner"></span>`;
  } else {
    btn.disabled = false;
    btn.style.width = '';
    if (originalText) {
      btn.innerHTML = originalText;
      btn.dataset.originalText = originalText;
    } else {
      btn.innerHTML = btn.dataset.originalText;
    }
  }
}

function initAuth() {
  if (typeof firebase === 'undefined') return;

  // Advertencia de protocolo local file:// (impide persistencia de sesión en Firebase)
  if (window.location.protocol === 'file:') {
    console.warn(
      '⚠️ [Firebase Auth] Estás ejecutando el sitio usando el protocolo local "file://".\n' +
      'Los navegadores modernos bloquean y aíslan LocalStorage/IndexedDB en páginas locales por seguridad.\n' +
      'Para que la sesión de Firebase persista entre páginas (index, perfil, productos), DEBES ejecutar el proyecto bajo un servidor local.\n' +
      '👉 Recomendación: Usa la extensión "Live Server" de VS Code (Clic derecho en index.html -> Open with Live Server) o ejecuta "npx http-server" en la terminal.'
    );
  }

  // ─── Observador del estado de autenticación ───────────────────────────────
  firebase.auth().onAuthStateChanged(user => {
    updateAuthUI(user);
    if (user) {
      loadUserProfile(user);
      loadUserOrders(user.uid);
    } else {
      // Redirección si es necesario
      if (window.location.pathname.includes('perfil.html')) {
        window.location.href = 'login.html';
      }
    }
  });

  // ─── Login con Google ──────────────────────────────────────────────────────
  const btnGoogle = document.getElementById('btn-google-login');
  if (btnGoogle) {
    btnGoogle.addEventListener('click', (e) => {
      e.preventDefault();
      setButtonLoading(btnGoogle, true);
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider)
        .then(result => {
          if (result.additionalUserInfo.isNewUser) {
            const user = result.user;
            window.App.saveUserProfile(user.uid, {
              name: capitalize(user.displayName || ''),
              email: user.email || '',
              phone: '',
              address: ''
            });
          }
          window.location.href = 'index.html';
        })
        .catch(error => {
          setButtonLoading(btnGoogle, false);
          console.error("Error Google Login:", error);
          showAuthError('login-error', "Error al conectar con Google.");
        });
    });
  }

  // ─── Login con Email ───────────────────────────────────────────────────────
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = formLogin.querySelector('button[type="submit"]');
      setButtonLoading(btn, true);
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      firebase.auth().signInWithEmailAndPassword(email, pass)
        .then(() => window.location.href = 'index.html')
        .catch(error => {
          setButtonLoading(btn, false);
          showAuthError('login-error', "Credenciales incorrectas.");
        });
    });
  }

  // ─── Registro con Email ────────────────────────────────────────────────────
  const formRegister = document.getElementById('form-register');
  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = formRegister.querySelector('button[type="submit"]');
      setButtonLoading(btn, true);
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-password').value;
      firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then(result => {
          window.App.saveUserProfile(result.user.uid, {
            name: capitalize(name),
            email: email,
            phone: '',
            address: ''
          });
          window.location.href = 'index.html';
        })
        .catch(error => {
          setButtonLoading(btn, false);
          showAuthError('reg-error', "Error al crear la cuenta.");
        });
    });
  }

  // ─── Guardar Perfil ────────────────────────────────────────────────────────
  const formProfile = document.getElementById('form-profile');
  if (formProfile) {
    formProfile.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = firebase.auth().currentUser;
      if (!user) return;

      const profileData = {
        name: capitalize(document.getElementById('prof-name').value),
        phone: document.getElementById('prof-phone').value,
        address: document.getElementById('prof-address').value,
        email: user.email
      };

      const btn = document.getElementById('btn-save-profile');
      setButtonLoading(btn, true);

      window.App.saveUserProfile(user.uid, profileData)
        .then(() => {
          const successEl = document.getElementById('save-success');
          if (successEl) {
            successEl.classList.add('show');
            setTimeout(() => successEl.classList.remove('show'), 3000);
          }
          setButtonLoading(btn, false, 'Guardar Cambios');
          updateNavbarText(profileData.name.split(' ')[0]);
        })
        .catch(() => {
          btn.textContent = 'Guardar Cambios';
        });
    });
  }

  // ─── Logout Global ─────────────────────────────────────────────────────────
  window.handleLogout = () => {
    firebase.auth().signOut().then(() => window.location.href = 'index.html');
  };

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
}

// ─── Funciones de UI ─────────────────────────────────────────────────────────

function updateAuthUI(user) {
  const containers = [
    document.getElementById('nav-auth-container'),
    document.getElementById('nav-auth-container-mobile')
  ];
  
  const dropdowns = [
    document.getElementById('nav-auth-dropdown'),
    document.getElementById('nav-auth-dropdown-mobile')
  ];

  if (user) {
    const nameToShow = user.displayName ? user.displayName.split(' ')[0] : 'Cuenta';
    updateNavbarText(capitalize(nameToShow));

    const navAuthLink = document.getElementById('nav-auth');
    const navAuthLinkMobile = document.getElementById('nav-auth-mobile');
    const arrowMobile = document.getElementById('nav-auth-arrow-mobile');
    
    if (navAuthLink) navAuthLink.href = 'perfil.html';
    if (navAuthLinkMobile) navAuthLinkMobile.href = 'perfil.html';
    if (arrowMobile) arrowMobile.style.display = 'block';
    
    // Poblar dropdowns
    const dropdownHTML = `
      <a href="perfil.html" class="dropdown-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Mi Perfil
      </a>
      <div class="dropdown-item danger" onclick="handleLogout()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Cerrar Sesión
      </div>
    `;
    
    dropdowns.forEach(d => { if(d) d.innerHTML = dropdownHTML; });
    containers.forEach(c => { if(c) c.classList.add('logged-in'); });

    // Configurar toggle para mobile y prevenir navegación directa en desktop si hay dropdown
    containers.forEach(c => {
      if(!c) return;
      
      const link = c.querySelector('a');
      if(link) {
        // Remover listener anterior para evitar duplicados si se llama varias veces
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', (e) => {
          if (window.innerWidth <= 768 || c.id.includes('mobile')) {
            e.preventDefault();
            c.classList.toggle('active');
            
            // Rotar flecha si es mobile
            if (c.id.includes('mobile')) {
              const arrow = c.querySelector('#nav-auth-arrow-mobile');
              if (arrow) {
                arrow.style.transform = c.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
              }
            }
          }
        });
      }
    });

    // Actualizar perfil si estamos en perfil.html
    const sideName = document.getElementById('user-display-name');
    const sideEmail = document.getElementById('user-display-email');
    const avatar = document.getElementById('user-avatar-circle');
    if (sideName) sideName.textContent = capitalize(user.displayName || 'Usuario');
    if (sideEmail) sideEmail.textContent = user.email;
    if (avatar) avatar.textContent = (user.displayName || user.email || '?')[0].toUpperCase();
    
  } else {
    updateNavbarText('Iniciar Sesión');
    dropdowns.forEach(d => { if(d) d.innerHTML = ''; });
    containers.forEach(c => { 
      if(c) {
        c.classList.remove('active'); 
        c.classList.remove('logged-in');
      }
    });
    
    const navAuthLink = document.getElementById('nav-auth');
    const navAuthLinkMobile = document.getElementById('nav-auth-mobile');
    const arrowMobile = document.getElementById('nav-auth-arrow-mobile');
    
    if (navAuthLink) navAuthLink.href = 'login.html';
    if (navAuthLinkMobile) navAuthLinkMobile.href = 'login.html';
    if (arrowMobile) {
      arrowMobile.style.display = 'none';
      arrowMobile.style.transform = 'rotate(0deg)';
    }
  }
}

function updateNavbarText(text) {
  const navAuthText = document.getElementById('nav-auth-text');
  const navAuthTextMobile = document.getElementById('nav-auth-text-mobile');
  if (navAuthText) navAuthText.textContent = text;
  if (navAuthTextMobile) navAuthTextMobile.textContent = text;
}

function loadUserProfile(user) {
  window.App.getUserProfile(user.uid).then(profile => {
    if (profile && profile.name) {
      updateNavbarText(capitalize(profile.name.split(' ')[0]));
      
      const sideName = document.getElementById('user-display-name');
      const profNameInput = document.getElementById('prof-name');
      const avatar = document.getElementById('user-avatar-circle');
      
      if (sideName) sideName.textContent = capitalize(profile.name);
      if (profNameInput) profNameInput.value = capitalize(profile.name);
      if (avatar) avatar.textContent = profile.name[0].toUpperCase();
      
      if (document.getElementById('prof-phone')) document.getElementById('prof-phone').value = profile.phone || '';
      if (document.getElementById('prof-address')) document.getElementById('prof-address').value = profile.address || '';
    }
  });
}

async function loadUserOrders(userId) {
  const container = document.getElementById('orders-list');
  if (!container) return;

  const orders = await window.App.getUserOrders(userId);
  if (!orders || orders.length === 0) {
    container.innerHTML = `<div class="no-orders"><p>Todavía no realizaste ningún pedido.</p><a href="productos.html" class="btn btn-outline" style="margin-top:15px">Ver la Carta</a></div>`;
    return;
  }

  orders.sort((a, b) => (b.date || 0) - (a.date || 0));

  container.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-info">
        <h4>Pedido #${order.id.slice(-6).toUpperCase()}</h4>
        <p>${new Date(order.date).toLocaleDateString()} — ${window.App.formatPrice(order.total || 0)}</p>
      </div>
      <div class="order-status status-${(order.status || 'pending').toLowerCase()}">${order.status || 'Pendiente'}</div>
    </div>
  `).join('');
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg; el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 5000);
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
