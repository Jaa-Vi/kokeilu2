const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api/', apiLimiter);

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
    ['Nike Air Jordan 1', 'Classic high-top basketball shoes with premium leather', 179.99, 25, 'Footwear', 'https://via.placeholder.com/150/FF6B35/ffffff?text=Jordan+1'],
    ['Spalding NBA Official Ball', 'Official size 7 composite leather basketball', 89.99, 40, 'Balls', 'https://via.placeholder.com/150/E63946/ffffff?text=Basketball'],
    ['Under Armour Curry 10', 'Stephen Curry signature basketball shoes', 159.99, 30, 'Footwear', 'https://via.placeholder.com/150/004E89/ffffff?text=Curry+10'],
    ['Nike Elite Jersey', 'Authentic NBA team jersey with player customization', 119.99, 50, 'Apparel', 'https://via.placeholder.com/150/1D3557/ffffff?text=Jersey'],
    ['Adidas Harden Vol. 7', 'James Harden signature basketball shoes', 149.99, 20, 'Footwear', 'https://via.placeholder.com/150/F77F00/ffffff?text=Harden+7'],
    ['Basketball Shorts Pro', 'Moisture-wicking performance basketball shorts', 44.99, 60, 'Apparel', 'https://via.placeholder.com/150/06A77D/ffffff?text=Shorts'],
    ['Compression Arm Sleeve', 'UV protection arm sleeve for basketball players', 19.99, 100, 'Accessories', 'https://via.placeholder.com/150/023047/ffffff?text=Sleeve'],
    ['Wilson Evolution Ball', 'Indoor game basketball with cushion core technology', 69.99, 35, 'Balls', 'https://via.placeholder.com/150/D62828/ffffff?text=Wilson'],
    ['Basketball Training Cones', 'Set of 12 agility and speed training cones', 24.99, 45, 'Training', 'https://via.placeholder.com/150/FCBF49/ffffff?text=Cones'],
    ['Nike Lebron 21', 'LeBron James signature basketball shoes', 189.99, 18, 'Footwear', 'https://via.placeholder.com/150/540B0E/ffffff?text=Lebron+21'],
    ['Shooting Sleeve Pro', 'Compression shooting sleeve with grip', 16.99, 85, 'Accessories', 'https://via.placeholder.com/150/3A506B/ffffff?text=Shooting'],
    ['Basketball Knee Pads', 'Protective knee pads with foam padding', 34.99, 55, 'Accessories', 'https://via.placeholder.com/150/5C946E/ffffff?text=Knee+Pads'],
    ['Resistance Bands Set', 'Basketball training resistance bands (3 levels)', 29.99, 40, 'Training', 'https://via.placeholder.com/150/80B918/ffffff?text=Bands'],
    ['Dribble Goggles', 'Vision restriction training goggles for ball handling', 22.99, 30, 'Training', 'https://via.placeholder.com/150/AACC00/ffffff?text=Goggles'],
    ['Basketball Backpack', 'Ball compartment backpack with shoe storage', 64.99, 28, 'Accessories', 'https://via.placeholder.com/150/283618/ffffff?text=Backpack'],
    ['Ankle Brace Support', 'Adjustable ankle stabilizer for injury prevention', 39.99, 50, 'Accessories', 'https://via.placeholder.com/150/606C38/ffffff?text=Brace'],
    ['Mini Basketball Hoop', 'Over-the-door mini hoop with foam ball', 34.99, 22, 'Training', 'https://via.placeholder.com/150/BC4749/ffffff?text=Mini+Hoop'],
    ['Sweat Headband Set', 'Moisture-wicking headbands (3-pack)', 14.99, 75, 'Accessories', 'https://via.placeholder.com/150/A7C957/ffffff?text=Headband'],
    ['Basketball Pump', 'Dual-action air pump with pressure gauge', 18.99, 65, 'Accessories', 'https://via.placeholder.com/150/6A4C93/ffffff?text=Pump'],
    ['Training Basketball', 'Weighted training basketball for strength building', 54.99, 25, 'Training', 'https://via.placeholder.com/150/F72585/ffffff?text=Training']
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
    
    const priceNum = parseFloat(price);
    const quantityNum = parseInt(quantity);
    
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: 'Invalid price value' });
    }
    
    if (isNaN(quantityNum) || quantityNum < 0) {
      return res.status(400).json({ error: 'Invalid quantity value' });
    }
    
    const result = insert.run(
      name,
      description || '',
      priceNum,
      quantityNum,
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

    const priceNum = parseFloat(price);
    const quantityNum = parseInt(quantity);
    
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: 'Invalid price value' });
    }
    
    if (isNaN(quantityNum) || quantityNum < 0) {
      return res.status(400).json({ error: 'Invalid quantity value' });
    }
    
    const result = update.run(
      name,
      description || '',
      priceNum,
      quantityNum,
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
    
    const quantityNum = parseInt(quantity);
    
    if (isNaN(quantityNum) || quantityNum < 0) {
      return res.status(400).json({ error: 'Invalid quantity value' });
    }

    const update = db.prepare('UPDATE products SET quantity = ? WHERE id = ?');
    const result = update.run(quantityNum, req.params.id);

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
  console.log('\nShutting down gracefully...');
  try {
    db.close();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error closing database:', err);
  }
  process.exit(0);
});
