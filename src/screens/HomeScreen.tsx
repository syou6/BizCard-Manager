import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BusinessCard } from '../types';
import { getAllCards, deleteCard, searchCards } from '../utils/database';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }: any) {
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'date'>('date');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );

  const loadCards = async () => {
    try {
      let loadedCards = await getAllCards();
      
      // フィルタリング
      if (filterGroup !== 'all') {
        loadedCards = loadedCards.filter(card => card.group === filterGroup);
      }
      
      // ソート
      switch (sortBy) {
        case 'name':
          loadedCards.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
          break;
        case 'company':
          loadedCards.sort((a, b) => a.company.localeCompare(b.company, 'ja'));
          break;
        case 'date':
        default:
          loadedCards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
          break;
      }
      
      setCards(loadedCards);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      loadCards();
    } else {
      try {
        const results = await searchCards(text);
        setCards(results);
      } catch (error) {
        console.error('Error searching cards:', error);
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      '名刺を削除',
      `${name}の名刺を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCard(id);
              loadCards();
            } catch (error) {
              console.error('Error deleting card:', error);
            }
          },
        },
      ]
    );
  };

  const renderCard = ({ item }: { item: BusinessCard }) => {
    if (viewMode === 'grid') {
      return (
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => navigation.navigate('CardDetail', { cardId: item.id })}
          onLongPress={() => handleDelete(item.id, item.name)}
        >
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.gridCardImage} />
          ) : (
            <View style={styles.gridCardPlaceholder}>
              <Ionicons name="person-circle-outline" size={60} color="#ddd" />
            </View>
          )}
          <View style={styles.gridCardInfo}>
            {item.isFavorite && (
              <Ionicons name="star" size={14} color="#FFD700" style={styles.gridFavoriteIcon} />
            )}
            <Text style={styles.gridCardName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.gridCardCompany} numberOfLines={1}>{item.company}</Text>
            {item.group && (
              <View style={[styles.groupBadge, { backgroundColor: getGroupColor(item.group) }]}>
                <Text style={styles.groupBadgeText}>{item.group}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CardDetail', { cardId: item.id })}
        onLongPress={() => handleDelete(item.id, item.name)}
      >
        <View style={styles.cardContent}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
          ) : (
            <View style={styles.placeholderThumbnail}>
              <Ionicons name="person-circle-outline" size={40} color="#ccc" />
            </View>
          )}
          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{item.name}</Text>
              {item.nameKana && (
                <Text style={styles.cardNameKana}>{item.nameKana}</Text>
              )}
            </View>
            <Text style={styles.cardCompany}>{item.company}</Text>
            {item.department && (
              <Text style={styles.cardDepartment}>{item.department} • {item.title}</Text>
            )}
            {!item.department && item.title && (
              <Text style={styles.cardDepartment}>{item.title}</Text>
            )}
            {item.exchangeDate && (
              <Text style={styles.exchangeInfo}>
                <Ionicons name="calendar-outline" size={12} color="#999" />
                {' '}{new Date(item.exchangeDate).toLocaleDateString('ja-JP')}
              </Text>
            )}
          </View>
          <View style={styles.cardActions}>
            {item.isFavorite && (
              <Ionicons name="star" size={20} color="#FFD700" />
            )}
            {item.group && (
              <View style={[styles.groupBadge, { backgroundColor: getGroupColor(item.group) }]}>
                <Text style={styles.groupBadgeText}>{item.group}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getGroupColor = (group: string) => {
    const colors: { [key: string]: string } = {
      '取引先': '#4CAF50',
      '見込み客': '#FF9800',
      'パートナー': '#2196F3',
      'その他': '#9E9E9E',
    };
    return colors[group] || '#9E9E9E';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="名前、会社、メールアドレスで検索"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={20} color="#007AFF" />
            <Text style={styles.controlButtonText}>フィルター</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            <Ionicons 
              name={viewMode === 'list' ? 'grid' : 'list'} 
              size={20} 
              color="#007AFF" 
            />
            <Text style={styles.controlButtonText}>
              {viewMode === 'list' ? 'グリッド' : 'リスト'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>合計: {cards.length}件</Text>
          {filterGroup !== 'all' && (
            <Text style={styles.filterActiveText}>• {filterGroup}でフィルター中</Text>
          )}
        </View>
      </View>
      
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          loadCards().then(() => setRefreshing(false));
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>名刺がありません</Text>
            <Text style={styles.emptySubText}>+ボタンから新しい名刺を追加してください</Text>
          </View>
        }
      />
      
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>フィルター & 並び替え</Text>
            
            <Text style={styles.modalSectionTitle}>グループ</Text>
            <ScrollView style={styles.modalOptions}>
              {['all', '取引先', '見込み客', 'パートナー', 'その他'].map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.modalOption,
                    filterGroup === group && styles.modalOptionActive
                  ]}
                  onPress={() => setFilterGroup(group)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    filterGroup === group && styles.modalOptionTextActive
                  ]}>
                    {group === 'all' ? 'すべて' : group}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.modalSectionTitle}>並び替え</Text>
            <ScrollView style={styles.modalOptions}>
              {[
                { value: 'date', label: '更新日時' },
                { value: 'name', label: '名前' },
                { value: 'company', label: '会社名' }
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.value}
                  style={[
                    styles.modalOption,
                    sortBy === sort.value && styles.modalOptionActive
                  ]}
                  onPress={() => setSortBy(sort.value as 'name' | 'company' | 'date')}
                >
                  <Text style={[
                    styles.modalOptionText,
                    sortBy === sort.value && styles.modalOptionTextActive
                  ]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowFilterModal(false);
                loadCards();
              }}
            >
              <Text style={styles.modalCloseButtonText}>適用</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EditCard', { 
          imageUri: '', 
          extractedData: null,
          editMode: false 
        })}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  placeholderThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardNameKana: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  cardCompany: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardDepartment: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 12,
    color: '#999',
  },
  exchangeInfo: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  favoriteIcon: {
    marginLeft: 10,
  },
  groupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  groupBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'space-around',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  controlButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#007AFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 5,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 13,
    color: '#666',
  },
  filterActiveText: {
    fontSize: 13,
    color: '#007AFF',
    marginLeft: 5,
  },
  gridCard: {
    flex: 1,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gridCardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: 'cover',
  },
  gridCardPlaceholder: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCardInfo: {
    padding: 10,
    position: 'relative',
  },
  gridCardName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gridCardCompany: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  gridFavoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    marginBottom: 10,
  },
  modalOptions: {
    maxHeight: 150,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 5,
  },
  modalOptionActive: {
    backgroundColor: '#007AFF',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#333',
  },
  modalOptionTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});