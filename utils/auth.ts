import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

/**
 * Récupérer le token d'authentification
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
};

/**
 * Sauvegarder le token d'authentification
 */
export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token:', error);
    throw error;
  }
};

/**
 * Supprimer le token d'authentification
 */
export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression du token:', error);
    throw error;
  }
};

/**
 * Récupérer les données utilisateur
 */
export const getUserData = async (): Promise<any | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    return null;
  }
};

/**
 * Sauvegarder les données utilisateur
 */
export const setUserData = async (userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données utilisateur:', error);
    throw error;
  }
};

/**
 * Supprimer les données utilisateur
 */
export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression des données utilisateur:', error);
    throw error;
  }
};

/**
 * Effacer toutes les données d'authentification
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await Promise.all([
      removeAuthToken(),
      removeUserData()
    ]);
  } catch (error) {
    console.error('Erreur lors de l\'effacement des données d\'auth:', error);
    throw error;
  }
};

/**
 * Vérifier si l'utilisateur est authentifié
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    const userData = await getUserData();
    return !!(token && userData);
  } catch (error) {
    console.error('Erreur lors de la vérification d\'authentification:', error);
    return false;
  }
};
