import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const CardBattle = ({ battle, user }) => {
  const [votes, setVotes] = useState({ entity1Votes: 0, entity2Votes: 0 });
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    fetchVotes();
    const timer = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchVotes = async () => {
    try {
      const response = await api.get(`battles/${battle.id}/votes`);
      const entity1Votes = response.entity1Votes;
      const entity2Votes = response.entity2Votes;
      setVotes({ entity1Votes, entity2Votes });

      if (user?.id) {
        const userVote = await api.get(`/battles/${battle.id}/user-vote`, { params: { userId: user.id } });
        setHasVoted(userVote.hasVoted);
      } else {
        setHasVoted(false);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des votes :', error);
    }
  };

  const handleVote = async (entityId) => {
    if (!user?.id || voting || battle.status !== 'pending') return;
    setVoting(true);
    try {
      await api.post(`/battles/${battle.id}/votes`, { votedEntityId: entityId, userId: user.id });
      setHasVoted(true);
      fetchVotes();
    } catch (error) {
      console.error('Erreur lors du vote :', error);
    } finally {
      setVoting(false);
    }
  };

  const updateTimeRemaining = () => {
    if (battle.status !== 'pending') {
      setTimeRemaining('Terminé');
      return;
    }

    const now = new Date();
    const endTime = new Date(battle.endTime);
    const diff = endTime - now;

    if (diff <= 0) {
      setTimeRemaining('Terminé');
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`Fin du sondage : ${hours}h${minutes}m`);
    }
  };

  const totalVotes = votes.entity1Votes + votes.entity2Votes;
  const entity1Percentage = totalVotes ? Math.round((votes.entity1Votes / totalVotes) * 100) : 50;
  const entity2Percentage = totalVotes ? Math.round((votes.entity2Votes / totalVotes) * 100) : 50;

  const showResults = hasVoted || battle.status !== 'pending';

  return (
    <View style={styles.card}>
      <View style={styles.statusContainer}>
        <Text style={styles.voteText}>
          {votes.entity1Votes} ({entity1Percentage}%)
        </Text>
        <Text style={[styles.status, { backgroundColor: battle.status === 'pending' ? '#4caf50' : '#f44336' }]}>
          {timeRemaining}
        </Text>
        <Text style={styles.voteText}>
          {votes.entity2Votes} ({entity2Percentage}%)
        </Text>
      </View>
      <View style={styles.backgroundBar}>
        <View
          style={[
            styles.backgroundSide,
            { flex: entity1Percentage / 100, backgroundColor: '#4caf50' },
          ]}
        />
        <View
          style={[
            styles.backgroundSide,
            { flex: entity2Percentage / 100, backgroundColor: '#f44336' },
          ]}
        />
      </View>
      <View style={styles.voteContainer}>
        <TouchableOpacity
          style={styles.voteSide}
          onPress={() => handleVote(battle.participants[0].id)}
          disabled={showResults || !user?.id}
        >
          <ImageBackground
            source={{ uri: battle.participants[0].imageUrl }}
            style={styles.imageBackground}
            imageStyle={styles.image}
          >
            <Text style={styles.titleOverlay}>{battle.participants[0].name}</Text>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.voteSide}
          onPress={() => handleVote(battle.participants[1].id)}
          disabled={showResults || !user?.id}
        >
          <ImageBackground
            source={{ uri: battle.participants[1].imageUrl }}
            style={styles.imageBackground}
            imageStyle={styles.image}
          >
            <Text style={styles.titleOverlay}>{battle.participants[1].name}</Text>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginVertical: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
  },
  status: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  voteText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  backgroundBar: {
    flexDirection: 'row',
    height: 20,
  },
  backgroundSide: {
    height: '100%',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteSide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackground: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 10,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    padding: 5,
    borderRadius: 5,
  },
});

export default CardBattle;
