import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { useUser } from '../context/UserContext';

interface Profile {
  firstname?: string;
  lastname?: string;
  email?: string;
  imageUrl?: string;
  username?: string;
  points?: number;
}

type EditableField = 'firstname' | 'lastname' | 'email';

export default function Account() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile>({});
  const [editing, setEditing] = useState<Partial<Record<EditableField, boolean>>>({});
  const [draft, setDraft] = useState<Profile>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState<EditableField | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users');
      setProfile(response);
      setDraft(response);
    } catch (error) {
      console.error('Erreur profil:', error);
    }
  };

  const toggleEdit = (field: EditableField) => {
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }));
    if (editing[field]) {
      // Cancel → reset draft
      setDraft((prev) => ({ ...prev, [field]: profile[field] }));
    }
  };

  const handleSave = async (field: EditableField) => {
    setSaving(field);
    try {
      await api.put(`/users/${user?.id}`, { [field]: draft[field] });
      setProfile((prev) => ({ ...prev, [field]: draft[field] }));
      setEditing((prev) => ({ ...prev, [field]: false }));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally {
      setSaving(null);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      await handleUploadImage(result.assets[0].uri);
    }
  };

  const handleUploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri,
        name: `profile-${user?.id}.jpg`,
        type: 'image/jpeg',
      } as any);
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = response.fullUrl;
      await api.put(`/users/${user?.id}`, { imageUrl });
      setProfile((prev) => ({ ...prev, imageUrl }));
      Alert.alert('Succès', 'Photo de profil mise à jour.');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo.');
    } finally {
      setUploading(false);
    }
  };

  const fields: { key: EditableField; label: string; icon: string; keyboard?: any }[] = [
    { key: 'firstname', label: 'Prénom', icon: 'account-outline' },
    { key: 'lastname', label: 'Nom', icon: 'account-outline' },
    { key: 'email', label: 'Email', icon: 'email-outline', keyboard: 'email-address' },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} disabled={uploading} activeOpacity={0.8}>
            <View style={styles.avatarWrapper}>
              {profile.imageUrl ? (
                <Image source={{ uri: profile.imageUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="account" size={52} color="#bbb" />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="camera" size={16} color="#fff" />
                )}
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.username}>{profile.username ?? user?.username}</Text>
          {profile.points !== undefined && (
            <View style={styles.pointsBadge}>
              <MaterialCommunityIcons name="diamond-stone" size={14} color="#6200ee" />
              <Text style={styles.pointsText}>{profile.points} pts</Text>
            </View>
          )}
        </View>

        {/* Editable fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          {fields.map(({ key, label, icon, keyboard }) => (
            <View key={key} style={styles.fieldCard}>
              <View style={styles.fieldHeader}>
                <MaterialCommunityIcons name={icon as any} size={18} color="#6200ee" />
                <Text style={styles.fieldLabel}>{label}</Text>
                <TouchableOpacity
                  onPress={() => (editing[key] ? handleSave(key) : toggleEdit(key))}
                  style={styles.fieldActionBtn}
                  disabled={saving === key}
                >
                  {saving === key ? (
                    <ActivityIndicator size="small" color="#6200ee" />
                  ) : (
                    <Text style={styles.fieldActionText}>
                      {editing[key] ? 'Enregistrer' : 'Modifier'}
                    </Text>
                  )}
                </TouchableOpacity>
                {editing[key] && (
                  <TouchableOpacity
                    onPress={() => toggleEdit(key)}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelText}>Annuler</Text>
                  </TouchableOpacity>
                )}
              </View>

              {editing[key] ? (
                <TextInput
                  style={styles.input}
                  value={draft[key] ?? ''}
                  onChangeText={(text) => setDraft((prev) => ({ ...prev, [key]: text }))}
                  keyboardType={keyboard}
                  autoCapitalize="none"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => handleSave(key)}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile[key] || <Text style={styles.fieldEmpty}>Non renseigné</Text>}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
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
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#6200ee',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6200ee',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ede7f6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6200ee',
  },
  section: {
    gap: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  fieldCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777',
    flex: 1,
  },
  fieldActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#ede7f6',
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  fieldActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6200ee',
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cancelText: {
    fontSize: 13,
    color: '#aaa',
  },
  fieldValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  fieldEmpty: {
    color: '#bbb',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  input: {
    fontSize: 16,
    color: '#222',
    borderBottomWidth: 2,
    borderBottomColor: '#6200ee',
    paddingVertical: 6,
  },
  backBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  backBtnText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
});
