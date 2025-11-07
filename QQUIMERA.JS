// QQUIMERA-NEW.js - funcionalidad principal (sin carrusel)
// A: toggle catálogo (mostrar más)
// B: carrito (localStorage) + render
// C: modal producto
// D: scroll reveal
// E: bindings add-to-cart

document.addEventListener('DOMContentLoaded', () => {
  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // NAV hamburger (simple)
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  function checkNav() {
    if (!navLinks) return;
    if (window.innerWidth <= 768) { hamburger.style.display = 'inline-block'; navLinks.style.display = 'none'; }
    else { hamburger.style.display = 'none'; navLinks.style.display = 'flex'; }
  }
  window.addEventListener('resize', checkNav);
  checkNav();
  hamburger.addEventListener('click', () => {
    if (!navLinks) return;
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  });

  // Toggle catálogo
  const toggleBtn = document.querySelector('.toggle-catalog-btn');
  const extraProducts = document.querySelector('.extra-products');
  if (toggleBtn && extraProducts) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
      extraProducts.style.display = isOpen ? 'none' : 'grid';
      toggleBtn.textContent = isOpen ? 'Mostrar más' : 'Mostrar menos';
      toggleBtn.setAttribute('aria-expanded', !isOpen);
    });
  }

  // CART: simple cart with localStorage
  const CART_KEY = 'qquimera_cart';
  const cartSidebar = document.getElementById('cartSidebar');
  const btnCartToggle = document.getElementById('btnCartToggle');
  const closeCartBtn = document.getElementById('closeCart');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountEl = document.getElementById('cartCount');
  const cartCountAside = document.getElementById('cartCountAside');
  const clearCartBtn = document.getElementById('clearCart');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }

  function addToCart(product) {
    const cart = loadCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.qty = (existing.qty || 1) + 1;
    else cart.push({ ...product, qty: 1 });
    saveCart(cart);
  }

  function removeFromCart(id) {
    let cart = loadCart();
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
  }

  function updateQty(id, qty) {
    const cart = loadCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      saveCart(cart);
    }
  }

  function renderCart() {
    const cart = loadCart();
    cartItemsEl.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
      total += (Number(item.price) || 0) * (Number(item.qty) || 1);
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <div style="display:flex;gap:.6rem;align-items:center;">
          <img src="${item.img || 'img/nuevo logo.png'}" alt="${item.name}">
          <div style="min-width:0">
            <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${item.name}</div>
            <div style="color:var(--muted);font-size:.9rem">${formatCOP(item.price)} · x${item.qty}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.4rem">
          <div style="display:flex;gap:.4rem;align-items:center">
            <button class="btn qty-minus" data-id="${item.id}">-</button>
            <input type="number" min="1" value="${item.qty}" data-id="${item.id}" style="width:56px;padding:.2rem;text-align:center;border-radius:6px;border:1px solid rgba(255,255,255,0.06)"/>
            <button class="btn qty-plus" data-id="${item.id}">+</button>
          </div>
          <button class="btn outline remove-item" data-id="${item.id}">Eliminar</button>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });

    cartTotalEl.textContent = formatCOP(total);
    const count = cart.reduce((s,i)=> s + (i.qty || 0), 0);
    cartCountEl.textContent = count;
    cartCountAside.textContent = count;
    // handlers
    cartItemsEl.querySelectorAll('.remove-item').forEach(b => b.addEventListener('click', e => removeFromCart(e.currentTarget.dataset.id)));
    cartItemsEl.querySelectorAll('.qty-minus').forEach(b => b.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const cart = loadCart();
      const it = cart.find(x=>x.id===id);
      if (it) updateQty(id, Math.max(1, (it.qty||1)-1));
    }));
    cartItemsEl.querySelectorAll('.qty-plus').forEach(b => b.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const cart = loadCart();
      const it = cart.find(x=>x.id===id);
      if (it) updateQty(id, (it.qty||1)+1);
    }));
    cartItemsEl.querySelectorAll('input[type="number"]').forEach(inp => inp.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const val = Math.max(1, Number(e.target.value) || 1);
      updateQty(id, val);
    }));
  }

  function openCart() { cartSidebar.classList.add('open'); cartSidebar.setAttribute('aria-hidden','false'); renderCart(); }
  function closeCart() { cartSidebar.classList.remove('open'); cartSidebar.setAttribute('aria-hidden','true'); }

  btnCartToggle && btnCartToggle.addEventListener('click', openCart);
  closeCartBtn && closeCartBtn.addEventListener('click', closeCart);
  clearCartBtn && clearCartBtn.addEventListener('click', () => { if (confirm('Vaciar carrito?')) { localStorage.removeItem(CART_KEY); renderCart(); }});
  checkoutBtn && checkoutBtn.addEventListener('click', () => {
    const cart = loadCart();
    if (!cart.length) { alert('El carrito está vacío.'); return; }
    alert('Compra simulada. Gracias por tu pedido.');
    localStorage.removeItem(CART_KEY);
    renderCart();
    closeCart();
  });

  // Bind add-to-cart buttons on page
  function bindAddButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = 'true';
      btn.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.product-card');
        const product = {
          id: card.dataset.id || ('p-' + Date.now()),
          name: card.dataset.name || card.querySelector('h3')?.textContent || 'Producto',
          price: Number(card.dataset.price || 0),
          img: card.dataset.img || card.querySelector('img')?.src || 'img/nuevo logo.png'
        };
        addToCart(product);
        btn.textContent = 'Añadido ✓';
        setTimeout(()=> btn.textContent = 'Agregar al carrito', 900);
      });
    });
  }
  bindAddButtons();
  renderCart();

  // PRODUCT MODAL (simple)
  const modal = document.getElementById('productModal');
  const modalMainImg = document.getElementById('modalMainImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalDesc = document.getElementById('modalDesc');
  const modalQty = document.getElementById('modalQty');
  const modalAddToCart = document.getElementById('modalAddToCart');

  function openProductModalFromCard(card) {
    if (!modal) return;
    const title = card.dataset.name || card.querySelector('h3')?.textContent || 'Producto';
    const price = card.dataset.price ? formatCOP(Number(card.dataset.price)) : '';
    const img = card.dataset.img || card.querySelector('img')?.src || '';
    modalMainImg.src = img;
    modalTitle.textContent = title;
    modalPrice.textContent = price;
    modalDesc.textContent = card.dataset.desc || '';
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');

    modalAddToCart.onclick = () => {
      const product = { id: card.dataset.id, name: title, price: Number(card.dataset.price||0), img };
      addToCart(product);
      modal.style.display = 'none';
    };
  }

  document.querySelectorAll('.product-card').forEach(card=>{
    // abrir modal al hacer doble click (UX opcional)
    card.addEventListener('dblclick', ()=> openProductModalFromCard(card));
  });
  document.getElementById('closeProductModal')?.addEventListener('click', ()=> { modal.style.display = 'none'; modal.setAttribute('aria-hidden','true');});
  modal?.addEventListener('click', (e)=> { if (e.target === modal) { modal.style.display = 'none'; modal.setAttribute('aria-hidden','true'); }});

  // SEARCH simple (filtrado por texto)
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      document.querySelectorAll('.product-card').forEach(card => {
        const text = (card.dataset.name || card.textContent || '').toLowerCase();
        card.style.display = q ? (text.includes(q) ? '' : 'none') : '';
      });
    });
  }

  // SCROLL REVEAL: simple observer
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => obs.observe(el));
  } else {
    // fallback: make visible
    revealEls.forEach(el=> el.classList.add('is-visible'));
  }

  // Accessibility: Esc closes modal and cart
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal && (modal.style.display = 'none');
      closeCart();
    }
  });

  // Simple currency formatter
  function formatCOP(v) {
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
    } catch (err) {
      return '$' + (v || 0);
    }
  }

}); // DOMContentLoaded end
// --- RESEÑAS --- //
const reviewsList = document.getElementById("reviewsList");
const reviewForm = document.getElementById("reviewForm");
const reviewAuthor = document.getElementById("reviewAuthor");
const reviewText = document.getElementById("reviewText");
const reviewRating = document.getElementById("reviewRating");
const reviewMsg = document.getElementById("reviewMsg");
const clearReview = document.getElementById("clearReview");

function loadReviews() {
  let reviews = JSON.parse(localStorage.getItem("reviews") || "[]");

  // Si no existen reseñas guardadas, cargamos 3 por defecto:
  if (reviews.length === 0) {
    reviews = [
      { name: "Nicolás R.", text: "Calidad brutal y entrega rápida.", rating: 5 },
      { name: "Laura M.", text: "El diseño es increíble, se siente premium.", rating: 5 },
      { name: "Kevin S.", text: "La talla me quedó perfecta, volveré a comprar.", rating: 4 }
    ];
    localStorage.setItem("reviews", JSON.stringify(reviews));
  }

  reviewsList.innerHTML = reviews.map(r => `
    <div class="review-card">
      <strong>${r.name}</strong>
      <p>"${r.text}"</p>
      <span class="rating">${"★".repeat(r.rating)}</span>
    </div>
  `).join("");
}

reviewForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const review = {
    name: reviewAuthor.value,
    text: reviewText.value,
    rating: Number(reviewRating.value)
  };

  const reviews = JSON.parse(localStorage.getItem("reviews") || "[]");
  reviews.unshift(review);
  localStorage.setItem("reviews", JSON.stringify(reviews));

  loadReviews();
  reviewForm.reset();
  reviewMsg.textContent = "✅ Reseña enviada";

  setTimeout(() => reviewMsg.textContent = "", 1200);
});

clearReview.addEventListener("click", () => {
  reviewForm.reset();
  reviewMsg.textContent = "";
});

// Cargar en arranque
loadReviews();
