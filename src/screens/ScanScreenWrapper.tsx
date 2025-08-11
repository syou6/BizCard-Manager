import React from 'react';
import ScanScreen from './ScanScreen';

// ナビゲーションプロパティを確実に渡すラッパーコンポーネント
export default function ScanScreenWrapper(props: any) {
  // navigationとrouteを明示的に渡す
  return <ScanScreen {...props} />;
}