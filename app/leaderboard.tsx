import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import api from '../services/api';

const MEDALS = ['🥇', '🥈', '🥉'];

const PODIUM_COLORS: [string, string][] = [
  ['#FFD700', '#FFF176'],
  ['#C0C0C0', '#E8E8E8'],
  ['#CD7F32', '#FFCC80'],
];
const DEFAULT_COLORS: [string, string] = ['#ffffff', '#f5f5f5'];

export default function Leaderboard() {
  const [userLeaderboard, setUserLeaderboard] = useState<any[]>([]);
  const [entityLeaderboard, setEntityLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [userRes, entityRes] = await Promise.all([
        api.get('/users/leaderboard'),
        api.get('/entities/leaderboard'),
      ]);
      setUserLeaderboard(Array.isArray(userRes) ? userRes : []);
      setEntityLeaderboard(Array.isArray(entityRes) ? entityRes : []);
    } catch (error) {
      console.error('Erreur leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [fetchLeaderboard])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchLeaderboard(true)}
          colors={['#6200ee']}
          tintColor="#6200ee"
        />
      }
    >
      <Text style={styles.pageTitle}>🏆 Leaderboard</Text>
      <Text style={styles.hint}>Tirez vers le bas pour actualiser</Text>

      {/* Top Players */}
      <Text style={styles.sectionTitle}>Top Joueurs</Text>
      {userLeaderboard.length > 0 ? (
        userLeaderboard.map((item, index) => (
          <LinearGradient
            key={item.id}
            colors={index < 3 ? PODIUM_COLORS[index] : DEFAULT_COLORS}
            style={styles.item}
          >
            <Text style={styles.medal}>
              {index < 3 ? MEDALS[index] : String(index + 1)}
            </Text>
            <Text style={[styles.name, index < 3 && styles.topName]} numberOfLines={1}>
              {item.username}
            </Text>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{item.points} pts</Text>
            </View>
          </LinearGradient>
        ))
      ) : (
        <Text style={styles.emptyMessage}>Aucun joueur classé.</Text>
      )}

      {/* Top Entities */}
      <Text style={styles.sectionTitle}>Top Entités</Text>
      {entityLeaderboard.length > 0 ? (
        entityLeaderboard.map((item, index) => (
          <LinearGradient
            key={item.id}
            colors={index < 3 ? PODIUM_COLORS[index] : DEFAULT_COLORS}
            style={styles.item}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.entityImage} />
            ) : (
              <Text style={styles.medal}>
                {index < 3 ? MEDALS[index] : String(index + 1)}
              </Text>
            )}
            <View style={styles.entityInfo}>
              <Text style={[styles.name, index < 3 && styles.topName]} numberOfLines={1}>
                {item.name}
              </Text>
              {item.category && (
                <Text style={styles.entityCategory}>{item.category}</Text>
              )}
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{item.votes} votes</Text>
            </View>
          </LinearGradient>
        ))
      ) : (
        <Text style={styles.emptyMessage}>Aucune entité classée.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#888',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6200ee',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  medal: {
    fontSize: 22,
    width: 38,
    textAlign: 'center',
  },
  name: {
    fontSize: 15,
    flex: 1,
    marginLeft: 10,
    color: '#555',
  },
  topName: {
    fontWeight: '700',
    color: '#1a1a2e',
  },
  scoreBadge: {
    backgroundColor: 'rgba(0,0,0,0.09)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  entityImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  entityInfo: {
    flex: 1,
    marginLeft: 10,
  },
  entityCategory: {
    fontSize: 11,
    color: '#999',
    marginTop: 1,
  },
  emptyMessage: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#bbb',
    fontStyle: 'italic',
    fontSize: 14,
  },
});
