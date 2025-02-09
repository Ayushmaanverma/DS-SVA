document.addEventListener('DOMContentLoaded', () => {
    // Firebase Initialization
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();
    
    // State Management
    let adminMode = false;
    let currentUser = null;
    let selectedVendor = null;
    
    // Data Storage
    let vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    
    // Core Functions
    function initializeApp() {
        checkAuthState();
        renderVendors();
        setupEventListeners();
    }

    function checkAuthState() {
        auth.onAuthStateChanged(user => {
            currentUser = user;
            if(user) showScreen('home');
        });
    }

    function setupEventListeners() {
        // Auth Buttons
        document.querySelector('.google-login').addEventListener('click', handleGoogleLogin);
        document.querySelector('.get-started').addEventListener('click', () => showScreen('login'));
        
        // Admin Controls
        document.addEventListener('click', handleAdminActions);
    }

    async function handleGoogleLogin() {
        try {
            await auth.signInWithPopup(provider);
            showScreen('home');
        } catch (error) {
            showError(`Google Login Failed: ${error.message}`);
        }
    }

    function renderVendors() {
        const grid = document.querySelector('.vendor-grid');
        grid.innerHTML = vendors.map(vendor => `
            <div class="vendor-card" data-id="${vendor.id}">
                <img src="${vendor.image}" alt="${vendor.name}">
                <div class="vendor-info">
                    <h3>${vendor.name}</h3>
                    <p>${vendor.description}</p>
                    ${adminMode ? adminControls(vendor) : ''}
                </div>
            </div>
        `).join('');
    }

    function adminControls(vendor) {
        return `
            <div class="admin-controls">
                <button class="edit-btn" data-action="edit" data-id="${vendor.id}">
                    <span class="material-icons">edit</span>
                </button>
                <button class="delete-btn" data-action="delete" data-id="${vendor.id}">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        `;
    }

    // Error Handling
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Initialize
    initializeApp();
});

// Utility Functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('visible'));
    document.getElementById(screenId).classList.add('visible');
}

// Expose needed functions to global scope
window.toggleAdminMode = function() {
    adminMode = !adminMode;
    renderVendors();
    document.querySelector('.fab').classList.toggle('active', adminMode);
};