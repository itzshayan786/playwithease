import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

// State
let cart = JSON.parse(localStorage.getItem('pwe_cart')) || [];
let user = null;

// Products Data (Mirroring HTML)
const products = [
    { id: 1, name: "Cyberpunk 2077", price: 2999, img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80" },
    { id: 2, name: "Valorant Points", price: 799, img: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=500&q=80" },
    { id: 3, name: "Elden Ring", price: 3499, img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&q=80" },
    { id: 4, name: "Modern Warfare 3", price: 4999, img: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500&q=80" }
];

// --- AUTH LOGIC ---
onAuthStateChanged(auth, async (u) => {
    user = u;
    const authContainer = document.getElementById('auth-links');
    
    if (user) {
        // Sync Cart from Cloud if empty locally
        if(cart.length === 0) {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists() && docSnap.data().cart) {
                cart = docSnap.data().cart;
                updateCart();
            }
        }

        if(authContainer) {
            authContainer.innerHTML = `
                <a href="profile.html" class="flex items-center gap-2">
                    <img src="https://ui-avatars.com/api/?name=${user.email}&background=7c3aed&color=fff" class="w-8 h-8 rounded-full border border-white/20">
                </a>
            `;
        }
        
        // Profile Page Specifics
        if(window.location.pathname.includes('profile.html')) {
            document.getElementById('user-email').innerText = user.email;
            document.getElementById('user-id').innerText = `ID: ${user.uid.slice(0,8)}...`;
        }
    } else {
        // Redirect protection for profile
        if(window.location.pathname.includes('profile.html')) {
            window.location.href = 'login.html';
        }
    }
});

// --- CART LOGIC ---
window.addToCart = (id) => {
    const item = products.find(p => p.id === id);
    const exist = cart.find(c => c.id === id);
    if(exist) exist.qty++;
    else cart.push({ ...item, qty: 1 });
    
    updateCart();
    window.toggleCart(); // Auto open
};

window.updateQty = (id, delta) => {
    const item = cart.find(c => c.id === id);
    if(item) {
        item.qty += delta;
        if(item.qty <= 0) cart = cart.filter(c => c.id !== id);
        updateCart();
    }
};

function updateCart() {
    localStorage.setItem('pwe_cart', JSON.stringify(cart));
    
    // Sync to Cloud
    if(user) {
        setDoc(doc(db, "users", user.uid), { cart }, { merge: true });
    }

    // Update UI Counters
    const badges = document.querySelectorAll('#cart-badge');
    const totalQty = cart.reduce((a,b) => a + b.qty, 0);
    badges.forEach(b => {
        b.innerText = totalQty;
        b.classList.toggle('hidden', totalQty === 0);
    });
    
    window.renderCartUI();
}

window.renderCartUI = () => {
    const container = document.getElementById('cart-items');
    if(!container) return; // Not on page with cart drawer
    
    if(cart.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 mt-10">Cart is empty</div>';
        document.getElementById('cart-total').innerText = '₹0';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        return `
            <div class="flex gap-4 bg-white/5 p-3 rounded-lg items-center">
                <img src="${item.img}" class="w-14 h-14 object-cover rounded-md">
                <div class="flex-1">
                    <h4 class="font-bold text-sm">${item.name}</h4>
                    <p class="text-xs text-brand-400">₹${item.price}</p>
                </div>
                <div class="flex items-center gap-2 bg-black/30 rounded-lg p-1">
                    <button onclick="window.updateQty(${item.id}, -1)" class="w-6 h-6 hover:bg-white/10 rounded">-</button>
                    <span class="text-xs font-mono">${item.qty}</span>
                    <button onclick="window.updateQty(${item.id}, 1)" class="w-6 h-6 hover:bg-white/10 rounded">+</button>
                </div>
            </div>
        `;
    }).join('');
    
    const totalEl = document.getElementById('cart-total');
    if(totalEl) totalEl.innerText = '₹' + total;
};

// --- EXPORT AUTH ---
window.doLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('pwe_cart');
    window.location.href = 'index.html';
};
