import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, ProgressBar, Divider } from 'react-native-paper';
import { voteService, VoteStats } from '../services/voteService';
import { LinearGradient } from 'expo-linear-gradient';

interface VoteStatsDisplayProps {
  battleId: number;
  refreshTrigger?: number;
  style?: any;
}

const { width } = Dimensions.get('window');

const VoteStatsDisplay: React.FC<VoteStatsDisplayProps> = ({
  battleId,
  refreshTrigger = 0,
  style
}) => {
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [battleId, refreshTrigger]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await voteService.getBattleVoteStats(battleId);
      setStats(response.data);
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des statistiques');
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, style]}>
        <Card.Content style={styles.loadingContainer}>
          <Text>Chargement des statistiques...</Text>
        </Card.Content>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card style={[styles.container, style]}>
        <Card.Content style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Impossible de charger les statistiques'}
          </Text>
        </Card.Content>
      </Card>
    );
  }

  const { entity1, entity2, totalVotes } = stats;
  const hasVotes = totalVotes > 0;

  return (
    <Card style={[styles.container, style]}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title}>Résultats du vote</Text>
          <Text style={styles.totalVotes}>
            {totalVotes} vote{totalVotes > 1 ? 's' : ''}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {hasVotes ? (
          <View style={styles.statsContainer}>
            {/* Entité 1 */}
            <View style={styles.entityContainer}>
              <View style={styles.entityHeader}>
                <Text style={styles.entityName} numberOfLines={1}>
                  {entity1.name}
                </Text>
                <Text style={styles.percentage}>
                  {entity1.percentage}%
                </Text>
              </View>
              
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={entity1.percentage / 100}
                  color="#E91E63"
                  style={styles.progressBar}
                />
                <LinearGradient
                  colors={['#E91E63', '#F06292']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressOverlay,
                    { width: `${entity1.percentage}%` }
                  ]}
                />
              </View>
              
              <Text style={styles.voteCount}>
                {entity1.votes} vote{entity1.votes > 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.separator} />

            {/* Entité 2 */}
            <View style={styles.entityContainer}>
              <View style={styles.entityHeader}>
                <Text style={styles.entityName} numberOfLines={1}>
                  {entity2.name}
                </Text>
                <Text style={styles.percentage}>
                  {entity2.percentage}%
                </Text>
              </View>
              
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={entity2.percentage / 100}
                  color="#2196F3"
                  style={styles.progressBar}
                />
                <LinearGradient
                  colors={['#2196F3', '#64B5F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressOverlay,
                    { width: `${entity2.percentage}%` }
                  ]}
                />
              </View>
              
              <Text style={styles.voteCount}>
                {entity2.votes} vote{entity2.votes > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noVotesContainer}>
            <Text style={styles.noVotesText}>
              Aucun vote pour le moment
            </Text>
            <Text style={styles.noVotesSubtext}>
              Soyez le premier à voter !
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalVotes: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  divider: {
    marginBottom: 20,
  },
  statsContainer: {
    gap: 20,
  },
  entityContainer: {
    gap: 8,
  },
  entityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 50,
    textAlign: 'right',
  },
  progressContainer: {
    position: 'relative',
    height: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 8,
    borderRadius: 4,
  },
  voteCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  noVotesContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noVotesText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  noVotesSubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default VoteStatsDisplay;
