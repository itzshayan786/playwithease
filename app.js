import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyAxuYwom2tuGTz3Nsi-6ndYSwK7BkEJIVs",
    authDomain: "playwithease.firebaseapp.com",
    projectId: "playwithease",
    storageBucket: "playwithease.appspot.com",
    messagingSenderId: "189729941006",
    appId: "1:189729941006:web:362653774b92416c357e5f",
    measurementId: "G-1C3B31KQ7C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- STATE MANAGEMENT ---
const state = {
    user: null,
    cart: JSON.parse(localStorage.getItem('pwe_cart')) || [],
    products: []
};

// --- DATA GENERATOR (80+ Games) ---
const generateCatalog = () => {
    const featured = [
        { id: 'gta6', title: 'Grand Theft Auto VI', price: 5499, cat: 'Action', img: 'https://image.api.playstation.com/vulcan/ap/rnd/202312/0117/1c6507713437257321689233c7379782559796e622416870.png' },
        { id: 'forza6', title: 'Forza Horizon 6', price: 4999, cat: 'Racing', img: 'https://store-images.s-microsoft.com/image/apps.38888.13510798887356280.93b3a79d-a417-4888-81d0-14923e275988.a844961d-381c-4b5c-b17b-a01c3855a9b8' },
        { id: 'spiderman2', title: 'Marvel\'s Spider-Man 2', price: 4499, cat: 'Action', img: 'https://gmedia.playstation.com/is/image/SIEPDC/marvels-spider-man-2-keyart-01-en-25may23?$1600px$' },
        { id: 'netflix', title: 'Netflix Premium (4K)', price: 649, cat: 'OTT', img: 'https://images.ctfassets.net/y2ske730sjqp/1aONibCke6niZhgPxuiilC/2a401b058ede6b63058a1d207d23c511/BrandAssets_Logos_01-Wordmark.jpg?w=458' },
        { id: 'spotify', title: 'Spotify Premium', price: 119, cat: 'OTT', img: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png' }
    ];

    const genres = ['RPG', 'Shooter', 'Strategy', 'Indie', 'Sports'];
    const generated = [];

    for (let i = 1; i <= 80; i++) {
        const genre = genres[Math.floor(Math.random() * genres.length)];
        generated.push({
            id: `gen_${i}`,
            title: `${genre} Saga: Chapter ${i}`,
            price: Math.floor(Math.random() * 3000) + 499,
            cat: 'Games',
            sub: genre,
            img: `https://picsum.photos/seed/${i * 55}/300/450`
        });
    }

    return [...featured, ...generated];
};

state.products = generateCatalog();

// --- CORE FUNCTIONS ---

window.formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

window.setTheme = (t) => {
    document.body.setAttribute('data-theme', t);
    localStorage.setItem('pwe_theme', t);
};

window.toggleCart = () => {
    document.querySelector('.drawer').classList.toggle('open');
    document.querySelector('.drawer-overlay').classList.toggle('open');
};

window.updateCart = () => {
    localStorage.setItem('pwe_cart', JSON.stringify(state.cart));
    document.querySelectorAll('.cart-badge').forEach(el => el.innerText = state.cart.length);
    
    // Render Drawer
    const container = document.getElementById('cartItems');
    if(container) {
        if(state.cart.length === 0) {
            container.innerHTML = '<p class="text-muted" style="text-align:center; padding:20px;">Your cart is empty.</p>';
        } else {
            container.innerHTML = state.cart.map((item, idx) => `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.title}">
                    <div style="flex:1">
                        <h4>${item.title}</h4>
                        <div style="color:var(--primary)">${window.formatPrice(item.price)}</div>
                    </div>
                    <button onclick="window.removeCart(${idx})" style="color: #ef4444; background:none;">✕</button>
                </div>
            `).join('');
        }
    }

    // Update Totals
    const total = state.cart.reduce((a, b) => a + b.price, 0);
    const totalEls = document.querySelectorAll('.cart-total');
    totalEls.forEach(el => el.innerText = window.formatPrice(total));
};

window.addToCart = (id) => {
    const product = state.products.find(p => p.id === id);
    if(product) {
        state.cart.push(product);
        window.updateCart();
        window.toggleCart();
    }
};

window.removeCart = (idx) => {
    state.cart.splice(idx, 1);
    window.updateCart();
};

window.searchProducts = (query) => {
    const term = query.toLowerCase();
    const filtered = state.products.filter(p => p.title.toLowerCase().includes(term));
    renderGrid(filtered);
};

window.filterCat = (cat) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    if (cat === 'All') renderGrid(state.products);
    else renderGrid(state.products.filter(p => p.cat === cat || p.sub === cat));
};

window.openTrailer = (id) => {
    const modal = document.getElementById('videoModal');
    const frame = document.getElementById('videoFrame');
    frame.src = `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1`;
    modal.classList.add('active');
};

window.closeTrailer = () => {
    const modal = document.getElementById('videoModal');
    const frame = document.getElementById('videoFrame');
    frame.src = '';
    modal.classList.remove('active');
};

function renderGrid(items) {
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    
    grid.innerHTML = items.map(p => `
        <div class="card">
            <img src="${p.img}" class="card-img" loading="lazy">
            <div class="card-body">
                <div class="card-title">${p.title}</div>
                <div class="card-meta">${p.cat}</div>
                <div class="card-price">
                    ${window.formatPrice(p.price)}
                    <button onclick="window.addToCart('${p.id}')" class="add-btn">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

// --- AUTH LOGIC ---

window.handleLogin = async () => {
    try {
        await signInWithPopup(auth, new GoogleAuthProvider());
        // onAuthStateChanged handles redirect
    } catch (error) {
        alert("Login failed: " + error.message);
    }
};

window.handleLogout = () => {
    signOut(auth).then(() => window.location.href = 'index.html');
};

// --- INIT ---

document.addEventListener('DOMContentLoaded', () => {
    // Theme
    const savedTheme = localStorage.getItem('pwe_theme') || 'default';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Render Initial Grid
    renderGrid(state.products);
    window.updateCart();

    // Checkout Logic
    if(window.location.pathname.includes('checkout')) {
        const total = state.cart.reduce((a, b) => a + b.price, 0);
        const upiLink = `upi://pay?pa=shayanff98@okhdfcbank&pn=PlayWithEase&am=${total}&cu=INR`;
        document.getElementById('upiQr').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
        
        document.getElementById('confirmBtn').onclick = async () => {
            if(!state.user) return alert('Please login to complete purchase');
            
            const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
            const orderData = {
                id: orderId,
                items: state.cart,
                total: total,
                date: new Date().toISOString()
            };

            await updateDoc(doc(db, 'users', state.user.uid), {
                orders: arrayUnion(orderData)
            });

            state.cart = [];
            window.updateCart();
            window.location.href = `order-success.html?oid=${orderId}&amt=${total}`;
        };
    }

    // Success Page
    if(window.location.pathname.includes('order-success')) {
        const params = new URLSearchParams(window.location.search);
        const oid = params.get('oid');
        const amt = params.get('amt');
        document.getElementById('orderIdDisplay').innerText = oid;
        
        const msg = `Hi PlayWithEase, I placed order ${oid} for ₹${amt}. Payment sent via UPI.`;
        document.getElementById('waLink').href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    }
});

// --- AUTH LISTENER (Prevents loops) ---
onAuthStateChanged(auth, async (user) => {
    state.user = user;
    const path = window.location.pathname;

    // UI Updates
    const navBtn = document.getElementById('navAuthBtn');
    if(navBtn) {
        if(user) {
            navBtn.innerText = 'Profile';
            navBtn.href = 'profile.html';
        } else {
            navBtn.innerText = 'Login';
            navBtn.href = 'login.html';
        }
    }

    // Redirect Rules
    if (user) {
        // Create user doc if not exists
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if(!snap.exists()) setDoc(userRef, { email: user.email, orders: [] });

        if(path.includes('login.html')) window.location.href = 'index.html';
        
        // Populate Profile
        if(path.includes('profile.html')) {
            document.getElementById('userEmail').innerText = user.email;
            const data = snap.data();
            const orderList = document.getElementById('orderHistory');
            if(data.orders && data.orders.length > 0) {
                orderList.innerHTML = data.orders.map(o => `
                    <div style="background:var(--surface); padding:15px; border-radius:12px; margin-bottom:10px; border:1px solid var(--border)">
                        <div style="display:flex; justify-content:space-between; font-weight:bold; margin-bottom:5px;">
                            <span>${o.id}</span>
                            <span style="color:var(--primary)">₹${o.total}</span>
                        </div>
                        <div style="font-size:0.85rem; color:var(--text-muted)">
                            ${new Date(o.date).toLocaleDateString()} • ${o.items.length} items
                        </div>
                    </div>
                `).join('');
            } else {
                orderList.innerHTML = '<p>No orders yet.</p>';
            }
        }

    } else {
        if(path.includes('profile.html') || path.includes('checkout.html')) {
            window.location.href = 'login.html';
        }
    }
});
