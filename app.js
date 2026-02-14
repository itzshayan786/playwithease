import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// STATE
let products = [];
let cart = JSON.parse(localStorage.getItem('pwe_cart')) || [];
let currentUser = null;

// --- 1. GENERATE 100+ CATALOG ---
const generateCatalog = () => {
    const list = [
        { id: 'gta6', title: 'Grand Theft Auto VI', price: 5499, cat: 'Pre-order', img: 'https://image.api.playstation.com/vulcan/ap/rnd/202312/0117/1c6507713437257321689233c7379782559796e622416870.png' },
        { id: 'forza6', title: 'Forza Horizon 6', price: 4999, cat: 'Racing', img: 'https://store-images.s-microsoft.com/image/apps.38888.13510798887356280.93b3a79d-a417-4888-81d0-14923e275988.a844961d-381c-4b5c-b17b-a01c3855a9b8' },
        { id: 'nf', title: 'Netflix Premium (4K)', price: 649, cat: 'OTT', img: 'https://images.ctfassets.net/y2ske730sjqp/1aONibCke6niZhgPxuiilC/2a401b058ede6b63058a1d207d23c511/BrandAssets_Logos_01-Wordmark.jpg?w=458' },
        { id: 'az', title: 'Amazon Prime 1 Year', price: 1499, cat: 'OTT', img: 'https://m.media-amazon.com/images/G/01/prime/marketing/slashPrime/prime_logo_RGB._CB633633273_.png' },
        { id: 'spt', title: 'Spotify Individual', price: 119, cat: 'Music', img: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png' },
        { id: 'psn', title: 'PSN Gift Card ₹1000', price: 1000, cat: 'GiftCard', img: 'https://gmedia.playstation.com/is/image/SIEPDC/ps-plus-gift-cards-box-art-01-en-29mar22?$1600px$' }
    ];

    const genres = ['RPG', 'Action', 'FPS', 'Strategy', 'Indie', 'Horror'];
    const otts = ['Disney+', 'Hulu', 'HBO Max', 'Crunchyroll', 'Peacock'];
    
    // Generate Games
    for (let i = 1; i <= 80; i++) {
        const genre = genres[Math.floor(Math.random() * genres.length)];
        list.push({
            id: `game_${i}`,
            title: `${genre} Legend ${i}`,
            price: Math.floor(Math.random() * 3000) + 499,
            cat: 'Games',
            subCat: genre,
            img: `https://picsum.photos/seed/game${i}/300/400`
        });
    }

    // Generate OTT Subs
    for (let i = 1; i <= 20; i++) {
        const name = otts[Math.floor(Math.random() * otts.length)];
        list.push({
            id: `ott_${i}`,
            title: `${name} - ${i} Month Plan`,
            price: Math.floor(Math.random() * 800) + 199,
            cat: 'OTT',
            img: `https://picsum.photos/seed/ott${i}/300/400`
        });
    }

    return list;
};

// --- 2. RENDER FUNCTIONS ---
const renderProducts = (items = products) => {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    grid.innerHTML = items.map(p => `
        <div class="card">
            <img src="${p.img}" class="card-img" loading="lazy">
            <div class="card-body">
                <div class="card-cat">${p.cat} ${p.subCat ? '• ' + p.subCat : ''}</div>
                <div class="card-title">${p.title}</div>
                <div class="card-price">
                    ₹${p.price}
                    <button onclick="window.addToCart('${p.id}')" class="btn-primary" style="padding:5px 15px; font-size:0.8rem">+</button>
                </div>
            </div>
        </div>
    `).join('');
};

const updateNav = (user) => {
    const loginBtn = document.getElementById('navLoginBtn');
    if (loginBtn) {
        if (user) {
            loginBtn.href = 'profile.html';
            loginBtn.innerText = 'Profile';
            loginBtn.classList.add('btn-primary');
        } else {
            loginBtn.href = 'login.html';
            loginBtn.innerText = 'Login';
            loginBtn.classList.remove('btn-primary');
        }
    }
};

const updateCartDisplay = () => {
    const badge = document.querySelector('.cart-badge');
    if (badge) badge.innerText = cart.reduce((a,b) => a + b.qty, 0);
    localStorage.setItem('pwe_cart', JSON.stringify(cart));
    
    // Drawer Render
    const drawer = document.getElementById('cartDrawerItems');
    if(drawer) {
        if(cart.length === 0) drawer.innerHTML = '<p style="padding:20px; text-align:center; color:gray">Cart is empty</p>';
        else {
            drawer.innerHTML = cart.map(item => `
                <div style="padding:15px; border-bottom:1px solid #333; display:flex; gap:10px;">
                    <img src="${item.img}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
                    <div style="flex:1">
                        <div style="font-size:0.9rem">${item.title}</div>
                        <div style="color:var(--secondary)">₹${item.price} x ${item.qty}</div>
                    </div>
                    <button onclick="window.removeFromCart('${item.id}')" style="color:red; background:none;">🗑</button>
                </div>
            `).join('');
        }
        const total = cart.reduce((a,b) => a + (b.price * b.qty), 0);
        document.getElementById('drawerTotal').innerText = `₹${total}`;
    }
};

// --- 3. WINDOW EXPORTS ---
window.addToCart = (id) => {
    const item = products.find(p => p.id === id);
    const exist = cart.find(c => c.id === id);
    if(exist) exist.qty++;
    else cart.push({ ...item, qty: 1 });
    updateCartDisplay();
    document.getElementById('cartDrawer').classList.add('open');
};

window.removeFromCart = (id) => {
    cart = cart.filter(c => c.id !== id);
    updateCartDisplay();
};

window.toggleCart = () => document.getElementById('cartDrawer').classList.toggle('open');

window.filterCat = (cat) => {
    if(cat === 'All') renderProducts(products);
    else renderProducts(products.filter(p => p.cat === cat || p.subCat === cat));
    
    // Highlight pills
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
};

window.searchProducts = (query) => {
    const term = query.toLowerCase();
    const filtered = products.filter(p => p.title.toLowerCase().includes(term));
    renderProducts(filtered);
};

window.openTrailer = (id) => {
    document.getElementById('videoModal').classList.add('active');
    document.getElementById('videoFrame').src = `https://www.youtube.com/embed/${id}?autoplay=1`;
};

window.closeTrailer = () => {
    document.getElementById('videoModal').classList.remove('active');
    document.getElementById('videoFrame').src = '';
};

window.handleLogin = async () => {
    try {
        await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
        alert(e.message);
    }
};

window.handleLogout = () => signOut(auth).then(() => window.location.href = 'index.html');

// --- 4. INIT ---
document.addEventListener('DOMContentLoaded', () => {
    products = generateCatalog();
    renderProducts();
    updateCartDisplay();

    // Checkout Page Logic
    if(window.location.pathname.includes('checkout.html')) {
        const total = cart.reduce((a,b) => a + (b.price * b.qty), 0);
        document.getElementById('checkoutTotal').innerText = `₹${total}`;
        const qrData = `upi://pay?pa=shayanff98@okhdfcbank&pn=PlayWithEase&am=${total}&cu=INR`;
        document.getElementById('upiQr').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
        
        document.getElementById('confirmBtn').onclick = async () => {
            if(!currentUser) return alert("Please Login First");
            const oid = 'ORD' + Date.now();
            await updateDoc(doc(db, 'users', currentUser.uid), {
                orders: arrayUnion({ id: oid, total, date: new Date().toISOString(), items: cart })
            });
            cart = [];
            updateCartDisplay();
            window.location.href = `order-success.html?oid=${oid}&amt=${total}`;
        };
    }
    
    // Success Page
    if(window.location.pathname.includes('order-success.html')) {
        const p = new URLSearchParams(window.location.search);
        document.getElementById('orderInfo').innerText = `ID: ${p.get('oid')} | Amount: ₹${p.get('amt')}`;
        const msg = `Hi PlayWithEase, placed order ${p.get('oid')} for ₹${p.get('amt')}. Confirm?`;
        document.getElementById('waBtn').href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    }
    
    // Profile Page
    if(window.location.pathname.includes('profile.html')) {
        onAuthStateChanged(auth, async (u) => {
            if(u) {
                document.getElementById('uEmail').innerText = u.email;
                const snap = await getDoc(doc(db, 'users', u.uid));
                if(snap.exists() && snap.data().orders) {
                    document.getElementById('history').innerHTML = snap.data().orders.map(o => 
                        `<div style="background:#222; padding:10px; margin:5px 0; border-radius:5px;">${o.id} - ₹${o.total}</div>`
                    ).join('');
                }
            }
        });
    }
});

// --- 5. AUTH LISTENER (FIXED) ---
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateNav(user);

    const path = window.location.pathname;
    
    // Only redirect if explicitly on a restricted page
    if (user && path.includes('login.html')) {
        window.location.href = 'index.html'; // Go to home if already logged in
    }
    if (!user && (path.includes('profile.html') || path.includes('checkout.html'))) {
        window.location.href = 'login.html'; // Go to login if trying to access restricted
    }
    // Index.html never redirects automatically
});
