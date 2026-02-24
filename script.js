import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, googleProvider, signInWithPopup, signOut, onAuthStateChanged, updateProfile } from './firebase.js';

// --- MOCK DATA ---
const categories = ['Action', 'RPG', 'Open World', 'Battle Royale', 'Racing', 'Sports', 'Horror', 'Survival', 'Adventure', 'Multiplayer', 'Indie', 'Simulation', 'Strategy', 'Anime', 'Story Mode', 'FPS', 'TPS', 'Sandbox', 'Co-op', 'Puzzle'];

// Using official Steam CDN vertical library assets
const games = [
    { id: 'g1', title: 'Cyberpunk 2077', price: 29.99, discount: '-50%', img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900_2x.jpg' },
    { id: 'g2', title: 'Elden Ring', price: 59.99, discount: null, img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900_2x.jpg' },
    { id: 'g3', title: 'Red Dead Redemption 2', price: 19.79, discount: '-67%', img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900_2x.jpg' },
    { id: 'g4', title: 'Helldivers 2', price: 39.99, discount: null, img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2530890/library_600x900_2x.jpg' },
    { id: 'g5', title: 'Baldur\'s Gate 3', price: 59.99, discount: null, img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900_2x.jpg' },
    { id: 'g6', title: 'Grand Theft Auto V', price: 14.99, discount: '-63%', img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900_2x.jpg' },
    { id: 'g7', title: 'Palworld', price: 26.99, discount: '-10%', img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/library_600x900_2x.jpg' },
    { id: 'g8', title: 'Counter-Strike 2', price: 0.00, discount: 'FREE', img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/library_600x900_2x.jpg' }
];

// Using high-quality retail posters for Gift Cards
const giftCards = [
    { id: 'gc1', title: 'Steam Wallet $50', price: 48.99, img: 'https://community.akamai.steamstatic.com/public/images/gift/steamcards_cards_02.png' },
    { id: 'gc2', title: 'Amazon Gift Card $100', price: 98.50, img: 'https://m.media-amazon.com/images/I/41DXYE5mRjL.jpg' },
    { id: 'gc3', title: 'PlayStation Store $25', price: 23.50, img: 'https://m.media-amazon.com/images/I/71Xm3z89u9L._AC_SL1500_.jpg' },
    { id: 'gc4', title: 'Netflix Gift Card $30', price: 29.00, img: 'https://m.media-amazon.com/images/I/610tP5sJ2hL._AC_SL1500_.jpg' },
    { id: 'gc5', title: 'Xbox Gift Card $50', price: 47.99, img: 'https://m.media-amazon.com/images/I/61m1a0v4wmL._AC_SL1500_.jpg' },
    { id: 'gc6', title: 'Google Play $10', price: 9.50, img: 'https://m.media-amazon.com/images/I/611ZzX0TuxL._AC_SL1500_.jpg' }
];

// Using high-quality retail posters for Subscriptions
const subscriptions = [
    { id: 's1', title: 'Xbox Game Pass Ultimate (3 Months)', price: 44.99, img: 'https://m.media-amazon.com/images/I/612aJ5U9fFL._AC_SL1500_.jpg' },
    { id: 's2', title: 'PlayStation Plus Premium (12 Months)', price: 119.99, img: 'https://m.media-amazon.com/images/I/71d1D5Vb09L._AC_SL1500_.jpg' },
    { id: 's3', title: 'EA Play (1 Month)', price: 4.99, img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/subs/806140/header_586x192.jpg' },
    { id: 's4', title: 'Spotify Premium (3 Months)', price: 29.99, img: 'https://m.media-amazon.com/images/I/51r5c7Xv-3L._AC_SL1500_.jpg' }
];

// --- APP STATE ---
let cart = [];
let currentUser = null;

// --- DOM ELEMENTS ---
const appContent = document.getElementById('app-content');
const cartCount = document.getElementById('cart-count');
const mobileCartCount = document.getElementById('mobile-cart-count');
const authSection = document.getElementById('auth-section');

// --- ROUTER / UI MANAGER ---
window.app = {
    navigate: (route) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        switch(route) {
            case 'home': renderHome(); break;
            case 'store': renderProducts(games, 'PC Games Store'); break;
            case 'giftcards': renderProducts(giftCards, 'Gift Cards'); break;
            case 'subscriptions': renderProducts(subscriptions, 'Subscriptions'); break;
            case 'cart': renderCart(); break;
            case 'login': currentUser ? renderProfile() : renderLogin(); break;
        }
    },
    addToCart: (id) => {
        const item = [...games, ...giftCards, ...subscriptions].find(p => p.id === id);
        if(item) {
            cart.push(item);
            updateCartUI();
            alert(`Added ${item.title} to cart!`);
        }
    },
    removeFromCart: (index) => {
        cart.splice(index, 1);
        updateCartUI();
        renderCart();
    }
};

// --- RENDER FUNCTIONS ---
function renderHome() {
    let html = `
        <div class="hero" style="text-align:center; padding: 50px 0;">
            <h1 style="font-size: 3rem; margin-bottom:10px;">Level Up Your <span class="neon-text">Gaming Experience</span></h1>
            <p style="color:var(--text-muted); margin-bottom: 30px;">Premium CD Keys, Gift Cards, and Subscriptions at the best prices.</p>
            <button class="btn btn-primary" onclick="app.navigate('store')">Browse Store</button>
        </div>
        
        <div class="section-header"><h2><i class="fa-solid fa-list"></i> Top Categories</h2></div>
        <div class="category-badges">
            ${categories.map(c => `<div class="category-badge">${c}</div>`).join('')}
        </div>

        <div class="section-header"><h2><i class="fa-solid fa-fire"></i> Trending PC Games</h2></div>
        <div class="grid">${generateCardsHTML(games.slice(0, 4))}</div> `;
    appContent.innerHTML = html;
}

function renderProducts(data, title) {
    appContent.innerHTML = `
        <div class="section-header"><h2>${title}</h2></div>
        <div class="grid">${generateCardsHTML(data)}</div>
    `;
}

function generateCardsHTML(data) {
    return data.map(item => `
        <div class="card glass-effect">
            ${item.discount ? `<div class="discount-badge">${item.discount}</div>` : ''}
            <img src="${item.img}" alt="${item.title}" class="card-img" loading="lazy" style="${item.id.startsWith('s') || item.id.startsWith('gc') ? 'object-fit: contain; padding: 10px;' : 'object-fit: cover;'}">
            <div class="card-body">
                <h3 class="card-title">${item.title}</h3>
                <div class="card-price">${item.price === 0 ? 'FREE' : '$' + item.price.toFixed(2)}</div>
                <button class="btn btn-outline" onclick="app.addToCart('${item.id}')">
                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function renderCart() {
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    let html = `
        <div class="cart-panel glass-effect" style="max-width: 800px;">
            <h2 class="section-header">Shopping Cart</h2>
            ${cart.length === 0 ? '<p>Your cart is empty.</p>' : 
                cart.map((item, index) => `
                    <div class="cart-item">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="${item.img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                            <div>
                                <h4>${item.title}</h4>
                                <span class="neon-text">${item.price === 0 ? 'FREE' : '$' + item.price.toFixed(2)}</span>
                            </div>
                        </div>
                        <button class="btn btn-outline" style="padding: 5px 10px;" onclick="app.removeFromCart(${index})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `).join('')
            }
            <div style="margin-top: 20px; text-align: right;">
                <h3>Total: <span class="neon-text">$${total.toFixed(2)}</span></h3>
                ${cart.length > 0 ? `<button class="btn btn-primary" style="margin-top:15px; width:100%;">Proceed to Checkout</button>` : ''}
            </div>
        </div>
    `;
    appContent.innerHTML = html;
}

// --- AUTHENTICATION UI ---
function renderLogin() {
    appContent.innerHTML = `
        <div class="auth-form glass-effect">
            <h2>Welcome Back</h2>
            <p style="color:var(--text-muted); margin-bottom:20px;">Login to PlayWithEase</p>
            
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="auth-email" placeholder="Enter email">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="auth-password" placeholder="Enter password">
            </div>
            
            <button class="btn btn-primary" style="width:100%; margin-bottom:15px;" id="btn-login">Login / Sign Up</button>
            <button class="btn btn-outline" style="width:100%;" id="btn-google">
                <i class="fa-brands fa-google"></i> Continue with Google
            </button>
        </div>
    `;
    setupAuthListeners();
}

function renderProfile() {
    appContent.innerHTML = `
        <div class="auth-form glass-effect" style="text-align:center;">
            <i class="fa-solid fa-user-circle" style="font-size: 4rem; color:var(--primary-color); margin-bottom:15px;"></i>
            <h2>${currentUser.displayName || 'Gamer'}</h2>
            <p style="color:var(--text-muted); margin-bottom:20px;">${currentUser.email}</p>
            <button class="btn btn-outline" style="width:100%;" id="btn-logout">Logout</button>
        </div>
    `;
    document.getElementById('btn-logout').addEventListener('click', () => {
        signOut(auth).then(() => app.navigate('home'));
    });
}

function updateCartUI() {
    cartCount.innerText = cart.length;
    mobileCartCount.innerText = cart.length;
}

// --- FIREBASE AUTH LOGIC ---
function setupAuthListeners() {
    document.getElementById('btn-login').addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-password').value;
        if(!email || !pass) return alert("Please enter email and password");
        
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            app.navigate('home');
        } catch (error) {
            if(error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                try {
                    await createUserWithEmailAndPassword(auth, email, pass);
                    app.navigate('home');
                } catch(e) { alert(e.message); }
            } else { alert(error.message); }
        }
    });

    document.getElementById('btn-google').addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            app.navigate('home');
        } catch (error) { alert(error.message); }
    });
}

// Track Auth State
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        authSection.innerHTML = `<button class="btn btn-outline" onclick="app.navigate('login')">Profile</button>`;
    } else {
        authSection.innerHTML = `<button class="btn btn-primary" onclick="app.navigate('login')">Login</button>`;
    }
});

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    app.navigate('home');
});
