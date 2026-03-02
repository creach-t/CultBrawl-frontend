import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import api from '../services/api';
import { useUser } from '../context/UserContext';
import { useIsAdmin } from '../hooks/useIsAdmin';

interface Entity {
  id: string;
  name: string;
  type: string;
  imageUrl: string;
  apiId: string;
}

const TYPE_FILTERS = [
  { key: 'all', label: 'Tous', icon: 'apps' },
  { key: 'movie', label: 'Films', icon: 'movie' },
  { key: 'series', label: 'Séries', icon: 'television-play' },
  { key: 'book', label: 'Livres', icon: 'book-open-variant' },
  { key: 'game', label: 'Jeux', icon: 'gamepad-variant' },
] as const;

const TYPE_EMOJI: Record<string, string> = {
  movie: '🎬',
  series: '📺',
  book: '📚',
  game: '🎮',
};

export default function AddBattle() {
  const { user } = useUser();
  const isAdmin = useIsAdmin();
  const { width } = useWindowDimensions();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [selected, setSelected] = useState<Entity[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Responsive breakpoints
  const isTablet = width >= 600;
  const isDesktop = width >= 1024;
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;
  const maxWidth = Math.min(width, 900);

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/entities');
      setEntities(Array.isArray(response) ? response : []);
    } catch {
      console.error('Erreur récupération entités');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchEntities(); }, [fetchEntities]));

  const filtered = useMemo(() => {
    return entities.filter((e) => {
      const matchType = typeFilter === 'all' || e.type === typeFilter;
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [entities, typeFilter, search]);

  const toggleSelect = (entity: Entity) => {
    const isSelected = selected.some((e) => e.id === entity.id);
    if (isSelected) {
      setSelected(selected.filter((e) => e.id !== entity.id));
    } else if (selected.length < 2) {
      setSelected([...selected, entity]);
    } else {
      // Replace the oldest selection
      setSelected([selected[1], entity]);
    }
  };

  const doDeleteEntity = async (entity: Entity) => {
    try {
      await api.delete(`/entities/${entity.id}`);
      setEntities((prev) => prev.filter((e) => e.id !== entity.id));
      setSelected((prev) => prev.filter((e) => e.id !== entity.id));
    } catch {
      if (Platform.OS === 'web') {
        window.alert('Impossible de supprimer cette entité.');
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer cette entité.');
      }
    }
  };

  const handleDeleteEntity = (entity: Entity) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Supprimer "${entity.name}" ?`)) {
        doDeleteEntity(entity);
      }
    } else {
      Alert.alert(
        'Supprimer l\'entité',
        `Supprimer "${entity.name}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: () => doDeleteEntity(entity) },
        ]
      );
    }
  };

  const handleCreate = async () => {
    if (selected.length !== 2 || creating) return;
    setCreating(true);
    setCreateError('');
    try {
      await api.post('/battles', {
        entity1Id: selected[0].id,
        entity2Id: selected[1].id,
        durationHours: 1,
        createdById: user?.id,
      });
      // Navigate immediately — no Alert, prevents any double-submit
      router.replace('/battlelist');
    } catch {
      setCreateError('Impossible de créer la bataille. Réessayez.');
      setCreating(false);
    }
    // No finally reset — if success we navigate away, creating stays true
  };

  const renderEntity = ({ item }: { item: Entity }) => {
    const isSelected = selected.some((e) => e.id === item.id);
    const selectionIndex = selected.findIndex((e) => e.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => toggleSelect(item)}
        activeOpacity={0.8}
      >
        {/* Selection badge */}
        {isSelected && (
          <View style={styles.selectionBadge}>
            <Text style={styles.selectionBadgeText}>{selectionIndex + 1}</Text>
          </View>
        )}

        {/* Type badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {TYPE_EMOJI[item.type] ?? '❓'}
          </Text>
        </View>

        <Image
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardMeta}>
          <Text style={styles.cardName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.cardType}>{item.type}</Text>
        </View>

        {isSelected && (
          <View style={styles.checkOverlay}>
            <MaterialCommunityIcons name="check-circle" size={28} color="#6200ee" />
          </View>
        )}

        {isAdmin && (
          <TouchableOpacity
            style={styles.entityDeleteBtn}
            onPress={(e) => { e.stopPropagation?.(); handleDeleteEntity(item); }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Centered content wrapper */}
      <View style={[styles.inner, { maxWidth, alignSelf: 'center', width: '100%' }]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#444" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚔️ Créer une Battle</Text>
          <TouchableOpacity
            style={styles.addEntityBtn}
            onPress={() => router.push('/addentity')}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#6200ee" />
            {isTablet && <Text style={styles.addEntityBtnText}>Nouvelle entité</Text>}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <MaterialCommunityIcons name="magnify" size={20} color="#bbb" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une entité…"
            placeholderTextColor="#bbb"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        {/* Type filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
          style={styles.filtersScroll}
        >
          {TYPE_FILTERS.map((f) => {
            const active = typeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setTypeFilter(f.key)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name={f.icon as any}
                  size={15}
                  color={active ? '#fff' : '#777'}
                />
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Count info */}
        <Text style={styles.countInfo}>
          {filtered.length} entité{filtered.length !== 1 ? 's' : ''}
          {typeFilter !== 'all' || search ? ' (filtrées)' : ''} — sélectionnez-en 2
        </Text>

        {/* Grid */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#6200ee" />
          </View>
        ) : (
          <FlatList
            key={numColumns} // force re-render when numColumns changes
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderEntity}
            numColumns={numColumns}
            columnWrapperStyle={styles.row}
            contentContainerStyle={[
              styles.gridContent,
              selected.length > 0 && styles.gridWithFooter,
            ]}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>Aucune entité trouvée</Text>
                <TouchableOpacity
                  style={styles.addFirstBtn}
                  onPress={() => router.push('/addentity')}
                >
                  <Text style={styles.addFirstBtnText}>+ Ajouter une entité</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

      </View>

      {/* Sticky footer: VS preview + create button */}
      {selected.length > 0 && (
        <View style={styles.footerOuter}>
          <View style={[styles.footer, { maxWidth, alignSelf: 'center', width: '100%' }]}>
            <View style={styles.vsPreview}>
              {/* Slot 1 */}
              <View style={styles.vsSlot}>
                {selected[0] ? (
                  <>
                    <Image source={{ uri: selected[0].imageUrl }} style={styles.vsImage} />
                    <Text style={styles.vsName} numberOfLines={1}>{selected[0].name}</Text>
                  </>
                ) : (
                  <View style={styles.vsSlotEmpty}>
                    <MaterialCommunityIcons name="image-plus" size={28} color="#ccc" />
                    <Text style={styles.vsSlotEmptyText}>Choisir</Text>
                  </View>
                )}
              </View>

              <View style={styles.vsCenter}>
                <Text style={styles.vsLabel}>VS</Text>
              </View>

              {/* Slot 2 */}
              <View style={styles.vsSlot}>
                {selected[1] ? (
                  <>
                    <Image source={{ uri: selected[1].imageUrl }} style={styles.vsImage} />
                    <Text style={styles.vsName} numberOfLines={1}>{selected[1].name}</Text>
                  </>
                ) : (
                  <View style={styles.vsSlotEmpty}>
                    <MaterialCommunityIcons name="image-plus" size={28} color="#ccc" />
                    <Text style={styles.vsSlotEmptyText}>Choisir</Text>
                  </View>
                )}
              </View>
            </View>

            {createError !== '' && (
              <Text style={styles.errorText}>{createError}</Text>
            )}

            {selected.length === 2 && (
              <TouchableOpacity
                style={[styles.createBtn, creating && styles.createBtnLoading]}
                onPress={handleCreate}
                disabled={creating}
                activeOpacity={0.85}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="sword-cross" size={22} color="#fff" />
                    <Text style={styles.createBtnText}>Lancer la Battle !</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  inner: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  addEntityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ede7f6',
    borderRadius: 20,
  },
  addEntityBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6200ee',
  },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingVertical: 12,
  },
  clearBtn: {
    padding: 4,
  },

  // Filters
  filtersScroll: {
    marginTop: 12,
  },
  filtersRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777',
  },
  filterChipTextActive: {
    color: '#fff',
  },

  // Count
  countInfo: {
    fontSize: 12,
    color: '#aaa',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
  },

  // Grid
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  gridWithFooter: {
    paddingBottom: 200,
  },

  // Card (2-column)
  card: {
    flex: 0.48,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#6200ee',
  },
  cardImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#e0e0e0',
  },
  cardMeta: {
    padding: 10,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
    lineHeight: 17,
    marginBottom: 3,
  },
  cardType: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 2,
  },
  typeBadgeText: {
    fontSize: 13,
  },
  selectionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6200ee',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  selectionBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  checkOverlay: {
    position: 'absolute',
    bottom: 40,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
  },
  entityDeleteBtn: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(244,67,54,0.85)',
    borderRadius: 10,
    padding: 4,
    zIndex: 4,
  },

  // Empty
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 44,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  addFirstBtn: {
    marginTop: 8,
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 22,
  },
  addFirstBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Sticky footer
  footerOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },
  errorText: {
    fontSize: 13,
    color: '#f44336',
    textAlign: 'center',
    fontWeight: '500',
  },
  vsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vsSlot: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  vsImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  vsName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  vsSlotEmpty: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsSlotEmptyText: {
    fontSize: 10,
    color: '#bbb',
  },
  vsCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6200ee',
    backgroundColor: '#ede7f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#6200ee',
    paddingVertical: 15,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#6200ee',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  createBtnLoading: {
    backgroundColor: '#9e9e9e',
    elevation: 0,
    shadowOpacity: 0,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
});
