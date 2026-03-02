import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import CardBattle from '../components/cardBattle';
import { useUser } from '../context/UserContext';
import { useIsAdmin } from '../hooks/useIsAdmin';
import api from '../services/api';

interface Entity {
  id: number;
  name: string;
  imageUrl?: string;
  type?: string;
}

interface Battle {
  id: number;
  title?: string;
  category?: string;
  participants: [Entity, Entity];
  status: string;
  endTime?: string;
}

export default function BattleList() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const isAdmin = useIsAdmin();
  const { width } = useWindowDimensions();

  // On large screens, constrain and center the list
  const isWide = width >= 768;
  const contentMaxWidth = Math.min(width, 700);

  const fetchBattles = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await api.get('/battles');
      setBattles(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Erreur récupération battles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBattles();
      const interval = setInterval(() => fetchBattles(), 30000);
      return () => clearInterval(interval);
    }, [fetchBattles])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Chargement des battles…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={battles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.cardWrapper, isWide && { alignSelf: 'center', width: contentMaxWidth }]}>
            <CardBattle
              battle={item}
              user={user}
              isAdmin={isAdmin}
              onDelete={(id) => setBattles((prev) => prev.filter((b) => b.id !== id))}
            />
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          isWide && styles.listContentWide,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBattles(true)}
            colors={['#6200ee']}
            tintColor="#6200ee"
          />
        }
        ListHeaderComponent={
          <View style={[styles.listHeader, isWide && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}>
            <Text style={styles.screenTitle}>⚔️ Battles</Text>
            {user && (
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => router.push('/addbattle')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="boxing-glove" size={18} color="#fff" />
                <Text style={styles.createBtnText}>Créer une battle</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🥊</Text>
            <Text style={styles.emptyTitle}>Aucune battle en cours</Text>
            <Text style={styles.emptySubtitle}>Tirez vers le bas pour actualiser</Text>
            {user && (
              <TouchableOpacity
                style={styles.emptyCreateBtn}
                onPress={() => router.push('/addbattle')}
              >
                <Text style={styles.emptyCreateBtnText}>Créer la première battle</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  listContentWide: {
    // On wide screens, let cardWrapper handle centering
    alignItems: 'stretch',
  },
  cardWrapper: {
    width: '100%',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#888',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 64,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 52,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#aaa',
  },
  emptyCreateBtn: {
    marginTop: 12,
    backgroundColor: '#6200ee',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 25,
  },
  emptyCreateBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
