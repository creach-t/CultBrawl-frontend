import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';
import { useUser } from '../context/UserContext';
import { useIsAdmin } from '../hooks/useIsAdmin';

interface Entity {
  id: number;
  name: string;
  imageUrl?: string;
  type?: string;
}

interface BattleDetail {
  id: number;
  status: string;
  endTime?: string;
  createdById?: number;
  Entity1: Entity;
  Entity2: Entity;
}

export default function BattleDetailScreen() {
  const { battleId } = useLocalSearchParams<{ battleId: string }>();
  const { user } = useUser();
  const isAdmin = useIsAdmin();

  const [battle, setBattle] = useState<BattleDetail | null>(null);
  const [votes, setVotes] = useState({ entity1Votes: 0, entity2Votes: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [userVotedEntityId, setUserVotedEntityId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voting, setVoting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  const id = Number(battleId);

  const fetchBattle = useCallback(async () => {
    try {
      const data = await api.get(`/battles/${id}`);
      setBattle(data);
    } catch {
      // silently fail
    }
  }, [id]);

  const fetchVotes = useCallback(async () => {
    try {
      const data = await api.get(`/battles/${id}/votes`);
      setVotes({
        entity1Votes: data?.entity1Votes ?? 0,
        entity2Votes: data?.entity2Votes ?? 0,
      });
      if (user?.id) {
        const userVote = await api.get(`/battles/${id}/user-vote`);
        setHasVoted(userVote?.hasVoted ?? false);
        setUserVotedEntityId(userVote?.votedEntityId ?? null);
      }
    } catch {
      // silently fail
    }
  }, [id, user?.id]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    await Promise.all([fetchBattle(), fetchVotes()]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchBattle, fetchVotes]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!battle) return;
    const update = () => {
      const isActive = battle.status === 'pending';
      if (!isActive || !battle.endTime) { setTimeRemaining('Terminé'); return; }
      const diff = new Date(battle.endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeRemaining('Terminé'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeRemaining(h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [battle]);

  const handleVote = async (entityId: number) => {
    if (!user?.id || voting || !battle || battle.status !== 'pending' || hasVoted) return;
    setVoting(true);
    try {
      await api.post(`/battles/${id}/votes`, { votedEntityId: entityId, userId: user.id });
      setHasVoted(true);
      setUserVotedEntityId(entityId);
      await fetchVotes();
    } catch {
      Alert.alert('Erreur', 'Impossible d\'enregistrer votre vote.');
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = () => {
    if (!battle) return;
    Alert.alert(
      'Supprimer la battle',
      `Supprimer "${battle.Entity1?.name} vs ${battle.Entity2?.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/battles/${id}`);
              router.back();
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer cette battle.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  if (!battle) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Battle introuvable</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isActive = battle.status === 'pending';
  const canVote = isActive && !hasVoted && !!user?.id;
  const total = votes.entity1Votes + votes.entity2Votes;
  const e1Pct = total ? Math.round((votes.entity1Votes / total) * 100) : 50;
  const e2Pct = total ? Math.round((votes.entity2Votes / total) * 100) : 50;
  const showResults = hasVoted || !isActive;

  const entity1 = battle.Entity1;
  const entity2 = battle.Entity2;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          colors={['#6200ee']}
          tintColor="#6200ee"
        />
      }
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBackBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#444" />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarCategory}>
            {entity1?.type?.toUpperCase() ?? 'BATTLE'}
          </Text>
          <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusDone]}>
            <Text style={styles.statusText}>
              {isActive ? `⏱ ${timeRemaining}` : '✓ Terminé'}
            </Text>
          </View>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.deleteTopBtn} onPress={handleDelete}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#f44336" />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <Text style={styles.vsTitle}>
        {entity1?.name} <Text style={styles.vsTitleVS}>VS</Text> {entity2?.name}
      </Text>

      {/* Progress bar */}
      {showResults && (
        <View style={styles.progressBarWrap}>
          <View style={[styles.progressLeft, { flex: e1Pct }]} />
          <View style={[styles.progressRight, { flex: e2Pct }]} />
        </View>
      )}

      {/* Battle area */}
      <View style={styles.battleArea}>
        {/* Entity 1 */}
        <View style={styles.entityCol}>
          <TouchableOpacity
            onPress={() => canVote && handleVote(entity1?.id)}
            disabled={!canVote || voting}
            activeOpacity={canVote ? 0.8 : 1}
            style={styles.entityImageWrap}
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
                {canVote && !voting && (
                  <View style={styles.voteHint}>
                    <Text style={styles.voteHintText}>Voter</Text>
                  </View>
                )}
              </View>
            </ImageBackground>
          </TouchableOpacity>
          <Text style={styles.entityName} numberOfLines={2}>{entity1?.name}</Text>
          {showResults && (
            <>
              <Text style={styles.voteCount}>{votes.entity1Votes} vote{votes.entity1Votes !== 1 ? 's' : ''}</Text>
              <Text style={styles.votePct}>{e1Pct}%</Text>
            </>
          )}
          {canVote && (
            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => handleVote(entity1?.id)}
              disabled={voting}
            >
              <Text style={styles.voteButtonText}>
                {voting ? '…' : 'Voter pour ' + (entity1?.name?.split(' ')[0] ?? '')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* VS separator */}
        <View style={styles.vsCol}>
          {voting ? (
            <ActivityIndicator size="small" color="#6200ee" />
          ) : (
            <Text style={styles.vsText}>VS</Text>
          )}
        </View>

        {/* Entity 2 */}
        <View style={styles.entityCol}>
          <TouchableOpacity
            onPress={() => canVote && handleVote(entity2?.id)}
            disabled={!canVote || voting}
            activeOpacity={canVote ? 0.8 : 1}
            style={styles.entityImageWrap}
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
                {canVote && !voting && (
                  <View style={styles.voteHint}>
                    <Text style={styles.voteHintText}>Voter</Text>
                  </View>
                )}
              </View>
            </ImageBackground>
          </TouchableOpacity>
          <Text style={styles.entityName} numberOfLines={2}>{entity2?.name}</Text>
          {showResults && (
            <>
              <Text style={styles.voteCount}>{votes.entity2Votes} vote{votes.entity2Votes !== 1 ? 's' : ''}</Text>
              <Text style={styles.votePct}>{e2Pct}%</Text>
            </>
          )}
          {canVote && (
            <TouchableOpacity
              style={[styles.voteButton, styles.voteButtonRight]}
              onPress={() => handleVote(entity2?.id)}
              disabled={voting}
            >
              <Text style={styles.voteButtonText}>
                {voting ? '…' : 'Voter pour ' + (entity2?.name?.split(' ')[0] ?? '')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Guest CTA */}
      {!user?.id && isActive && (
        <TouchableOpacity style={styles.loginCta} onPress={() => router.push('/auth')}>
          <MaterialCommunityIcons name="login" size={18} color="#6200ee" />
          <Text style={styles.loginCtaText}>Connectez-vous pour voter</Text>
        </TouchableOpacity>
      )}

      {/* Already voted banner */}
      {hasVoted && (
        <View style={styles.votedBanner}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#4caf50" />
          <Text style={styles.votedBannerText}>
            Vous avez voté pour{' '}
            <Text style={styles.votedBannerEntity}>
              {userVotedEntityId === entity1?.id ? entity1?.name : entity2?.name}
            </Text>
          </Text>
        </View>
      )}

      {/* Stats card */}
      {showResults && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Résultats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue} numberOfLines={1}>{entity1?.name}</Text>
              <Text style={styles.statNum}>{votes.entity1Votes} votes · {e1Pct}%</Text>
              <View style={styles.statBar}>
                <View style={[styles.statBarFill, styles.statBarLeft, { width: `${e1Pct}%` as any }]} />
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue} numberOfLines={1}>{entity2?.name}</Text>
              <Text style={styles.statNum}>{votes.entity2Votes} votes · {e2Pct}%</Text>
              <View style={styles.statBar}>
                <View style={[styles.statBarFill, styles.statBarRight, { width: `${e2Pct}%` as any }]} />
              </View>
            </View>
          </View>
          <Text style={styles.statTotal}>{total} vote{total !== 1 ? 's' : ''} au total</Text>
        </View>
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
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f4f4f8',
  },
  loadingText: {
    fontSize: 15,
    color: '#888',
  },
  errorIcon: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 16,
    color: '#555',
  },
  backBtn: {
    marginTop: 8,
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  topBackBtn: {
    padding: 4,
  },
  topBarCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
  },
  statusDone: {
    backgroundColor: '#fce4ec',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
  },
  deleteTopBtn: {
    padding: 6,
    backgroundColor: '#fff3f3',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },

  // Title
  vsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    lineHeight: 26,
  },
  vsTitleVS: {
    color: '#6200ee',
    fontSize: 16,
  },

  // Progress bar
  progressBarWrap: {
    flexDirection: 'row',
    height: 6,
    marginHorizontal: 16,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressLeft: {
    backgroundColor: '#6200ee',
  },
  progressRight: {
    backgroundColor: '#E91E63',
  },

  // Battle area
  battleArea: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  entityCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  entityImageWrap: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  entityImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entityImageStyle: {
    borderRadius: 14,
  },
  entityOverlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  votedBadge: {
    backgroundColor: 'rgba(98, 0, 238, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
  },
  votedText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  voteHint: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  voteHintText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  entityName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  voteCount: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
  },
  votePct: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6200ee',
    textAlign: 'center',
  },
  voteButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginTop: 4,
    width: '100%',
    alignItems: 'center',
  },
  voteButtonRight: {
    backgroundColor: '#E91E63',
  },
  voteButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },

  // VS column
  vsCol: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 90,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6200ee',
    backgroundColor: '#ede7f6',
    paddingHorizontal: 6,
    paddingVertical: 14,
    borderRadius: 10,
    textAlign: 'center',
    overflow: 'hidden',
  },

  // Guest CTA
  loginCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#f0ebff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#d0bbff',
  },
  loginCtaText: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '700',
  },

  // Voted banner
  votedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f1f8f1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  votedBannerText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  votedBannerEntity: {
    fontWeight: '800',
    color: '#2e7d32',
  },

  // Stats card
  statsCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    gap: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    gap: 6,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  statNum: {
    fontSize: 12,
    color: '#888',
  },
  statBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statBarLeft: {
    backgroundColor: '#6200ee',
  },
  statBarRight: {
    backgroundColor: '#E91E63',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
  },
  statTotal: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
});
