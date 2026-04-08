import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Wanderly } from '@/constants/wanderly-theme';

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.ghost,
        pressed ? { opacity: 0.92, transform: [{ scale: 0.99 }] } : null,
      ]}
      accessibilityRole="button"
    >
      <Text style={[styles.text, variant === 'primary' ? styles.textPrimary : styles.textGhost]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: Wanderly.colors.tint,
  },
  ghost: {
    backgroundColor: 'rgba(17,24,28,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
  },
  textPrimary: {
    color: 'white',
  },
  textGhost: {
    color: Wanderly.colors.ink,
  },
});
