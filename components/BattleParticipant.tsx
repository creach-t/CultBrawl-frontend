import React from 'react';
import { TouchableOpacity, ImageBackground, Text, StyleSheet } from 'react-native';

const BattleParticipant = ({ participant, onVote, disabled }) => (
  <TouchableOpacity style={styles.voteSide} onPress={onVote} disabled={disabled}>
    <ImageBackground
      source={{ uri: participant.imageUrl }}
      style={styles.imageBackground}
      imageStyle={styles.image}
    >
      <Text style={styles.titleOverlay}>{participant.name}</Text>
    </ImageBackground>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
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

export default BattleParticipant;
