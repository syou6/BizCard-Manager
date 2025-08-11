import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BusinessCard } from '../types';
import { saveCard, getAllCards } from '../utils/database';

export default function EditCardScreen({ navigation, route }: any) {
  const { imageUri: initialImageUri, extractedData, editMode, cardId } = route.params || {};
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [imageUri, setImageUri] = useState<string>(initialImageUri || '');

  useEffect(() => {
    if (editMode && cardId) {
      loadCard();
    }
  }, [editMode, cardId]);

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
  
  const [formData, setFormData] = useState({
    name: extractedData?.name || '',
    nameKana: '',
    company: extractedData?.company || '',
    department: '',
    title: extractedData?.title || '',
    email: extractedData?.email || '',
    phone: extractedData?.phone || '',
    mobile: '',
    fax: '',
    address: extractedData?.address || '',
    website: extractedData?.website || '',
    linkedin: '',
    twitter: '',
    notes: '',
    group: '',
    exchangeDate: new Date(),
    exchangeLocation: '',
    isFavorite: false,
  });

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        company: card.company,
        title: card.title,
        email: card.email,
        phone: card.phone,
        address: card.address,
        website: card.website,
        notes: card.notes,
        isFavorite: card.isFavorite,
      });
    }
  }, [card]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('カメラの許可が必要です');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('エラー', '名前は必須項目です');
      return;
    }

    try {
      const cardData: BusinessCard = {
        id: editMode && card ? card.id : Date.now().toString(),
        ...formData,
        imageUri: imageUri || '',
        createdAt: editMode && card ? card.createdAt : new Date(),
        updatedAt: new Date(),
        tags: editMode && card ? card.tags : [],
      };

      await saveCard(cardData);
      Alert.alert('成功', '名刺を保存しました', [
        { text: 'OK', onPress: () => navigation.navigate('HomeMain') },
      ]);
    } catch (error) {
      console.error('Error saving card:', error);
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageSection}>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={pickImage}
              >
                <Text style={styles.changeImageText}>画像を変更</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePickerContainer}>
              <Text style={styles.imagePickerTitle}>名刺画像を追加</Text>
              <View style={styles.imagePickerButtons}>
                <TouchableOpacity style={styles.imagePickerButton} onPress={takePhoto}>
                  <Ionicons name="camera" size={40} color="#007AFF" />
                  <Text style={styles.imagePickerButtonText}>カメラ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                  <Ionicons name="images" size={40} color="#007AFF" />
                  <Text style={styles.imagePickerButtonText}>ギャラリー</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>名前 *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="山田 太郎"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>会社名</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(text) => setFormData({ ...formData, company: text })}
              placeholder="株式会社サンプル"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>役職</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="営業部長"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="sample@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>電話番号</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="03-1234-5678"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>住所</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="東京都渋谷区..."
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ウェブサイト</Text>
            <TextInput
              style={styles.input}
              value={formData.website}
              onChangeText={(text) => setFormData({ ...formData, website: text })}
              placeholder="https://example.com"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>メモ</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="メモを入力..."
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => setFormData({ ...formData, isFavorite: !formData.isFavorite })}
          >
            <Ionicons
              name={formData.isFavorite ? 'star' : 'star-outline'}
              size={24}
              color={formData.isFavorite ? '#FFD700' : '#666'}
            />
            <Text style={styles.favoriteText}>お気に入り</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: 'white',
    marginBottom: 10,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  changeImageText: {
    color: 'white',
    fontSize: 14,
  },
  imagePickerContainer: {
    padding: 30,
    alignItems: 'center',
  },
  imagePickerTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  imagePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  imagePickerButton: {
    alignItems: 'center',
    padding: 20,
  },
  imagePickerButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#007AFF',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  favoriteText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});