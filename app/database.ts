// database.ts - Complete SQLite Database Service with Built-in Crypto
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

// Simple hash function as fallback
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Database interfaces
export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  badge: string;
  description: string;
  category: string;
  quantity: number;
}

export interface FavoriteItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  badge: string;
  description: string;
  category: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  badge: string;
  description: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ProductData {
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  badge: string;
  description: string;
  category: string;
}

export interface OrderData {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  products: { id: number; name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbPath: string = '';

  async initialize() {
    try {
      // Log the database directory path
      const documentDirectory = FileSystem.documentDirectory;
      this.dbPath = `${documentDirectory}SQLite/flowerShop.db`;
      
      console.log('=== DATABASE PATH INFO ===');
      console.log('Document Directory:', documentDirectory);
      console.log('Expected DB Path:', this.dbPath);
      console.log('========================');

      this.db = await SQLite.openDatabaseAsync('flowerShop.db');
      await this.createTables();
      await this.createDefaultAdmin();
      console.log('Database initialized successfully');
      
      // Log database info after initialization
      await this.logDatabaseInfo();
      
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async logDatabaseInfo() {
    try {
      console.log('=== DATABASE INFO ===');
      
      // Check if database file exists
      const fileExists = await FileSystem.getInfoAsync(this.dbPath);
      console.log('Database file exists:', fileExists.exists);
      if (fileExists.exists) {
        console.log('Database file size:', fileExists.size, 'bytes');
      }

      // Log table info
      if (this.db) {
        const tables = await this.db.getAllAsync(
          "SELECT name FROM sqlite_master WHERE type='table'"
        );
        console.log('Tables in database:', tables);
      }

      console.log('==================');
    } catch (error) {
      console.error('Error logging database info:', error);
    }
  }

  getDatabasePath(): string {
    return this.dbPath;
  }

  // Simple password hashing function
  private hashPassword(password: string): string {
    // Using simple hash for now - in production, use proper crypto
    return simpleHash(password + 'flower_shop_salt');
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    // Create users table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullName TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create products table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        originalPrice REAL NOT NULL,
        image TEXT NOT NULL,
        rating REAL NOT NULL DEFAULT 4.5,
        reviews INTEGER NOT NULL DEFAULT 0,
        badge TEXT NOT NULL DEFAULT 'NEW',
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create orders table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        userName TEXT NOT NULL,
        userEmail TEXT NOT NULL,
        products TEXT NOT NULL, -- JSON string of products array
        total REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Create cart table (now with userId)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        originalPrice REAL NOT NULL,
        image TEXT NOT NULL,
        rating REAL NOT NULL,
        reviews INTEGER NOT NULL,
        badge TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(userId, productId)
      );
    `);

    // Create favorites table (now with userId)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        originalPrice REAL NOT NULL,
        image TEXT NOT NULL,
        rating REAL NOT NULL,
        reviews INTEGER NOT NULL,
        badge TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(userId, productId)
      );
    `);

    // Create sessions table for login tracking
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Insert sample products if none exist
    await this.createSampleProducts();

    console.log('Tables created successfully');
  }

  private async createSampleProducts() {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Check if products already exist
      const existingProducts = await this.db.getFirstAsync(
        'SELECT id FROM products LIMIT 1'
      );

      if (!existingProducts) {
        const sampleProducts = [
          {
            name: 'Premium Red Roses',
            price: 299,
            originalPrice: 399,
            image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400',
            rating: 4.8,
            reviews: 124,
            badge: 'BESTSELLER',
            description: 'Beautiful premium red roses perfect for expressing love and appreciation.',
            category: 'roses'
          },
          {
            name: 'Sunflower Delight',
            price: 199,
            originalPrice: 249,
            image: 'https://images.unsplash.com/photo-1597848212624-e19f2049ce73?w=400',
            rating: 4.6,
            reviews: 89,
            badge: 'NEW',
            description: 'Bright and cheerful sunflowers that bring joy to any space.',
            category: 'bouquets'
          },
          {
            name: 'Mixed Garden Bouquet',
            price: 399,
            originalPrice: 499,
            image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400',
            rating: 4.9,
            reviews: 156,
            badge: 'TRENDING',
            description: 'A stunning mix of seasonal flowers arranged by our expert florists.',
            category: 'bouquets'
          },
          {
            name: 'Elegant White Lilies',
            price: 349,
            originalPrice: 449,
            image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=400',
            rating: 4.7,
            reviews: 93,
            badge: 'PREMIUM',
            description: 'Pure and elegant white lilies for sophisticated occasions.',
            category: 'wedding'
          },
          {
            name: 'Birthday Party Bouquet',
            price: 259,
            originalPrice: 329,
            image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400',
            rating: 4.5,
            reviews: 67,
            badge: 'POPULAR',
            description: 'Colorful and vibrant bouquet perfect for birthday celebrations.',
            category: 'birthday'
          },
          {
            name: 'Pink Rose Arrangement',
            price: 329,
            originalPrice: 429,
            image: 'https://images.unsplash.com/photo-1502181415656-405a82d99281?w=400',
            rating: 4.8,
            reviews: 112,
            badge: 'BESTSELLER',
            description: 'Delicate pink roses arranged in a beautiful bouquet.',
            category: 'roses'
          }
        ];

        for (const product of sampleProducts) {
          await this.db.runAsync(`
            INSERT INTO products (name, price, originalPrice, image, rating, reviews, badge, description, category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            product.name,
            product.price,
            product.originalPrice,
            product.image,
            product.rating,
            product.reviews,
            product.badge,
            product.description,
            product.category
          ]);
        }

        console.log('Sample products created');
      }
    } catch (error) {
      console.error('Error creating sample products:', error);
    }
  }

  private async createDefaultAdmin() {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Check if admin already exists
      const adminExists = await this.db.getFirstAsync(
        'SELECT id FROM users WHERE role = ? LIMIT 1',
        ['admin']
      );

      if (!adminExists) {
        const hashedPassword = this.hashPassword('admin123');

        await this.db.runAsync(`
          INSERT INTO users (email, password, fullName, role, isActive)
          VALUES (?, ?, ?, ?, ?)
        `, [
          'admin@flowershop.com',
          hashedPassword,
          'System Administrator',
          'admin',
          1
        ]);

        console.log('Default admin created: admin@flowershop.com / admin123');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  }

  // Authentication methods
  async register(userData: RegisterData): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Hash password
      const hashedPassword = this.hashPassword(userData.password);

      // Insert user
      const result = await this.db.runAsync(`
        INSERT INTO users (email, password, fullName, phone, address, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userData.email.toLowerCase().trim(),
        hashedPassword,
        userData.fullName.trim(),
        userData.phone || null,
        userData.address || null,
        'user'
      ]);

      // Get the created user
      const user = await this.db.getFirstAsync(
        'SELECT id, email, fullName, phone, address, role, isActive, createdAt, updatedAt FROM users WHERE id = ?',
        [result.lastInsertRowId]
      ) as User;

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      if ((error as any).message?.includes('UNIQUE constraint failed')) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Hash the provided password
      const hashedPassword = this.hashPassword(credentials.password);

      // Find user with matching email and password
      const user = await this.db.getFirstAsync(`
        SELECT id, email, fullName, phone, address, role, isActive, createdAt, updatedAt 
        FROM users 
        WHERE email = ? AND password = ? AND isActive = 1
      `, [credentials.email.toLowerCase().trim(), hashedPassword]) as User | null;

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Generate session token
      const token = simpleHash(`${user.id}-${Date.now()}-${Math.random()}`);

      // Set expiration to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Save session
      await this.db.runAsync(`
        INSERT INTO sessions (userId, token, expiresAt)
        VALUES (?, ?, ?)
      `, [user.id, token, expiresAt.toISOString()]);

      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async validateSession(token: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync(`
        SELECT u.id, u.email, u.fullName, u.phone, u.address, u.role, u.isActive, u.createdAt, u.updatedAt
        FROM users u
        JOIN sessions s ON u.id = s.userId
        WHERE s.token = ? AND s.expiresAt > datetime('now') AND u.isActive = 1
      `, [token]) as User | null;

      return result;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  async logout(token: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM sessions WHERE token = ?', [token]);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async updateProfile(userId: number, updates: Partial<RegisterData>): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      if (updates.fullName) {
        updateFields.push('fullName = ?');
        values.push(updates.fullName.trim());
      }
      if (updates.phone !== undefined) {
        updateFields.push('phone = ?');
        values.push(updates.phone || null);
      }
      if (updates.address !== undefined) {
        updateFields.push('address = ?');
        values.push(updates.address || null);
      }
      if (updates.password) {
        updateFields.push('password = ?');
        const hashedPassword = this.hashPassword(updates.password);
        values.push(hashedPassword);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(userId);

      await this.db.runAsync(`
        UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
      `, values);

      // Return updated user
      const user = await this.db.getFirstAsync(
        'SELECT id, email, fullName, phone, address, role, isActive, createdAt, updatedAt FROM users WHERE id = ?',
        [userId]
      ) as User;

      return user;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  // Product management methods
  async getAllProducts(): Promise<Product[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      'SELECT * FROM products ORDER BY createdAt DESC'
    );
    return result as Product[];
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      'SELECT * FROM products WHERE category = ? ORDER BY createdAt DESC',
      [category]
    );
    return result as Product[];
  }

  async addProduct(productData: ProductData): Promise<Product> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.runAsync(`
        INSERT INTO products (name, price, originalPrice, image, rating, reviews, badge, description, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        productData.name,
        productData.price,
        productData.originalPrice,
        productData.image,
        productData.rating,
        productData.reviews,
        productData.badge,
        productData.description,
        productData.category
      ]);

      const product = await this.db.getFirstAsync(
        'SELECT * FROM products WHERE id = ?',
        [result.lastInsertRowId]
      ) as Product;

      return product;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(productId: number, productData: Partial<ProductData>): Promise<Product> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(productId);

      await this.db.runAsync(`
        UPDATE products SET ${updateFields.join(', ')} WHERE id = ?
      `, values);

      const product = await this.db.getFirstAsync(
        'SELECT * FROM products WHERE id = ?',
        [productId]
      ) as Product;

      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM products WHERE id = ?', [productId]);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // User management methods
  async updateUserProfile(userId: number, updates: Partial<RegisterData>): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      if (updates.fullName) {
        updateFields.push('fullName = ?');
        values.push(updates.fullName.trim());
      }
      if (updates.email) {
        updateFields.push('email = ?');
        values.push(updates.email.toLowerCase().trim());
      }
      if (updates.phone !== undefined) {
        updateFields.push('phone = ?');
        values.push(updates.phone || null);
      }
      if (updates.address !== undefined) {
        updateFields.push('address = ?');
        values.push(updates.address || null);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(userId);

      await this.db.runAsync(`
        UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
      `, values);

      const user = await this.db.getFirstAsync(
        'SELECT id, email, fullName, phone, address, role, isActive, createdAt, updatedAt FROM users WHERE id = ?',
        [userId]
      ) as User;

      return user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM users WHERE id = ?', [userId]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Order management methods
  async createOrder(orderData: {
    userId: number;
    userName: string;
    userEmail: string;
    products: { id: number; name: string; quantity: number; price: number }[];
    total: number;
  }): Promise<OrderData> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.runAsync(`
        INSERT INTO orders (userId, userName, userEmail, products, total, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderData.userId,
        orderData.userName,
        orderData.userEmail,
        JSON.stringify(orderData.products),
        orderData.total,
        'pending'
      ]);

      const order = await this.db.getFirstAsync(
        'SELECT * FROM orders WHERE id = ?',
        [result.lastInsertRowId]
      ) as any;

      return {
        ...order,
        products: JSON.parse(order.products)
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getAllOrders(): Promise<OrderData[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      'SELECT * FROM orders ORDER BY createdAt DESC'
    ) as any[];
    
    return result.map(order => ({
      ...order,
      products: JSON.parse(order.products)
    }));
  }

  async getUserOrders(userId: number): Promise<OrderData[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    ) as any[];
    
    return result.map(order => ({
      ...order,
      products: JSON.parse(order.products)
    }));
  }

  async updateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'cancelled'): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        'UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [status, orderId]
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Cart operations (updated with userId)
  async getCartItems(userId: number): Promise<CartItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      'SELECT * FROM cart WHERE userId = ? ORDER BY updatedAt DESC',
      [userId]
    );
    return result as CartItem[];
  }

  async addToCart(userId: number, product: Product): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Check if item already exists
      const existing = await this.db.getFirstAsync(
        'SELECT * FROM cart WHERE userId = ? AND productId = ?',
        [userId, product.id]
      ) as CartItem | null;

      if (existing) {
        // Update quantity
        await this.db.runAsync(
          'UPDATE cart SET quantity = quantity + 1, updatedAt = CURRENT_TIMESTAMP WHERE userId = ? AND productId = ?',
          [userId, product.id]
        );
      } else {
        // Insert new item
        await this.db.runAsync(`
          INSERT INTO cart (
            userId, productId, name, price, originalPrice, image, rating, 
            reviews, badge, description, category, quantity
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `, [
          userId, product.id, product.name, product.price, product.originalPrice,
          product.image, product.rating, product.reviews, product.badge,
          product.description, product.category
        ]);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartQuantity(userId: number, productId: number, quantity: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    if (quantity <= 0) {
      await this.removeFromCart(userId, productId);
      return;
    }

    await this.db.runAsync(
      'UPDATE cart SET quantity = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ? AND productId = ?',
      [quantity, userId, productId]
    );
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync('DELETE FROM cart WHERE userId = ? AND productId = ?', [userId, productId]);
  }

  async clearCart(userId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync('DELETE FROM cart WHERE userId = ?', [userId]);
  }

  // Favorites operations (updated with userId)
  async getFavoriteItems(userId: number): Promise<FavoriteItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      'SELECT * FROM favorites WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    return result as FavoriteItem[];
  }

  async addToFavorites(userId: number, product: Product): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(`
        INSERT OR IGNORE INTO favorites (
          userId, productId, name, price, originalPrice, image, rating, 
          reviews, badge, description, category
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId, product.id, product.name, product.price, product.originalPrice,
        product.image, product.rating, product.reviews, product.badge,
        product.description, product.category
      ]);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  async removeFromFavorites(userId: number, productId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync('DELETE FROM favorites WHERE userId = ? AND productId = ?', [userId, productId]);
  }

  async clearFavorites(userId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync('DELETE FROM favorites WHERE userId = ?', [userId]);
  }

  async isFavorite(userId: number, productId: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getFirstAsync(
      'SELECT 1 FROM favorites WHERE userId = ? AND productId = ?',
      [userId, productId]
    );
    return result !== null;
  }

  // Utility methods (updated with userId)
  async getCartCount(userId: number): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getFirstAsync(
      'SELECT SUM(quantity) as total FROM cart WHERE userId = ?',
      [userId]
    ) as { total: number | null };
    
    return result?.total || 0;
  }

  async getCartTotal(userId: number): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getFirstAsync(
      'SELECT SUM(price * quantity) as total FROM cart WHERE userId = ?',
      [userId]
    ) as { total: number | null };
    
    return result?.total || 0;
  }

  async getFavoritesCount(userId: number): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM favorites WHERE userId = ?',
      [userId]
    ) as { count: number };
    
    return result.count;
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      'SELECT id, email, fullName, phone, address, role, isActive, createdAt, updatedAt FROM users ORDER BY createdAt DESC'
    );
    return result as User[];
  }

  async toggleUserStatus(userId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(
      'UPDATE users SET isActive = NOT isActive, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  }

  // Database maintenance
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.execAsync(`
      DELETE FROM cart;
      DELETE FROM favorites;
      DELETE FROM sessions;
      DELETE FROM orders;
      DELETE FROM products;
      DELETE FROM users WHERE role != 'admin';
    `);
    
    // Recreate sample products
    await this.createSampleProducts();
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();