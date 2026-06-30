// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, ActivityIndicator
} from 'react-native';

// ─── Colour tokens (dark-first, matches ScanScreen palette) ─────────────────
const C = {
  bg:           '#0D1117',
  surface:      '#161B22',
  surfaceAlt:   '#1C2128',
  border:       '#30363D',
  borderFocus:  '#3FB950',
  text:         '#E6EDF3',
  textMuted:    '#8B949E',
  textFaint:    '#484F58',
  accent:       '#3FB950',
  accentDim:    '#1B4D2E',
  accentHover:  '#2EA043',
  danger:       '#F85149',
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [emailFocus, setEmailFocus]   = useState(false);
  const [passFocus, setPassFocus]     = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleLogin = () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    // Simulate brief async transition; replace with real auth call
    setTimeout(() => {
      setLoading(false);
      navigation.replace('MainApp');
    }, 600);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.root}
      >
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />

        {/* ── Brand header ── */}
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>🌿</Text>
          </View>
          <Text style={styles.brandTitle}>CropGuard AI</Text>
          <Text style={styles.brandSub}>Agronomic Intelligence Platform</Text>
        </View>

        {/* ── Form card ── */}
        <View style={styles.card}>

          <Text style={styles.cardHeading}>Welcome back</Text>
          <Text style={styles.cardSub}>Sign in to your account to continue</Text>

          {/* Error banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠  {error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email address</Text>
            <View style={[
              styles.inputWrap,
              emailFocus && styles.inputWrapFocus
            ]}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={C.textFaint}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={[
              styles.inputWrap,
              passFocus && styles.inputWrapFocus
            ]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={C.textFaint}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPass(s => !s)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign in button */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && styles.signInBtnLoading]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.82}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <Text style={styles.signInBtnText}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign up row */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.7}>
              <Text style={styles.signUpLink}>Create one →</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* ── Footer ── */}
        <Text style={styles.footer}>
          Secured · End-to-end encrypted
        </Text>

      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // ── Hero
  hero: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: C.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.accent,
  },
  logoIcon: { fontSize: 30 },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.4,
    marginBottom: 5,
  },
  brandSub: {
    fontSize: 13,
    color: C.textMuted,
    letterSpacing: 0.2,
  },

  // ── Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: 20,
  },

  // ── Error banner
  errorBanner: {
    backgroundColor: '#2D1417',
    borderWidth: 1,
    borderColor: C.danger,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    color: C.danger,
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Field
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    marginBottom: 7,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  forgotLink: {
    fontSize: 12,
    color: C.accent,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
  },
  inputWrapFocus: {
    borderColor: C.borderFocus,
    backgroundColor: '#0D1117',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeBtn: {
    paddingLeft: 10,
    paddingVertical: 4,
  },
  eyeIcon: { fontSize: 16 },

  // ── Sign in button
  signInBtn: {
    backgroundColor: C.accent,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 52,
  },
  signInBtnLoading: {
    backgroundColor: C.accentDim,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '500',
  },

  // ── Sign up
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 13,
    color: C.textMuted,
  },
  signUpLink: {
    fontSize: 13,
    color: C.accent,
    fontWeight: '700',
  },

  // ── Footer
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: C.textFaint,
    marginTop: 28,
    letterSpacing: 0.5,
  },
});