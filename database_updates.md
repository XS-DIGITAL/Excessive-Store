# Database Updates

## Initial Setup SQL

Run the following SQL script to set up the database for **EXCESSIVE STORE**.

```sql
-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    handle VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    items JSON, -- Store order items as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT 'EXCESSIVE STORE',
    primary_color VARCHAR(7) DEFAULT '#6c0094',
    secondary_color VARCHAR(7) DEFAULT '#4a0066',
    accent_color VARCHAR(7) DEFAULT '#f5a8ff',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Initial Settings
INSERT INTO settings (site_name, primary_color, secondary_color, accent_color)
VALUES ('EXCESSIVE STORE', '#6c0094', '#4a0066', '#f5a8ff')
ON DUPLICATE KEY UPDATE site_name = VALUES(site_name);

-- Insert Sample Products
INSERT INTO products (handle, title, description, price, image, category)
VALUES 
('tactical-backpack', 'Tactical Urban Backpack', 'Premium water-resistant tactical backpack for urban pioneers.', 129.00, 'https://picsum.photos/seed/backpack/800/800', 'Gear'),
('stealth-hoodie', 'Stealth Tech Hoodie', 'High-performance techwear hoodie with hidden pockets.', 89.00, 'https://picsum.photos/seed/hoodie/800/800', 'Apparel'),
('utility-belt', 'Modular Utility Belt', 'Heavy-duty modular belt system for EDC essentials.', 45.00, 'https://picsum.photos/seed/belt/800/800', 'Accessories');
```

## Admin Credentials
The admin panel is configured to use the following credentials:
- **Email:** `admin@admin.com`
- **Password:** `password123`

*Note: In the PHP implementation, these should be verified against a `users` table or handled via secure session management.*
