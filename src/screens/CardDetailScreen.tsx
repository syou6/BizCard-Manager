import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BusinessCard } from '../types';
import { getAllCards } from '../utils/database';

export default function CardDetailScreen({ navigation, route }: any) {
  const { cardId } = route.params;
  const [card, setCard] = useState<BusinessCard | null>(null);

  useEffect(() => {
    loadCard();
  }, [cardId]);

  const loadCard = async () => {
    try {
      const cards = await getAllCards();
      const foundCard = cards.find(c => c.id === cardId);
      if (foundCard) {
        setCard(foundCard);
      }
    } catch (error) {
      console.error('Error loading card:', error);
    }
  };

  if (!card) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleCall = () => {
    if (card.phone) {
      Linking.openURL(`tel:${card.phone}`);
    }
  };

  const handleEmail = () => {
    if (card.email) {
      Linking.openURL(`mailto:${card.email}`);
    }
  };

  const handleWebsite = () => {
    if (card.website) {
      Linking.openURL(card.website);
    }
  };

  const handleMap = () => {
    if (card.address) {
      const encodedAddress = encodeURIComponent(card.address);
      Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditCard', { editMode: true, cardId: card.id });
  };

  const handleShare = () => {
    Alert.alert('共有', 'この機能は後日実装予定です');
  };

  return (
    <ScrollView style={styles.container}>
      {card.imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: card.imageUri }} style={styles.image} />
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{card.name}</Text>
          {card.isFavorite && (
            <Ionicons name="star" size={24} color="#FFD700" style={styles.favoriteIcon} />
          )}
        </View>
        <Text style={styles.title}>{card.title}</Text>
        <Text style={styles.company}>{card.company}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <Ionicons name="call" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>電話</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
          <Ionicons name="mail" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>メール</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleWebsite}>
          <Ionicons name="globe" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>Web</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleMap}>
          <Ionicons name="map" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>地図</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        {card.phone && (
          <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{card.phone}</Text>
          </TouchableOpacity>
        )}

        {card.email && (
          <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{card.email}</Text>
          </TouchableOpacity>
        )}

        {card.address && (
          <TouchableOpacity style={styles.infoRow} onPress={handleMap}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{card.address}</Text>
          </TouchableOpacity>
        )}

        {card.website && (
          <TouchableOpacity style={styles.infoRow} onPress={handleWebsite}>
            <Ionicons name="globe-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{card.website}</Text>
          </TouchableOpacity>
        )}
      </View>

      {card.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>メモ</Text>
          <Text style={styles.notesText}>{card.notes}</Text>
        </View>
      )}

      {card.tags && card.tags.length > 0 && (
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>タグ</Text>
          <View style={styles.tagsContainer}>
            {card.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.metaInfo}>
        <Text style={styles.metaText}>
          作成日: {new Date(card.createdAt).toLocaleDateString('ja-JP')}
        </Text>
        <Text style={styles.metaText}>
          更新日: {new Date(card.updatedAt).toLocaleDateString('ja-JP')}
        </Text>
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={24} color="#007AFF" />
          <Text style={styles.bottomButtonText}>編集</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#007AFF" />
          <Text style={styles.bottomButtonText}>共有</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    height: 250,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  favoriteIcon: {
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  company: {
    fontSize: 18,
    color: '#333',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  notesSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tagsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
  },
  metaInfo: {
    padding: 20,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  bottomButton: {
    alignItems: 'center',
  },
  bottomButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
  },
});