import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { useFocusEffect } from 'expo-router';

export default function Leaderboard() {
  const [userLeaderboard, setUserLeaderboard] = useState([]);
  const [entityLeaderboard, setEntityLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const userResponse = await api.get('/users/leaderboard');
      const entityResponse = await api.get('/entities/leaderboard');
      setUserLeaderboard(userResponse);
      setEntityLeaderboard(entityResponse);
    } catch (error) {
      console.error('Erreur lors de la récupération du leaderboard :', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLeaderboard();
  }, [