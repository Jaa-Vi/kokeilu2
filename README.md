# Inventory Management System 📦

A modern, easy-to-use web application for managing retail store inventory. Built with Node.js, Express, SQLite, and vanilla JavaScript.

## Features

- 🔍 **Browse Products**: View all products in a modern, responsive grid layout
- ➕ **Add Products**: Create new products with name, description, price, quantity, category, and image
- ✏️ **Edit Products**: Update product information
- 🗑️ **Delete Products**: Remove products from inventory
- 📊 **Update Quantity**: Quick quantity updates for stock management
- 🔎 **Search**: Search products by name, description, or category
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: SQLite with better-sqlite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Design**: Modern gradient UI with smooth animations

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Jaa-Vi/kokeilu2.git
   cd kokeilu2
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

The application will automatically create a local SQLite database (`inventory.db`) and populate it with 20 sample products on first run.

## API Endpoints

The application provides a RESTful API:

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `PATCH /api/products/:id/quantity` - Update product quantity only
- `DELETE /api/products/:id` - Delete a product

## Sample Products

The database is pre-populated with 20 diverse products across categories:
- Electronics (laptops, monitors, keyboards, etc.)
- Furniture (chairs, desks, shelves, etc.)
- Stationery (notebooks, pens, organizers, etc.)
- Accessories (backpacks, water bottles, etc.)

## Project Structure

```
kokeilu2/
├── server.js           # Express server and API routes
├── package.json        # Project dependencies
├── inventory.db        # SQLite database (created on first run)
└── public/
    ├── index.html      # Main HTML page
    ├── styles.css      # Styling
    └── app.js          # Frontend JavaScript
```

## Usage

### Adding a Product
1. Click the "➕ Add New Product" button
2. Fill in the product details
3. Click "Save Product"

### Editing a Product
1. Click the "✏️ Edit" button on any product card
2. Modify the product details
3. Click "Save Product"

### Updating Quantity
1. Click the "📊 Quantity" button on any product card
2. Enter the new quantity
3. Click "Update"

### Deleting a Product
1. Click the "🗑️ Delete" button on any product card
2. Confirm the deletion

### Searching Products
- Use the search box at the top to filter products by name, description, or category

## License

ISC

## Contributing

Feel free to submit issues and enhancement requests!
