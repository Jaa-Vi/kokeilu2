const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
const db = new Database('inventory.db');

// Create products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    category TEXT,
    imageUrl TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Populate with sample data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, description, price, quantity, category, imageUrl)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const sampleProducts = [
    ['Laptop Pro 15"', 'High-performance laptop with 16GB RAM and 512GB SSD', 1299.99, 15, 'Electronics', 'https://via.placeholder.com/150/0066cc/ffffff?text=Laptop'],
    ['Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 29.99, 50, 'Electronics', 'https://via.placeholder.com/150/4CAF50/ffffff?text=Mouse'],
    ['USB-C Hub', '7-in-1 USB-C hub with HDMI and card reader', 49.99, 30, 'Electronics', 'https://via.placeholder.com/150/FF9800/ffffff?text=Hub'],
    ['Mechanical Keyboard', 'RGB backlit mechanical gaming keyboard', 89.99, 25, 'Electronics', 'https://via.placeholder.com/150/9C27B0/ffffff?text=Keyboard'],
    ['4K Monitor 27"', 'Ultra HD 4K monitor with HDR support', 399.99, 12, 'Electronics', 'https://via.placeholder.com/150/2196F3/ffffff?text=Monitor'],
    ['Webcam HD', '1080p webcam with built-in microphone', 69.99, 20, 'Electronics', 'https://via.placeholder.com/150/F44336/ffffff?text=Webcam'],
    ['Office Chair', 'Ergonomic office chair with lumbar support', 249.99, 10, 'Furniture', 'https://via.placeholder.com/150/795548/ffffff?text=Chair'],
    ['Standing Desk', 'Adjustable height standing desk', 499.99, 8, 'Furniture', 'https://via.placeholder.com/150/607D8B/ffffff?text=Desk'],
    ['Desk Lamp LED', 'Adjustable LED desk lamp with touch control', 39.99, 35, 'Furniture', 'https://via.placeholder.com/150/FFEB3B/ffffff?text=Lamp'],
    ['Bookshelf', '5-tier wooden bookshelf', 129.99, 15, 'Furniture', 'https://via.placeholder.com/150/8BC34A/ffffff?text=Shelf'],
    ['Notebook Set', 'Premium lined notebook set (3 pack)', 19.99, 60, 'Stationery', 'https://via.placeholder.com/150/00BCD4/ffffff?text=Notebook'],
    ['Pen Collection', 'Professional ballpoint pen set', 24.99, 45, 'Stationery', 'https://via.placeholder.com/150/3F51B5/ffffff?text=Pens'],
    ['Sticky Notes', 'Colorful sticky notes variety pack', 9.99, 100, 'Stationery', 'https://via.placeholder.com/150/FFC107/ffffff?text=Notes'],
    ['Desk Organizer', 'Bamboo desk organizer with compartments', 34.99, 28, 'Stationery', 'https://via.placeholder.com/150/009688/ffffff?text=Organizer'],
    ['Headphones Pro', 'Noise-cancelling wireless headphones', 199.99, 18, 'Electronics', 'https://via.placeholder.com/150/E91E63/ffffff?text=Headphones'],
    ['Phone Stand', 'Adjustable aluminum phone stand', 19.99, 40, 'Electronics', 'https://via.placeholder.com/150/9E9E9E/ffffff?text=Stand'],
    ['Water Bottle', 'Insulated stainless steel water bottle', 24.99, 55, 'Accessories', 'https://via.placeholder.com/150/03A9F4/ffffff?text=Bottle'],
    ['Backpack', 'Laptop backpack with USB charging port', 59.99, 22, 'Accessories', 'https://via.placeholder.com/150/673AB7/ffffff?text=Backpack'],
    ['Desk Mat', 'Large mouse pad desk mat', 29.99, 33, 'Accessories', 'https://via.placeholder.com/150/FF5722/ffffff?text=Mat'],
    ['Cable Organizer', 'Cable management clips and sleeves', 14.99, 75, 'Accessories', 'https://via.placeholder.com/150/4CAF50/ffffff?text=Cables']
  ];

  for (const product of sampleProducts) {
    insert.run(...product);
  }
  console.log('Database populated with 20 sample products');
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new product
app.post('/api/products', (req, res) => {
  try {
    const { name, description, price, quantity, category, imageUrl } = req.body;
    
    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Name, price, and quantity are required' });
    }

    const insert = db.prepare(`
      INSERT INTO products (name, description, price, quantity, category, imageUrl)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(
      name,
      description || '',
      parseFloat(price),
      parseInt(quantity),
      category || 'Uncategorized',
      imageUrl || 'https://via.placeholder.com/150/666666/ffffff?text=Product'
    );

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', (req, res) => {
  try {
    const { name, description, price, quantity, category, imageUrl } = req.body;
    
    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Name, price, and quantity are required' });
    }

    const update = db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, quantity = ?, category = ?, imageUrl = ?
      WHERE id = ?
    `);

    const result = update.run(
      name,
      description || '',
      parseFloat(price),
      parseInt(quantity),
      category || 'Uncategorized',
      imageUrl || 'https://via.placeholder.com/150/666666/ffffff?text=Product',
      req.params.id
    );

    if (result.changes > 0) {
      const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
      res.json(updatedProduct);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product quantity only
app.patch('/api/products/:id/quantity', (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({ error: 'Quantity is required' });
    }

    const update = db.prepare('UPDATE products SET quantity = ? WHERE id = ?');
    const result = update.run(parseInt(quantity), req.params.id);

    if (result.changes > 0) {
      const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
      res.json(updatedProduct);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM products WHERE id = ?');
    const result = deleteStmt.run(req.params.id);

    if (result.changes > 0) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Inventory Management Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/products`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
