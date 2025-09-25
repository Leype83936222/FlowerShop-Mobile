// AuthContext.tsx - Authentication Context without AsyncStorage (temporary)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { databaseService, User, LoginCredentials, RegisterData } from './database';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<RegisterData>) => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  updateProfile: async () => false,
  checkAuthStatus: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Simple in-memory storage (temporary replacement for AsyncStorage)
let inMemoryToken: string | null = null;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      if (inMemoryToken) {
        const validUser = await databaseService.validateSession(inMemoryToken);
        if (validUser) {
          setUser(validUser);
        } else {
          // Token invalid, remove it
          inMemoryToken = null;
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Validate input
      if (!credentials.email || !credentials.password) {
        Alert.alert('Error', 'Please enter both email and password');
        return false;
      }

      if (!isValidEmail(credentials.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return false;
      }

      const { user: loggedInUser, token } = await databaseService.login(credentials);
      
      // Store token in memory
      inMemoryToken = token;
      setUser(loggedInUser);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = (error as Error).message || 'Login failed';
      Alert.alert('Login Failed', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Validate input
      if (!userData.email || !userData.password || !userData.fullName) {
        Alert.alert('Error', 'Please fill in all required fields');
        return false;
      }

      if (!isValidEmail(userData.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return false;
      }

      if (userData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return false;
      }

      const newUser = await databaseService.register(userData);
      
      // Auto-login after registration
      const loginSuccess = await login({
        email: userData.email,
        password: userData.password
      });

      if (loginSuccess) {
        Alert.alert(
          'Registration Successful!', 
          `Welcome to Flower Shop, ${newUser.fullName}!`,
          [{ text: 'OK' }]
        );
      }
      
      return loginSuccess;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = (error as Error).message || 'Registration failed';
      Alert.alert('Registration Failed', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (inMemoryToken) {
        await databaseService.logout(inMemoryToken);
        inMemoryToken = null;
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<RegisterData>): Promise<boolean> => {
    try {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to update profile');
        return false;
      }

      setIsLoading(true);
      
      // Validate input
      if (updates.fullName && updates.fullName.trim().length === 0) {
        Alert.alert('Error', 'Full name cannot be empty');
        return false;
      }

      if (updates.password && updates.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return false;
      }

      const updatedUser = await databaseService.updateProfile(user.id, updates);
      setUser(updatedUser);
      
      Alert.alert('Success', 'Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = (error as Error).message || 'Profile update failed';
      Alert.alert('Update Failed', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};