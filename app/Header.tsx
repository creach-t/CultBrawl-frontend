import React, { useState, useRef } from 'react';
import { Appbar, Menu, Divider } from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { useMessage } from '../context/MessageContext';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Header() {
  const { user, setUser, refreshUser } = useUser();
  const { message } = useMessage();
  const [menuVisible, setMenuVisible] = useState(false);
  const [messageOpacity] = useState(new Animated.Value(0));
  const userIconRef = useRef(null);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setMenuVisible(false);
      router.push('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleProfilePress = () => {
    if (user) {
      setMenuVisible(true);
    } else {
      router.push('/auth');
    }
  };

  const handleAccountPress = () => {
    setMenuVisible(false);
    router.push('/account');
  };

  const truncateUsername = (username) => {
    return username.length > 15 ? `${username.substring(0, 15)}...` : username;
  };

  // Rafraîchir les informations utilisateur si nécessaire
  React.useEffect(() => {
    if (user && !user.points && user.points !== 0) {
      refreshUser();
    }
  }, [user]);

  if (message) {
    Animated.timing(messageOpacity, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(messageOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 3000);
    });
  }

  return (
    <>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="CultBrawl" titleStyle={styles.headerTitle} />

        {user && (
          <View style={styles.userInfo}>
            <View style={styles.userDetails}>
              <Text style={styles.username}>{truncateUsername(user.username)}</Text>
              <View style={styles.pointsContainer}>
                <MaterialCommunityIcons name="diamond-stone" size={16} color="#fff" />
                <Text style={styles.points}>{user.points || 0}</Text>
              </View>
            </View>
            <TouchableOpacity
              ref={userIconRef}
              onPress={handleProfilePress}
              style={styles.userIconContainer}
            >
              <MaterialCommunityIcons name="account-circle" size={40} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {!user && (
          <Appbar.Action icon="account-circle" onPress={handleProfilePress} />
        )}

        {user && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <View style={styles.menuAnchor} />
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item 
              onPress={handleAccountPress} 
              title="Mon Compte"
              leadingIcon="account"
            />
            <Divider />
            <Menu.Item 
              onPress={handleLogout} 
              title="Se Déconnecter"
              leadingIcon="logout"
              titleStyle={styles.logoutText}
            />
          </Menu>
        )}
      </Appbar.Header>

      {message && (
        <Animated.View
          style={[
            styles.messageContainer,
            message.type === 'error' ? styles.error : styles.success,
            { opacity: messageOpacity },
          ]}
        >
          <Text style={styles.messageText}>{message.text}</Text>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#6200ee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  userDetails: {
    flexDirection: 'column',
    marginRight: 8,
    justifyContent: 'center',
  },
  username: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  points: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  userIconContainer: {
    padding: 4,
  },
  menuAnchor: {
    position: 'absolute',
    top: 0,
    right: 16,
    width: 40,
    height: 40,
  },
  menuContent: {
    marginTop: 50,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 8,
  },
  logoutText: {
    color: '#d32f2f',
  },
  messageContainer: {
    position: 'absolute',
    top: 60,
    left: '5%',
    right: '5%',
    zIndex: 100,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  error: {
    backgroundColor: '#f44336',
  },
  success: {
    backgroundColor: '#4caf50',
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
