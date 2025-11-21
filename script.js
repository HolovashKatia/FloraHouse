// script.js - basic site interactions: load products, search, cart (localStorage)
async function loadProducts(){
  const res = await fetch('data/products.json');
  const products = await res.json();
  window.__products = products;
  renderProducts(products);
  renderFeatured(products.slice(0,4));
  updateCartCount();
}

function renderFeatured(list){
  const el = document.getElementById('featured');
  if(!el) return;
  el.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" loading="lazy"/>
      <h3>${p.name}</h3>
      <div class="product-meta"><div class="price">${p.price} ₴ / ${p.unit}</div><div class="small">${p.category}</div></div>
      <p class="small">${p.short}</p>
      <div style="display:flex;justify-content:space-between">
        <button class="button" onclick="addToCart('${p.id}')">Додати в кошик</button>
        <button class="button alt" onclick="location.href='catalog.html'">Детальніше</button>
      </div>
    `;
    el.appendChild(card);
  });
}

function renderProducts(list){
  const el = document.getElementById('products');
  const shown = document.getElementById('shownCount');
  if(!el) return;
  el.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" loading="lazy"/>
      <h3>${p.name}</h3>
      <div class="product-meta"><div class="price">${p.price} ₴ / ${p.unit}</div><div class="small">${p.category}</div></div>
      <p class="small">${p.short}</p>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;gap:8px">
          <button class="button" onclick="addToCart('${p.id}')">Додати</button>
          <button class="button alt" onclick="viewProduct('${p.id}')">Перегляд</button>
        </div>
      </div>
    `;
    el.appendChild(card);
  });
  if(shown) shown.textContent = list.length;
}

function viewProduct(id){
  alert('Перехід до картки товару (поки заглушка). ID: '+id);
}

function addToCart(id){
  const cart = JSON.parse(localStorage.getItem('fh_cart')||'[]');
  const item = cart.find(c=>c.id===id);
  if(item) item.qty++;
  else cart.push({id,qty:1});
  localStorage.setItem('fh_cart', JSON.stringify(cart));
  updateCartCount();
  alert('Товар додано в кошик');
}

function updateCartCount(){
  const cart = JSON.parse(localStorage.getItem('fh_cart')||'[]');
  const total = cart.reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById('cartCount');
  if(el){
    if(total>0){el.style.display='inline-block'; el.textContent = total;}
    else el.style.display='none';
  }
}

function applyFilters(){
  const q = (document.getElementById('search')?.value||'').toLowerCase();
  const cat = (document.getElementById('filterCat')?.value||'');
  let res = window.__products || [];
  if(q) res = res.filter(p=> (p.name+p.short+p.category).toLowerCase().includes(q));
  if(cat) res = res.filter(p=> p.category===cat);
  renderProducts(res);
}

function submitOrder(){
  const name = document.getElementById('customerName')?.value||'';
  const phone = document.getElementById('phone')?.value||'';
  const address = document.getElementById('address')?.value||'';
  const notes = document.getElementById('notes')?.value||'';
  const cart = JSON.parse(localStorage.getItem('fh_cart')||'[]');
  if(!name || !phone){ alert('Вкажіть ім'я та телефон'); return; }
  let body = `Замовлення з сайту FloraHouse%0D%0AІм'я: ${encodeURIComponent(name)}%0D%0AТелефон: ${encodeURIComponent(phone)}%0D%0AАдреса: ${encodeURIComponent(address)}%0D%0A%0D%0AТовари:%0D%0A`;
  cart.forEach(ci=>{
    const p = (window.__products||[]).find(x=>x.id===ci.id);
    if(p) body += `${p.name} — ${ci.qty} шт — ${p.price} ₴%0D%0A`;
  });
  body += `%0D%0AКоментар: ${encodeURIComponent(notes)}`;
  const mail = 'flora@example.com';
  const href = `mailto:${mail}?subject=${encodeURIComponent('Нове замовлення FloraHouse')}&body=${body}`;
  window.location.href = href;
}

function saveOrder(){
  const name = document.getElementById('customerName')?.value||'';
  const phone = document.getElementById('phone')?.value||'';
  const address = document.getElementById('address')?.value||'';
  const notes = document.getElementById('notes')?.value||'';
  const cart = JSON.parse(localStorage.getItem('fh_cart')||'[]');
  const payload = {name,phone,address,notes,cart,ts:new Date().toISOString()};
  const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'order_florahouse.json'; document.body.appendChild(a); a.click();
  a.remove();
}

document.addEventListener('DOMContentLoaded',()=>{
  loadProducts();
  document.getElementById('search')?.addEventListener('input',applyFilters);
  document.getElementById('filterCat')?.addEventListener('change',applyFilters);
  document.getElementById('quickSearch')?.addEventListener('keydown',(e)=>{ if(e.key==='Enter') location.href='catalog.html?q='+encodeURIComponent(e.target.value); });
});
