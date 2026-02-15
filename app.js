// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAxuYwom2tuGTz3Nsi-6ndYSwK7BkEJIVs",
    authDomain: "playwithease.firebaseapp.com",
    projectId: "playwithease",
    storageBucket: "playwithease.appspot.com",
    messagingSenderId: "189729941006",
    appId: "1:189729941006:web:362653774b92416c357e5f"
};
firebase.initializeApp(firebaseConfig);

// Product Data (Samples - Expands to 80+ in logic)
const products = [
    { id: 1, name: "GTA VI", price: 4999, cat: "ps5", img: "https://example.com/gtavi.jpg" },
    { id: 2, name: "Forza Horizon 5", price: 3499, cat: "pc", img: "https://example.com/forza.jpg" },
    { id: 3, name: "Netflix Premium 1 Month", price: 649, cat: "subscriptions", img: "https://example.com/netflix.jpg" },
    // ... logic below generates remaining 77+ items for demo
];

// Generate 80 items for the "Professional Store" feel
for(let i=4; i<=85; i++) {
    products.push({
        id: i,
        name: `Premium Title ${i}`,
        price: Math.floor(Math.random() * (5000 - 500) + 500),
        cat: i % 2 === 0 ? "ps5" : "pc",
        img: `https://picsum.photos/seed/${i}/400/500`
    });
}

let cart = JSON.parse(localStorage.getItem('pwe_cart')) || [];

function renderProducts(filter = 'all', search = '') {
    const container = document.getElementById('product-list');
    if(!container) return;
    container.innerHTML = '';

    const filtered = products.filter(p => {
        const matchesCat = filter === 'all' || p.cat === filter;
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
    });

    filtered.forEach(p => {
        container.innerHTML += `
            <div class="card">
                <img src="${p.img}" alt="${p.name}">
                <div class="card-body">
                    <div class="card-title">${p.name}</div>
                    <div class="price">₹${p.price}</div>
                    <button class="btn btn-primary" style="margin-top:10px" onclick="addToCart(${p.id})">Add to Cart</button>
                </div>
            </div>
        `;
    });
}

// Cart Logic
window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    cart.push(product);
    updateCartUI();
    toggleCart(true);
};

function updateCartUI() {
    localStorage.setItem('pwe_cart', JSON.stringify(cart));
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    if(cartCount) cartCount.innerText = cart.length;
    if(cartItems) {
        cartItems.innerHTML = cart.map((item, index) => `
            <div style="display:flex; justify-content:space-between; margin-bottom:1rem; align-items:center;">
                <div>
                    <div style="font-weight:600">${item.name}</div>
                    <div style="color:var(--primary)">₹${item.price}</div>
                </div>
                <span class="material-icons" style="cursor:pointer; color:red" onclick="removeFromCart(${index})">delete</span>
            </div>
        `).join('');
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    if(cartTotal) cartTotal.innerText = `₹${total}`;
}

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

window.toggleCart = (forceOpen = false) => {
    const drawer = document.getElementById('cart-drawer');
    if(forceOpen) drawer.classList.add('active');
    else drawer.classList.toggle('active');
};

// Auth Guard
firebase.auth().onAuthStateChanged(user => {
    const path = window.location.pathname;
    if (path.includes('profile.html') && !user) {
        window.location.href = 'login.html';
    }
});

// Initial Render
renderProducts();
updateCartUI();
