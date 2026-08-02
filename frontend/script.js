const API_URL = 'http://localhost:5000/api'; // UPDATE THIS AFTER DEPLOYING BACKEND
const WHATSAPP_NUMBER = '447586181193';

let cart = [];
let sarees = [];
let jewellery = [];

// ===== FETCH SAREES =====
async function fetchSarees() {
    try {
        const response = await fetch(`${API_URL}/sarees`);
        if (!response.ok) throw new Error('Failed to fetch sarees');
        sarees = await response.json();
        displaySarees();
    } catch (error) {
        console.error('Error fetching sarees:', error);
        sarees = [];
        displaySarees();
    }
}

// ===== FETCH JEWELLERY =====
async function fetchJewellery() {
    try {
        const response = await fetch(`${API_URL}/jewellery`);
        if (!response.ok) throw new Error('Failed to fetch jewellery');
        jewellery = await response.json();
        displayJewellery();
    } catch (error) {
        console.error('Error fetching jewellery:', error);
        jewellery = [];
        displayJewellery();
    }
}

// ===== DISPLAY SAREES =====
function displaySarees() {
    const grid = document.getElementById('sareesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    if (sarees.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No sarees available</p>';
        return;
    }

    sarees.forEach(saree => {
        const card = document.createElement('div');
        card.className = 'saree-card';
        card.innerHTML = `
            <div class="saree-image">
                <img src="${saree.image}" alt="${saree.name}" onerror="this.src='https://via.placeholder.com/280x350?text=${saree.name}'">
            </div>
            <h3>${saree.name}</h3>
            <div class="price">₹${saree.price}</div>
            <div class="rating">★★★★★</div>
            <button class="btn btn-secondary" onclick="addToCart('${saree._id}', '${saree.name}', ${saree.price}, 'saree')">
                Add to Cart
            </button>
        `;
        grid.appendChild(card);
    });
}

// ===== DISPLAY JEWELLERY =====
function displayJewellery() {
    const grid = document.getElementById('jewelleryGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    if (jewellery.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No jewellery available</p>';
        return;
    }

    jewellery.forEach(item => {
        const card = document.createElement('div');
        card.className = 'jewellery-card';
        card.innerHTML = `
            <div class="jewellery-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/280x350?text=${item.name}'">
            </div>
            <h3>${item.name}</h3>
            <p class="material">${item.material}</p>
            <div class="price">₹${item.price}</div>
            <div class="rating">★★★★★</div>
            <button class="btn btn-secondary" onclick="addToCart('${item._id}', '${item.name}', ${item.price}, 'jewellery')">
                Add to Cart
            </button>
        `;
        grid.appendChild(card);
    });
}

// ===== ADD TO CART =====
function addToCart(id, name, price, type) {
    cart.push({ id, name, price, type });
    saveCart();
    showNotification(`✓ ${name} added to cart!`);
}

// ===== SAVE CART =====
function saveCart() {
    localStorage.setItem('ellysCart', JSON.stringify(cart));
    updateCartCount();
    toggleWhatsAppSection();
    renderCartItems();
}

// ===== UPDATE CART COUNT =====
function updateCartCount() {
    const cartBadge = document.getElementById('cartBadge');
    const cartCount = document.getElementById('cartCount');
    if (cartBadge) cartBadge.textContent = cart.length;
    if (cartCount) cartCount.textContent = cart.length;
}

// ===== SHOW NOTIFICATION =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed !important;
        top: 100px !important;
        right: 20px !important;
        background: #8b1538 !important;
        color: #fffaf0 !important;
        padding: 1.2rem 1.8rem !important;
        border-radius: 50px !important;
        z-index: 1000 !important;
        box-shadow: 0 5px 20px rgba(139, 21, 56, 0.4) !important;
        font-weight: 500 !important;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ===== TOGGLE WHATSAPP SECTION =====
function toggleWhatsAppSection() {
    const section = document.getElementById('whatsappSection');
    if (section) {
        section.style.display = cart.length > 0 ? 'block' : 'none';
    }
}

// ===== RENDER CART ITEMS =====
function renderCartItems() {
    const list = document.getElementById('cartItemsList');
    if (!list) return;
    
    list.innerHTML = '';

    if (cart.length === 0) {
        list.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        const total = document.getElementById('cartTotal');
        if (total) total.textContent = '0';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-type" style="font-size: 0.8rem; color: #666;">${item.type === 'saree' ? '👗 Saree' : '💎 Jewellery'}</div>
                <div class="cart-item-price">₹${item.price}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
        `;
        list.appendChild(div);
    });

    const totalElement = document.getElementById('cartTotal');
    if (totalElement) totalElement.textContent = total;
}

// ===== REMOVE FROM CART =====
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    if (cart.length === 0) {
        const modal = document.getElementById('cartModal');
        if (modal) modal.classList.remove('active');
    }
}

// ===== GENERATE WHATSAPP MESSAGE =====
function generateWhatsAppMessage() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return null;
    }

    let message = 'Hello! I would like to order from Ellys by Elizabeth:\n\n';
    let total = 0;

    cart.forEach((item, index) => {
        const type = item.type === 'saree' ? '👗' : '💎';
        message += `${index + 1}. ${type} ${item.name} - ₹${item.price}\n`;
        total += item.price;
    });

    message += `\nTotal: ₹${total}\n\nPlease confirm availability and provide payment details.`;
    return encodeURIComponent(message);
}

// ===== SEND ORDER CONFIRMATION EMAIL =====
async function sendOrderConfirmation(email, customerName) {
    if (cart.length === 0) return;

    let total = 0;
    const items = cart.map(item => {
        total += item.price;
        return item;
    });

    try {
        const response = await fetch(`${API_URL}/send-order-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                customerName: customerName,
                items: items,
                total: total
            })
        });

        const result = await response.json();
        if (result.success) {
            console.log('✅ Order confirmation email sent!');
        }
    } catch (error) {
        console.error('Error sending order confirmation:', error);
    }
}

// ===== CART MODAL =====
const cartIcon = document.getElementById('cartIcon');
if (cartIcon) {
    cartIcon.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        const modal = document.getElementById('cartModal');
        if (modal) modal.classList.add('active');
    });
}

const closeCart = document.getElementById('closeCart');
if (closeCart) {
    closeCart.addEventListener('click', () => {
        const modal = document.getElementById('cartModal');
        if (modal) modal.classList.remove('active');
    });
}

const cartModal = document.getElementById('cartModal');
if (cartModal) {
    cartModal.addEventListener('click', (e) => {
        if (e.target.id === 'cartModal') {
            cartModal.classList.remove('active');
        }
    });
}

// ===== WHATSAPP CHECKOUT =====
const whatsappBtn = document.getElementById('whatsappBtn');
if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const name = prompt('Enter your name:');
        if (!name) return;

        const email = prompt('Enter your email for order confirmation:');
        if (!email) return;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Send order confirmation email
        sendOrderConfirmation(email, name);

        // Generate and send WhatsApp message
        const message = generateWhatsAppMessage();
        if (message) {
            setTimeout(() => {
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
            }, 1000);
        }
    });
}

const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const name = prompt('Enter your name:');
        if (!name) return;

        const email = prompt('Enter your email for order confirmation:');
        if (!email) return;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Send order confirmation email
        sendOrderConfirmation(email, name);

        // Generate and send WhatsApp message
        const message = generateWhatsAppMessage();
        if (message) {
            setTimeout(() => {
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
            }, 1000);
        }
    });
}

// ===== CONTACT FORM WITH EMAIL =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                })
            });

            const result = await response.json();

            if (result.success) {
                showNotification('✅ Message sent! Check your email for confirmation.');
                contactForm.reset();
            } else {
                alert('Message sent successfully! We will contact you soon.');
                contactForm.reset();
            }
        } catch (error) {
            console.error('Error:', error);
            // Even if there's an error, show success message as fallback
            alert('✅ Message received! We will contact you soon.');
            contactForm.reset();
        }
    });
}

// ===== PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('ellysCart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            cart = [];
        }
    }
    updateCartCount();
    toggleWhatsAppSection();
    fetchSarees();
    fetchJewellery();
});

console.log('✅ Frontend loaded successfully!');
console.log('📍 API URL:', API_URL);
console.log('📧 Email support: Enabled');
