import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';

export default function AuthScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'
  const fadeAnim = useState(new Animated.Value(0))[0]; // Animation d'opacité

  // Fonction pour afficher une infobulle
  const showMessage = (text, type = 'error') => {
    setMessage(text);
    setMessageType(type);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setMessage('');
        });
      }, 3000);
    });
  };

  const handleLogin = async () => {
    if (!username || !password) {
      showMessage('Veuillez remplir tous les champs.');
      return;
    }
  
    try {
      const response = await api.post('/auth/login', { username, password });
  
      if (response.token) {
        const userData = {
          username,
          token: response.token,
          id: response.user.id,
        };
  
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        showMessage(response.message || 'Connexion réussie.', 'success');
  
        // Redirection après succès
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    } catch (err) {
      if (err.response) {
        showMessage(err.response.message || 'Erreur de connexion.');
      } else if (err.request) {
        showMessage('Aucune réponse du serveur.');
      } else {
        showMessage('Identifiants incorrects.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

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

      <TextInput
        style={styles.input}
        placeholder="Nom d'utilisateur"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => {
          // Focus sur le champ mot de passe
          this.passwordInput?.focus();
        }}
        blurOnSubmit={false}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          ref={(input) => { this.passwordInput = input; }}
          style={styles.passwordInput}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      {/* Lien vers la création de compte */}
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.push('/signup')}
      >
        <Text style={styles.linkText}>
          Pas encore de compte ?{' '}
          <Text style={styles.linkHighlight}>Créer un compte</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#333',
  },
  linkHighlight: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  messageBox: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#FFCDD2',
    borderColor: '#D32F2F',
  },
  successBox: {
    backgroundColor: '#C8E6C9',
    borderColor: '#388E3C',
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
