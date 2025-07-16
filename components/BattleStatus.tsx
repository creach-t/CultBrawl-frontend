import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BattleStatus = ({ timeRemaining, votes, status }) => (
  <View style={styles.statusContainer}>
    <Text style={styles.voteText}>
      {votes.entity1Votes} ({Math.round((votes.entity1Votes / (votes.entity1Votes + votes.entity2Votes || 1)) * 100)}%)
    </Text>
    <Text style={[styles.status, { backgroundColor: status === 'pending' ? '#4caf50' : '#f44336' }]}>
      {timeRemaining}
    </Text>
    <Text style={styles.voteText}>
      {votes.entity2Votes} ({Math.round((votes.entity2Votes / (votes.entity1Votes + votes.entity2Votes || 1)) * 100)}%)
    </Text>
  </View>
);

const styles = StyleSheet.create({
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
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
});

export default BattleStatus;
