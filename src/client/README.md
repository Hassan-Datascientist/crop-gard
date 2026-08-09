# CropGuard Mobile

React Native (Expo SDK 57) mobile client for CropGuard. Built with a development client so it can run the on-device TFLite model for leaf disease scanning.

## Prerequisites

1. Node.js and npm installed.
2. Android device with wireless debugging enabled, or an emulator.
3. Phone and computer on the same network.

## Install Dependencies

```bash
npm install
```

`lucide-react-native` and `react-native-svg` are native dependencies. After a fresh install (or a new machine), rebuild the dev client once (see below).

## Run

Start Metro (the JS dev server):

```bash
npx expo start --dev-client
```

Open the app on your phone. The dev client auto-connects to the dev server on your local network. If the app shows "no bundles URL", press `j` in the Metro terminal or open the app's dev menu and Reload.

Normal JS/icon edits hot-reload through Metro — no rebuild needed.

## Rebuild the Dev Client

Rebuild and install the native dev client (required after adding/updating native packages, `git clean`, or on a new machine):

```bash
npx expo run:android
```

This builds the debug APK and installs it on the connected device.

## Environment

The API URL is read from a `.env` file in this directory:

```bash
EXPO_PUBLIC_API_URL=http://<your-api-host>:<port>
```

The value is loaded by Expo at build/serve time (see `npx expo start` output) and must point to the running backend.
