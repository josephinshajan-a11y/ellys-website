// ===== LOGIN CREDENTIALS =====
// These must match your .env file!
const ADMIN_ID = 'ellys_admin';
const ADMIN_PASSWORD = 'Ellys@2024!SecureAdmin123';

// ===== API CONFIGURATION =====
const API_URL = 'http://localhost:5000/api'; // UPDATE AFTER DEPLOYING TO NETLIFY
const ADMIN_HEADER = { 'x-admin-password': ADMIN_PASSWORD };

// ===== LOGIN VALIDATION =====
function validateLogin() {
    const adminId = document.getElementById('adminId').value.trim();
    const adminPassword = document.getElementById('adminPassword').value;
    const errorMsg = document.getElementById('loginError');

    if (!adminId || !adminPassword) {
        showError('Please enter both Admin ID and Password');
        return;
    }

    if (adminId === ADMIN_ID && adminPassword === ADMIN_PASSWORD) {
        // Login successful
        localStorage.setItem('ellysAdminLoggedIn', 'true');
        document.getElementById('loginContainer').classList.add('logged-in');
        document.getElementById('dashboardContainer').classList.add('logged-in');
        errorMsg.textContent = '';
        console.log('✅ Admin logged in successfully!');
        
        // Load data after login
        loadSarees();
        loadJewellery();
    } else {
        showError('❌ Invalid Admin ID or Password');
    }
}

function showError(message) {
    const errorMsg = document.getElementById('loginError');
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
}

// ===== LOGOUT FUNCTIONALITY =====
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('ellysAdminLoggedIn');
        document.getElementById('adminId').value = '';
        document.getElementById('adminPassword').value = '';
        document.getElementById('loginContainer').classList.remove('logged-in');
        document.getElementById('dashboardContainer').classList.remove('logged-in');
        document.getElementById('loginError').textContent = '';
        console.log('✅ Logged out successfully!');
    }
}

// ===== CHECK LOGIN STATUS ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('ellysAdminLoggedIn');
    
    if (isLoggedIn === 'true') {
        document.getElementById('loginContainer').classList.add('logged-in');
        document.getElementById('dashboardContainer').classList.add('logged-in');
        loadSarees();
        loadJewellery();
    }

    // Allow login on Enter key
    const adminPasswordInput = document.getElementById('adminPassword');
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                validateLogin();
            }
        });
    }
});

// ===== TAB MANAGEMENT =====
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');
}

// ===== SUCCESS MESSAGE =====
function showSuccess(message) {
    const successMsg = document.getElementById('successMessage');
    successMsg.textContent = '✅ ' + message;
    successMsg.classList.add('show');
    
    setTimeout(() => {
        successMsg.classList.remove('show');
    }, 3000);
}

// ===== SAREE MANAGEMENT =====

async function addSaree() {
    const name = document.getElementById('sareeName').value;
    const price = document.getElementById('sareePrice').value;
    const description = document.getElementById('sareeDescription').value;
    const category = document.getElementById('sareeCategory').value;
    const rating = document.getElementById('sareeRating').value;
    const imageFile = document.getElementById('sareeImage').files[0];

    if (!name || !price || !description || !category || !imageFile) {
        alert('❌ Please fill in all fields and select an image');
        return;
    }

    try {
        // Upload image to Cloudinary
        const imageUrl = await uploadImageToCloudinary(imageFile);

        // Send saree data to backend
        const response = await fetch(`${API_URL}/admin/add-saree`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': ADMIN_PASSWORD
            },
            body: JSON.stringify({
                name,
                price: parseFloat(price),
                description,
                category,
                rating: parseFloat(rating),
                image: imageUrl,
                inStock: true
            })
        });

        if (response.ok) {
            showSuccess('Saree added successfully!');
            document.getElementById('sareeForm').reset();
            loadSarees();
        } else {
            alert('❌ Error adding saree');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
    }
}

async function loadSarees() {
    try {
        const response = await fetch(`${API_URL}/admin/all-sarees`, {
            headers: { 'x-admin-password': ADMIN_PASSWORD }
        });

        if (!response.ok) throw new Error('Failed to load sarees');

        const sarees = await response.json();
        displaySarees(sarees);
    } catch (error) {
        console.error('Error loading sarees:', error);
        document.getElementById('sareesList').innerHTML = '<p class="empty-message">Error loading sarees</p>';
    }
}

function displaySarees(sarees) {
    const list = document.getElementById('sareesList');
    
    if (sarees.length === 0) {
        list.innerHTML = '<p class="empty-message">No sarees yet. Add one to get started!</p>';
        return;
    }

    list.innerHTML = sarees.map(saree => `
        <div class="product-item">
            <img src="${saree.image}" alt="${saree.name}" class="product-image">
            <div class="product-details">
                <h4>${saree.name}</h4>
                <p><strong>Price:</strong> ₹${saree.price}</p>
                <p><strong>Category:</strong> ${saree.category}</p>
                <p><strong>Description:</strong> ${saree.description.substring(0, 50)}...</p>
            </div>
            <div class="product-actions">
                <button class="edit-btn" onclick="editSaree('${saree._id}')">Edit</button>
                <button class="delete-btn" onclick="deleteSaree('${saree._id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteSaree(id) {
    if (!confirm('Are you sure you want to delete this saree?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/delete-saree/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-password': ADMIN_PASSWORD }
        });

        if (response.ok) {
            showSuccess('Saree deleted successfully!');
            loadSarees();
        } else {
            alert('❌ Error deleting saree');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
    }
}

function editSaree(id) {
    alert('Edit functionality coming soon!');
}

// ===== JEWELLERY MANAGEMENT =====

async function addJewellery() {
    const name = document.getElementById('jewelleryName').value;
    const price = document.getElementById('jewelleryPrice').value;
    const description = document.getElementById('jewelleryDescription').value;
    const category = document.getElementById('jewelleryCategory').value;
    const material = document.getElementById('jewelleryMaterial').value;
    const rating = document.getElementById('jewelleryRating').value;
    const imageFile = document.getElementById('jewelleryImage').files[0];

    if (!name || !price || !description || !category || !material || !imageFile) {
        alert('❌ Please fill in all fields and select an image');
        return;
    }

    try {
        // Upload image to Cloudinary
        const imageUrl = await uploadImageToCloudinary(imageFile);

        // Send jewellery data to backend
        const response = await fetch(`${API_URL}/admin/add-jewellery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': ADMIN_PASSWORD
            },
            body: JSON.stringify({
                name,
                price: parseFloat(price),
                description,
                category,
                material,
                rating: parseFloat(rating),
                image: imageUrl,
                inStock: true
            })
        });

        if (response.ok) {
            showSuccess('Jewellery added successfully!');
            document.getElementById('jewelleryForm').reset();
            loadJewellery();
        } else {
            alert('❌ Error adding jewellery');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
    }
}

async function loadJewellery() {
    try {
        const response = await fetch(`${API_URL}/admin/all-jewellery`, {
            headers: { 'x-admin-password': ADMIN_PASSWORD }
        });

        if (!response.ok) throw new Error('Failed to load jewellery');

        const jewelleryList = await response.json();
        displayJewellery(jewelleryList);
    } catch (error) {
        console.error('Error loading jewellery:', error);
        document.getElementById('jewelleryList').innerHTML = '<p class="empty-message">Error loading jewellery</p>';
    }
}

function displayJewellery(jewelleryList) {
    const list = document.getElementById('jewelleryList');
    
    if (jewelleryList.length === 0) {
        list.innerHTML = '<p class="empty-message">No jewellery yet. Add one to get started!</p>';
        return;
    }

    list.innerHTML = jewelleryList.map(item => `
        <div class="product-item">
            <img src="${item.image}" alt="${item.name}" class="product-image">
            <div class="product-details">
                <h4>${item.name}</h4>
                <p><strong>Price:</strong> ₹${item.price}</p>
                <p><strong>Category:</strong> ${item.category} | <strong>Material:</strong> ${item.material}</p>
                <p><strong>Description:</strong> ${item.description.substring(0, 50)}...</p>
            </div>
            <div class="product-actions">
                <button class="edit-btn" onclick="editJewellery('${item._id}')">Edit</button>
                <button class="delete-btn" onclick="deleteJewellery('${item._id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteJewellery(id) {
    if (!confirm('Are you sure you want to delete this jewellery?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/delete-jewellery/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-password': ADMIN_PASSWORD }
        });

        if (response.ok) {
            showSuccess('Jewellery deleted successfully!');
            loadJewellery();
        } else {
            alert('❌ Error deleting jewellery');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
    }
}

function editJewellery(id) {
    alert('Edit functionality coming soon!');
}

// ===== CLOUDINARY IMAGE UPLOAD =====
async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_upload_preset'); // You'll set this in Cloudinary

    try {
        const response = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            // Fallback: send image via backend to Cloudinary
            return await uploadViaBackend(file);
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary error, using backend upload:', error);
        return await uploadViaBackend(file);
    }
}

async function uploadViaBackend(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { 'x-admin-password': ADMIN_PASSWORD },
            body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image. Please try again.');
    }
}

// ===== CONSOLE LOG =====
console.log('✅ Admin Dashboard Loaded');
console.log('Admin ID: ' + ADMIN_ID);
console.log('API URL: ' + API_URL);