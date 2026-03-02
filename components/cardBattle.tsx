import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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

const CardBattle = ({
  battle,
  user,
  isAdmin = false,
  onDelete,
}: {
  battle: Battle;
  user: any;
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
}) => {
  const [votes, setVotes] = useState({ entity1Votes: 0, entity2Votes: 0 });
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVotedEntityId, setUserVotedEntityId] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  const entity1 = battle.participants[0];
  const entity2 = battle.participants[1];
  const isActive = battle.status === 'pending';
  const canVote = isActive && !hasVoted && !!user?.id;

  useEffect(() => {
    fetchVotes();
    updateTimeRemaining();
    const timer = setInterval(updateTimeRemaining, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchVotes = async () => {
    try {
      const response = await api.get(`battles/${battle.id}/votes`);
      setVotes({
        entity1Votes: response?.entity1Votes ?? 0,
        entity2Votes: response?.entity2Votes ?? 0,
      });
      if (user?.id) {
        const userVote = await api.get(`/battles/${battle.id}/user-vote`, {
          params: { userId: user.id },
        });
        setHasVoted(userVote?.hasVoted ?? false);
        setUserVotedEntityId(userVote?.votedEntityId ?? null);
      }
    } catch {
      // silently fail
    }
  };

  const handleVote = async (entityId: number) => {
    if (!user?.id || voting || !isActive) return;
    setVoting(true);
    try {
      await api.post(`/battles/${battle.id}/votes`, {
        votedEntityId: entityId,
        userId: user.id,
      });
      setHasVoted(true);
      setUserVotedEntityId(entityId);
      await fetchVotes();
    } catch {
      // silently fail
    } finally {
      setVoting(false);
    }
  };

  const updateTimeRemaining = () => {
    if (!isActive) {
      setTimeRemaining('Terminé');
      return;
    }
    if (!battle.endTime) return;
    const diff = new Date(battle.endTime).getTime() - Date.now();
    if (diff <= 0) {
      setTimeRemaining('Terminé');
    } else {
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeRemaining(h > 0 ? `${h}h ${m}m` : `${m}m`);
    }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/battles/${battle.id}`);
      onDelete?.(battle.id);
    } catch (err) {
      console.error('[DELETE] API ERREUR:', err);
      if (Platform.OS === 'web') {
        window.alert('Impossible de supprimer la battle.');
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer la battle.');
      }
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Supprimer "${entity1?.name} vs ${entity2?.name}" ?`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Supprimer la battle',
        `Supprimer "${entity1?.name} vs ${entity2?.name}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  const total = votes.entity1Votes + votes.entity2Votes;
  const e1Pct = total ? Math.round((votes.entity1Votes / total) * 100) : 50;
  const e2Pct = total ? Math.round((votes.entity2Votes / total) * 100) : 50;
  const showResults = hasVoted || !isActive;

  return (
    // cardOuter: wrapper View qui permet au bouton delete d'être un sibling
    // (pas imbriqué dans le TouchableOpacity de la card)
    <View style={styles.cardOuter}>
      {/* Card principale — TouchableOpacity pour la navigation */}
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({ pathname: '/battle-detail', params: { battleId: battle.id } })
        }
        activeOpacity={0.93}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.category}>{battle.category ?? 'Battle'}</Text>
          {/* Le badge prend toute la place restante à droite (avec padding pour laisser room au delete btn) */}
          <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeDone, isAdmin && styles.badgeAdminOffset]}>
            <Text style={styles.badgeText}>
              {isActive ? `⏱ ${timeRemaining}` : '✓ Terminé'}
            </Text>
          </View>
        </View>

        {/* Vote progress bar */}
        {showResults && (
          <View style={styles.progressBar}>
            <View style={[styles.progressLeft, { flex: e1Pct }]} />
            <View style={[styles.progressRight, { flex: e2Pct }]} />
          </View>
        )}

        {/* Battle area */}
        <View style={styles.battleRow}>
          {/* Entity 1 */}
          <TouchableOpacity
            style={styles.entitySide}
            onPress={() => canVote && handleVote(entity1?.id)}
            disabled={!canVote || voting}
            activeOpacity={canVote ? 0.75 : 1}
          >
            <ImageBackground
              source={entity1?.imageUrl ? { uri: entity1.imageUrl } : undefined}
              style={styles.entityImage}
              imageStyle={styles.entityImageStyle}
            >
              <View style={styles.entityOverlay}>
                {hasVoted && userVotedEntityId === entity1?.id && (
                  <View style={styles.votedBadge}>
                    <Text style={styles.votedText}>✓ Voté</Text>
                  </View>
                )}
                {canVote && (
                  <View style={styles.voteHint}>
                    <Text style={styles.voteHintText}>Voter</Text>
                  </View>
                )}
              </View>
            </ImageBackground>
            <View style={styles.entityMeta}>
              <Text style={styles.entityName} numberOfLines={2}>
                {entity1?.name}
              </Text>
              {showResults && (
                <Text style={styles.voteCount}>
                  {votes.entity1Votes} vote{votes.entity1Votes !== 1 ? 's' : ''} · {e1Pct}%
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* VS */}
          <View style={styles.vsSeparator}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Entity 2 */}
          <TouchableOpacity
            style={styles.entitySide}
            onPress={() => canVote && handleVote(entity2?.id)}
            disabled={!canVote || voting}
            activeOpacity={canVote ? 0.75 : 1}
          >
            <ImageBackground
              source={entity2?.imageUrl ? { uri: entity2.imageUrl } : undefined}
              style={styles.entityImage}
              imageStyle={styles.entityImageStyle}
            >
              <View style={styles.entityOverlay}>
                {hasVoted && userVotedEntityId === entity2?.id && (
                  <View style={styles.votedBadge}>
                    <Text style={styles.votedText}>✓ Voté</Text>
                  </View>
                )}
                {canVote && (
                  <View style={styles.voteHint}>
                    <Text style={styles.voteHintText}>Voter</Text>
                  </View>
                )}
              </View>
            </ImageBackground>
            <View style={styles.entityMeta}>
              <Text style={styles.entityName} numberOfLines={2}>
                {entity2?.name}
              </Text>
              {showResults && (
                <Text style={styles.voteCount}>
                  {votes.entity2Votes} vote{votes.entity2Votes !== 1 ? 's' : ''} · {e2Pct}%
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Voting overlay */}
        {voting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#6200ee" size="large" />
          </View>
        )}

        {/* Guest hint */}
        {!user?.id && isActive && (
          <TouchableOpacity
            style={styles.loginHint}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.loginHintText}>Connectez-vous pour voter →</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/*
        Bouton delete admin — rendu APRÈS le TouchableOpacity card (sibling, pas child).
        En React Native, les éléments rendus après ont un z-index plus élevé et
        capturent les touches en priorité dans leur zone. Pas de problème de nesting.
      */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.adminDeleteBtn}
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={17} color="#f44336" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Wrapper externe — permet le positionnement absolu du bouton delete
  cardOuter: {
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // Quand admin : décale le badge vers la gauche pour laisser room au bouton delete overlay
  badgeAdminOffset: {
    marginRight: 32,
  },
  badgeActive: {
    backgroundColor: '#e8f5e9',
  },
  badgeDone: {
    backgroundColor: '#fce4ec',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
  },
  // Bouton delete admin — absolu par rapport à cardOuter, rendu après la card
  adminDeleteBtn: {
    position: 'absolute',
    top: 9,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 5,
    elevation: 6,
    shadowColor: '#f44336',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    zIndex: 10,
  },
  progressBar: {
    flexDirection: 'row',
    height: 5,
  },
  progressLeft: {
    backgroundColor: '#6200ee',
    height: '100%',
  },
  progressRight: {
    backgroundColor: '#E91E63',
    height: '100%',
  },
  battleRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: 12,
    gap: 8,
  },
  entitySide: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  entityImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entityImageStyle: {
    borderRadius: 12,
  },
  entityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  votedBadge: {
    backgroundColor: 'rgba(98, 0, 238, 0.88)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  votedText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  voteHint: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  voteHintText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  entityMeta: {
    paddingTop: 8,
    paddingHorizontal: 4,
    paddingBottom: 4,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  entityName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    lineHeight: 18,
  },
  voteCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 3,
  },
  vsSeparator: {
    width: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#6200ee',
    backgroundColor: '#ede7f6',
    paddingHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    textAlign: 'center',
    overflow: 'hidden',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginHint: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f5f0ff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0d5f5',
  },
  loginHintText: {
    fontSize: 13,
    color: '#6200ee',
    fontWeight: '600',
  },
});

export default CardBattle;
