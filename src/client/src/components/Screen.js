import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Root page shell replicating the web app's emerald-tinted gradient backdrop.
export default function Screen({ c, children, style, contentStyle }) {
  return (
    <LinearGradient
      colors={[c.heroTop, c.heroBottom, c.heroBottom]}
      locations={[0, 0.45, 1]}
      style={[styles.flex, style]}
    >
      <View style={[styles.flex, contentStyle]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
