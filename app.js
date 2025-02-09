// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    const auth = firebase.auth();
    let adminMode = false;
    let currentUser = null;
    let selectedVendor = null;

    // Mock Data Storage (Replace with Firebase Firestore in production)
    let vendors = JSON.parse(localStorage.getItem('vendors')) || [
        {
            id: 'v1',
            name: 'Chai Wala',
            image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2',
            description: 'Authentic Indian Street Chai',
            rating: 4.5,
            menu: [
                { id: 'm1', name: 'Masala Chai', price: 15, category: 'Beverages' },
                { id: 'm2', name: 'Samosa', price: 20, category: 'Snacks' }
            ]
        }
    ];

    // 1. Loading Screen Transition
    setTimeout(showOnboarding, 3000);

    // 2. Onboarding Controls
    function showOnboarding() {
        switchScreen('loading', 'onboarding');
        initSwipeControls();
    }

    document.querySelector('.get-started').addEventListener('click', () => {
        switchScreen('onboarding', 'login');
    });

    // 3. Authentication Handlers
    document.querySelector('.google-login').addEventListener('click', async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            currentUser = result.user;
            checkAdminStatus();
            switchScreen('login', 'home');
        } catch (error) {
            showError('Google sign-in failed: ' + error.message);
        }
    });

    // 4. Vendor Management
    function renderVendors() {
        const grid = document.querySelector('.vendor-grid');
        grid.innerHTML = vendors.map(vendor => `
            <div class="vendor-card" data-id="${vendor.id}">
                <img src="${vendor.image}" alt="${vendor.name}">
                <div class="vendor-info">
                    <h3>${vendor.name}</h3>
                    <div class="rating">
                        ${Array(Math.floor(vendor.rating)).fill('<span class="material-icons">star</span>').join('')}
                    </div>
                    <p>${vendor.description}</p>
                    ${adminMode ? `
                    <div class="admin-controls">
                        <button class="edit-vendor" onclick="openVendorEditor('${vendor.id}')">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="delete-vendor" onclick="deleteVendor('${vendor.id}')">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>` : ''}
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.vendor-card').forEach(card => {
            card.addEventListener('click', () => showVendorDetails(card.dataset.id));
        });
    }

    // 5. Vendor Details and Order Management
    function showVendorDetails(vendorId) {
        selectedVendor = vendors.find(v => v.id === vendorId);
        switchScreen('home', 'vendor-details');
        
        // Update Vendor Header
        const header = document.querySelector('.vendor-header');
        header.innerHTML = `
            <img src="${selectedVendor.image}" class="vendor-image">
            <h1>${selectedVendor.name}</h1>
            <p>${selectedVendor.description}</p>
        `;

        // Render Menu Items
        const menuContainer = document.querySelector('.menu-items');
        menuContainer.innerHTML = selectedVendor.menu.map(item => `
            <div class="menu-item" data-id="${item.id}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p class="price">₹${item.price}</p>
                </div>
                <div class="quantity-controls">
                    ${adminMode ? `
                    <button class="edit-item" onclick="openMenuEditor('${item.id}')">
                        <span class="material-icons">edit</span>
                    </button>` : `
                    <button class="quantity-btn minus">-</button>
                    <input type="number" value="0" min="0" class="quantity">
                    <button class="quantity-btn plus">+</button>`}
                </div>
            </div>
        `).join('');

        if(!adminMode) {
            initQuantityControls();
        }
    }

    // 6. Admin Functionality
    window.toggleAdminMode = () => {
        adminMode = !adminMode;
        document.querySelector('.admin-fab').classList.toggle('active', adminMode);
        renderVendors();
        if(selectedVendor) showVendorDetails(selectedVendor.id);
    };

    window.openVendorEditor = (vendorId) => {
        const vendor = vendors.find(v => v.id === vendorId);
        document.getElementById('vendorName').value = vendor.name;
        document.getElementById('vendorImage').value = vendor.image;
        document.getElementById('vendorDescription').value = vendor.description;
        document.getElementById('vendorModal').style.display = 'block';
    };

    // 7. WhatsApp Integration
    document.querySelector('.whatsapp-order').addEventListener('click', () => {
        const items = Array.from(document.querySelectorAll('.menu-item'))
            .filter(item => {
                const quantity = item.querySelector('.quantity').value;
                return quantity > 0;
            })
            .map(item => {
                return {
                    name: item.querySelector('h4').textContent,
                    quantity: item.querySelector('.quantity').value,
                    price: item.querySelector('.price').textContent
                };
            });

        const total = items.reduce((sum, item) => sum + (item.quantity * parseInt(item.price.replace('₹',''))), 0);
        
        const message = `Hello, I'd like to order:%0A%0A${
            items.map(item => `- ${item.quantity}x ${item.name} (${item.price} each)`).join('%0A')
        }%0A%0ATotal: ₹${total}%0A%0AFrom: ${selectedVendor.name}`;

        window.open(`https://wa.me/917007383638?text=${message}`, '_blank');
    });

    // Helper Functions
    function switchScreen(from, to) {
        document.getElementById(from).classList.remove('visible');
        document.getElementById(to).classList.add('visible');
    }

    function initQuantityControls() {
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.target.parentElement.querySelector('.quantity');
                const currentValue = parseInt(input.value) || 0;
                
                if(e.target.classList.contains('plus')) {
                    input.value = currentValue + 1;
                } else if(currentValue > 0) {
                    input.value = currentValue - 1;
                }
            });
        });
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Initialize App
    renderVendors();
});

// Vendor Modal Controls
document.getElementById('vendorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    
    const newVendor = {
        id: 'v' + Date.now(),
        name: this.vendorName.value,
        image: this.vendorImage.value,
        description: this.vendorDescription.value,
        rating: 0,
        menu: []
    };

    vendors.push(newVendor);
    localStorage.setItem('vendors', JSON.stringify(vendors));
    document.getElementById('vendorModal').style.display = 'none';
    location.reload(); // Refresh to show new vendor
});

window.closeModal = () => {
    document.getElementById('vendorModal').style.display = 'none';
};
