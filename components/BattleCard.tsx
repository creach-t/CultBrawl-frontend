import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import VoteButton from './VoteButton';
import VoteStatsDisplay from './VoteStatsDisplay';
import { Vote } from '../services/voteService';

interface Entity {
  id: number;
  name: string;
  type: string;
  description?: string;
  imageUrl?: string;
}

interface Battle {
  id: number;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'pending';
  startDate: string;
  endDate: string;
  entity1Id: number;
  entity2Id: number;
  winnerId?: number;
  Entity1?: Entity;
  Entity2?: Entity;
}

interface BattleCardProps {
  battle: Battle;
  onPress?: (battle: Battle) => void;
  showVoting?: boolean;
  showStats?: boolean;
  style?: any;
}

const { width } = Dimensions.get('window');
const cardWidth = width - 32;

const BattleCard: React.FC<BattleCardProps> = ({
  battle,
  onPress,
  showVoting = true,
  showStats = true,
  style
}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userVote, setUserVote] = useState<Vote | null>(null);

  const { Entity1, Entity2 } = battle;

  const handleVoteSuccess = (vote: Vote) => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleVoteChange = (vote: Vote | null) => {
    setUserVote(vote);
    setRefreshTrigger(prev => prev + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#FF9800';
      case 'pending':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'À venir';
      default:
        return status;
    }
  };

  // Déterminer les dimensions d'image selon le type d'entité
  const getImageDimensions = (entityType: string) => {
    const baseWidth = (cardWidth - 60) / 2;
    switch (entityType) {
      case 'movie':
        // Format poster de film (2:3)
        return {
          width: baseWidth,
          height: baseWidth * 1.5,
          borderRadius: 12
        };
      case 'book':
        // Format livre (3:4)
        return {
          width: baseWidth,
          height: baseWidth * 1.33,
          borderRadius: 8
        };
      case 'serie':
      case 'anime':
        // Format série/anime (16:9)
        return {
          width: baseWidth,
          height: baseWidth * 0.75,
          borderRadius: 10
        };
      case 'game':
        // Format jeu (carré ou légèrement rectangulaire)
        return {
          width: baseWidth,
          height: baseWidth * 1.1,
          borderRadius: 10
        };
      default:
        // Format par défaut (carré)
        return {
          width: baseWidth,
          height: baseWidth,
          borderRadius: 12
        };
    }
  };

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'movie':
        return '🎬';
      case 'book':
        return '📚';
      case 'serie':
        return '📺';
      case 'anime':
        return '🎌';
      case 'game':
        return '🎮';
      default:
        return '❓';
    }
  };

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case 'movie':
        return 'Film';
      case 'book':
        return 'Livre';
      case 'serie':
        return 'Série';
      case 'anime':
        return 'Anime';
      case 'game':
        return 'Jeu';
      default:
        return 'Autre';
    }
  };

  const isActive = battle.status === 'active';
  const isCompleted = battle.status === 'completed';
  const endDate = new Date(battle.endDate);
  const now = new Date();
  const timeRemaining = endDate.getTime() - now.getTime();
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));

  // Déterminer le gagnant
  const isEntity1Winner = isCompleted && battle.winnerId === Entity1?.id;
  const isEntity2Winner = isCompleted && battle.winnerId === Entity2?.id;

  const renderEntityCard = (entity: Entity | undefined, isWinner: boolean) => {
    if (!entity) return null;

    const imageDimensions = getImageDimensions(entity.type);
    const entityTypeIcon = getEntityTypeIcon(entity.type);
    const entityTypeLabel = getEntityTypeLabel(entity.type);

    return (
      <View style={[styles.entityContainer, isWinner && styles.winnerContainer]}>
        {/* Badge de gagnant */}
        {isWinner && (
          <View style={styles.winnerBadge}>
            <Text style={styles.winnerBadgeText}>🏆 GAGNANT</Text>
          </View>
        )}
        
        <View style={[styles.imageContainer, imageDimensions, isWinner && styles.winnerImageContainer]}>
          {entity.imageUrl ? (
            <Image
              source={{ uri: entity.imageUrl }}
              style={[styles.entityImage, imageDimensions]}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={
                entity.type === 'movie' ? ['#E91E63', '#F06292'] :
                entity.type === 'book' ? ['#8BC34A', '#AED581'] :
                entity.type === 'serie' ? ['#2196F3', '#64B5F6'] :
                entity.type === 'anime' ? ['#FF5722', '#FF8A65'] :
                entity.type === 'game' ? ['#9C27B0', '#BA68C8'] :
                ['#607D8B', '#90A4AE']
              }
              style={[styles.placeholderImage, imageDimensions]}
            >
              <Text style={styles.placeholderText}>
                {entity.name?.charAt(0) || '?'}
              </Text>
            </LinearGradient>
          )}
          
          {userVote?.votedEntityId === entity.id && (
            <View style={styles.voteBadge}>
              <Text style={styles.voteBadgeText}>✓</Text>
            </View>
          )}
        </View>
        
        <View style={styles.entityInfo}>
          <Text style={[styles.entityName, isWinner && styles.winnerEntityName]} numberOfLines={2}>
            {entity.name}
          </Text>
          
          <View style={styles.entityTypeContainer}>
            <Text style={styles.entityTypeIcon}>{entityTypeIcon}</Text>
            <Text style={styles.entityType}>{entityTypeLabel}</Text>
          </View>
        </View>
        
        {showVoting && isActive && (
          <VoteButton
            battleId={battle.id}
            entityId={entity.id}
            entityName={entity.name}
            onVoteSuccess={handleVoteSuccess}
            onVoteChange={handleVoteChange}
            style={styles.voteButton}
          />
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(battle)}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Card style={[styles.container, style, isCompleted && styles.completedContainer]}>
        <Card.Content>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {battle.title}
              </Text>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(battle.status) }]}
                textStyle={styles.statusText}
              >
                {getStatusLabel(battle.status)}
              </Chip>
            </View>
            
            {isActive && hoursRemaining > 0 && (
              <Text style={styles.timeRemaining}>
                {hoursRemaining}h restantes
              </Text>
            )}
            
            {isCompleted && battle.winnerId && (
              <View style={styles.completedHeader}>
                <Text style={styles.completedText}>
                  🏆 Victoire de {battle.winnerId === Entity1?.id ? Entity1.name : Entity2?.name}!
                </Text>
              </View>
            )}
          </View>

          {/* Entities Display */}
          <View style={styles.entitiesContainer}>
            {/* Entity 1 */}
            {renderEntityCard(Entity1, isEntity1Winner)}

            {/* VS Separator */}
            <View style={styles.vsContainer}>
              <LinearGradient
                colors={isCompleted ? ['#FFD700', '#FFA500'] : ['#FF6B6B', '#4ECDC4']}
                style={styles.vsCircle}
              >
                <Text style={styles.vsText}>VS</Text>
              </LinearGradient>
            </View>

            {/* Entity 2 */}
            {renderEntityCard(Entity2, isEntity2Winner)}
          </View>

          {/* Description */}
          {battle.description && (
            <Text style={styles.description} numberOfLines={3}>
              {battle.description}
            </Text>
          )}
        </Card.Content>

        {/* Vote Stats */}
        {showStats && (
          <VoteStatsDisplay
            battleId={battle.id}
            refreshTrigger={refreshTrigger}
            style={styles.statsContainer}
          />
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    elevation: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  completedContainer: {
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 8,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeRemaining: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '600',
    textAlign: 'center',
  },
  completedHeader: {
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  completedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    textAlign: 'center',
  },
  entitiesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  entityContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  winnerContainer: {
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  winnerBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  winnerBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    elevation: 3,
  },
  winnerImageContainer: {
    borderWidth: 3,
    borderColor: '#FFD700',
    elevation: 6,
  },
  entityImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  voteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voteBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  entityInfo: {
    alignItems: 'center',
    minHeight: 60,
  },
  entityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    minHeight: 40,
  },
  winnerEntityName: {
    color: '#F57C00',
    fontWeight: 'bold',
  },
  entityTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  entityTypeIcon: {
    fontSize: 14,
  },
  entityType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  voteButton: {
    marginTop: 8,
  },
  vsContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 40,
  },
  vsCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statsContainer: {
    margin: 0,
    marginTop: 16,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    elevation: 0,
  },
});

export default BattleCard;
