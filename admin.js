const ADMIN_PASSWORD = 'admin123';  // Change this!

let products = [];  // Global for edits
let updateTimeout;  // For debouncing

// Wait for DOM to be fully ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded—admin ready.');  // Debug: Confirms script timing

    // Enter key for password
    const passInput = document.getElementById('admin-pass');
    if (passInput) {
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkPassword();
        });
    }
});

function checkPassword() {
    const pass = document.getElementById('admin-pass').value;
    const error = document.getElementById('pass-error');
    const prompt = document.getElementById('password-prompt');
    const content = document.getElementById('admin-content');

    if (!prompt || !content) {
        console.error('Missing DOM elements for login.');
        return;
    }

    if (pass === ADMIN_PASSWORD) {
        prompt.style.display = 'none';
        content.style.display = 'block';
        // Slight delay to ensure content renders
        setTimeout(() => {
            loadProducts();
        }, 100);
    } else {
        if (error) {
            error.style.display = 'block';
            setTimeout(() => error.style.display = 'none', 2000);
        }
    }
}

function loadProducts() {
    console.log('Loading products...');  // Debug
    fetch('products.json')
        .then(response => {
            if (!response.ok) throw new Error('JSON not found');
            return response.json();
        })
        .then(data => {
            products = [...data];  // Clone
            console.log('Loaded products:', products);  // Debug
            renderTable();
            if (typeof showNotification === 'function') {
                showNotification('Products loaded—start editing!');
            }
        })
        .catch(error => {
            console.error('Error loading products:', error);
            // Fallback data
            products = [
                { name: 'Running Shoes', price: 50, description: 'Sneakers', image: 'images/shoes.jpg' },
                { name: 'Cotton Shirt', price: 20, description: 'T-shirt', image: 'images/shirt.jpg' },
                { name: 'Backpack', price: 30, description: 'Bag', image: 'images/bag.jpg' }
            ];
            console.log('Using fallback products:', products);
            renderTable();
            if (typeof showNotification === 'function') {
                showNotification('Using fallback data—check JSON file.');
            }
        });
}

function renderTable() {
    const tbody = document.getElementById('product-tbody');
    if (!tbody) {
        console.error('Tbody not found—check HTML table structure.');
        if (typeof showNotification === 'function') {
            showNotification('Error: Table body missing. Reload page.');
        }
        return;
    }

    console.log('Rendering table with', products.length, 'products.');  // Debug

    tbody.innerHTML = products.map((product, index) => `
        <tr>
            <td><input type="text" value="${product.name}" oninput="debouncedUpdate(${index}, 'name', this.value)"></td>
            <td><input type="number" value="${product.price}" oninput="debouncedUpdate(${index}, 'price', this.value)" min="0" step="0.01"></td>
            <td><input type="text" value="${product.description}" oninput="debouncedUpdate(${index}, 'description', this.value)"></td>
            <td><input type="text" value="${product.image}" oninput="debouncedUpdate(${index}, 'image', this.value)"></td>
            <td><button onclick="deleteProduct(${index})">Delete</button></td>
        </tr>
    `).join('');

    // New product row
    tbody.innerHTML += `
        <tr style="background: #f9f9f9;">
            <td><input type="text" id="new-name" placeholder="New name" oninput="debouncedNewUpdate('name', this.value)"></td>
            <td><input type="number" id="new-price" placeholder="Price" min="0" oninput="debouncedNewUpdate('price', this.value)"></td>
            <td><input type="text" id="new-desc" placeholder="Desc" oninput="debouncedNewUpdate('description', this.value)"></td>
            <td><input type="text" id="new-image" placeholder="images/new.jpg" oninput="debouncedNewUpdate('image', this.value)"></td>
            <td><button onclick="addProduct()">Add</button></td>
        </tr>
    `;
}

// Rest of functions unchanged (debouncedUpdate, etc.)
function debouncedUpdate(index, field, value) {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
        products[index][field] = value;
        console.log(`Updated ${field} for ${products[index].name} to:`, value);  // Debug
        if (typeof showNotification === 'function') {
            showNotification(`${field} updated for ${products[index].name}`);
        }
    }, 500);
}

let newProduct = { name: '', price: '', description: '', image: '' };
function debouncedNewUpdate(field, value) {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
        newProduct[field] = value;
        console.log(`New ${field}:`, value);  // Debug
    }, 500);
}

function addProduct() {
    const { name, price, description, image } = newProduct;
    if (name && price > 0) {
        products.push({ name, price: parseFloat(price), description, image });
        newProduct = { name: '', price: '', description: '', image: '' };
        renderTable();
        if (typeof showNotification === 'function') {
            showNotification('New product added!');
        }
        console.log('Added product:', products[products.length - 1]);
    } else {
        alert('Name & price required!');
    }
}

function deleteProduct(index) {
    if (confirm(`Delete ${products[index].name}?`)) {
        products.splice(index, 1);
        renderTable();
        if (typeof showNotification === 'function') {
            showNotification('Product deleted!');
        }
        console.log('Products after delete:', products);
    }
}

function saveProducts() {
    if (products.length === 0) {
        alert('No products to save!');
        return;
    }
    console.log('Saving products:', products);  // Debug
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.json';
    link.click();
    URL.revokeObjectURL(url);
    if (typeof showNotification === 'function') {
        showNotification('JSON downloaded with updates—replace old file & redeploy!');
    }
}