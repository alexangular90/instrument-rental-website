import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await apiClient.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Failed to get profile:', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      if (response.success && response.data) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Ошибка входа');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiClient.register(userData);
      if (response.success && response.data) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Ошибка регистрации');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.removeToken();
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await apiClient.updateProfile(userData);
      if (response.success) {
        // Обновляем данные пользователя
        const profileResponse = await apiClient.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data);
        }
      } else {
        throw new Error(response.message || 'Ошибка обновления профиля');
      }
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};