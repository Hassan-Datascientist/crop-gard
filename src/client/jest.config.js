module.exports = {
  preset: "jest-expo",
  setupFilesAfterSetup: ["./jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo|@react-navigation|react-native-fast-tflite|jpeg-js)/)",
  ],
};
