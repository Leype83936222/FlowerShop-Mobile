// app/AppContext.tsx - Updated to use database products
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { databaseService, Product, CartItem, FavoriteItem } from './database';
import { useAuth } from './AuthContext';

interface AppContextType {
  // Products
  products: Product[];
  isLoading: boolean;
  refreshProducts: () => Promise<void>;
  
  // Cart
  cartItems: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  
  // Favorites
  favoriteItems: FavoriteItem[];
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (productId: number) => Promise<void>;
  clearFavorites: () => Promise<void>;
  isFavorite: (productId: number) => boolean;
}

const AppContext = createContext<AppContextType>({
  products: [],
  isLoading: true,
  refreshProducts: async () => {},
  cartItems: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  getTotalItems: () => 0,
  getTotalPrice: () => 0,
  favoriteItems: [],
  addToFavorites: async () => {},
  removeFromFavorites: async () => {},
  clearFavorites: async () => {},
  isFavorite: () => false,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await refreshProducts();
      if (user) {
        await Promise.all([
          loadCartItems(),
          loadFavoriteItems()
        ]);
      }
    } catch (error) {
      console.error('Error loading app data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      const productList = await databaseService.getAllProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const loadCartItems = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    
    try {
      const items = await databaseService.getCartItems(user.id);
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart items:', error);
      setCartItems([]);
    }
  };

  const loadFavoriteItems = async () => {
    if (!user) {
      setFavoriteItems([]);
      return;
    }
    
    try {
      const items = await databaseService.getFavoriteItems(user.id);
      setFavoriteItems(items);
    } catch (error) {
      console.error('Error loading favorite items:', error);
      setFavoriteItems([]);
    }
  };

  const addToCart = async (product: Product) => {
    if (!user) {
      throw new Error('User must be logged in to add to cart');
    }
    
    try {
      await databaseService.addToCart(user.id, product);
      await loadCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!user) return;
    
    try {
      await databaseService.removeFromCart(user.id, productId);
      await loadCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) return;
    
    try {
      await databaseService.updateCartQuantity(user.id, productId, quantity);
      await loadCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;
    
    try {
      await databaseService.clearCart(user.id);
      await loadCartItems();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const getTotalItems = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = (): number => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const addToFavorites = async (product: Product) => {
    if (!user) {
      throw new Error('User must be logged in to add to favorites');
    }
    
    try {
      await databaseService.addToFavorites(user.id, product);
      await loadFavoriteItems();
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  const removeFromFavorites = async (productId: number) => {
    if (!user) return;
    
    try {
      await databaseService.removeFromFavorites(user.id, productId);
      await loadFavoriteItems();
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  };

  const clearFavorites = async () => {
    if (!user) return;
    
    try {
      await databaseService.clearFavorites(user.id);
      await loadFavoriteItems();
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw error;
    }
  };

  const isFavorite = (productId: number): boolean => {
    return favoriteItems.some(item => item.productId === productId);
  };

  const value: AppContextType = {
    products,
    isLoading,
    refreshProducts,
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    favoriteItems,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    isFavorite,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext };