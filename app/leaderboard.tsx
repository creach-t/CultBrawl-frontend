import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import api from '../services/api';

export default function Leaderboard() {
  const [userLeaderboard, setUserLeaderboard] = useState([]);
  const [entityLeaderboard, setEntityLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const userResponse = await api.get('/users/leaderboard');
      const entityResponse = await api.get('/entities/leaderboard');
      setUserLeaderboard(userResponse);
      setEntityLeaderboard(entityResponse);
    } catch (error) {
      console.error('Erreur lors de la récupération du leaderboard :', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLeaderboard();
  }, []);

    useFocusEffect(
      React.useCallback(() => {
        fetchLeaderboard(); // Initial fetch on focus

        const interval = setInterval(() => {
          console.log('Mise à jour automatique du leaderboard...');
          fetchLeaderboard(); // Récupération périodique
        }, 10000); // Intervalle défini (par ex. 10 secondes)

        return () => clearInterval(interval); // Nettoyage de l'intervalle lorsque la page perd le focus
      }, [])
    );

  const renderUserItem = ({ item, index }) => (
    <LinearGradient
      colors={index === 0 ? ['#ffd700', '#ffdb4d'] : ['#ffffff', '#f0f0f0']}
      style={styles.item}
    >
      <Text style={[styles.rank, index === 0 && styles.firstPlaceRank]}>
        {index + 1}
      </Text>
      <Text style={[styles.name, index === 0 && styles.firstPlaceName]}>
        {item.username}
      </Text>
      <Text style={styles.points}>{item.points} pts</Text>
    </LinearGradient>
  );

  const renderEntityItem = ({ item, index }) => (
    <LinearGradient
      colors={index === 0 ? ['#ffd700', '#fff170'] : ['#ffffff', '#f0f0f0']}
      style={styles.item}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.entityImage} />
      <View style={styles.entityInfo}>
        <Text style={[styles.name, index === 0 && styles.firstPlaceName]}>
          {item.name}
        </Text>
        <Text style={styles.points}>{item.votes} votes</Text>
      </View>
    </LinearGradient>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Chargement du leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>

      <Text style={styles.sectionTitle}>Top Players</Text>
      {userLeaderboard.length > 0 ? (
        <FlatList
          data={userLeaderboard}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.emptyMessage}>No classed Player yet.</Text>
      )}

      <Text style={styles.sectionTitle}>Top Entity</Text>
      {entityLeaderboard.length > 0 ? (
        <FlatList
          data={entityLeaderboard}
          renderItem={renderEntityItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.emptyMessage}>No classed Entity yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#6200ee',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    width: 30,
    textAlign: 'center',
  },
  firstPlaceRank: {
    color: '#ffd700',
  },
  name: {
    fontSize: 18,
    flex: 1,
    marginLeft: 10,
    color: '#333',
  },
  firstPlaceName: {
    color: '#000',
    fontWeight: 'bold',
  },
  points: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  entityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  entityInfo: {
    flex: 1,
  },
  emptyMessage: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#888',
    fontStyle: 'italic',
  },
});
