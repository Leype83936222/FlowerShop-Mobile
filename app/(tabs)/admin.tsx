// app/(tabs)/admin.tsx - Fixed Admin Dashboard
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import { databaseService } from '../database';

// Types
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

interface User {
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

interface Order {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  products: { id: number; name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

// Modal component interfaces
interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: () => void;
  loadProducts: () => Promise<void>;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: () => void;
  loadUsers: () => Promise<void>;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadUsers(),
        loadOrders(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productList = await databaseService.getAllProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const userList = await databaseService.getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const orderList = await databaseService.getAllOrders();
      setOrders(orderList);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="shield-outline" size={80} color="#ccc" />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>You need admin privileges to access this page.</Text>
          <TouchableOpacity style={styles.backButton} onPress={logout}>
            <Text style={styles.backButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, onSave, loadProducts }) => {
    const [formData, setFormData] = useState({
      name: product?.name || '',
      price: product?.price?.toString() || '',
      originalPrice: product?.originalPrice?.toString() || '',
      image: product?.image || '',
      rating: product?.rating?.toString() || '4.5',
      reviews: product?.reviews?.toString() || '0',
      badge: product?.badge || 'NEW',
      description: product?.description || '',
      category: product?.category || 'bouquets'
    });

    // Update form data when product prop changes
    useEffect(() => {
      if (product) {
        setFormData({
          name: product.name || '',
          price: product.price?.toString() || '',
          originalPrice: product.originalPrice?.toString() || '',
          image: product.image || '',
          rating: product.rating?.toString() || '4.5',
          reviews: product.reviews?.toString() || '0',
          badge: product.badge || 'NEW',
          description: product.description || '',
          category: product.category || 'bouquets'
        });
      } else {
        // Reset form for new product
        setFormData({
          name: '',
          price: '',
          originalPrice: '',
          image: '',
          rating: '4.5',
          reviews: '0',
          badge: 'NEW',
          description: '',
          category: 'bouquets'
        });
      }
    }, [product]);

    const handleSave = async () => {
      if (!formData.name || !formData.price || !formData.originalPrice || !formData.description) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        image: formData.image || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: parseFloat(formData.rating),
        reviews: parseInt(formData.reviews),
        badge: formData.badge,
        description: formData.description,
        category: formData.category
      };

      try {
        if (product) {
          await databaseService.updateProduct(product.id, productData);
          Alert.alert('Success', 'Product updated successfully!');
        } else {
          await databaseService.addProduct(productData);
          Alert.alert('Success', 'Product added successfully!');
        }
        await loadProducts();
        onClose();
      } catch (error) {
        console.error('Error saving product:', error);
        Alert.alert('Error', 'Failed to save product');
      }
    };

    if (!isOpen) return null;

    return (
      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {product ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter product name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="299"
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Original Price *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="399"
                  keyboardType="numeric"
                  value={formData.originalPrice}
                  onChangeText={(text) => setFormData({ ...formData, originalPrice: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryButtons}>
                {['roses', 'bouquets', 'wedding', 'birthday'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      formData.category === cat && styles.categoryButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat })}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.category === cat && styles.categoryButtonTextActive
                    ]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Badge</Text>
              <View style={styles.categoryButtons}>
                {['NEW', 'BESTSELLER', 'TRENDING', 'PREMIUM', 'POPULAR'].map((badge) => (
                  <TouchableOpacity
                    key={badge}
                    style={[
                      styles.categoryButton,
                      formData.badge === badge && styles.categoryButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, badge })}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.badge === badge && styles.categoryButtonTextActive
                    ]}>
                      {badge}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Rating</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="4.5"
                  keyboardType="numeric"
                  value={formData.rating}
                  onChangeText={(text) => setFormData({ ...formData, rating: text })}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Reviews</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={formData.reviews}
                  onChangeText={(text) => setFormData({ ...formData, reviews: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Image URL</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.image}
                onChangeText={(text) => setFormData({ ...formData, image: text })}
                multiline
              />
              {formData.image && (
                <Image source={{ uri: formData.image }} style={styles.previewImage} />
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter product description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user: editUser, onSave, loadUsers }) => {
    const [formData, setFormData] = useState({
      fullName: editUser?.fullName || '',
      email: editUser?.email || '',
      phone: editUser?.phone || '',
      address: editUser?.address || '',
      role: editUser?.role || 'user' as 'user' | 'admin'
    });

    // Update form data when editUser prop changes
    useEffect(() => {
      if (editUser) {
        setFormData({
          fullName: editUser.fullName || '',
          email: editUser.email || '',
          phone: editUser.phone || '',
          address: editUser.address || '',
          role: editUser.role || 'user'
        });
      }
    }, [editUser]);

    const handleSave = async () => {
      if (!formData.fullName || !formData.email) {
        Alert.alert('Error', 'Please fill in required fields');
        return;
      }

      if (!editUser) {
        Alert.alert('Error', 'User data not found');
        return;
      }

      try {
        await databaseService.updateUserProfile(editUser.id, formData);
        Alert.alert('Success', 'User updated successfully!');
        await loadUsers();
        onClose();
      } catch (error) {
        console.error('Error saving user:', error);
        Alert.alert('Error', 'Failed to save user');
      }
    };

    if (!isOpen) return null;

    return (
      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit User</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter full name"
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="user@example.com"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter phone number"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter address"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Role</Text>
              <View style={styles.categoryButtons}>
                {['user', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.categoryButton,
                      formData.role === role && styles.categoryButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, role: role as 'user' | 'admin' })}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.role === role && styles.categoryButtonTextActive
                    ]}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const deleteProduct = async (productId: number) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteProduct(productId);
              Alert.alert('Success', 'Product deleted successfully!');
              await loadProducts();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const deleteUser = async (userId: number) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteUser(userId);
              Alert.alert('Success', 'User deleted successfully!');
              await loadUsers();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const updateOrderStatus = async (orderId: number, newStatus: 'pending' | 'completed' | 'cancelled') => {
    try {
      await databaseService.updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', 'Order status updated successfully!');
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome, {user.fullName}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ff6b6b" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons 
            name="cube-outline" 
            size={20} 
            color={activeTab === 'products' ? '#7b4bb7' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            Products
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={activeTab === 'users' ? '#7b4bb7' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons 
            name="receipt-outline" 
            size={20} 
            color={activeTab === 'orders' ? '#7b4bb7' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Orders
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7b4bb7" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Products Tab */}
          {activeTab === 'products' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Products ({products.length})</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    setEditingProduct(null);
                    setShowProductModal(true);
                  }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addButtonText}>Add Product</Text>
                </TouchableOpacity>
              </View>
              
              {products.map((product) => (
                <View key={product.id} style={styles.card}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <View style={styles.cardContent}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>₱{product.price}</Text>
                      <Text style={styles.originalPrice}>₱{product.originalPrice}</Text>
                    </View>
                    <View style={styles.productMeta}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#ffd700" />
                        <Text style={styles.rating}>{product.rating}</Text>
                        <Text style={styles.reviews}>({product.reviews})</Text>
                      </View>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{product.badge}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setEditingProduct(product);
                        setShowProductModal(true);
                      }}
                    >
                      <Ionicons name="pencil" size={16} color="#7b4bb7" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteProduct(product.id)}
                    >
                      <Ionicons name="trash" size={16} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Users ({users.length})</Text>
              </View>
              
              {users.map((userItem) => (
                <View key={userItem.id} style={styles.card}>
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={24} color="#7b4bb7" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.userName}>{userItem.fullName}</Text>
                    <Text style={styles.userEmail}>{userItem.email}</Text>
                    {userItem.phone && (
                      <Text style={styles.userPhone}>{userItem.phone}</Text>
                    )}
                    <View style={styles.userMeta}>
                      <View style={[styles.badge, 
                        { backgroundColor: userItem.role === 'admin' ? '#9b59b6' : '#4ecdc4' }
                      ]}>
                        <Text style={styles.badgeText}>{userItem.role.toUpperCase()}</Text>
                      </View>
                      <View style={[styles.statusBadge, 
                        { backgroundColor: userItem.isActive ? '#4caf50' : '#f44336' }
                      ]}>
                        <Text style={styles.badgeText}>
                          {userItem.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setEditingUser(userItem);
                        setShowUserModal(true);
                      }}
                    >
                      <Ionicons name="pencil" size={16} color="#7b4bb7" />
                    </TouchableOpacity>
                    {userItem.id !== user.id && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteUser(userItem.id)}
                      >
                        <Ionicons name="trash" size={16} color="#ff6b6b" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Orders ({orders.length})</Text>
              </View>
              
              {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="receipt-outline" size={80} color="#ddd" />
                  <Text style={styles.emptyTitle}>No Orders Yet</Text>
                  <Text style={styles.emptyText}>Orders will appear here when customers make purchases</Text>
                </View>
              ) : (
                orders.map((order) => (
                  <View key={order.id} style={styles.card}>
                    <View style={styles.cardContent}>
                      <View style={styles.orderHeader}>
                        <Text style={styles.orderId}>Order #{order.id}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              'Update Order Status',
                              'Choose new status:',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Pending', onPress: () => updateOrderStatus(order.id, 'pending') },
                                { text: 'Completed', onPress: () => updateOrderStatus(order.id, 'completed') },
                                { text: 'Cancelled', onPress: () => updateOrderStatus(order.id, 'cancelled') },
                              ]
                            );
                          }}
                        >
                          <View style={[styles.statusBadge, 
                            { backgroundColor: 
                              order.status === 'completed' ? '#4caf50' : 
                              order.status === 'pending' ? '#ff9800' : '#f44336' }
                          ]}>
                            <Text style={styles.badgeText}>{order.status.toUpperCase()}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                      
                      <Text style={styles.customerInfo}>{order.userName}</Text>
                      <Text style={styles.customerEmail}>{order.userEmail}</Text>
                      
                      <View style={styles.orderItems}>
                        {order.products.map((item, index) => (
                          <Text key={index} style={styles.orderItem}>
                            {item.quantity}x {item.name} - ₱{item.price * item.quantity}
                          </Text>
                        ))}
                      </View>
                      
                      <View style={styles.orderFooter}>
                        <Text style={styles.orderDate}>{order.createdAt}</Text>
                        <Text style={styles.orderTotal}>Total: ₱{order.total}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={() => {}}
        loadProducts={loadProducts}
      />

      <UserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={() => {}}
        loadUsers={loadUsers}
      />
    </SafeAreaView>
  );
};

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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#7b4bb7',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#7b4bb7',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#7b4bb7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7b4bb7',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
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
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  badge: {
    backgroundColor: '#7b4bb7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  cardActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 6,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  customerInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  orderItems: {
    marginBottom: 8,
  },
  orderItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7b4bb7',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7b4bb7',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#7b4bb7',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 8,
  },
});

export default AdminDashboard;