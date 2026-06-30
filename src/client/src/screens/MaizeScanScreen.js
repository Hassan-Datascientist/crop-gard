// src/screens/MaizeScanScreen.js
import React from 'react';
import ScanScreen from './ScanScreen';

export default function MaizeScanScreen({ navigation }) {
  return (
    <ScanScreen
      cropName="Maize"
      endpoint="/predict/maize"
      navigation={navigation}
    />
  );
}

MaizeScanScreen.displayName = 'MaizeScanScreen';