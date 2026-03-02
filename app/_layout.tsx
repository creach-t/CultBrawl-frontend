import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider, useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './header';
import { MessageProvider } from '../context/MessageContext';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

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

const VISIBLE_TABS = [
  { name: 'index', title: 'Accueil', icon: 'home.tab' as const },
  { name: 'battlelist', title: 'Battles', icon: 'battle.tab' as const },
  { name: 'leaderboard', title: 'Classement', icon: 'leaderboard.tab' as const },
  { name: 'account', title: 'Compte', icon: 'account.tab' as const },
];

const HIDDEN_ROUTES = [
  'entitylist',
  'auth',
  'signup',
  'header',
  'addmovie',
  'addentity',
  'addbattle',
  'battle-detail',
];

function RootWithTabs() {
  const { setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('user').then((storedUser) => {
      if (storedUser) setUser(JSON.parse(storedUser));
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return (
    <>
      <Header />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#6200ee',
          tabBarInactiveTintColor: '#9e9e9e',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: '#e0e0e0',
            ...Platform.select({
              ios: { position: 'absolute' },
              default: { elevation: 8 },
            }),
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        {VISIBLE_TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color }) => (
                <IconSymbol size={26} name={tab.icon} color={color} />
              ),
            }}
          />
        ))}
        {HIDDEN_ROUTES.map((name) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{ href: null }}
          />
        ))}
      </Tabs>
    </>
  );
}
