// src/screens/PotatoScanScreen.js
import React from 'react';
import ScanScreen from './ScanScreen';

export default function PotatoScanScreen({ navigation }) {
  return (
    <ScanScreen
      cropName="Potato"
      endpoint="/predict/potato"
      navigation={navigation}
    />
  );
}

PotatoScanScreen.displayName = 'PotatoScanScreen';