// Thamani Dairy - Shopping Cart with Modal Display

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ✅ Update cart count in badge
function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const countEl = document.getElementById("cart-count");
  if (countEl) countEl.textContent = count;
}

// ✅ Add item to cart
function addToCart(name, price, quantity = 1) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    // If adding a custom amount, just replace. Otherwise, increment.
    existing.quantity = quantity > 1 ? quantity : existing.quantity + 1;
    existing.price = price; // Update price in case it's calculated
  } else {
    cart.push({ name, price, quantity });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

// ✅ Remove item
function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

// ✅ Update item quantity
function updateQuantity(index, change) {
  const item = cart[index];
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(index);
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      renderCart();
    }
  }
}

// ✅ Checkout / purchase
function purchase() {
  if (cart.length === 0) return alert("Your cart is empty!");

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  alert(`✅ Thank you for your purchase of Ksh. ${total}!`);
  cart = [];
  localStorage.removeItem("cart");
  updateCartCount();
  renderCart();
  const modal = bootstrap.Modal.getInstance(document.getElementById("cartModal"));
  modal.hide();
}

// ✅ Render items inside modal
function renderCart() {
  const tbody = document.querySelector("#cart-items");
  const totalEl = document.querySelector("#cart-total");

  if (!tbody) return;

  tbody.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>Ksh. ${item.price}</td>
      <td class="quantity-controls">
        <button class="btn btn-sm btn-secondary" onclick="updateQuantity(${index}, -1)" ${item.name.includes('(g)') ? 'disabled' : ''}>-</button>
        <span class="mx-2">${item.quantity}</span>
        <button class="btn btn-sm btn-secondary" onclick="updateQuantity(${index}, 1)" ${item.name.includes('(g)') ? 'disabled' : ''}>+</button>
      </td>
      <td>Ksh. ${subtotal}</td>
      <td><button class="btn btn-sm btn-primary" onclick="removeFromCart(${index})">Remove</button></td>
    `;
    tbody.appendChild(row);
  });

  totalEl.textContent = `Ksh. ${total}`;
}

// ✅ Setup
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();

  // Add-to-cart buttons
  document.querySelectorAll(".cart_bt a").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const name = btn.dataset.productName;
      const price = parseInt(btn.dataset.price, 10);
      
      addToCart(name, price);
    });
  });

  // Add-to-cart for custom gram products
  document.querySelectorAll(".add-custom-to-cart").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const productBox = btn.closest(".custom-gram-product");
      const input = productBox.querySelector(".quantity-input");
      const grams = parseInt(input.value, 10);

      if (!grams || grams <= 0) {
        alert("Please enter a valid quantity in grams.");
        return;
      }

      const productName = productBox.dataset.productName;
      const pricePerGram = parseFloat(productBox.dataset.pricePerGram);
      const calculatedPrice = Math.round(grams * pricePerGram);
      const finalName = `${productName} (${grams}g)`;
      addToCart(finalName, calculatedPrice, 1); // Add as a single item with the calculated price
    });
  });

  // Floating cart icon
  const cartIcon = document.createElement("div");
  cartIcon.classList.add("bg-maroon");
  cartIcon.id = "cart-icon";
  cartIcon.innerHTML = `🛒 <span id="cart-count">0</span>`;
  cartIcon.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    padding: 10px 15px;
    border-radius: 50px; cursor: pointer; font-weight: bold;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    z-index: 9999;
  `;
  document.body.appendChild(cartIcon);

  cartIcon.addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("cartModal"));
    renderCart();
    modal.show();
  });

  updateCartCount();
});
