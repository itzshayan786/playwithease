// --- State Management ---
let cart = JSON.parse(localStorage.getItem('pwe_cart')) || [];
let isUSD = false;
const EXCHANGE_RATE = 83.0; // Static rate as requested

// --- Mock Product Data ---
const products = [
    { id: 1, name: "PlayStation 5 Controller", priceINR: 5990, img: "https://via.placeholder.com/300?text=PS5+Controller", rating: 4.8, discount: "10% OFF" },
    { id: 2, name: "Cyberpunk 2077 (Digital)", priceINR: 2999, img: "https://via.placeholder.com/300?text=Cyberpunk+2077", rating: 4.5, discount: null },
    { id: 3, name: "Xbox Game Pass (3 Months)", priceINR: 1049, img: "https://via.placeholder.com/300?text=Game+Pass", rating: 4.9, discount: null },
    { id: 4, name: "Gaming Headset Pro", priceINR: 3499, img: "https://via.placeholder.com/300?text=Headset", rating: 4.2, discount: "15% OFF" }
];

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderProducts();
    updateCartUI();
    registerServiceWorker(); // For offline functionality
});

// --- Theme Toggle ---
const themeToggle = document.getElementById('themeToggle');
function initTheme() {
    const savedTheme = localStorage.getItem('pwe_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pwe_theme', next);
    initTheme();
});

// --- Currency Switcher ---
const currencyBtn = document.getElementById('currencyBtn');
currencyBtn.addEventListener('click', () => {
    isUSD = !isUSD;
    currencyBtn.innerText = isUSD ? "$ USD" : "₹ INR";
    renderProducts();
    updateCartUI();
});

function formatPrice(priceINR) {
    if (isUSD) return `$${(priceINR / EXCHANGE_RATE).toFixed(2)}`;
    return `₹${priceINR.toLocaleString('en-IN')}`;
}

// --- Render Products ---
function renderProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = ''; // Clear skeletons
    
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            ${p.discount ? `<span class="discount-badge">${p.discount}</span>` : ''}
            <img src="${p.img}" loading="lazy" alt="${p.name}">
            <h3>${p.name}</h3>
            <div class="rating"><i class="fas fa-star"></i> ${p.rating}</div>
            <div class="price">${formatPrice(p.priceINR)}</div>
            <button class="btn-primary" onclick="addToCart(${p.id})">Add to Cart</button>
        `;
        grid.appendChild(card);
    });
}

// --- Cart System ---
const cartPanel = document.getElementById('cartPanel');
const cartOverlay = document.getElementById('cartOverlay');
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');

cartBtn.addEventListener('click', toggleCart);
closeCart.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', toggleCart);

function toggleCart() {
    cartPanel.classList.toggle('open');
    cartOverlay.classList.toggle('active');
}

window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) existingItem.qty += 1;
    else cart.push({ ...product, qty: 1 });
    
    saveCart();
    updateCartUI();
    
    // Smooth interaction: Open cart when item is added
    if(!cartPanel.classList.contains('open')) toggleCart();
}

window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('pwe_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    cartItems.innerHTML = '';
    let totalINR = 0;
    let count = 0;

    cart.forEach(item => {
        totalINR += (item.priceINR * item.qty);
        count += item.qty;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>${formatPrice(item.priceINR)} x ${item.qty}</p>
            </div>
            <button class="icon-btn" onclick="removeFromCart(${item.id})" style="color: #e74c3c;"><i class="fas fa-trash"></i></button>
        `;
        cartItems.appendChild(div);
    });

    cartCount.innerText = count;
    cartTotal.innerText = formatPrice(totalINR);
}

// --- Service Worker (Offline Mode) ---
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Registers immediately when the function is called
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered successfully with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    }
}
