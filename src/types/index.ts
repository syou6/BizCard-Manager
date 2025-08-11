export interface BusinessCard {
  id: string;
  name: string;
  nameKana?: string; // ふりがな
  company: string;
  department?: string; // 部署
  title: string;
  email: string;
  phone: string;
  mobile?: string; // 携帯電話
  fax?: string;
  address: string;
  website: string;
  linkedin?: string;
  twitter?: string;
  notes: string;
  imageUri: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date; // 最後に連絡した日
  tags: string[];
  group?: string; // グループ（取引先、見込み客、パートナー等）
  isFavorite: boolean;
  exchangeDate?: Date; // 名刺交換日
  exchangeLocation?: string; // 名刺交換場所
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface SearchFilters {
  searchText: string;
  tags: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  showFavoritesOnly: boolean;
}