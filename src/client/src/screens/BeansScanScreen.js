// src/screens/BeansScanScreen.js
import React from 'react';
import ScanScreen from './ScanScreen';

export default function BeansScanScreen({ navigation }) {
  return (
    <ScanScreen
      cropName="Beans"
      endpoint="/predict/beans"
      navigation={navigation}
    />
  );
}

BeansScanScreen.displayName = 'BeansScanScreen';