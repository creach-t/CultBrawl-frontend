import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUser } from '../context/UserContext';

export default function Index() {
  const { user } = useUser();

  // Logged-in: dashboard rapide
  if (user) {
    return (
      <View style={styles.dashContainer}>
        <View style={styles.welcomeCard}>
          <MaterialCommunityIcons name="boxing-glove" size={36} color="#6200ee" />
          <Text style={styles.welcomeTitle}>Salut, {user.username} 👋</Text>
          <View style={styles.pointsRow}>
            <MaterialCommunityIcons name="diamond-stone" size={18} color="#6200ee" />
            <Text style={styles.pointsValue}>{user.points ?? 0} points</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => router.push('/battlelist')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="sword-cross" size={24} color="#fff" />
            <Text style={styles.actionBtnLabel}>Voir les Battles</Text>
            <Text style={styles.actionBtnSub}>Votez et participez</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={() => router.push('/addbattle')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="plus-circle" size={24} color="#6200ee" />
            <Text style={[styles.actionBtnLabel, { color: '#6200ee' }]}>Créer une Battle</Text>
            <Text style={[styles.actionBtnSub, { color: '#888' }]}>10 points requis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnTertiary]}
            onPress={() => router.push('/leaderboard')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="trophy" size={24} color="#FF9800" />
            <Text style={[styles.actionBtnLabel, { color: '#555' }]}>Classement</Text>
            <Text style={[styles.actionBtnSub, { color: '#aaa' }]}>Votre rang</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Guest: landing page
  return (
    <LinearGradient colors={['#6200ee', '#9c27b0']} style={styles.landingContainer}>
      <View style={styles.landingContent}>
        <MaterialCommunityIcons name="boxing-glove" size={72} color="#fff" />
        <Text style={styles.landingTitle}>CultBrawl</Text>
        <Text style={styles.landingSubtitle}>
          Films, séries, livres, jeux…{'\n'}Lequel mérite le titre ?
        </Text>

        <View style={styles.landingActions}>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth')}
            activeOpacity={0.88}
          >
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupBtn}
            onPress={() => router.push('/signup')}
            activeOpacity={0.88}
          >
            <Text style={styles.signupBtnText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Dashboard (logged-in)
  dashContainer: {
    flex: 1,
    backgroundColor: '#f4f4f8',
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    gap: 8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ede7f6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6200ee',
  },
  actions: {
    gap: 12,
  },
  actionBtn: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  actionBtnPrimary: {
    backgroundColor: '#6200ee',
  },
  actionBtnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ede7f6',
  },
  actionBtnTertiary: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#f0f0f0',
  },
  actionBtnLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  actionBtnSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },

  // Landing (guest)
  landingContainer: {
    flex: 1,
  },
  landingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  landingTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  landingSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 16,
  },
  landingActions: {
    width: '100%',
    gap: 14,
  },
  loginBtn: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#6200ee',
    fontSize: 18,
    fontWeight: '800',
  },
  signupBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  signupBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
