import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppContext } from './index';

// TypeScript interfaces (matching index.tsx)
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

// Product Detail Modal Component (same as products.tsx)
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

const FavoriteProductCard: React.FC<{ 
  product: Product; 
  onPress: () => void; 
}> = ({ product, onPress }) => {
  const { addToCart, removeFromFavorites } = useContext(AppContext);

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addToCart(product);
    Alert.alert(
      "Added to Cart! 🛒", 
      `${product.name} has been added to your cart.\nPrice: ₱${product.price}`,
      [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => {} }
      ]
    );
  };

  const handleRemoveFromFavorites = (e: any) => {
    e.stopPropagation();
    Alert.alert(
      "Remove from Favorites?",
      `Are you sure you want to remove ${product.name} from your favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            removeFromFavorites(product.id);
            Alert.alert("Removed!", `${product.name} removed from favorites.`);
          }
        }
      ]
    );
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
    <TouchableOpacity style={styles.favoriteCard} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.favoriteImage} />
        <View style={[styles.favoriteBadge, 
          { backgroundColor: product.badge === 'LUXURY' ? '#9b59b6' : 
                           product.badge === 'SEASONAL' ? '#e67e22' :
                           product.badge === 'AROMATIC' ? '#8e44ad' : 
                           product.badge === 'ROMANTIC' ? '#e74c3c' :
                           product.badge === 'BESTSELLER' ? '#ff6b6b' :
                           product.badge === 'NEW' ? '#4ecdc4' :
                           product.badge === 'TRENDING' ? '#f9ca24' :
                           product.badge === 'PREMIUM' ? '#9b59b6' :
                           product.badge === 'POPULAR' ? '#45b7d1' : '#7b4bb7' }
        ]}>
          <Text style={styles.favoriteBadgeText}>{product.badge}</Text>
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveFromFavorites}>
          <Ionicons name="heart" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.favoriteRatingContainer}>
          <View style={styles.favoriteStars}>
            {renderStars(product.rating)}
          </View>
          <Text style={styles.favoriteRatingText}>({product.reviews})</Text>
        </View>
        
        <View style={styles.favoritePriceContainer}>
          <Text style={styles.favoritePrice}>₱{product.price}</Text>
          <Text style={styles.favoriteOriginalPrice}>₱{product.originalPrice}</Text>
        </View>
        
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Ionicons name="bag-add-outline" size={14} color="#fff" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const FavoritesContent: React.FC = () => {
  const { favoriteItems } = useContext(AppContext);
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleClearAllFavorites = () => {
    if (favoriteItems.length === 0) return;
    
    Alert.alert(
      "Clear All Favorites?",
      "Are you sure you want to remove all items from your favorites?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: () => {
            favoriteItems.forEach(item => {
              const { removeFromFavorites } = useContext(AppContext);
              removeFromFavorites(item.id);
            });
            Alert.alert("Cleared!", "All favorites have been removed.");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>My Favorites</Text>
          <Text style={styles.subtitle}>{favoriteItems.length} items saved</Text>
        </View>
        {favoriteItems.length > 0 && (
          <TouchableOpacity 
            style={styles.clearAllBtn}
            onPress={handleClearAllFavorites}
          >
            <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {favoriteItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start adding flowers to your favorites by tapping the heart icon on any product
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/products')}
          >
            <Ionicons name="flower-outline" size={20} color="#fff" />
            <Text style={styles.shopButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="heart" size={24} color="#ff6b6b" />
              <Text style={styles.statNumber}>{favoriteItems.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="pricetag" size={24} color="#4caf50" />
              <Text style={styles.statNumber}>
                ₱{favoriteItems.reduce((sum, item) => sum + (item.originalPrice - item.price), 0)}
              </Text>
              <Text style={styles.statLabel}>Total Savings</Text>
            </View>
          </View>

          <FlatList
            data={favoriteItems}
            renderItem={({ item }) => (
              <FavoriteProductCard 
                product={item} 
                onPress={() => handleProductPress(item)} 
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.favoritesList}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        visible={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
      />
    </SafeAreaView>
  );
};

export default function Favorites() {
  return <FavoritesContent />;
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
  headerLeft: {
    flex: 1,
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
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearAllText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7b4bb7',
    borderRadius: 15,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  favoritesList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  favoriteCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    marginHorizontal: '1%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  favoriteImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  favoriteBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 6,
  },
  favoriteInfo: {
    padding: 12,
  },
  favoriteName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    minHeight: 36,
  },
  favoriteRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteStars: {
    flexDirection: 'row',
    marginRight: 5,
  },
  favoriteRatingText: {
    fontSize: 12,
    color: '#888',
  },
  favoritePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  favoritePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7b4bb7',
    marginRight: 8,
  },
  favoriteOriginalPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7b4bb7',
    borderRadius: 8,
    paddingVertical: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Modal Styles (matching products.tsx)
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
});