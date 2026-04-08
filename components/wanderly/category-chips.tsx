import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { CategoryDefinition } from '@/types/wanderly';
import { Wanderly } from '@/constants/wanderly-theme';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

function ChipIcon({ id, active }: { id: CategoryDefinition['id']; active: boolean }) {
  const stroke = active ? 'rgba(255,255,255,0.95)' : 'rgba(26,16,8,0.90)';
  const fill = active ? 'rgba(255,255,255,0.18)' : 'rgba(26,16,8,0.08)';

  // These are intentionally simple, “crafted” glyphs (not generic icon fonts).
  switch (id) {
    case 'all':
      return (
        <Svg width={16} height={16} viewBox="0 0 16 16">
          <Rect x={2} y={2} width={4} height={4} rx={1} fill={fill} stroke={stroke} strokeWidth={1} />
          <Rect x={10} y={2} width={4} height={4} rx={1} fill={fill} stroke={stroke} strokeWidth={1} />
          <Rect x={2} y={10} width={4} height={4} rx={1} fill={fill} stroke={stroke} strokeWidth={1} />
          <Rect x={10} y={10} width={4} height={4} rx={1} fill={fill} stroke={stroke} strokeWidth={1} />
        </Svg>
      );
    case 'landmark':
      return (
        <Svg width={16} height={16} viewBox="0 0 16 16">
          <Path d="M3 7.2C5.2 4.5 6.8 3.4 8 3.4s2.8 1.1 5 3.8" fill="none" stroke={stroke} strokeWidth={1.4} strokeLinecap="round" />
          <Path d="M4 7.4h8v5.7H4z" fill={fill} stroke={stroke} strokeWidth={1.1} />
          <Path d="M6 13.1V9.2h4v3.9" fill="none" stroke={stroke} strokeWidth={1.1} strokeLinecap="round" />
        </Svg>
      );
    case 'restaurant':
      return (
        <Svg width={16} height={16} viewBox="0 0 16 16">
          <Path d="M4.2 3.1v9.8" stroke={stroke} strokeWidth={1.3} strokeLinecap="round" />
          <Path d="M2.6 3.1v3.2c0 1.1.7 2 1.6 2s1.6-.9 1.6-2V3.1" stroke={stroke} strokeWidth={1.3} strokeLinecap="round" />
          <Path d="M10.2 3.1c1.6.6 2.5 1.8 2.5 3.4v6.4" stroke={stroke} strokeWidth={1.3} strokeLinecap="round" />
          <Path d="M10.2 8.1h2.5" stroke={stroke} strokeWidth={1.3} strokeLinecap="round" />
        </Svg>
      );
    case 'cafe':
      return (
        <Svg width={16} height={16} viewBox="0 0 16 16">
          <Path d="M4 6.5h7.2v3.7c0 1.6-1.3 2.9-2.9 2.9H6.9C5.3 13.1 4 11.8 4 10.2V6.5z" fill={fill} stroke={stroke} strokeWidth={1.1} />
          <Path d="M11.2 7.2h1.4c.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4h-1.4" fill="none" stroke={stroke} strokeWidth={1.1} />
          <Path d="M5.2 4.1c.9.3 1.4 1 .9 2" stroke={stroke} strokeWidth={1.1} strokeLinecap="round" />
          <Path d="M8 4.1c.9.3 1.4 1 .9 2" stroke={stroke} strokeWidth={1.1} strokeLinecap="round" />
        </Svg>
      );
    case 'activity':
      return (
        <Svg width={16} height={16} viewBox="0 0 16 16">
          <Path d="M3 10.5l10-6.3-3 9.8-2-3.3-3 1.6" fill={fill} stroke={stroke} strokeWidth={1.1} strokeLinejoin="round" />
        </Svg>
      );
    case 'shopping':
      return (
        <Svg width={16} height={16} viewBox="0 0 16 16">
          <Path d="M4.2 6.2h7.6l-.7 7.2H4.9l-.7-7.2z" fill={fill} stroke={stroke} strokeWidth={1.1} />
          <Path d="M6 6.2c0-1.7.9-2.8 2-2.8s2 1.1 2 2.8" fill="none" stroke={stroke} strokeWidth={1.1} strokeLinecap="round" />
          <Circle cx={6.1} cy={8.2} r={0.6} fill={stroke} />
          <Circle cx={9.9} cy={8.2} r={0.6} fill={stroke} />
        </Svg>
      );
    default:
      return null;
  }
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CategoryChip({
  category,
  selected,
  onPress,
  onLayout,
}: {
  category: CategoryDefinition;
  selected: boolean;
  onPress: () => void;
  onLayout?: (x: number, width: number) => void;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 14, stiffness: 260 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
      }}
      onLayout={(e) => onLayout?.(e.nativeEvent.layout.x, e.nativeEvent.layout.width)}
      style={[styles.chip, selected && styles.chipSelected, anim]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <ChipIcon id={category.id} active={selected} />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{category.label}</Text>
    </AnimatedPressable>
  );
}

export function CategoryChips({
  categories,
  selectedId,
  onSelect,
}: {
  categories: CategoryDefinition[];
  selectedId: CategoryDefinition['id'];
  onSelect: (id: CategoryDefinition['id']) => void;
}) {
  const layouts = useRef<Record<string, { x: number; w: number }>>({});
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);

  const selectedKey = useMemo(() => String(selectedId), [selectedId]);

  useEffect(() => {
    const next = layouts.current[selectedKey];
    if (!next) return;
    indicatorX.value = withTiming(next.x, { duration: 220 });
    indicatorW.value = withTiming(next.w, { duration: 220 });
  }, [selectedKey, indicatorW, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: indicatorW.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map((c) => {
          const selected = c.id === selectedId;
          return (
            <CategoryChip
              key={c.id}
              category={c}
              selected={selected}
              onPress={() => onSelect(c.id)}
              onLayout={(x, w) => {
                layouts.current[String(c.id)] = { x, w };
                if (c.id === selectedId && indicatorW.value === 0) {
                  indicatorX.value = x;
                  indicatorW.value = w;
                }
              }}
            />
          );
        })}
      </ScrollView>

      <Animated.View style={[styles.indicator, indicatorStyle]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  row: {
    gap: 10,
    paddingRight: 8,
    paddingBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Wanderly.radius.pill,
    backgroundColor: 'rgba(242,232,217,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(26,16,8,0.10)',
  },
  chipSelected: {
    backgroundColor: Wanderly.colors.primary,
    borderColor: 'rgba(232,96,44,0.22)',
    shadowColor: 'rgba(26,16,8,1)',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,16,8,0.08)',
  },
  iconWrapSelected: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  label: {
    fontSize: 13,
    color: Wanderly.colors.ink,
    opacity: 0.9,
    fontFamily: Wanderly.fonts.ui,
  },
  labelSelected: {
    color: 'white',
    opacity: 1,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.uiBold,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    bottom: 2,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(196,146,42,0.95)',
  },
});
