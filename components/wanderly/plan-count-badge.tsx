import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Wanderly } from '@/constants/wanderly-theme';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export function PlanCountBadge({
  count,
  onPress,
}: {
  count: number;
  onPress?: () => void;
}) {
  const bump = useSharedValue(1);

  useEffect(() => {
    bump.value = 0.96;
    bump.value = withSpring(1, { damping: 14, stiffness: 240 });
  }, [count, bump]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: bump.value }],
  }));

  return (
    <Animated.View style={anim}>
      <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && onPress ? { opacity: 0.85 } : null]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Open plan. ${count} places selected.` : `${count} places selected.`}
    >
      <View style={styles.dot} />
      <Text style={styles.text}>Plan</Text>
      <View style={styles.countPill}>
        <Text style={styles.countText}>{count}</Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.85)" /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Wanderly.colors.primary,
    borderRadius: Wanderly.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: 'rgba(26,16,8,1)',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  text: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
  countPill: {
    minWidth: 26,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Wanderly.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Wanderly.fonts.uiBold,
  },
});
