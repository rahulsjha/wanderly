import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryChips } from '@/components/wanderly/category-chips';
import { SearchBar } from '@/components/wanderly/search-bar';
import { Wanderly } from '@/constants/wanderly-theme';
import type { CategoryDefinition, PlaceCategory } from '@/types/wanderly';

type Props = {
  query: string;
  onChangeQuery: (value: string) => void;
  onSearch: () => void;
  sortLabel: string;
  onCycleSort: () => void;
  categories: CategoryDefinition[];
  categoryId: 'all' | PlaceCategory;
  onSelectCategory: (id: 'all' | PlaceCategory) => void;
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
};

export function ExploreToolbar({
  query,
  onChangeQuery,
  onSearch,
  sortLabel,
  onCycleSort,
  categories,
  categoryId,
  onSelectCategory,
  tags,
  selectedTags,
  onToggleTag,
}: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greeting}>Hello, </Text>
          <Text style={styles.subGreeting}>Welcome to Wanderly</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar value={query} onChange={onChangeQuery} placeholder="Search" />
        </View>
        <Pressable
          style={styles.searchAction}
          onPress={onSearch}
          accessibilityRole="button"
          accessibilityLabel="Search places"
          accessibilityHint="Runs search for the entered text"
        >
          <Ionicons name="search" size={18} color="white" />
        </Pressable>
        <Pressable
          style={styles.sortButton}
          onPress={onCycleSort}
          accessibilityRole="button"
          accessibilityLabel="Change sort order"
          accessibilityHint="Cycles sorting by rating, distance, and duration"
        >
          <Ionicons name="swap-vertical" size={18} color="white" />
          <Text style={styles.sortLabel}>{sortLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Select your next trip</Text>
        <CategoryChips
          categories={categories}
          selectedId={categoryId}
          onSelect={onSelectCategory}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagRow}>
        {tags.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <Pressable
              key={tag}
              onPress={() => onToggleTag(tag)}
              style={[styles.tagChip, active && styles.tagChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`${tag} tag filter`}
              accessibilityHint="Filters places by selected tag"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Wanderly.colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomWidth: 0,
    gap: 14,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '900',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    fontWeight: '400',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchAction: {
    width: 44,
    height: 54,
    borderRadius: 22,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButton: {
    height: 54,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  sortLabel: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
  categorySection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    letterSpacing: -0.3,
  },
  tagRow: {
    gap: 10,
    paddingBottom: 4,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  tagChipActive: {
    backgroundColor: Wanderly.colors.text,
    borderColor: 'rgba(10,10,10,0.25)',
  },
  tagText: {
    fontSize: 12,
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  tagTextActive: {
    color: 'white',
    fontWeight: '700',
    fontFamily: Wanderly.fonts.uiBold,
  },
});
