// src/screens/SignUpScreen.js
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Platform, ActivityIndicator, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard
} from 'react-native';

// ─── Colour tokens (shared palette with LoginScreen & ScanScreen) ────────────
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
  danger:       '#F85149',
  warning:      '#D29922',
};

// ─── Password strength ───────────────────────────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: 'Too short',  color: C.danger },
    { label: 'Weak',       color: C.danger },
    { label: 'Fair',       color: C.warning },
    { label: 'Good',       color: '#3FB950' },
    { label: 'Strong',     color: '#56D364' },
  ];
  return { score, ...map[score] };
};

const FIELDS = [
  { key: 'name',     label: 'Full name',     icon: '👤', placeholder: 'Your full name',      keyboard: 'default',        secure: false },
  { key: 'email',    label: 'Email address',  icon: '✉️',  placeholder: 'you@example.com',     keyboard: 'email-address',  secure: false },
  { key: 'password', label: 'Password',       icon: '🔒', placeholder: '••••••••',            keyboard: 'default',        secure: true  },
];

export default function SignUpScreen({ navigation }) {
  const [form, setForm]         = useState({ name: '', email: '', password: '' });
  const [focus, setFocus]       = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const strength = getStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                  e.name     = 'Full name is required.';
    if (!/\S+@\S+\.\S+/.test(form.email))   e.email    = 'Enter a valid email address.';
    if (form.password.length < 8)           e.password = 'Password must be at least 8 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('MainApp');
    }, 700);
  };

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: C.bg }}
      >
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Back button ── */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>Sign in</Text>
          </TouchableOpacity>

          {/* ── Hero ── */}
          <View style={styles.hero}>
            <View style={styles.logoMark}>
              <Text style={styles.logoIcon}>🌱</Text>
            </View>
            <Text style={styles.brandTitle}>CropGuard AI</Text>
            <Text style={styles.brandSub}>Create your field diagnostics account</Text>
          </View>

          {/* ── Form card ── */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Get started</Text>
            <Text style={styles.cardSub}>Free account · No credit card needed</Text>

            {FIELDS.map((field) => {
              const isPass = field.key === 'password';
              const isFocused = !!focus[field.key];
              const hasError  = !!errors[field.key];

              return (
                <View key={field.key} style={styles.fieldGroup}>
                  <Text style={styles.label}>{field.label}</Text>
                  <View style={[
                    styles.inputWrap,
                    isFocused && !hasError && styles.inputWrapFocus,
                    hasError && styles.inputWrapError,
                  ]}>
                    <Text style={styles.inputIcon}>{field.icon}</Text>
                    <TextInput
                      style={styles.input} // Fixed width containment allocation bug
                      placeholder={field.placeholder}
                      placeholderTextColor={C.textFaint}
                      value={form[field.key]}
                      onChangeText={(v) => update(field.key, v)}
                      onFocus={() => setFocus(f => ({ ...f, [field.key]: true }))}
                      onBlur={() => setFocus(f => ({ ...f, [field.key]: false }))}
                      keyboardType={field.keyboard}
                      autoCapitalize={field.key === 'name' ? 'words' : 'none'}
                      autoCorrect={false}
                      secureTextEntry={isPass && !showPass}
                      returnKeyType={isPass ? 'done' : 'next'}
                      onSubmitEditing={isPass ? handleSignUp : undefined}
                    />
                    {isPass && (
                      <TouchableOpacity
                        onPress={() => setShowPass(s => !s)}
                        style={styles.eyeBtn}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Inline field error */}
                  {hasError && (
                    <Text style={styles.fieldError}>⚠  {errors[field.key]}</Text>
                  )}

                  {/* Password strength meter */}
                  {isPass && form.password.length > 0 && (
                    <View style={styles.strengthArea}>
                      <View style={styles.strengthBars}>
                        {[1, 2, 3, 4].map(i => (
                          <View
                            key={i}
                            style={[
                              styles.strengthBar,
                              { backgroundColor: i <= strength.score ? strength.color : C.border }
                            ]}
                          />
                        ))}
                      </View>
                      <Text style={[styles.strengthLabel, { color: strength.color }]}>
                        {strength.label}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Terms note */}
            <Text style={styles.terms}>
              By creating an account you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnLoading]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.82}
            >
              {loading
                ? <ActivityIndicator color="#FFFFFF" size="small" />
                : <Text style={styles.submitBtnText}>Create Account</Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign in link */}
            <View style={styles.signInRow}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                <Text style={styles.signInLink}>Sign in →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Footer ── */}
          <Text style={styles.footer}>Secured · End-to-end encrypted</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: 40,
  },

  // ── Back
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 28,
    paddingVertical: 4,
  },
  backIcon: { fontSize: 18, color: C.accent },
  backText: { fontSize: 14, color: C.accent, fontWeight: '600' },

  // ── Hero
  hero: { alignItems: 'center', marginBottom: 32 },
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
  brandSub: { fontSize: 13, color: C.textMuted, letterSpacing: 0.2 },

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
  cardSub: { fontSize: 13, color: C.textMuted, marginBottom: 24 },

  // ── Fields
  fieldGroup: { marginBottom: 18 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    marginBottom: 7,
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
  inputWrapFocus: { borderColor: C.borderFocus },
  inputWrapError: { borderColor: C.danger },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeBtn: { paddingLeft: 10, paddingVertical: 4 },
  eyeIcon: { fontSize: 16 },

  // ── Errors
  fieldError: {
    fontSize: 12,
    color: C.danger,
    marginTop: 6,
    fontWeight: '500',
  },

  // ── Strength meter
  strengthArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 99,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 48,
    textAlign: 'right',
  },

  // ── Terms
  terms: {
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 18,
    marginBottom: 20,
  },
  termsLink: { color: C.accent, fontWeight: '600' },

  // ── Submit
  submitBtn: {
    backgroundColor: C.accent,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitBtnLoading: { backgroundColor: C.accentDim },
  submitBtnText: {
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
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 12, color: C.textMuted, fontWeight: '500' },

  // ── Sign in
  signInRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signInText: { fontSize: 13, color: C.textMuted },
  signInLink: { fontSize: 13, color: C.accent, fontWeight: '700' },

  // ── Footer
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: C.textFaint,
    marginTop: 28,
    letterSpacing: 0.5,
  },
});