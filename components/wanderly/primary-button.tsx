import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Wanderly } from '@/constants/wanderly-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  tone = 'primary',
  style,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  tone?: 'primary' | 'success' | 'danger';
  style?: ViewStyle;
  disabled?: boolean;
}) {
  const pressT = useSharedValue(0);

  const toneIndex = useMemo(() => {
    if (tone === 'success') return 1;
    if (tone === 'danger') return 2;
    return 0;
  }, [tone]);

  const toneT = useSharedValue(toneIndex);
  useEffect(() => {
    toneT.value = withTiming(toneIndex, { duration: 300 });
  }, [toneIndex, toneT]);

  const anim = useAnimatedStyle(() => {
    const bg = interpolateColor(
      toneT.value,
      [0, 1, 2],
      [Wanderly.colors.primary, Wanderly.colors.success, Wanderly.colors.danger]
    );

    return {
      transform: [{ scale: 1 - pressT.value * 0.01 }],
      opacity: disabled ? 0.72 : 1,
      backgroundColor: variant === 'primary' ? bg : undefined,
    };
  }, [disabled, variant]);

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        pressT.value = withSpring(1, { damping: 18, stiffness: 280 });
      }}
      onPressOut={() => {
        pressT.value = withSpring(0, { damping: 16, stiffness: 240 });
      }}
      style={[styles.base, variant === 'primary' ? styles.primary : styles.ghost, style, anim]}
      accessibilityRole="button"
    >
      <Text style={[styles.text, variant === 'primary' ? styles.textPrimary : styles.textGhost]}>
        {label}
      </Text>
    </AnimatedPressable>
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
