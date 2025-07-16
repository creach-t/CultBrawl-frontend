import React from 'react';
import { View, StyleSheet } from 'react-native';

const BattleProgressBar = ({ votes }) => {
  const totalVotes = votes.entity1Votes + votes.entity2Votes;
  const entity1Percentage = (votes.entity1Votes / (totalVotes || 1)) * 100;
  const entity2Percentage = (votes.entity2Votes / (totalVotes || 1)) * 100;

  return (
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
  );
};

const styles = StyleSheet.create({
  backgroundBar: {
    flexDirection: 'row',
    height: 20,
  },
  backgroundSide: {
    height: '100%',
  },
});

export default BattleProgressBar;
