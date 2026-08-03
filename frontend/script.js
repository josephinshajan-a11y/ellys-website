// ===== API CONFIGURATION =====
// For local testing: http://localhost:3000/.netlify/functions
// For Netlify: /.netlify/functions
const API_BASE = '/.netlify/functions';

const WHATSAPP_NUMBER = '447586181193';

// ===== CART MANAGEMENT =====
let cart = JSON.parse(localStorage.getItem('ellysCart')) || [];

function updateCartCount() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = cart.length;
    }
    toggleWhatsAppSection();
}

function addToCart(id, name, price, type) {
    const item = { id, name, price, type };
    cart.push(item);
    localStorage.setItem('ellysCart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${name} added to cart! 🛒`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('ellysCart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

function openCart() {
    displayCart();
    document.getElementById('cartModal').style.display = 'block';
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function displayCart() {
    const cartItemsDiv = document.getElementById('cartItemsList');
    const cartTotalSpan = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align: center; color: #999;">Your cart is empty</p>';
        cartTotalSpan.textContent = '0';
        return;
    }

    let total = 0;
    cartItemsDiv.innerHTML = cart.map((item, index) => {
        total += item.price;
        return `
            <div style="display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #eee; align-items: center;">
                <div>
                    <p><strong>${item.name}</strong></p>
                    <p style="color: #666; font-size: 14px;">₹${item.price} (${item.type})</p>
                </div>
                <button onclick="removeFromCart(${index})" style="background: #d32f2f; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 5px;">Remove</button>
            </div>
        `;
    }).join('');

    cartTotalSpan.textContent = total;
}

function toggleWhatsAppSection() {
    const whatsappButton = document.getElementById('whatsappButton');
    if (whatsappButton) {
        whatsappButton.style.display = cart.length > 0 ? 'block' : 'none';
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }

    const name = prompt('Enter your name:');
    if (!name) return;

    const email = prompt('Enter your email:');
    if (!email) return;

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const cartSummary = cart.map(item => {
        return `${item.type === 'saree' ? '👗' : '💎'} ${item.name} - ₹${item.price}`;
    }).join('\n');

    const message = `Hi Ellys,\n\nI would like to order:\n${cartSummary}\n\nTotal: ₹${total}\n\nCustomer Name: ${name}\nEmail: ${email}`;

    // Send order confirmation email
    sendOrderConfirmation(name, email, total, cartSummary);

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Clear cart
    cart = [];
    localStorage.setItem('ellysCart', JSON.stringify(cart));
    updateCartCount();
    closeCart();
}

// ===== FETCH PRODUCTS =====
async function fetchSarees() {
    try {
        const response = await fetch(`${API_BASE}/sarees`);
        if (!response.ok) throw new Error('Failed to fetch sarees');
        const sarees = await response.json();
        displaySarees(sarees);
    } catch (error) {
        console.error('Error:', error);
        const grid = document.getElementById('sareesGrid');
        if (grid) {
            grid.innerHTML = '<p>Error loading sarees. Please refresh the page.</p>';
        }
    }
}

async function fetchJewellery() {
    try {
        const response = await fetch(`${API_BASE}/jewellery`);
        if (!response.ok) throw new Error('Failed to fetch jewellery');
        const jewellery = await response.json();
        displayJewellery(jewellery);
    } catch (error) {
        console.error('Error:', error);
        const grid = document.getElementById('jewelleryGrid');
        if (grid) {
            grid.innerHTML = '<p>Error loading jewellery. Please refresh the page.</p>';
        }
    }
}

// ===== DISPLAY PRODUCTS =====
function displaySarees(sarees) {
    const grid = document.getElementById('sareesGrid');
    if (!grid) return;
    
    if (sarees.length === 0) {
        grid.innerHTML = '<p style="text-align: center;">No sarees available.</p>';
        return;
    }

    grid.innerHTML = sarees.map(saree => `
        <div class="product-card">
            <img src="${saree.image}" alt="${saree.name}" class="product-image">
            <h3>${saree.name}</h3>
            <p class="category">${saree.category}</p>
            <p class="description">${saree.description.substring(0, 60)}...</p>
            <div class="product-footer">
                <span class="price">₹${saree.price}</span>
                <button onclick="addToCart('${saree._id}', '${saree.name}', ${saree.price}, 'saree')" class="add-btn">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function displayJewellery(jewellery) {
    const grid = document.getElementById('jewelleryGrid');
    if (!grid) return;
    
    if (jewellery.length === 0) {
        grid.innerHTML = '<p style="text-align: center;">No jewellery available.</p>';
        return;
    }

    grid.innerHTML = jewellery.map(item => `
        <div class="product-card">
            <img src="${item.image}" alt="${item.name}" class="product-image">
            <h3>${item.name}</h3>
            <p class="category">${item.category} • ${item.material}</p>
            <p class="description">${item.description.substring(0, 60)}...</p>
            <div class="product-footer">
                <span class="price">₹${item.price}</span>
                <button onclick="addToCart('${item._id}', '${item.name}', ${item.price}, 'jewellery')" class="add-btn">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// ===== CONTACT FORM =====
async function sendContactMessage(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    try {
        const response = await fetch(`${API_BASE}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message })
        });

        if (response.ok) {
            showNotification('Message sent successfully! ✅');
            document.getElementById('contactForm').reset();
        } else {
            showNotification('Error sending message. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error: ' + error.message);
    }
}

// ===== ORDER CONFIRMATION EMAIL =====
async function sendOrderConfirmation(name, email, total, cartSummary) {
    try {
        await fetch(`${API_BASE}/order-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: name,
                customerEmail: email,
                total: total,
                items: cartSummary
            })
        });
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #8b1538;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== CLOSE MODAL ON OUTSIDE CLICK =====
window.onclick = function(event) {
    const modal = document.getElementById('cartModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// ===== INITIALIZE PAGE =====
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Load products if on product pages
    if (document.getElementById('sareesGrid')) {
        fetchSarees();
    }
    if (document.getElementById('jewelleryGrid')) {
        fetchJewellery();
    }
    
    // Setup contact form if on contact page
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', sendContactMessage);
    }
    
    console.log('✅ Store loaded successfully!');
    console.log('API Base:', API_BASE);
});

// ===== ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
