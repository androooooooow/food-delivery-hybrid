
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100),
    restaurant_id INT REFERENCES restaurants(id),
    total_amount DECIMAL(10,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES menu_items(id),
    quantity INT,
    price DECIMAL(10,2)
);


INSERT INTO restaurants (name, address)
VALUES
    ('Campus Cafe', 'Main Campus'),
    ('Quick Bites', 'Downtown');

INSERT INTO menu_items (restaurant_id, name, description, price)
VALUES
    (1, 'Chicken Rice', 'Fried chicken with rice', 120.00),
    (1, 'Burger', 'Beef burger with fries', 150.00),
    (1, 'Iced Coffee', 'Cold brewed coffee', 80.00),
    (2, 'Pizza', 'Cheese and pepperoni pizza', 250.00);