const API_URL = 'http://localhost:3000/api/products';

let allProducts = [];
let editingProductId = null;

// Load products when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Load all products from API
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to load products');
        
        allProducts = await response.json();
        displayProducts(allProducts);
        updateStats();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Please make sure the server is running.');
    }
}

// Display products in the grid
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <h3>📭 No Products Found</h3>
                <p>Add your first product to get started!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.imageUrl || 'https://via.placeholder.com/150/666666/ffffff?text=Product'}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='https://via.placeholder.com/150/666666/ffffff?text=Product'">
            <div class="product-info">
                <div class="product-header">
                    <h3 class="product-name">${product.name}</h3>
                    <span class="product-category">${product.category}</span>
                </div>
                <p class="product-description">${product.description || 'No description available'}</p>
                <div class="product-details">
                    <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                    <div class="product-quantity">
                        <span>Stock:</span>
                        <span class="quantity-badge ${product.quantity < 10 ? 'low-stock' : ''}">
                            ${product.quantity}
                        </span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-success" onclick="openQuantityModal(${product.id}, ${product.quantity})">
                        📊 Quantity
                    </button>
                    <button class="btn btn-primary" onclick="openEditModal(${product.id})">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    document.getElementById('totalProducts').textContent = allProducts.length;
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    displayProducts(filtered);
}

// Open add product modal
function openAddModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').classList.add('active');
}

// Open edit product modal
async function openEditModal(productId) {
    try {
        const response = await fetch(`${API_URL}/${productId}`);
        if (!response.ok) throw new Error('Failed to load product');
        
        const product = await response.json();
        editingProductId = productId;
        
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productImageUrl').value = product.imageUrl || '';
        
        document.getElementById('productModal').classList.add('active');
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Failed to load product details');
    }
}

// Close modal
function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
    editingProductId = null;
}

// Save product (add or update)
async function saveProduct(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        category: document.getElementById('productCategory').value,
        imageUrl: document.getElementById('productImageUrl').value
    };

    try {
        let response;
        if (editingProductId) {
            // Update existing product
            response = await fetch(`${API_URL}/${editingProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            // Add new product
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }

        if (!response.ok) throw new Error('Failed to save product');

        closeModal();
        await loadProducts();
        showSuccess(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
        console.error('Error saving product:', error);
        showError('Failed to save product');
    }
}

// Open quantity update modal
function openQuantityModal(productId, currentQuantity) {
    document.getElementById('quantityProductId').value = productId;
    document.getElementById('newQuantity').value = currentQuantity;
    document.getElementById('quantityModal').classList.add('active');
}

// Close quantity modal
function closeQuantityModal() {
    document.getElementById('quantityModal').classList.remove('active');
    document.getElementById('quantityForm').reset();
}

// Update product quantity
async function updateQuantity(event) {
    event.preventDefault();
    
    const productId = document.getElementById('quantityProductId').value;
    const quantity = parseInt(document.getElementById('newQuantity').value);

    try {
        const response = await fetch(`${API_URL}/${productId}/quantity`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });

        if (!response.ok) throw new Error('Failed to update quantity');

        closeQuantityModal();
        await loadProducts();
        showSuccess('Quantity updated successfully!');
    } catch (error) {
        console.error('Error updating quantity:', error);
        showError('Failed to update quantity');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete product');

        await loadProducts();
        showSuccess('Product deleted successfully!');
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete product');
    }
}

// Show success message
function showSuccess(message) {
    // Simple alert for now - could be enhanced with a toast notification
    alert('✅ ' + message);
}

// Show error message
function showError(message) {
    alert('❌ ' + message);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    const quantityModal = document.getElementById('quantityModal');
    
    if (event.target === productModal) {
        closeModal();
    }
    if (event.target === quantityModal) {
        closeQuantityModal();
    }
}
