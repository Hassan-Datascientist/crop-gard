# CropGuard Mobile — ROADMAP

## ✅ Completed

### ML Integration
- [x] On-device TFLite model loaded from app bundle
- [x] Hardware-accelerated inference (CoreML on iOS, NNAPI on Android)
- [x] Platform-aware inference pipeline (native `inference.ts` + web `inference.web.ts`)
- [x] Full offline inference — no network required
- [x] Singleton model loading with concurrent-call deduplication
- [x] Softmax + top-K prediction parsing

### UI Polish
- [x] Removed crop selection step (auto-detected from model labels)
- [x] Removed per-crop screens (MaizeScanScreen, BeansScanScreen, PotatoScanScreen)
- [x] Extracted translations, disease data, and theme into separate constants files
- [x] Extracted reusable components: TopBar, LanguageSelector, ImagePickerSection, ResultCard
- [x] ScanScreen reduced from 901 lines to smaller composable pieces
- [x] Full translations for all 10 disease classes in EN/RW/FR/AR
- [x] Dark/light theme toggle
- [x] "New Scan" button after results

### Backend Removal
- [x] Removed `src/services/api.js` (all inference is on-device)
- [x] Removed login/signup screens (no auth backend)
- [x] Removed per-crop API endpoint wrappers
- [x] Cleaned out dead commented-out code

## 🔜 Next

### Testing & Quality
- [ ] Add Jest + React Native Testing Library tests for components
- [ ] Add ESLint + Prettier (configs created, run `npm run lint`)
- [ ] Add TypeScript type checking script (`npm run typecheck`)
- [ ] Add GitHub Actions CI (lint → typecheck → test)

### Performance
- [ ] Profile inference time on mid/low-end Android devices
- [ ] Consider model quantization (FP16 → INT8) for smaller binary size
- [ ] Lazy-load model on first scan instead of on mount (optional cold-start trade-off)

### Features
- [ ] Add multi-image / batch scan support
- [ ] Add scan history (local storage via AsyncStorage or SQLite)
- [ ] Add crop calendar / treatment reminders
- [ ] Add camera viewfinder overlay for better leaf positioning

### Platform
- [ ] Test on iOS Simulator + physical device
- [ ] Test on Android emulator + physical device
- [ ] Verify Expo EAS Build CI/CD
- [ ] Add app icon and splash screen polish
