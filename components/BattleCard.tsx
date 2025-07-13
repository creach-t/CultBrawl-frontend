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
const imageWidth = (cardWidth - 60) / 2;

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

  const isActive = battle.status === 'active';
  const endDate = new Date(battle.endDate);
  const now = new Date();
  const timeRemaining = endDate.getTime() - now.getTime();
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));

  return (
    <TouchableOpacity
      onPress={() => onPress?.(battle)}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Card style={[styles.container, style]}>
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
          </View>

          {/* Entities Display */}
          <View style={styles.entitiesContainer}>
            {/* Entity 1 */}
            <View style={styles.entityContainer}>
              <View style={styles.imageContainer}>
                {Entity1?.imageUrl ? (
                  <Image
                    source={{ uri: Entity1.imageUrl }}
                    style={styles.entityImage}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={['#E91E63', '#F06292']}
                    style={styles.placeholderImage}
                  >
                    <Text style={styles.placeholderText}>
                      {Entity1?.name?.charAt(0) || '?'}
                    </Text>
                  </LinearGradient>
                )}
                {userVote?.votedEntityId === Entity1?.id && (
                  <View style={styles.voteBadge}>
                    <Text style={styles.voteBadgeText}>✓</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.entityName} numberOfLines={2}>
                {Entity1?.name || 'Entité 1'}
              </Text>
              
              <Text style={styles.entityType}>
                {Entity1?.type || 'Type'}
              </Text>
              
              {showVoting && isActive && (
                <VoteButton
                  battleId={battle.id}
                  entityId={Entity1?.id || 0}
                  entityName={Entity1?.name || 'Entité 1'}
                  onVoteSuccess={handleVoteSuccess}
                  onVoteChange={handleVoteChange}
                  style={styles.voteButton}
                />
              )}
            </View>

            {/* VS Separator */}
            <View style={styles.vsContainer}>
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4']}
                style={styles.vsCircle}
              >
                <Text style={styles.vsText}>VS</Text>
              </LinearGradient>
            </View>

            {/* Entity 2 */}
            <View style={styles.entityContainer}>
              <View style={styles.imageContainer}>
                {Entity2?.imageUrl ? (
                  <Image
                    source={{ uri: Entity2.imageUrl }}
                    style={styles.entityImage}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={['#2196F3', '#64B5F6']}
                    style={styles.placeholderImage}
                  >
                    <Text style={styles.placeholderText}>
                      {Entity2?.name?.charAt(0) || '?'}
                    </Text>
                  </LinearGradient>
                )}
                {userVote?.votedEntityId === Entity2?.id && (
                  <View style={styles.voteBadge}>
                    <Text style={styles.voteBadgeText}>✓</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.entityName} numberOfLines={2}>
                {Entity2?.name || 'Entité 2'}
              </Text>
              
              <Text style={styles.entityType}>
                {Entity2?.type || 'Type'}
              </Text>
              
              {showVoting && isActive && (
                <VoteButton
                  battleId={battle.id}
                  entityId={Entity2?.id || 0}
                  entityName={Entity2?.name || 'Entité 2'}
                  onVoteSuccess={handleVoteSuccess}
                  onVoteChange={handleVoteChange}
                  style={styles.voteButton}
                />
              )}
            </View>
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
  entitiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  entityContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  imageContainer: {
    position: 'relative',
    width: imageWidth,
    height: imageWidth,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
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
  entityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    minHeight: 40,
  },
  entityType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  voteButton: {
    marginTop: 8,
  },
  vsContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
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
