import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import { voteService, Vote } from '../services/voteService';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

interface VoteButtonProps {
  battleId: number;
  entityId: number;
  entityName: string;
  onVoteSuccess?: (vote: Vote) => void;
  onVoteChange?: (vote: Vote | null) => void;
  disabled?: boolean;
  style?: any;
}

const VoteButton: React.FC<VoteButtonProps> = ({
  battleId,
  entityId,
  entityName,
  onVoteSuccess,
  onVoteChange,
  disabled = false,
  style
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentVote, setCurrentVote] = useState<Vote | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    checkExistingVote();
  }, [battleId, user?.id]);

  const checkExistingVote = async () => {
    if (!user?.id) return;

    try {
      const vote = await voteService.getUserVoteForBattle(battleId, user.id);
      setCurrentVote(vote);
      setHasVoted(!!vote);
      onVoteChange?.(vote);
    } catch (error) {
      console.error('Erreur lors de la vérification du vote existant:', error);
    }
  };

  const handleVote = async () => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Authentification requise',
        text2: 'Vous devez être connecté pour voter'
      });
      return;
    }

    if (currentVote) {
      // L'utilisateur a déjà voté, proposer de changer son vote
      if (currentVote.votedEntityId === entityId) {
        // Même entité, proposer de supprimer le vote
        handleDeleteVote();
      } else {
        // Entité différente, proposer de changer le vote
        handleChangeVote();
      }
    } else {
      // Nouveau vote
      await createVote();
    }
  };

  const createVote = async () => {
    setIsLoading(true);
    try {
      const response = await voteService.createVote({
        battleId,
        votedEntityId: entityId
      });

      setCurrentVote(response.data);
      setHasVoted(true);
      onVoteSuccess?.(response.data);
      onVoteChange?.(response.data);

      Toast.show({
        type: 'success',
        text1: 'Vote enregistré !',
        text2: `Vous avez voté pour ${entityName}`
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message || 'Impossible d\'enregistrer votre vote'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeVote = () => {
    Alert.alert(
      'Changer de vote',
      `Vous avez déjà voté. Voulez-vous changer votre vote pour ${entityName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Changer', onPress: updateVote }
      ]
    );
  };

  const updateVote = async () => {
    if (!currentVote) return;

    setIsLoading(true);
    try {
      const response = await voteService.updateVote(currentVote.id, {
        votedEntityId: entityId
      });

      setCurrentVote(response.data);
      onVoteSuccess?.(response.data);
      onVoteChange?.(response.data);

      Toast.show({
        type: 'success',
        text1: 'Vote modifié !',
        text2: `Vous avez changé votre vote pour ${entityName}`
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message || 'Impossible de modifier votre vote'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVote = () => {
    Alert.alert(
      'Supprimer le vote',
      'Voulez-vous vraiment supprimer votre vote ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: deleteVote }
      ]
    );
  };

  const deleteVote = async () => {
    if (!currentVote) return;

    setIsLoading(true);
    try {
      await voteService.deleteVote(currentVote.id);

      setCurrentVote(null);
      setHasVoted(false);
      onVoteChange?.(null);

      Toast.show({
        type: 'success',
        text1: 'Vote supprimé',
        text2: 'Votre vote a été supprimé'
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message || 'Impossible de supprimer votre vote'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isVotedFor = currentVote?.votedEntityId === entityId;
  const buttonMode = isVotedFor ? 'contained' : 'outlined';
  const buttonIcon = isVotedFor ? 'check-circle' : 'vote';
  const buttonText = isVotedFor ? 'Voté' : (hasVoted ? 'Changer' : 'Voter');

  return (
    <View style={[styles.container, style]}>
      <Button
        mode={buttonMode}
        icon={isLoading ? undefined : buttonIcon}
        onPress={handleVote}
        disabled={disabled || isLoading}
        style={[
          styles.button,
          isVotedFor && styles.votedButton
        ]}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          buttonText
        )}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    borderRadius: 25,
    minWidth: 100,
  },
  votedButton: {
    backgroundColor: '#4CAF50',
  },
  buttonContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default VoteButton;
