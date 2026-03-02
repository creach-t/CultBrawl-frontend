import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
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

interface Rules {
  length: boolean;
  uppercase: boolean;
  number: boolean;
  specialChar: boolean;
}

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rules, setRules] = useState<Rules>({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const checkUsername = (text: string) => {
    setUsername(text);
    setUsernameAvailable(null);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (text.length < 3) {
      setCheckingUsername(false);
      return;
    }
    setCheckingUsername(true);
    typingTimeout.current = setTimeout(async () => {
      try {
        const response = await api.get(`/auth/check-username?username=${text}`);
        setUsernameAvailable(response.message === "Nom d'utilisateur disponible.");
      } catch {
        setUsernameAvailable(false);
      } finally {
        setCheckingUsername(false);
      }
    }, 800);
  };

  const validatePassword = (text: string) => {
    setPassword(text);
    setRules({
      length: text.length >= 8,
      uppercase: /[A-Z]/.test(text),
      number: /\d/.test(text),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(text),
    });
  };

  const isPasswordValid = Object.values(rules).every(Boolean);
  const canSubmit = isPasswordValid && usernameAvailable === true && username.length >= 3;

  const handleSignUp = async () => {
    if (!canSubmit) {
      showMessage('Vérifiez les champs avant de continuer.');
      return;
    }
    try {
      const response = await api.post('/auth/register', { username, password });
      if (response?.message) {
        showMessage(response.message, 'success');
        setTimeout(() => router.replace('/auth'), 1800);
      }
    } catch (err: any) {
      showMessage(err?.response?.message || 'Erreur lors de la création du compte.');
    }
  };

  const usernameStatus = () => {
    if (username.length > 0 && username.length < 3) return 'short';
    if (checkingUsername) return 'checking';
    if (usernameAvailable === true) return 'ok';
    if (usernameAvailable === false) return 'taken';
    return 'neutral';
  };

  const status = usernameStatus();

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
          <Text style={styles.brandSub}>Créez votre compte</Text>
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

        <View style={styles.form}>
          {/* Username */}
          <View>
            <View
              style={[
                styles.inputWrapper,
                status === 'ok' && styles.inputWrapperValid,
                (status === 'taken' || status === 'short') && styles.inputWrapperInvalid,
              ]}
            >
              <MaterialCommunityIcons name="account-outline" size={20} color="#bbb" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                placeholderTextColor="#bbb"
                value={username}
                onChangeText={checkUsername}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
              {checkingUsername && <ActivityIndicator size="small" color="#6200ee" />}
              {status === 'ok' && <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />}
              {status === 'taken' && <MaterialCommunityIcons name="close-circle" size={20} color="#f44336" />}
            </View>
            {status === 'short' && (
              <Text style={styles.fieldError}>3 caractères minimum</Text>
            )}
            {status === 'taken' && (
              <Text style={styles.fieldError}>Nom d'utilisateur déjà pris</Text>
            )}
            {status === 'ok' && (
              <Text style={styles.fieldSuccess}>Nom d'utilisateur disponible</Text>
            )}
          </View>

          {/* Password */}
          <View>
            <View
              style={[
                styles.inputWrapper,
                password.length > 0 && isPasswordValid && styles.inputWrapperValid,
                password.length > 0 && !isPasswordValid && styles.inputWrapperInvalid,
              ]}
            >
              <MaterialCommunityIcons name="lock-outline" size={20} color="#bbb" style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={[styles.input, { flex: 1 }]}
                placeholder="Mot de passe"
                placeholderTextColor="#bbb"
                value={password}
                onChangeText={validatePassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#bbb" />
              </TouchableOpacity>
            </View>

            {/* Password rules */}
            <View style={styles.rulesGrid}>
              {[
                { key: 'length', label: '8+ caractères' },
                { key: 'uppercase', label: 'Majuscule' },
                { key: 'number', label: 'Chiffre' },
                { key: 'specialChar', label: 'Caractère spécial' },
              ].map(({ key, label }) => (
                <View key={key} style={styles.ruleItem}>
                  <MaterialCommunityIcons
                    name={rules[key as keyof Rules] ? 'check-circle' : 'circle-outline'}
                    size={14}
                    color={rules[key as keyof Rules] ? '#4CAF50' : '#bbb'}
                  />
                  <Text
                    style={[
                      styles.ruleText,
                      rules[key as keyof Rules] ? styles.ruleValid : styles.ruleInvalid,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSignUp}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>S'inscrire</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => router.push('/auth')}>
            <Text style={styles.linkText}>
              Déjà inscrit ?{' '}
              <Text style={styles.linkHighlight}>Se connecter</Text>
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
    marginBottom: 32,
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
  inputWrapperValid: {
    borderColor: '#4CAF50',
  },
  inputWrapperInvalid: {
    borderColor: '#f44336',
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
  fieldError: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
    marginLeft: 4,
  },
  fieldSuccess: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    marginLeft: 4,
  },
  rulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '45%',
  },
  ruleText: {
    fontSize: 12,
  },
  ruleValid: {
    color: '#4CAF50',
  },
  ruleInvalid: {
    color: '#bbb',
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
  submitBtnDisabled: {
    backgroundColor: '#d0d0d0',
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
