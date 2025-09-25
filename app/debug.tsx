import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { databaseService } from './database';
import { useAuth } from './AuthContext';
import * as FileSystem from 'expo-file-system';

export default function DebugScreen() {
  const [data, setData] = useState<any>({});
  const [dbPath, setDbPath] = useState<string>('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const { user } = useAuth();

  const loadData = async () => {
    try {
      let cart: any[] = [];
      let favorites: any[] = [];
      let cartCount = 0;
      let favoritesCount = 0;
      let cartTotal = 0;

      // Only load user-specific data if user is logged in
      if (user) {
        cart = await databaseService.getCartItems(user.id);
        favorites = await databaseService.getFavoriteItems(user.id);
        cartCount = await databaseService.getCartCount(user.id);
        favoritesCount = await databaseService.getFavoritesCount(user.id);
        cartTotal = await databaseService.getCartTotal(user.id);
      }

      // Load admin data
      const users = await databaseService.getAllUsers();
      const products = await databaseService.getAllProducts();
      const orders = await databaseService.getAllOrders();
      
      const path = databaseService.getDatabasePath();
      
      setData({ 
        cart, 
        favorites, 
        cartCount, 
        favoritesCount, 
        cartTotal 
      });
      setAllUsers(users);
      setAllProducts(products);
      setAllOrders(orders);
      setDbPath(path);
      
      // Console logging
      console.log('=== DEBUG SCREEN DATA ===');
      if (user) {
        console.log(`Current User: ${user.fullName} (ID: ${user.id}, Role: ${user.role})`);
        console.log('=== CART ITEMS ===');
        console.table(cart);
        console.log('=== FAVORITES ===');
        console.table(favorites);
        console.log('Cart Stats:', { cartCount, favoritesCount, cartTotal });
      } else {
        console.log('No user logged in - showing system data only');
      }
      
      console.log('=== ALL USERS ===');
      console.table(users);
      console.log('=== ALL PRODUCTS ===');
      console.table(products);
      console.log('=== ALL ORDERS ===');
      console.table(orders);
      console.log('Database Path:', path);
      console.log('========================');
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', `Failed to load data: ${error}`);
    }
  };

  const exportDatabase = async () => {
    try {
      // Create export function since it doesn't exist in the database service
      const sourcePath = databaseService.getDatabasePath();
      const documentsDir = FileSystem.documentDirectory;
      const exportPath = `${documentsDir}exported_flowerShop.db`;
      
      // Copy the database file
      await FileSystem.copyAsync({
        from: sourcePath,
        to: exportPath
      });
      
      Alert.alert(
        'Database Exported',
        `Database exported to:\n${exportPath}\n\nCheck your console for the full path.`,
        [{ text: 'OK' }]
      );
      console.log('=== DATABASE EXPORT ===');
      console.log('Exported to:', exportPath);
      console.log('You can find this file in your app\'s document directory');
      console.log('=====================');
      
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', String(error));
    }
  };

  const checkFileSystem = async () => {
    try {
      console.log('=== FILE SYSTEM INFO ===');
      console.log('Document Directory:', FileSystem.documentDirectory);
      console.log('Cache Directory:', FileSystem.cacheDirectory);
      
      if (!FileSystem.documentDirectory) {
        console.log('Document directory is not available');
        Alert.alert('Error', 'Document directory is not available');
        return;
      }
      
      const docDirInfo = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      console.log('Files in Document Directory:', docDirInfo);
      
      const sqliteDir = `${FileSystem.documentDirectory}SQLite/`;
      const sqliteDirInfo = await FileSystem.getInfoAsync(sqliteDir);
      console.log('SQLite Directory exists:', sqliteDirInfo.exists);
      
      if (sqliteDirInfo.exists) {
        const sqliteFiles = await FileSystem.readDirectoryAsync(sqliteDir);
        console.log('Files in SQLite Directory:', sqliteFiles);
      }
      
      console.log('======================');
      
      Alert.alert(
        'File System Check',
        'Check your console for detailed file system information'
      );
    } catch (error) {
      console.error('File system check error:', error);
    }
  };

  const clearUserData = async () => {
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    Alert.alert(
      'Clear User Data',
      `This will clear cart and favorites for ${user.fullName}. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.clearCart(user.id);
              await databaseService.clearFavorites(user.id);
              await loadData();
              Alert.alert('Success', 'User data cleared');
            } catch (error) {
              console.error('Clear data error:', error);
              Alert.alert('Error', String(error));
            }
          }
        }
      ]
    );
  };

  const addTestData = async () => {
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    try {
      // Add first product to cart and favorites for testing
      if (allProducts.length > 0) {
        const testProduct = allProducts[0];
        await databaseService.addToCart(user.id, testProduct);
        await databaseService.addToFavorites(user.id, testProduct);
        
        if (allProducts.length > 1) {
          const testProduct2 = allProducts[1];
          await databaseService.addToCart(user.id, testProduct2);
        }
        
        await loadData();
        Alert.alert('Success', 'Test data added to cart and favorites');
      } else {
        Alert.alert('Error', 'No products available to add');
      }
    } catch (error) {
      console.error('Add test data error:', error);
      Alert.alert('Error', String(error));
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, [user]); // Reload when user changes

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Database Debug</Text>
        
        {/* User Info */}
        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.sectionTitle}>Current User:</Text>
            <Text style={styles.userText}>{user.fullName} ({user.email})</Text>
            <Text style={styles.userText}>Role: {user.role.toUpperCase()}</Text>
            <Text style={styles.userText}>ID: {user.id}</Text>
          </View>
        ) : (
          <View style={styles.userInfo}>
            <Text style={styles.sectionTitle}>No User Logged In</Text>
            <Text style={styles.helpText}>Login to see user-specific data</Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={loadData}>
            <Text style={styles.buttonText}>Refresh Database Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exportButton} onPress={exportDatabase}>
            <Text style={styles.buttonText}>Export Database</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoButton} onPress={checkFileSystem}>
            <Text style={styles.buttonText}>Check File System</Text>
          </TouchableOpacity>

          {user && (
            <>
              <TouchableOpacity style={styles.testButton} onPress={addTestData}>
                <Text style={styles.buttonText}>Add Test Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.clearButton} onPress={clearUserData}>
                <Text style={styles.buttonText}>Clear User Data</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {/* Database Path Info */}
        <View style={styles.pathContainer}>
          <Text style={styles.sectionTitle}>Database Path:</Text>
          <Text style={styles.pathText}>{dbPath || 'Loading...'}</Text>
          <Text style={styles.helpText}>
            Copy this path to locate your database file
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Database Statistics:</Text>
          <Text style={styles.section}>Total Users: {allUsers.length}</Text>
          <Text style={styles.section}>Total Products: {allProducts.length}</Text>
          <Text style={styles.section}>Total Orders: {allOrders.length}</Text>
          {user && (
            <>
              <Text style={styles.section}>Your Cart Items: {data.cartCount || 0}</Text>
              <Text style={styles.section}>Your Favorites: {data.favoritesCount || 0}</Text>
              <Text style={styles.section}>Cart Total: ₱{data.cartTotal || 0}</Text>
            </>
          )}
        </View>

        {/* Show user's cart items */}
        {user && data.cart && data.cart.length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Your Cart Items:</Text>
            {data.cart.map((item: any, index: number) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>ID: {item.id} | Product ID: {item.productId}</Text>
                <Text style={styles.itemDetail}>Quantity: {item.quantity}</Text>
                <Text style={styles.itemDetail}>Price: ₱{item.price}</Text>
                <Text style={styles.itemDetail}>Category: {item.category}</Text>
                <Text style={styles.itemDetail}>Created: {item.createdAt}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Show user's favorites */}
        {user && data.favorites && data.favorites.length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Your Favorites:</Text>
            {data.favorites.map((item: any, index: number) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>ID: {item.id} | Product ID: {item.productId}</Text>
                <Text style={styles.itemDetail}>Price: ₱{item.price}</Text>
                <Text style={styles.itemDetail}>Category: {item.category}</Text>
                <Text style={styles.itemDetail}>Created: {item.createdAt}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Show all users (admin view) */}
        {user && user.role === 'admin' && allUsers.length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>All Users:</Text>
            {allUsers.map((userItem: any, index: number) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemName}>{userItem.fullName}</Text>
                <Text style={styles.itemDetail}>ID: {userItem.id} | Email: {userItem.email}</Text>
                <Text style={styles.itemDetail}>Role: {userItem.role} | Active: {userItem.isActive ? 'Yes' : 'No'}</Text>
                <Text style={styles.itemDetail}>Created: {userItem.createdAt}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Show all products */}
        {allProducts.length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>All Products:</Text>
            {allProducts.slice(0, 3).map((product: any, index: number) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemName}>{product.name}</Text>
                <Text style={styles.itemDetail}>ID: {product.id} | Category: {product.category}</Text>
                <Text style={styles.itemDetail}>Price: ₱{product.price} | Original: ₱{product.originalPrice}</Text>
                <Text style={styles.itemDetail}>Rating: {product.rating} | Reviews: {product.reviews}</Text>
                <Text style={styles.itemDetail}>Badge: {product.badge}</Text>
              </View>
            ))}
            {allProducts.length > 3 && (
              <Text style={styles.helpText}>... and {allProducts.length - 3} more products</Text>
            )}
          </View>
        )}

        {/* Show orders */}
        {allOrders.length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Recent Orders:</Text>
            {allOrders.slice(0, 2).map((order: any, index: number) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemName}>Order #{order.id}</Text>
                <Text style={styles.itemDetail}>User: {order.userName} ({order.userEmail})</Text>
                <Text style={styles.itemDetail}>Total: ₱{order.total} | Status: {order.status}</Text>
                <Text style={styles.itemDetail}>Items: {order.products.length}</Text>
                <Text style={styles.itemDetail}>Created: {order.createdAt}</Text>
              </View>
            ))}
            {allOrders.length > 2 && (
              <Text style={styles.helpText}>... and {allOrders.length - 2} more orders</Text>
            )}
          </View>
        )}

        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>How to Use Debug Screen:</Text>
          <Text style={styles.instructionText}>
            1. Login to see your personal cart and favorites data{'\n'}
            2. Use "Add Test Data" to add sample items to your cart{'\n'}
            3. Use "Export Database" to save database file{'\n'}
            4. Use "Clear User Data" to reset your cart and favorites{'\n'}
            5. Admin users can see all users and orders{'\n'}
            6. Check console for detailed table views
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  userInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff'
  },
  userText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  buttonContainer: {
    marginBottom: 20
  },
  button: { 
    backgroundColor: '#007bff', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  exportButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  infoButton: {
    backgroundColor: '#6f42c1',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  testButton: {
    backgroundColor: '#17a2b8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  clearButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  buttonText: { 
    color: 'white', 
    textAlign: 'center', 
    fontWeight: 'bold',
    fontSize: 16
  },
  pathContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107'
  },
  pathText: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    marginVertical: 5
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20
  },
  section: { 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  dataSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  itemContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff'
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333'
  },
  itemDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2
  },
  instructionsContainer: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff'
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  }
});