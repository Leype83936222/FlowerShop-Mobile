import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppContext } from '../AppContext';
import { allProducts } from './index';

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

// Extended products dataset
const extendedProducts: Product[] = [
  ...allProducts,
  {
    id: 9,
    name: 'Lavender Dreams',
    price: 189,
    originalPrice: 239,
    image: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=400',
    rating: 4.6,
    reviews: 89,
    badge: 'AROMATIC',
    description: 'Soothing lavender bouquet with calming fragrance perfect for relaxation.',
    category: 'bouquets'
  },
  {
    id: 10,
    name: 'Orange Marigolds',
    price: 159,
    originalPrice: 199,
    image: 'https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=400',
    rating: 4.4,
    reviews: 56,
    badge: 'VIBRANT',
    description: 'Bright orange marigolds that bring warmth and energy to any space.',
    category: 'birthday'
  },
  {
    id: 11,
    name: 'Purple Orchid Elegance',
    price: 549,
    originalPrice: 699,
    image: 'https://images.unsplash.com/photo-1515002246390-7bf7e8f87b54?w=400',
    rating: 4.9,
    reviews: 143,
    badge: 'LUXURY',
    description: 'Exotic purple orchids for the most sophisticated occasions.',
    category: 'wedding'
  },
  {
    id: 12,
    name: 'Daisy Chain Bouquet',
    price: 139,
    originalPrice: 179,
    image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400',
    rating: 4.3,
    reviews: 72,
    badge: 'CHEERFUL',
    description: 'Simple and cheerful daisies perfect for casual occasions.',
    category: 'bouquets'
  },
  {
    id: 13,
    name: 'Red Carnation Cluster',
    price: 229,
    originalPrice: 289,
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400',
    rating: 4.5,
    reviews: 94,
    badge: 'CLASSIC',
    description: 'Traditional red carnations symbolizing deep love and affection.',
    category: 'roses'
  },
  {
    id: 14,
    name: 'Baby\'s Breath Arrangement',
    price: 199,
    originalPrice: 249,
    image: 'https://images.unsplash.com/photo-1469259943454-aa100abaa749?w=400',
    rating: 4.7,
    reviews: 108,
    badge: 'DELICATE',
    description: 'Delicate baby\'s breath flowers for elegant and minimalist arrangements.',
    category: 'wedding'
  },
  {
    id: 15,
    name: 'Tulip Spring Mix',
    price: 269,
    originalPrice: 339,
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400',
    rating: 4.8,
    reviews: 126,
    badge: 'SEASONAL',
    description: 'Colorful spring tulips in a vibrant mixed arrangement.',
    category: 'bouquets'
  },
  {
    id: 16,
    name: 'Yellow Chrysanthemums',
    price: 179,
    originalPrice: 229,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400',
    rating: 4.4,
    reviews: 83,
    badge: 'CHEERFUL',
    description: 'Bright yellow chrysanthemums perfect for autumn celebrations.',
    category: 'birthday'
  },
  {
    id: 17,
    name: 'White Rose Elegance',
    price: 319,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
    rating: 4.8,
    reviews: 156,
    badge: 'ELEGANT',
    description: 'Pure white roses symbolizing new beginnings and pure love.',
    category: 'roses'
  },
  {
    id: 18,
    name: 'Pink Rose Bouquet',
    price: 279,
    originalPrice: 349,
    image: 'https://images.unsplash.com/photo-1502181415656-405a82d99281?w=400',
    rating: 4.6,
    reviews: 98,
    badge: 'ROMANTIC',
    description: 'Soft pink roses perfect for romantic gestures and appreciation.',
    category: 'roses'
  }
];

// Categories
const categories: Category[] = [
  { id: 1, name: 'roses', label: 'Roses', icon: 'rose', color: '#ff6b6b', count: '6 items' },
  { id: 2, name: 'bouquets', label: 'Bouquets', icon: 'flower', color: '#4ecdc4', count: '4 items' },
  { id: 3, name: 'wedding', label: 'Wedding', icon: 'heart', color: '#45b7d1', count: '2 items' },
  { id: 4, name: 'birthday', label: 'Birthday', icon: 'gift', color: '#f9ca24', count: '2 items' }
];

// Cart Modal Component
const CartModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useContext(AppContext);

  const handleQuantityChange = async (productId: number, change: number) => {
    const item = cartItems.find(item => item.productId === productId);
    if (item) {
      await updateQuantity(productId, item.quantity + change);
    }
  };

  const handleCheckout = async () => {
    Alert.alert(
      "Checkout",
      "Thank you for your order! Your flowers will be delivered soon.",
      [
        {
          text: "OK",
          onPress: async () => {
            await clearCart();
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
                        onPress={() => handleQuantityChange(item.productId, -1)}
                      >
                        <Ionicons name="remove" size={16} color="#7b4bb7" />
                      </TouchableOpacity>
                      <Text style={styles.cartQuantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.cartQuantityButton}
                        onPress={() => handleQuantityChange(item.productId, 1)}
                      >
                        <Ionicons name="add" size={16} color="#7b4bb7" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.cartItemRight}>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFromCart(item.productId)}
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

// Product Card Component
const ProductCard: React.FC<{ 
  product: Product; 
  onPress: () => void; 
}> = ({ product, onPress }) => {
  const { addToCart, addToFavorites, removeFromFavorites, isFavorite } = useContext(AppContext);
  const router = useRouter();

  const handleAddToCart = async (e: any) => {
    e.stopPropagation();
    try {
      await addToCart(product);
      Alert.alert(
        "Added to Cart!",
        `${product.name} has been added to your cart.\nPrice: ₱${product.price}`,
        [
          { text: "Continue Shopping", style: "cancel" },
          { text: "View Cart", onPress: () => {} }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleFavoriteToggle = async (e: any) => {
    e.stopPropagation();
    try {
      if (isFavorite(product.id)) {
        await removeFromFavorites(product.id);
        Alert.alert("Removed from Favorites", `${product.name} removed from your favorites.`);
      } else {
        await addToFavorites(product);
        Alert.alert(
          "Added to Favorites!", 
          `${product.name} added to your favorites.`,
          [
            { text: "Continue Shopping", style: "cancel" },
            { text: "View Favorites", onPress: () => router.push('/(tabs)/favorites') }
          ]
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={[styles.badge, 
          { backgroundColor: product.badge === 'LUXURY' ? '#9b59b6' : 
                           product.badge === 'SEASONAL' ? '#e67e22' :
                           product.badge === 'AROMATIC' ? '#8e44ad' : 
                           product.badge === 'ROMANTIC' ? '#e74c3c' :
                           product.badge === 'BESTSELLER' ? '#ff6b6b' :
                           product.badge === 'NEW' ? '#4ecdc4' :
                           product.badge === 'TRENDING' ? '#f9ca24' :
                           product.badge === 'PREMIUM' ? '#9b59b6' :
                           product.badge === 'POPULAR' ? '#45b7d1' : 
                           product.badge === 'VIBRANT' ? '#ff9500' :
                           product.badge === 'CHEERFUL' ? '#32cd32' :
                           product.badge === 'CLASSIC' ? '#8b4513' :
                           product.badge === 'DELICATE' ? '#dda0dd' :
                           product.badge === 'ELEGANT' ? '#2f4f4f' : '#7b4bb7' }
        ]}>
          <Text style={styles.badgeText}>{product.badge}</Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteBtn} 
          onPress={handleFavoriteToggle}
        >
          <Ionicons 
            name={isFavorite(product.id) ? "heart" : "heart-outline"} 
            size={20} 
            color={isFavorite(product.id) ? "#ff6b6b" : "#fff"} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {renderStars(product.rating)}
          </View>
          <Text style={styles.reviewText}>({product.reviews})</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>₱{product.price}</Text>
          <Text style={styles.originalPrice}>₱{product.originalPrice}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToCart}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Product Detail Modal
const ProductDetailModal: React.FC<{
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}> = ({ product, visible, onClose }) => {
  const { addToCart } = useContext(AppContext);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = async () => {
    try {
      for (let i = 0; i < quantity; i++) {
        await addToCart(product);
      }
      Alert.alert(
        "Added to Cart!",
        `${quantity}x ${product.name} added to your cart.`,
        [{ text: "OK", onPress: onClose }]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
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

const ProductsContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const { getTotalItems } = useContext(AppContext);
  const router = useRouter();
  const params = useLocalSearchParams();

  // Handle category navigation from index.tsx
  useEffect(() => {
    if (params.category && typeof params.category === 'string') {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  const filteredProducts = extendedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category.name);
  };

  // Calculate actual counts for each category
  const getCategoryCount = (categoryName: string) => {
    return extendedProducts.filter(p => p.category === categoryName).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Cart */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Our Products</Text>
            <Text style={styles.subtitle}>Discover beautiful flowers for every occasion</Text>
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
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search flowers..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#888"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => setSelectedCategory('all')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesGrid}>
            {categories.map((category) => {
              const actualCount = getCategoryCount(category.name);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.name && styles.categoryCardActive
                  ]}
                  onPress={() => handleCategoryPress(category)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <Ionicons name={category.icon as any} size={28} color={category.color} />
                  </View>
                  <Text style={[
                    styles.categoryName,
                    selectedCategory === category.name && styles.categoryNameActive
                  ]}>
                    {category.label}
                  </Text>
                  <Text style={[
                    styles.categoryCount,
                    selectedCategory === category.name && styles.categoryCountActive
                  ]}>
                    {actualCount} items
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity
            style={[styles.categoryItem, selectedCategory === 'all' && styles.categoryActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
              All ({extendedProducts.length})
            </Text>
          </TouchableOpacity>
          {categories.map((category) => {
            const count = getCategoryCount(category.name);
            return (
              <TouchableOpacity
                key={`pill-${category.id}`}
                style={[styles.categoryItem, selectedCategory === category.name && styles.categoryActive]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text style={[styles.categoryText, selectedCategory === category.name && styles.categoryTextActive]}>
                  {category.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            {selectedCategory !== 'all' && ` in ${categories.find(c => c.name === selectedCategory)?.label}`}
            {searchText && ` for "${searchText}"`}
          </Text>
        </View>

        {/* Products Grid */}
        <View style={styles.productsGridContainer}>
          {filteredProducts.map((item) => (
            <ProductCard 
              key={item.id}
              product={item} 
              onPress={() => handleProductPress(item)}
            />
          ))}
        </View>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={60} color="#ddd" />
            <Text style={styles.noResultsTitle}>No products found</Text>
            <Text style={styles.noResultsText}>
              {searchText 
                ? `No products match "${searchText}"`
                : 'No products in this category'}
            </Text>
            <TouchableOpacity 
              style={styles.clearFiltersBtn}
              onPress={() => {
                setSearchText('');
                setSelectedCategory('all');
              }}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
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

export default function ProductsScreen() {
  return <ProductsContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  // Categories Section
  section: {
    marginBottom: 20,
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
  categoryCardActive: {
    backgroundColor: '#7b4bb7',
    transform: [{ scale: 0.98 }],
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
  categoryNameActive: {
    color: '#fff',
  },
  categoryCount: {
    fontSize: 12,
    color: '#888',
  },
  categoryCountActive: {
    color: '#fff',
    opacity: 0.9,
  },
  // Filter Pills
  categoryScroll: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  categoryItem: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryActive: {
    backgroundColor: '#7b4bb7',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  resultsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  productsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    padding: 6,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    minHeight: 36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 5,
  },
  reviewText: {
    fontSize: 12,
    color: '#888',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7b4bb7',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7b4bb7',
    borderRadius: 8,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  clearFiltersBtn: {
    backgroundColor: '#7b4bb7',
    borderRadius: 15,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  clearFiltersText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
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