// Cart & Notification (from earlier)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(name, price, image) {
    cart.push({ image,name, price, qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${name} added to cart!`);
}

function getCart() {
    return cart;
}

function updateCartDisplay() {
    const itemsDiv = document.getElementById('cart-items');
    const totalP = document.getElementById('total');
    if (!itemsDiv) return;

    itemsDiv.innerHTML = cart.map((item, i) => 
        `<div>${item.name} x${item.qty} - $${item.price * item.qty} <button onclick="removeFromCart(${i})">Remove</button></div>`
    ).join('');
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    totalP.textContent = `Total: $${total}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartCount();
}

function updateCartCount() {
    const countSpan = document.getElementById('cart-count');
    if (countSpan) countSpan.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

updateCartCount();
function updateCartDisplay() {
    const itemsDiv = document.getElementById('cart-items');
    const totalP = document.getElementById('total');
    const subtotalP = document.getElementById('subtotal');
    const emptyCart = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!itemsDiv) return;

    if (cart.length === 0) {
        itemsDiv.classList.add('hidden');
        emptyCart.classList.remove('hidden');
        cartSummary.classList.add('hidden');
        return;
    }

    itemsDiv.classList.remove('hidden');
    emptyCart.classList.add('hidden');
    cartSummary.classList.remove('hidden');

    itemsDiv.innerHTML = cart.map((item, i) => `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center space-x-4 hover:shadow-lg transition-shadow">
            <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded">  <!-- Use real image if added to JSON -->
            <div class="flex-1">
                <h3 class="font-semibold text-lg">${item.name}</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">${item.price}etb each</p>
            </div>
            <div class="flex items-center space-x-4">
                <button onclick="updateQty(${i}, -1)" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 hover:text-alibaba-red transition">-</button>
                <span class="font-semibold w-8 text-center">${item.qty}</span>
                <button onclick="updateQty(${i}, 1)" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 hover:text-alibaba-red transition">+</button>
            </div>
            <div class="text-right">
                <p class="font-bold text-lg">${ (item.price * item.qty).toFixed(2) } etb</p>
                <button onclick="removeFromCart(${i})" class="text-red-500 hover:text-red-700 text-sm mt-1">Remove</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    totalP.textContent = `${total.toFixed(2)}etb`;
    subtotalP.textContent = `${total.toFixed(2)}etb`;  // Same as total for simplicity

    if (total === 0) {
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
    }

    updateCartCount();
}

// New: Update Quantity Function
function updateQty(index, delta) {
    cart[index].qty = Math.max(1, cart[index].qty + delta);
    if (cart[index].qty === 0) {
        removeFromCart(index);
        return;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification(`${cart[index].name} quantity updated!`);
}

// In DOMContentLoaded, ensure init for cart page
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initSearch();  // If search needed here
    updateCartDisplay();  // Always call for cart.html
    // loadProducts();  // Only for index.html
});

// Notification Function (from earlier)
function showNotification(message) {
    const notif = document.getElementById('notification');
    if (!notif) return;

    notif.textContent = message;
    notif.classList.remove('hidden');
    notif.classList.add('show');  // Assuming your CSS has .show for slide-down

    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.classList.add('hidden'), 300);  // Delay for fade
    }, 3000);
}

// Dark Mode Toggle (new)
function initDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const html = document.documentElement;

    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        if (html.classList.contains('dark')) {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
            localStorage.setItem('theme', 'dark');
        } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
            localStorage.setItem('theme', 'light');
        }
    });

    // Load saved theme
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

// Product Loading & Search (new)
let productData = [];
let allProducts = [];  // Store full list for filtering

function loadProducts() {
    // Try localStorage first for admin edits
    const localProducts = localStorage.getItem('adminProducts');
    if (localProducts) {
        try {
            allProducts = JSON.parse(localProducts);
            console.log('Shop loaded from local edits');
        } catch (e) {
            console.error('Bad local data, using JSON');
        }
    }

    // Fallback to JSON
    if (allProducts.length === 0) {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                allProducts = data;
                renderProducts(allProducts);
            })
            .catch(error => {
                console.error('Error loading products:', error);
                // Fallback empty
            });
    } else {
        renderProducts(allProducts);
    }
}

function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = products.map(product => `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
            <div class="relative overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                <div class="absolute top-2 right-2 bg-alibaba-red text-white px-2 py-1 rounded text-xs">New</div>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-lg mb-1 truncate">${product.name}</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">${product.description}</p>
                <div class="flex items-center justify-between mb-3">
                    <span class="text-2xl font-bold text-alibaba-red">${product.price}etb</span>
                    <div class="flex items-center space-x-1 text-yellow-400">
                        <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <span class="text-sm">${product.rating}</span>
                    </div>
                </div>
                <button onclick="addToCart('${product.name}', ${product.price},'${product.image}')" class="w-full bg-alibaba-red hover:bg-red-700 text-white py-2 rounded-full font-semibold transition-colors duration-300">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function updateSearchUI(query, filtered) {
    const title = document.getElementById('products-title');
    const viewAll = document.getElementById('view-all-link');
    const noResults = document.getElementById('no-results');

    if (query.length > 0) {
        title.textContent = `Search Results for "${query}"`;
        viewAll.style.display = 'none';
        if (filtered.length === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }
    } else {
        title.textContent = 'Featured Products';
        viewAll.style.display = 'inline';
        noResults.classList.add('hidden');
    }
}

// Search Input Listener
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = allProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
        renderProducts(filtered);
        updateSearchUI(query, filtered);
    });
}

// Init on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initSearch();
    loadProducts();  // For index.html
    updateCartDisplay();  // If on cart.html
});

function updateOrderSummary() {
    const itemsDiv = document.getElementById('order-items');
    const totalP = document.getElementById('total');
    const subtotalP = document.getElementById('subtotal');
    const emptyCart = document.getElementById('empty-cart');
    const checkoutContent = document.getElementById('checkout-content');

    if (cart.length === 0) {
        emptyCart.classList.remove('hidden');
        checkoutContent.classList.add('hidden');
        return;
    }

    emptyCart.classList.add('hidden');
    checkoutContent.classList.remove('hidden');

    itemsDiv.innerHTML = cart.map((item, i) => `
        <div class="flex items-center space-x-3 py-2">
            <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded">  <!-- Use real image if added -->
            <div class="flex-1">
                <h4 class="font-medium">${item.name}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">Qty: ${item.qty}</p>
            </div>
            <span class="font-semibold">${ (item.price * item.qty).toFixed(2) }etb</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    totalP.textContent = `${total.toFixed(2)}etb`;
    subtotalP.textContent = `${total.toFixed(2)}etb`;  // Same for simplicity
}

// In DOMContentLoaded, add for checkout
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initSearch();  // If search needed
    if (document.getElementById('order-items')) {
        updateOrderSummary();  // For checkout.html
    } else if (document.getElementById('cart-items')) {
        updateCartDisplay();  // For cart.html
    }
    // loadProducts();  // Only for index
});