/**
 * auth.js — Lógica de autenticación y gestión de perfil
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

function initAuth() {
  if (typeof firebase === 'undefined') return;

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
    btnGoogle.addEventListener('click', () => {
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
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      firebase.auth().signInWithEmailAndPassword(email, pass)
        .then(() => window.location.href = 'index.html')
        .catch(error => showAuthError('login-error', "Credenciales incorrectas."));
    });
  }

  // ─── Registro con Email ────────────────────────────────────────────────────
  const formRegister = document.getElementById('form-register');
  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
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
        .catch(error => showAuthError('reg-error', "Error al crear la cuenta."));
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
      btn.disabled = true;
      btn.textContent = 'Guardando...';

      window.App.saveUserProfile(user.uid, profileData)
        .then(() => {
          document.getElementById('save-success').style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Guardar Cambios';
          updateNavbarText(profileData.name.split(' ')[0]);
          setTimeout(() => document.getElementById('save-success').style.display = 'none', 3000);
        })
        .catch(() => {
          btn.disabled = false;
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
        link.addEventListener('click', (e) => {
          if (window.innerWidth <= 768 || c.id.includes('mobile')) {
            e.preventDefault();
            c.classList.toggle('active');
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
    if (navAuthLink) navAuthLink.href = 'login.html';
    if (navAuthLinkMobile) navAuthLinkMobile.href = 'login.html';
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
