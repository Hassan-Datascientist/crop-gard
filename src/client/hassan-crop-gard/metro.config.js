// metro.config.js
// Tell Metro to treat .tflite and .wasm binary files as static assets.
// .tflite  → bundled into APK/IPA for native, served as static file for web
// .wasm    → WebAssembly binary used by @tensorflow/tfjs-tflite on web
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add binary asset extensions
config.resolver.assetExts.push('tflite', 'wasm');

module.exports = config;
