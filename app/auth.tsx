import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';

export default function AuthScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef<TextInput>(null);

  const showMessage = (text: string, type: 'success' | 'error' = 'error') => {
    setMessage(text);
    setMessageType(type);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2800),
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setMessage(''));
  };

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      showMessage('Remplissez tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username: username.trim(), password });
      if (response.token) {
        const userData = { username: username.trim(), token: response.token, id: response.user.id, roleId: response.user.roleId };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        showMessage(response.message || 'Connexion réussie.', 'success');
        setTimeout(() => router.replace('/'), 800);
      }
    } catch (err: any) {
      showMessage(err?.response?.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brand}>
          <MaterialCommunityIcons name="boxing-glove" size={52} color="#6200ee" />
          <Text style={styles.brandName}>CultBrawl</Text>
          <Text style={styles.brandSub}>Connectez-vous pour voter</Text>
        </View>

        {/* Message */}
        {message !== '' && (
          <Animated.View
            style={[
              styles.messageBox,
              messageType === 'success' ? styles.successBox : styles.errorBox,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.messageText}>{message}</Text>
          </Animated.View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="account-outline" size={20} color="#bbb" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nom d'utilisateur"
              placeholderTextColor="#bbb"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#bbb" style={styles.inputIcon} />
            <TextInput
              ref={passwordRef}
              style={[styles.input, { flex: 1 }]}
              placeholder="Mot de passe"
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#bbb" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnLoading]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => router.push('/signup')}>
            <Text style={styles.linkText}>
              Pas encore de compte ?{' '}
              <Text style={styles.linkHighlight}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  content: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 36,
    gap: 8,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a2e',
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 15,
    color: '#999',
  },
  messageBox: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  successBox: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    paddingHorizontal: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 14,
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  submitBtn: {
    backgroundColor: '#6200ee',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    elevation: 3,
    shadowColor: '#6200ee',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  submitBtnLoading: {
    backgroundColor: '#9e9e9e',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  link: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 15,
    color: '#888',
  },
  linkHighlight: {
    color: '#6200ee',
    fontWeight: '700',
  },
});
