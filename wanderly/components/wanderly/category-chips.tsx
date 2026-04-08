import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CategoryDefinition } from '@/types/wanderly';
import { Wanderly } from '@/constants/wanderly-theme';

function iconName(icon: string): keyof typeof Ionicons.glyphMap {
  switch (icon) {
    case 'grid':
      return 'apps';
    case 'landmark':
      return 'business';
    case 'utensils':
      return 'restaurant';
    case 'coffee':
      return 'cafe';
    case 'sparkles':
      return 'sparkles';
    case 'shopping-bag':
      return 'bag-handle';
    default:
      return 'pricetag';
  }
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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {categories.map((c) => {
        const selected = c.id === selectedId;
        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            style={[styles.chip, selected && styles.chipSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
              <Ionicons
                name={iconName(c.icon)}
                size={14}
                color={selected ? 'white' : Wanderly.colors.ink}
              />
            </View>
            <Text style={[styles.label, selected && styles.labelSelected]}>{c.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Wanderly.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  chipSelected: {
    backgroundColor: Wanderly.colors.tint,
    borderColor: 'rgba(10, 126, 164, 0.25)',
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,24,28,0.06)',
  },
  iconWrapSelected: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  label: {
    fontSize: 13,
    color: Wanderly.colors.ink,
    opacity: 0.9,
  },
  labelSelected: {
    color: 'white',
    opacity: 1,
    fontWeight: '600',
  },
});
