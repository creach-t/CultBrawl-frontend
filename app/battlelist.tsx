import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CardBattle from '../components/cardBattle';
import { useUser } from '../context/UserContext';
import api from '../services/api';

interface Battle {
  id: number;
  title: string;
  category: string;
  entity1Id: {
    id: number;
    name: string;
    imageUrl: string;
  };
  entity2Id: {
    id: number;
    name: string;
    imageUrl: string;
  };
  votes: {
    entity1Votes: number;
    entity2Votes: number;
  };
  status: string; // "ongoing", "finished"
}

export default function BattleList() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchBattles = async () => {
    try {
      const response = await api.get('/battles');
      setBattles(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des battles :', error);
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour des données toutes les xx secondes en focus
  useFocusEffect(
    React.useCallback(() => {
      fetchBattles(); // Initial fetch on focus

      const interval = setInterval(() => {

        console.log(`${new Date()} Mise à jour automatique de la liste des battles...`);
        fetchBattles(); // Récupération périodique
      }, 10000); // Intervalle défini (par ex. 10 secondes)

      return () => clearInterval(interval); // Nettoyage de l'intervalle lorsque la page perd le focus
    }, [])
  );

  const renderBattle = ({ item }: { item: Battle }) => (
    <CardBattle
      battle={item}
      user={user}
    />
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>battles loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/addbattle')}
        >
          <MaterialCommunityIcons name="boxing-glove" size={28} color="white" />
          <Text style={styles.addButtonText}>Create Battle</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.header}>Battles list</Text>
      {battles?.length > 0 ? (
        <FlatList
          data={battles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBattle}
        />
      ) : (
        <View style={styles.center}>
          <Text>Aucune battle en cours.</Text>
        </View>
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
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '500',
  },
});
