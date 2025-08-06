import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

type User = {
  id: number;
  username: string;
  token: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  imageUrl?: string;
  roleId?: number;
  points?: number;
} | null;

type UserContextType = {
  user: User;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être utilisé à l\'intérieur de UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  const refreshUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (parsedUser?.token) {
        try {
          // Correction de l'URL : /users au lieu de /user
          const userInfo = await api.get('/users');
          
          // Fusionner les informations récupérées avec le token existant
          const updatedUser = { 
            ...userInfo, 
            token: parsedUser.token,
            points: userInfo.points || 0 // S'assurer que les points sont définis
          };
          
          setUser(updatedUser);
          
          // Mettre à jour le stockage local avec les nouvelles informations
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Erreur API lors de la récupération des informations utilisateur:', error);
          // En cas d'erreur API, on garde l'utilisateur stocké localement mais on ajoute les points à 0
          setUser({
            ...parsedUser,
            points: parsedUser.points || 0
          });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur :', error);
      setUser(null);
      await AsyncStorage.removeItem('user');
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
