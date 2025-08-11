import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessCard, Tag } from '../types';

const CARDS_STORAGE_KEY = 'business_cards';
const TAGS_STORAGE_KEY = 'business_tags';

export const initDatabase = async (): Promise<void> => {
  try {
    const cards = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
    if (cards === null) {
      await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify([]));
    }
    
    const tags = await AsyncStorage.getItem(TAGS_STORAGE_KEY);
    if (tags === null) {
      await AsyncStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

export const saveCard = async (card: BusinessCard): Promise<void> => {
  try {
    const cardsJson = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
    const cards: BusinessCard[] = cardsJson ? JSON.parse(cardsJson) : [];
    
    const existingIndex = cards.findIndex(c => c.id === card.id);
    if (existingIndex >= 0) {
      cards[existingIndex] = card;
    } else {
      cards.push(card);
    }
    
    await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error('Error saving card:', error);
    throw error;
  }
};

export const getAllCards = async (): Promise<BusinessCard[]> => {
  try {
    const cardsJson = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
    if (cardsJson === null) {
      return [];
    }
    
    const cards = JSON.parse(cardsJson);
    return cards.map((card: any) => ({
      ...card,
      createdAt: new Date(card.createdAt),
      updatedAt: new Date(card.updatedAt),
    })).sort((a: BusinessCard, b: BusinessCard) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  } catch (error) {
    console.error('Error getting cards:', error);
    return [];
  }
};

export const deleteCard = async (id: string): Promise<void> => {
  try {
    const cardsJson = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
    if (cardsJson === null) return;
    
    const cards: BusinessCard[] = JSON.parse(cardsJson);
    const filteredCards = cards.filter(card => card.id !== id);
    
    await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(filteredCards));
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};

export const searchCards = async (searchText: string): Promise<BusinessCard[]> => {
  try {
    const allCards = await getAllCards();
    const searchLower = searchText.toLowerCase();
    
    return allCards.filter(card => 
      card.name.toLowerCase().includes(searchLower) ||
      card.company.toLowerCase().includes(searchLower) ||
      card.email.toLowerCase().includes(searchLower) ||
      card.phone.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching cards:', error);
    return [];
  }
};