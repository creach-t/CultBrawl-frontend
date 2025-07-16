import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  IconButton,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

import BattleCard from '../components/BattleCard';
import VoteStatsDisplay from '../components/VoteStatsDisplay';
import { battleService } from '../services/battleService';
import { voteService, Vote } from '../services/voteService';
import { useAuth } from '../context/AuthContext';
import { THEME_COLORS } from '../constants/config';

interface Battle {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  startDate: string;
  endDate: string;
  entity1Id: number;
  entity2Id: number;
  Entity1?: any;
  Entity2?: any;
  createdAt: string;
  updatedAt: string;
}

const BattleDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [battle, setBattle] = useState<Battle | null>(null);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  const battleId = parseInt(id as string);

  useEffect(() => {
    if (battleId) {
      loadBattleData();
    }
  }, [battleId]);

  useEffect(() => {
    if (user?.id && battleId) {
      loadUserVotes();
    }
  }, [user?.id, battleId]);

  const loadBattleData = async () => {
    try {
      setError(null);
      const response = await battleService.getBattleById(battleId);
      setBattle(response.data);
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement de la bataille');
      console.error('Erreur lors du chargement de la bataille:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserVotes = async () => {
    if (!user?.id) return;
    
    try {
      const response = await voteService.getUserVotes(user.id, {
        page: 1,
        limit: 50
      });
      setUserVotes(response.data.votes);
    } catch (error) {
      console.error('Erreur lors du chargement des votes utilisateur:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadBattleData(),
      loadUserVotes()
    ]);
    setStatsRefreshTrigger(prev => prev + 1);
    setIsRefreshing(false);
  };

  const handleVoteSuccess = () => {
    setStatsRefreshTrigger(prev => prev + 1);
    loadUserVotes();
    Toast.show({
      type: 'success',
      text1: 'Vote enregistré !',
      text2: 'Merci pour votre participation'
    });
  };

  const handleShare = async () => {
    if (!battle) return;
    
    try {
      await Share.share({
        message: `Découvrez cette bataille sur CultBrawl: ${battle.title}`,
        title: battle.title,
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const handleEditBattle = () => {
    // Navigation vers l'écran d'édition
    router.push(`/edit-battle?id=${battleId}`);
  };

  const handleDeleteBattle = () => {
    Alert.alert(
      'Supprimer la bataille',
      'Êtes-vous sûr de vouloir supprimer cette bataille ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: confirmDeleteBattle
        }
      ]
    );
  };

  const confirmDeleteBattle = async () => {
    try {
      await battleService.deleteBattle(battleId);
      Toast.show({
        type: 'success',
        text1: 'Bataille supprimée',
        text2: 'La bataille a été supprimée avec succès'
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message || 'Impossible de supprimer la bataille'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return THEME_COLORS.success;
      case 'completed':
        return THEME_COLORS.warning;
      case 'pending':
        return THEME_COLORS.text.secondary;
      default:
        return THEME_COLORS.text.secondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      case 'pending':
        return 'À venir';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error || !battle) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || 'Bataille non trouvée'}
        </Text>
        <Button
          mode="contained"
          onPress={loadBattleData}
          style={styles.retryButton}
        >
          Réessayer
        </Button>
      </View>
    );
  }

  const userVote = userVotes.find(vote => vote.battleId === battleId);
  const canEdit = user?.role === 'admin' || user?.id === battle.creatorId;
  const isActive = battle.status === 'active';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[THEME_COLORS.primary]}
        />
      }
    >
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <View style={styles.statusContainer}>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(battle.status) }]}
            textStyle={styles.statusText}
          >
            {getStatusLabel(battle.status)}
          </Chip>
        </View>
        
        <View style={styles.actionsContainer}>
          <IconButton
            icon="share"
            size={24}
            onPress={handleShare}
            style={styles.actionButton}
          />
          
          {canEdit && (
            <>
              <IconButton
                icon="pencil"
                size={24}
                onPress={handleEditBattle}
                style={styles.actionButton}
              />
              <IconButton
                icon="delete"
                size={24}
                onPress={handleDeleteBattle}
                style={[styles.actionButton, styles.deleteButton]}
              />
            </>
          )}
        </View>
      </View>

      {/* Battle Card */}
      <BattleCard
        battle={battle}
        showVoting={isActive}
        showStats={false}
        onVoteSuccess={handleVoteSuccess}
      />

      {/* Detailed Stats */}
      <VoteStatsDisplay
        battleId={battleId}
        refreshTrigger={statsRefreshTrigger}
      />

      {/* Battle Information */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Informations</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Début :</Text>
            <Text style={styles.infoValue}>
              {new Date(battle.startDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fin :</Text>
            <Text style={styles.infoValue}>
              {new Date(battle.endDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          
          {battle.description && (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{battle.description}</Text>
            </>
          )}
        </Card.Content>
      </Card>

      {/* User Vote Status */}
      {userVote && (
        <Card style={styles.userVoteCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Votre vote</Text>
            <Divider style={styles.divider} />
            
            <View style={styles.voteInfo}>
              <Text style={styles.voteText}>
                Vous avez voté pour :
              </Text>
              <Text style={styles.votedEntity}>
                {userVote.VotedEntity?.name || 'Entité inconnue'}
              </Text>
              <Text style={styles.voteDate}>
                Le {new Date(userVote.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            
            {isActive && (
              <Text style={styles.changeVoteHint}>
                Vous pouvez changer votre vote en cliquant sur l'autre entité
              </Text>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: THEME_COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.background,
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: THEME_COLORS.error,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: THEME_COLORS.primary,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statusContainer: {
    flex: 1,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
  },
  deleteButton: {
    backgroundColor: THEME_COLORS.error + '20',
  },
  infoCard: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.text.primary,
    marginBottom: 12,
  },
  divider: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: THEME_COLORS.text.secondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: THEME_COLORS.text.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: THEME_COLORS.text.primary,
    lineHeight: 20,
    marginTop: 8,
  },
  userVoteCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.success + '10',
  },
  voteInfo: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  voteText: {
    fontSize: 14,
    color: THEME_COLORS.text.secondary,
    marginBottom: 4,
  },
  votedEntity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.success,
    marginBottom: 4,
  },
  voteDate: {
    fontSize: 12,
    color: THEME_COLORS.text.secondary,
  },
  changeVoteHint: {
    fontSize: 12,
    color: THEME_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default BattleDetailScreen;
