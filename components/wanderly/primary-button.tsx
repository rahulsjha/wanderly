import { Wanderly } from '@/constants/wanderly-theme';
import { Pressable, StyleSheet, Text } from 'react-native';

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
    shadowColor: 'rgba(26,16,8,1)',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  primary: {
    backgroundColor: Wanderly.colors.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196,146,42,0.55)',
  },
  ghost: {
    backgroundColor: 'rgba(242,232,217,0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
    fontFamily: Wanderly.fonts.uiBold,
  },
  textPrimary: {
    color: 'white',
  },
  textGhost: {
    color: Wanderly.colors.ink,
  },
});
