import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Wanderly } from '@/constants/wanderly-theme';

export function PlanCountBadge({
  count,
  onPress,
}: {
  count: number;
  onPress?: () => void;
}) {
  return (
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
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Wanderly.colors.ink,
    borderRadius: Wanderly.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Wanderly.colors.sandstone,
  },
  text: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  countPill: {
    minWidth: 26,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Wanderly.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
});
