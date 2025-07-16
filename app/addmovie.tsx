import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';

interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
}

export default function EntityList() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const searchMovies = async () => {
    if (query.length < 3) return;
    setLoading(true);
    try {
      const response = await api.get(`http://www.omdbapi.com/?apikey=c75eae17&s=${query}`);
      if (response) {
        setMovies(response.Search);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de films :', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntity = async (movie: Movie) => {
    setAdding(movie.imdbID);
    try {
      const response = await api.post('/entities', {
        name: movie.Title + ' (' + movie.Year + ')',
        apiId: movie.imdbID,
        type: 'movie',
        imageUrl: movie.Poster === 'N/A' ? 'https://placehold.jp/100x150.png' : movie.Poster,
        source: 'OMDB',
      });
      alert('Film ajouté avec succès !');
    } catch (error) {
      console.error("Erreur lors de l'ajout du film :", error);
      alert("Impossible d'ajouter ce film.");
    } finally {
      setAdding(null);
    }
  };

    const renderMovie = ({ item }: { item: Movie }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.Poster !== 'N/A' ? item.Poster : 'https://placehold.jp/100x150.png' }}
        style={styles.poster}
      />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.Title}</Text>
        <Text style={styles.year}>{item.Year}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addEntity(item)}
        disabled={adding === item.imdbID}
      >
        {adding === item.imdbID ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="add" size={30} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ajouter un Film</Text>
      <TextInput
        style={styles.input}
        placeholder="Rechercher un film..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={searchMovies}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.imdbID}
          renderItem={({ item }) => renderMovie({ item })}  // Correcte transmission de l'item
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Aucun résultat trouvé. Essayez une autre recherche.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  poster: {
    width: 100,
    height: 150,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  year: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});
