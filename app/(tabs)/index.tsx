// index.tsx - Fixed version with perfect category navigation
import React, { useState, useEffect, createContext, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// TypeScript interfaces
interface Category {
  id: number;
  name: string;
  label: string;
  icon: any;
  color: string;
  count: string;
}

interface Product {
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
}

interface CartItem extends Product {
  quantity: number;
}

// Global App Context
export const AppContext = createContext<{
  cartItems: CartItem[];
  favoriteItems: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}>({
  cartItems: [],
  favoriteItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  addToFavorites: () => {},
  removeFromFavorites: () => {},
  isFavorite: () => false,
  getTotalItems: () => 0,
  getTotalPrice: () => 0,
});

// App Provider Component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<Product[]>([]);

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const addToFavorites = (product: Product) => {
    setFavoriteItems(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromFavorites = (productId: number) => {
    setFavoriteItems(prev => prev.filter(item => item.id !== productId));
  };

  const isFavorite = (productId: number) => {
    return favoriteItems.some(item => item.id === productId);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <AppContext.Provider value={{
      cartItems,
      favoriteItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      getTotalItems,
      getTotalPrice,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Sample Data
const heroSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    title: 'Beautiful Rose Collection',
    subtitle: 'Express your love with fresh roses',
    discount: '20% OFF'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
    title: 'Bright Sunflower Bouquets',
    subtitle: 'Bring sunshine to any occasion',
    discount: '15% OFF'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=800',
    title: 'Premium Mixed Arrangements',
    subtitle: 'Curated by expert florists',
    discount: 'Buy 2 Get 1'
  }
];

const categories: Category[] = [
  { id: 1, name: 'roses', label: 'Roses', icon: 'rose', color: '#ff6b6b', count: '24 items' },
  { id: 2, name: 'bouquets', label: 'Bouquets', icon: 'flower', color: '#4ecdc4', count: '18 items' },
  { id: 3, name: 'wedding', label: 'Wedding', icon: 'heart', color: '#45b7d1', count: '12 items' },
  { id: 4, name: 'birthday', label: 'Birthday', icon: 'gift', color: '#f9ca24', count: '30 items' }
];

export const allProducts: Product[] = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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

// Product Card Component
const ProductCard: React.FC<{ 
  product: Product; 
  onPress: () => void; 
}> = ({ product, onPress }) => {
  const { addToCart, addToFavorites, removeFromFavorites, isFavorite } = useContext(AppContext);
  const router = useRouter();

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addToCart(product);
    Alert.alert(
      "Added to Cart!",
      `${product.name} has been added to your cart.\nPrice: ₱${product.price}`,
      [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => {} }
      ]
    );
  };

  const handleFavoriteToggle = (e: any) => {
    e.stopPropagation();
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      Alert.alert("Removed from Favorites", `${product.name} removed from your favorites.`);
    } else {
      addToFavorites(product);
      Alert.alert(
        "Added to Favorites!", 
        `${product.name} added to your favorites.`,
        [
          { text: "Continue Shopping", style: "cancel" },
          { text: "View Favorites", onPress: () => router.push('/favorites') }
        ]
      );
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={12} color="#ffd700" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={12} color="#ffd700" />);
    }
    return stars;
  };

  return (
    <TouchableOpacity style={styles.gridProductCard} onPress={onPress}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: product.image }} style={styles.gridProductImage} />
        <View style={[styles.productBadge, 
          { backgroundColor: product.badge === 'BESTSELLER' ? '#ff6b6b' : 
                           product.badge === 'NEW' ? '#4ecdc4' :
                           product.badge === 'TRENDING' ? '#f9ca24' : '#7b4bb7' }
        ]}>
          <Text style={styles.productBadgeText}>{product.badge}</Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={handleFavoriteToggle}
        >
          <Ionicons 
            name={isFavorite(product.id) ? "heart" : "heart-outline"} 
            size={20} 
            color={isFavorite(product.id) ? "#ff6b6b" : "#fff"} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.gridProductInfo}>
        <Text style={styles.gridProductName} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.ratingRow}>
          <View style={styles.starsContainer}>
            {renderStars(product.rating)}
          </View>
          <Text style={styles.ratingText}>({product.reviews})</Text>
        </View>
        
        <View style={styles.gridPriceRow}>
          <Text style={styles.gridCurrentPrice}>₱{product.price}</Text>
          <Text style={styles.gridOriginalPrice}>₱{product.originalPrice}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.gridAddButton}
          onPress={handleAddToCart}
        >
          <Ionicons name="add" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Product Detail Modal Component
const ProductDetailModal: React.FC<{
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}> = ({ product, visible, onClose }) => {
  const { addToCart } = useContext(AppContext);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    Alert.alert(
      "Added to Cart!",
      `${quantity}x ${product.name} added to your cart.`,
      [{ text: "OK", onPress: onClose }]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#ffd700" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#ffd700" />);
    }
    return stars;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Product Details</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView>
          <Image source={{ uri: product.image }} style={styles.modalImage} />
          <View style={styles.modalContent}>
            <Text style={styles.modalProductName}>{product.name}</Text>
            
            <View style={styles.modalRatingContainer}>
              <View style={styles.modalStars}>
                {renderStars(product.rating)}
              </View>
              <Text style={styles.modalRating}>{product.rating}</Text>
              <Text style={styles.modalReviews}>({product.reviews} reviews)</Text>
            </View>
            
            <Text style={styles.modalDescription}>{product.description}</Text>
            
            <View style={styles.modalPriceRow}>
              <Text style={styles.modalPrice}>₱{product.price}</Text>
              <Text style={styles.modalOriginalPrice}>₱{product.originalPrice}</Text>
              <View style={styles.savingsContainer}>
                <Text style={styles.savingsText}>
                  Save ₱{product.originalPrice - product.price}
                </Text>
              </View>
            </View>
            
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Ionicons name="remove" size={20} color="#7b4bb7" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Ionicons name="add" size={20} color="#7b4bb7" />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity style={styles.modalAddButton} onPress={handleAddToCart}>
              <Text style={styles.modalAddText}>Add to Cart - ₱{product.price * quantity}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Cart Modal Component
const CartModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useContext(AppContext);

  const handleQuantityChange = (productId: number, change: number) => {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity + change);
    }
  };

  const handleCheckout = () => {
    Alert.alert(
      "Checkout",
      "Thank you for your order! Your flowers will be delivered soon.",
      [
        {
          text: "OK",
          onPress: () => {
            clearCart();
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Shopping Cart</Text>
          <View style={{ width: 24 }} />
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="bag-outline" size={80} color="#ddd" />
            <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtitle}>
              Add some beautiful flowers to get started
            </Text>
            <TouchableOpacity 
              style={styles.continueShoppingButton}
              onPress={onClose}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView style={styles.cartList}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>₱{item.price} each</Text>
                    <View style={styles.cartQuantityControls}>
                      <TouchableOpacity
                        style={styles.cartQuantityButton}
                        onPress={() => handleQuantityChange(item.id, -1)}
                      >
                        <Ionicons name="remove" size={16} color="#7b4bb7" />
                      </TouchableOpacity>
                      <Text style={styles.cartQuantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.cartQuantityButton}
                        onPress={() => handleQuantityChange(item.id, 1)}
                      >
                        <Ionicons name="add" size={16} color="#7b4bb7" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.cartItemRight}>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFromCart(item.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                    </TouchableOpacity>
                    <Text style={styles.cartItemTotal}>₱{item.price * item.quantity}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.cartFooter}>
              <View style={styles.cartSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>₱{getTotalPrice()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery</Text>
                  <Text style={styles.summaryValue}>₱50</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₱{getTotalPrice() + 50}</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                <Ionicons name="card-outline" size={20} color="#fff" />
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
};

// Home Screen Component
const HomeScreen: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const { getTotalItems } = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // FIXED: Category navigation function
  const handleCategoryPress = (category: Category) => {
    console.log(`Navigating to products with category: ${category.name}`);
    router.push(`/products?category=${category.name}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.headerTitle}>Find your perfect flowers</Text>
          </View>
          <TouchableOpacity style={styles.cartButton} onPress={() => setShowCartModal(true)}>
            <Ionicons name="bag-outline" size={24} color="#333" />
            {getTotalItems() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search flowers, bouquets..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color="#7b4bb7" />
          </TouchableOpacity>
        </View>

        {/* Hero Carousel */}
        <View style={styles.heroContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const slide = Math.ceil(e.nativeEvent.contentOffset.x / (width - 30));
              setCurrentSlide(slide);
            }}
          >
            {heroSlides.map((slide) => (
              <View key={slide.id} style={[styles.heroSlide, { width: width - 30 }]}>
                <Image source={{ uri: slide.image }} style={styles.heroImage} />
                <View style={styles.heroOverlay}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{slide.discount}</Text>
                  </View>
                  <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>{slide.title}</Text>
                    <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                    <TouchableOpacity 
                      style={styles.shopNowButton}
                      onPress={() => router.push('/products')}
                    >
                      <Text style={styles.shopNowText}>Shop Now</Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.slideIndicators}>
            {heroSlides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  { backgroundColor: currentSlide === index ? '#7b4bb7' : '#ddd' }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Categories - FIXED: Proper category navigation */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                  <Ionicons name={category.icon as any} size={28} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.label}</Text>
                <Text style={styles.categoryCount}>{category.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.allProductsGrid}>
            {allProducts.slice(0, 6).map((product) => (
              <ProductCard 
                key={product.id}
                product={product} 
                onPress={() => handleProductPress(product)}
              />
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        visible={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
      />

      {/* Cart Modal */}
      <CartModal 
        visible={showCartModal}
        onClose={() => setShowCartModal(false)}
      />
    </SafeAreaView>
  );
};

// Main App Component 
export default function App() {
  return (
    <AppProvider>
      <HomeScreen />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  greeting: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 5,
  },
  heroContainer: {
    marginBottom: 25,
  },
  heroSlide: {
    marginHorizontal: 15,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 15,
  },
  shopNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shopNowText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 5,
  },
  slideIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#7b4bb7',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#888',
  },
  productImageContainer: {
    position: 'relative',
  },
  productBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#7b4bb7',
  },
  productBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    padding: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 5,
  },
  ratingText: {
    fontSize: 12,
    color: '#888',
  },
  allProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  gridProductCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  gridProductImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  gridProductInfo: {
    padding: 12,
    position: 'relative',
  },
  gridProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    minHeight: 36,
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridCurrentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7b4bb7',
    marginRight: 6,
  },
  gridOriginalPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  gridAddButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#7b4bb7',
    borderRadius: 15,
    padding: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalContent: {
    padding: 20,
    backgroundColor: '#fff',
  },
  modalProductName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  modalRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  modalReviews: {
    fontSize: 14,
    color: '#888',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7b4bb7',
    marginRight: 12,
  },
  modalOriginalPrice: {
    fontSize: 18,
    color: '#888',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  savingsContainer: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quantityLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 5,
  },
  quantityBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    margin: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
  modalAddButton: {
    backgroundColor: '#7b4bb7',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalAddText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Cart Modal Styles
  cartList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  cartQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartQuantityButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 6,
    borderWidth: 1,
    borderColor: '#7b4bb7',
  },
  cartQuantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  cartItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: 5,
  },
  cartItemTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7b4bb7',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  continueShoppingButton: {
    backgroundColor: '#7b4bb7',
    borderRadius: 15,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartFooter: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 20,
  },
  cartSummary: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7b4bb7',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7b4bb7',
    borderRadius: 15,
    paddingVertical: 18,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});