import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider, useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './header';
import { MessageProvider } from '../context/MessageContext';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Réessaye deux fois avant de renvoyer une erreur
      refetchOnWindowFocus: false, // Ne recharge pas automatiquement lorsque la fenêtre est réactivée
    },
  },
});

// Layout principal avec contexte et provider
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <UserProvider>
          <MessageProvider>
            <QueryClientProvider client={queryClient}>
                <RootWithTabs />
            </QueryClientProvider>
          </MessageProvider>
        </UserProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

// Rendu des onglets avec Header intégré
function RootWithTabs() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  const allowedScreens = [
    { name: 'index', title: 'Home', icon: 'home.tab', visible: true },
    { name: 'battlelist', title: 'Battles', icon: 'battle.tab', visible: true },
    { name: 'entitylist', title: 'Entity', icon: 'entity.tab', visible: false },
    { name: 'account', title: 'Account', icon: 'account.tab', visible: false },
    { name: 'auth', title: 'Login', icon: 'account.circle', visible: false },
    { name: 'signup', title: 'Register', icon: 'account.circle', visible: false },
    { name: 'header', title: 'Battle', icon: 'battle.tab', visible: false },
    { name: 'leaderboard', title: 'Leaderboard', icon: 'leaderboard.tab', visible: true },
    { name: 'addmovie', title: 'Add Movie', icon: 'leaderboard.tab', visible: false },
    { name: 'addentity', title: 'Add Entity', icon: 'leaderboard.tab', visible: false },
    { name: 'addbattle', title: 'Add Battle', icon: 'leaderboard.tab', visible: false },
    { name: 'battle-detail', title: 'Battle Detail', icon: 'leaderboard.tab', visible: false },
  ];

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return null;  // Empêche l'affichage prématuré
  }

  return (
    <>
      <Header />  {/* L'en-tête est affiché en permanence */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'blue',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute', // Blur sur iOS
            },
            default: {},
          }),
        }}>
        {allowedScreens.map((screen) => (
          <Tabs.Screen
            key={screen.name}
            name={screen.name}
            options={{
              ...(screen.visible ? {} : { href: null }),  // Ajoute href: null seulement si visible est false
              title: screen.title,
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name={screen.icon} color={color} />
              ),
            }}
          />
        ))}
      </Tabs>
    </>
  );
}
