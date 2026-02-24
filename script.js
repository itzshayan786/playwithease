import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, googleProvider, signInWithPopup, signOut, onAuthStateChanged, updateProfile } from './firebase.js';

// --- MOCK DATA ---
const categories = ['Action', 'RPG', 'Open World', 'Battle Royale', 'Racing', 'Sports', 'Horror', 'Survival', 'Adventure', 'Multiplayer', 'Indie', 'Simulation', 'Strategy', 'Anime', 'Story Mode', 'FPS', 'TPS', 'Sandbox', 'Co-op', 'Puzzle'];

const games = [
    { id: 'g1', title: 'Cyber Hunter 2077', price: 49.99, discount: '-20%', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80' },
    { id: 'g2', title: 'Fantasy Ring', price: 59.99, discount: null, img: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=400&q=80' },
    { id: 'g3', title: 'Space Warfare', price: 29.99, discount: '-50%', img: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?auto=format&fit=crop&w=400&q=80' },
    { id: 'g4', title: 'Auto Theft VI', price: 69.99, discount: null, img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=400&q=80' }
];

const giftCards = [
    { id: 'gc1', title: 'Steam $50', price: 48.99, img: 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?auto=format&fit=crop&w=400&q=80' },
    { id: 'gc2', title: 'Amazon $100', price: 95.00, img: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=400&q=80' },
    { id: 'gc3', title: 'PlayStation $25', price: 23.50, img: 'https://images.unsplash.com/photo-1606144042870-2022830f305f?auto=format&fit=crop&w=400&q=80' },
    { id: 'gc4', title: 'Netflix 1 Month', price: 15.00, img: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=400&q=80' }
];

const subscriptions = [
    { id: 's1', title: 'Xbox Game Pass (1 Mo)', price: 9.99, img: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=400&q=80' },
    { id: 's2', title: 'PlayStation Plus Premium', price: 17.99, img: 'https://images.unsplash.com/photo-1606144042870-2022830f305f?auto=format&fit=crop&w=400&q=80' }
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
        <div class="grid">${generateCardsHTML(games)}</div>
    `;
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
            <img src="${item.img}" alt="${item.title}" class="card-img" loading="lazy">
            <div class="card-body">
                <h3 class="card-title">${item.title}</h3>
                <div class="card-price">$${item.price.toFixed(2)}</div>
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
                        <div>
                            <h4>${item.title}</h4>
                            <span class="neon-text">$${item.price.toFixed(2)}</span>
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
            // If user doesn't exist, try to create one
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
