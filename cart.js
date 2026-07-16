const Cart = {
  KEY: 'qb_cart',

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },

  save(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.updateBadge();
    this.updateCartPage();
  },

  add(item) {
    const items = this.get();
    const dup = items.find(i =>
      i.id === item.id && i.variant === item.variant &&
      i.video === item.video && i.extra === item.extra
    );
    if (dup) { dup.qty += item.qty; }
    else { items.push({ ...item, cartId: Date.now() + Math.random() }); }
    this.save(items);
    this.showToast(item.name);
  },

  remove(cartId) {
    this.save(this.get().filter(i => i.cartId !== cartId));
  },

  updateQty(cartId, qty) {
    if (qty <= 0) return this.remove(cartId);
    const items = this.get();
    const item = items.find(i => i.cartId === cartId);
    if (item) item.qty = qty;
    this.save(items);
  },

  clear() { localStorage.removeItem(this.KEY); this.updateBadge(); },

  subtotal() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); },
  totalItems() { return this.get().reduce((s, i) => s + i.qty, 0); },

  updateBadge() {
    const n = this.totalItems();
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = n;
      b.style.display = n > 0 ? 'flex' : 'none';
    });
  },

  showToast(name) {
    let t = document.getElementById('cart-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'cart-toast';
      t.style.cssText = 'position:fixed;top:80px;right:24px;background:#221d18;color:#fff;padding:14px 22px;border-radius:14px;font-size:13px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.25);transition:opacity .3s;font-family:Poppins,sans-serif;max-width:280px;';
      document.body.appendChild(t);
    }
    t.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c3a587" stroke-width="2" style="vertical-align:middle;margin-right:6px;"><path d="M20 6 9 17l-5-5"/></svg> <b>${name}</b> adicionado ao carrinho!`;
    t.style.opacity = '1';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { t.style.opacity = '0'; }, 2200);
  },

  updateCartPage() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    const items = this.get();
    const empty = document.getElementById('cartEmpty');
    const content = document.getElementById('cartContent');

    if (!items.length) {
      if (empty) empty.style.display = 'block';
      if (content) content.style.display = 'none';
      return;
    }
    if (empty) empty.style.display = 'none';
    if (content) content.style.display = 'block';

    container.innerHTML = items.map(i => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-variant">${i.variant || ''}${i.extra ? ' · ' + i.extra : ''}</div>
          <div class="cart-item-price">R$ ${(i.price * i.qty).toFixed(2).replace('.',',')}</div>
        </div>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button onclick="Cart.updateQty(${i.cartId},${i.qty - 1})">−</button>
            <span>${i.qty}</span>
            <button onclick="Cart.updateQty(${i.cartId},${i.qty + 1})">+</button>
          </div>
          <button class="cart-item-remove" onclick="Cart.remove(${i.cartId})">✕</button>
        </div>
      </div>
    `).join('');

    const sub = this.subtotal();
    const freight = window.CartFreight != null ? window.CartFreight : null;
    const subEl = document.getElementById('cartSubtotalValue');
    const frEl = document.getElementById('cartFreightValue');
    const totEl = document.getElementById('cartTotalValue');
    if (subEl) subEl.textContent = 'R$ ' + sub.toFixed(2).replace('.', ',');
    if (frEl) frEl.textContent = freight != null ? 'R$ ' + freight.toFixed(2).replace('.', ',') : 'calcule o CEP';
    if (totEl) totEl.textContent = 'R$ ' + (sub + (freight || 0)).toFixed(2).replace('.', ',');
  }
};

document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());
