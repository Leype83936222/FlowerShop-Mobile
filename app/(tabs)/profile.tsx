// app/(tabs)/profile.tsx - Updated Profile Screen with Authentication
import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppContext } from '../AppContext';
import { useAuth } from '../AuthContext';

const EditProfileModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  user: any;
}> = ({ visible, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setIsLoading(true);
    const updateData: any = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim() || undefined,
      address: formData.address.trim() || undefined,
    };

    if (formData.newPassword) {
      updateData.password = formData.newPassword;
    }

    await onSave(updateData);
    setIsLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#7b4bb7" />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={formData.fullName}
                onChangeText={(value) => setFormData(prev => ({ ...prev, fullName: value }))}
                placeholder="Enter your full name"
                placeholderTextColor="#888"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                placeholder="Enter your phone number"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <View style={[styles.inputContainer, { alignItems: 'flex-start' }]}>
              <Ionicons name="location-outline" size={20} color="#888" style={[styles.inputIcon, { marginTop: 15 }]} />
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.address}
                onChangeText={(value) => setFormData(prev => ({ ...prev, address: value }))}
                placeholder="Enter your delivery address"
                placeholderTextColor="#888"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.passwordSection}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formData.newPassword}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, newPassword: value }))}
                  placeholder="Enter new password (optional)"
                  placeholderTextColor="#888"
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formData.confirmPassword}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
                  placeholder="Confirm new password"
                  placeholderTextColor="#888"
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const ProfileScreen: React.FC = () => {
  const { cartItems, favoriteItems, clearCart, clearFavorites, getTotalPrice } = useContext(AppContext);
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);

  // Redirect to login if not authenticated
  if (!user) {
    router.replace('./auth/login');
    return null;
  }

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to clear your cart?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => clearCart()
        }
      ]
    );
  };

  const handleClearFavorites = () => {
    Alert.alert(
      "Clear Favorites",
      "Are you sure you want to clear all favorites?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => clearFavorites()
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace('./auth/login');
          }
        }
      ]
    );
  };

  const handleEditProfile = async (updateData: any) => {
    const success = await updateProfile(updateData);
    if (success) {
      setShowEditModal(false);
    }
  };

  const navigateToAdmin = () => {
    router.push('./(tabs)/admin');
  };

  const MenuButton: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    color?: string;
    showBadge?: boolean;
    badgeCount?: number;
  }> = ({ icon, title, subtitle, onPress, color = '#333', showBadge = false, badgeCount = 0 }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={styles.menuButtonLeft}>
        <View style={[styles.menuIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={22} color={color} />
          {showBadge && badgeCount > 0 && (
            <View style={styles.menuBadge}>
              <Text style={styles.menuBadgeText}>{badgeCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#7b4bb715' }]}>
              <Ionicons name="bag-outline" size={24} color="#7b4bb7" />
            </View>
            <Text style={styles.statNumber}>{cartItems.length}</Text>
            <Text style={styles.statLabel}>Cart Items</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#ff6b6b15' }]}>
              <Ionicons name="heart-outline" size={24} color="#ff6b6b" />
            </View>
            <Text style={styles.statNumber}>{favoriteItems.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#4caf5015' }]}>
              <Ionicons name="wallet-outline" size={24} color="#4caf50" />
            </View>
            <Text style={styles.statNumber}>₱{getTotalPrice()}</Text>
            <Text style={styles.statLabel}>Cart Total</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <MenuButton
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => setShowEditModal(true)}
            color="#7b4bb7"
          />
          
          <MenuButton
            icon="location-outline"
            title="Delivery Address"
            subtitle={user.address || "Set your delivery location"}
            onPress={() => setShowEditModal(true)}
            color="#45b7d1"
          />
          
          <MenuButton
            icon="call-outline"
            title="Phone Number"
            subtitle={user.phone || "Add your phone number"}
            onPress={() => setShowEditModal(true)}
            color="#4caf50"
          />
        </View>

        {/* Admin Section (only for admins) */}
        {user.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administration</Text>
            
            <MenuButton
              icon="shield-checkmark-outline"
              title="Admin Dashboard"
              subtitle="Manage users and system settings"
              onPress={navigateToAdmin}
              color="#f9ca24"
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shopping</Text>
          
          <MenuButton
            icon="time-outline"
            title="Order History"
            subtitle="View your past orders"
            onPress={() => Alert.alert('Coming Soon', 'Order history will be available soon!')}
            color="#f9ca24"
          />
          
          <MenuButton
            icon="bag-outline"
            title="Clear Cart"
            subtitle={`${cartItems.length} items in cart`}
            onPress={handleClearCart}
            color="#ff6b6b"
            showBadge={true}
            badgeCount={cartItems.length}
          />
          
          <MenuButton
            icon="heart-outline"
            title="Clear Favorites"
            subtitle={`${favoriteItems.length} favorite items`}
            onPress={handleClearFavorites}
            color="#e74c3c"
            showBadge={true}
            badgeCount={favoriteItems.length}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <MenuButton
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help with your orders"
            onPress={() => Alert.alert('Support', 'Contact us at support@flowershop.com')}
            color="#9b59b6"
          />
          
          <MenuButton
            icon="document-text-outline"
            title="Terms & Conditions"
            onPress={() => Alert.alert('Terms', 'Terms and conditions will be displayed here.')}
            color="#666"
          />
          
          <MenuButton
            icon="shield-outline"
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Privacy policy will be displayed here.')}
            color="#666"
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Flower Shop v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for flower lovers</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditProfile}
        user={user}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#7b4bb7',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7b4bb7',
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9ca24',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  menuBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#ccc',
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
    fontWeight: '600',
    color: '#7b4bb7',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    paddingHorizontal: 15,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    minHeight: 50,
    paddingVertical: 15,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  passwordSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
});