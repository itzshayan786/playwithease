import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

// --- DATA GENERATOR (80+ ITEMS) ---
const generateCatalog = () => {
    const categories = ['Action', 'RPG', 'Sports', 'OTT', 'GiftCard'];
    const baseProducts = [
        { id: 'gta6', title: 'Grand Theft Auto VI', price: 5499, img: 'https://image.api.playstation.com/vulcan/ap/rnd/202312/0117/1c6507713437257321689233c7379782559796e622416870.png', cat: 'Action' },
        { id: 'forza6', title: 'Forza Horizon 6', price: 4999, img: 'https://store-images.s-microsoft.com/image/apps.38888.13510798887356280.93b3a79d-a417-4888-81d0-14923e275988.a844961d-381c-4b5c-b17b-a01c3855a9b8', cat: 'Sports' },
        { id: 'netflix', title: 'Netflix Premium (1 Mo)', price: 649, img: 'https://images.ctfassets.net/y2ske730sjqp/1aONibCke6niZhgPxuiilC/2a401b058ede6b63058a1d207d23c511/BrandAssets_Logos_01-Wordmark.jpg?w=458', cat: 'OTT' },
        { id: 'psplus', title: 'PlayStation Plus Deluxe', price: 849, img: 'https://gmedia.playstation.com/is/image/SIEPDC/ps-plus-deluxe-badge-01-en-29mar22?$1600px$', cat: 'Services' }
    ];

    let allProducts = [...baseProducts];
    
    // Procedurally generate rest to hit 80+
    for(let i=1; i<=80; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        allProducts.push({
            id: `gen_${i}`,
            title: `${cat} Title ${i} - Standard Ed.`,
            price: Math.floor(Math.random() * 4000) + 499,
            img: `https://picsum.photos/seed/${i}/300/300`, // Placeholder
            cat: cat
        });
    }
    return allProducts;
};

// --- CORE FUNCTIONS ---

const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

const updateCartUI = () => {
    const badge = document.querySelector('.cart-badge');
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotal');
    const drawerTotal = document.getElementById('drawerTotal');
    
    if(badge) badge.innerText = state.cart.reduce((a,b) => a + b.qty, 0);
    
    // Save to local
    localStorage.setItem('pwe_cart', JSON.stringify(state.cart));
    // Save to firestore if user exists
    if(state.user) {
        setDoc(doc(db, 'users', state.user.uid), { cart: state.cart }, { merge: true });
    }

    if(container) {
        container.innerHTML = state.cart.map(item => `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.title}">
                <div style="flex-grow:1">
                    <h4>${item.title}</h4>
                    <div>${formatPrice(item.price)} x ${item.qty}</div>
                </div>
                <div>
                    <button onclick="window.updateQty('${item.id}', 1)" class="btn-primary" style="padding:2px 8px">+</button>
                    <button onclick="window.updateQty('${item.id}', -1)" class="btn-secondary" style="padding:2px 8px">-</button>
                </div>
            </div>
        `).join('');
    }

    const total = state.cart.reduce((a,b) => a + (b.price * b.qty), 0);
    if(totalEl) totalEl.innerText = formatPrice(total);
    if(drawerTotal) drawerTotal.innerText = formatPrice(total);
};

// --- WINDOW EXPORTS (For HTML onclicks) ---
window.addToCart = (id) => {
    const product = state.products.find(p => p.id === id);
    const existing = state.cart.find(c => c.id === id);
    
    if(existing) existing.qty++;
    else state.cart.push({ ...product, qty: 1 });
    
    updateCartUI();
    document.getElementById('cartDrawer').classList.add('open');
};

window.updateQty = (id, change) => {
    const idx = state.cart.findIndex(c => c.id === id);
    if(idx === -1) return;
    
    state.cart[idx].qty += change;
    if(state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
    
    updateCartUI();
};

window.toggleCart = () => {
    document.getElementById('cartDrawer').classList.toggle('open');
};

window.setTheme = (themeName) => {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('pwe_theme', themeName);
};

window.openTrailer = (videoId) => {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoFrame');
    // Using YouTube Embed with autoplay and enablejsapi
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    modal.classList.add('active');
};

window.closeTrailer = () => {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoFrame');
    iframe.src = ''; // Stop video
    modal.classList.remove('active');
};

window.handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        // Redirect handled by onAuthStateChanged
    } catch (error) {
        alert(error.message);
    }
};

window.handleLogout = () => {
    signOut(auth).then(() => window.location.href = 'index.html');
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    // Load Theme
    const savedTheme = localStorage.getItem('pwe_theme') || 'neon';
    document.body.setAttribute('data-theme', savedTheme);

    // Load Products
    state.products = generateCatalog();
    
    // Render Products (if on index)
    const productGrid = document.getElementById('productGrid');
    if(productGrid) {
        productGrid.innerHTML = state.products.map(p => `
            <div class="product-card">
                <img src="${p.img}" class="product-img" loading="lazy">
                <div class="product-info">
                    <div class="product-title">${p.title}</div>
                    <div class="product-cat">${p.cat}</div>
                    <div class="product-bottom">
                        <span class="price">${formatPrice(p.price)}</span>
                        <button onclick="window.addToCart('${p.id}')" class="btn-primary" style="font-size:0.8rem">Add</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Checkout Logic
    if(window.location.pathname.includes('checkout.html')) {
        const total = state.cart.reduce((a,b) => a + (b.price * b.qty), 0);
        document.getElementById('checkoutTotal').innerText = formatPrice(total);
        
        // QR Generation
        const upiStr = `upi://pay?pa=shayanff98@okhdfcbank&pn=PlayWithEase&am=${total}&cu=INR`;
        document.getElementById('upiQr').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiStr)}`;
        
        document.getElementById('confirmOrderBtn').onclick = async () => {
            if(!state.user) return alert('Please login first');
            
            const orderId = 'ORD-' + Date.now();
            const orderData = {
                id: orderId,
                items: state.cart,
                total: total,
                date: new Date().toISOString(),
                status: 'Paid'
            };

            // Save to Firestore
            await updateDoc(doc(db, 'users', state.user.uid), {
                orders: arrayUnion(orderData),
                cart: [] // Clear remote cart
            });

            state.cart = []; // Clear local cart
            updateCartUI();
            
            window.location.href = `order-success.html?oid=${orderId}&amt=${total}`;
        };
    }

    // Success Page Logic
    if(window.location.pathname.includes('order-success.html')) {
        const params = new URLSearchParams(window.location.search);
        const oid = params.get('oid');
        const amt = params.get('amt');
        
        document.getElementById('orderIdDisplay').innerText = oid;
        
        const msg = `Hello PlayWithEase, I placed order ${oid} for ₹${amt}. Payment completed via UPI. Please confirm delivery.`;
        document.getElementById('waLink').href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    }

    // Profile Logic
    if(window.location.pathname.includes('profile.html')) {
         // Data is fetched in auth state change
    }
});

// --- AUTH LISTENER (CRITICAL FOR REDIRECTS) ---
onAuthStateChanged(auth, async (user) => {
    state.user = user;
    const path = window.location.pathname;

    if (user) {
        // Sync Cart
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if(userDoc.exists()) {
            const data = userDoc.data();
            if(data.cart && data.cart.length > 0) {
                state.cart = data.cart;
                updateCartUI();
            }
            // Populate Profile Orders
            if(path.includes('profile.html')) {
                document.getElementById('userEmail').innerText = user.email;
                const orders = data.orders || [];
                document.getElementById('orderHistory').innerHTML = orders.map(o => `
                    <div style="background:var(--surface); padding:10px; margin-bottom:10px; border-radius:8px; border:1px solid var(--border)">
                        <b>${o.id}</b> - ₹${o.total} <br>
                        <small>${new Date(o.date).toLocaleDateString()}</small>
                    </div>
                `).join('');
            }
        } else {
            // Create user doc if new
            setDoc(doc(db, 'users', user.uid), { cart: state.cart, orders: [] });
        }

        // Redirects
        if (path.includes('login.html')) window.location.href = 'profile.html';
    } else {
        // Logged out
        if (path.includes('profile.html') || path.includes('checkout.html')) {
            window.location.href = 'login.html';
        }
    }
});
