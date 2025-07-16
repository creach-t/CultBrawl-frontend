import Constants from 'expo-constants';

// Configuration de l'API
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

// Configuration de l'application
export const APP_CONFIG = {
  name: 'CultBrawl',
  version: Constants.expoConfig?.version || '1.0.0',
  buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1',
};

// Configuration des votes
export const VOTE_CONFIG = {
  maxVotesPerMinute: 5,
  voteChangeAllowed: true,
  showRealTimeResults: true,
  autoRefreshInterval: 30000, // 30 secondes
};

// Configuration des images
export const IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  quality: 0.8,
};

// Configuration de la pagination
export const PAGINATION_CONFIG = {
  defaultLimit: 10,
  maxLimit: 50,
};

// Thème de l'application
export const THEME_COLORS = {
  primary: '#E91E63',
  secondary: '#2196F3',
  accent: '#4CAF50',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  error: '#F44336',
  warning: '#FF9800',
  success: '#4CAF50',
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
  },
  border: '#E0E0E0',
};

// Configuration des notifications
export const NOTIFICATION_CONFIG = {
  enabled: true,
  sound: true,
  vibration: true,
  badge: true,
};
