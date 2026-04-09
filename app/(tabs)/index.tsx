import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryChips } from '@/components/wanderly/category-chips';
import { CamelIllustration } from '@/components/wanderly/empty-illustrations';
import { PlaceCard } from '@/components/wanderly/place-card';
import { SearchBar } from '@/components/wanderly/search-bar';
import { ShimmerCard } from '@/components/wanderly/shimmer-card';
import { Wanderly } from '@/constants/wanderly-theme';
import { CATEGORIES, PLACES } from '@/data/mock-data';
import { usePlanStore } from '@/store/plan-store';
import type { Place, PlaceCategory } from '@/types/wanderly';

type SortOption = 'rating' | 'distance' | 'duration';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = Math.round(screenWidth * 0.82);
  const cardSpacing = 12;
  const itemWidth = cardWidth + cardSpacing;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [categoryId, setCategoryId] = useState<'all' | PlaceCategory>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>(['All']);
  const [sort, setSort] = useState<SortOption>('rating');
  const [isLoading, setIsLoading] = useState(true);

  const planIds = usePlanStore((s) => s.placeIds);
  const add = usePlanStore((s) => s.add);
  const remove = usePlanStore((s) => s.remove);
  const sortLabel = sort === 'rating' ? 'Rating' : sort === 'distance' ? 'Distance' : 'Duration';

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 220);
    return () => clearTimeout(t);
  }, [query]);

  const tagsForCategory = useMemo(() => {
    const set = new Set<string>();
    PLACES.forEach((p) => {
      if (categoryId !== 'all' && p.category !== categoryId) return;
      p.tags.forEach((t) => set.add(t));
    });
    return ['All', ...Array.from(set)];
  }, [categoryId]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let next = PLACES.filter((p) => {
      const categoryOk = categoryId === 'all' ? true : p.category === categoryId;
      if (!categoryOk) return false;
      const queryOk = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      if (!queryOk) return false;
      if (selectedTags.includes('All')) return true;
      return selectedTags.every((t) => p.tags.includes(t));
    });

    if (sort === 'rating') {
      next = [...next].sort((a, b) => b.rating - a.rating);
    } else if (sort === 'distance') {
      next = [...next].sort((a, b) => a.distance_km - b.distance_km);
    } else {
      next = [...next].sort((a, b) => a.estimated_duration_min - b.estimated_duration_min);
    }

    return next;
  }, [categoryId, debouncedQuery, selectedTags, sort]);

  const openDetail = useCallback(async (place: Place) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/place/[id]', params: { id: place.id } });
  }, [router]);

  const togglePlan = useCallback(
    async (place: Place) => {
      const exists = planIds.includes(place.id);
      if (exists) remove(place.id);
      else add(place.id);
      await Haptics.impactAsync(
        exists ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
      );
    },
    [add, remove, planIds]
  );

  const onToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      if (tag === 'All') return ['All'];
      const clean = prev.filter((t) => t !== 'All');
      if (clean.includes(tag)) return clean.filter((t) => t !== tag);
      return [...clean, tag];
    });
  }, []);

  const cycleSort = useCallback(() => {
    setSort((prev) => (prev === 'rating' ? 'distance' : prev === 'distance' ? 'duration' : 'rating'));
  }, []);

  const triggerSearch = useCallback(() => {
    setDebouncedQuery(query);
  }, [query]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}> 
      <View style={styles.header}>
        <View style={styles.greetingSection}>
          <View>
            <Text style={styles.greeting}>Hello, </Text>
            <Text style={styles.subGreeting}>Welcome to Wanderly</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar value={query} onChange={setQuery} placeholder="Search" />
          </View>
          <Pressable style={styles.searchAction} onPress={triggerSearch} accessibilityRole="button">
            <Ionicons name="search" size={18} color="white" />
          </Pressable>
          <Pressable style={styles.sortButton} onPress={cycleSort} accessibilityRole="button">
            <Ionicons name="swap-vertical" size={18} color="white" />
            <Text style={styles.sortLabel}>{sortLabel}</Text>
          </Pressable>
        </View>
        
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Select your next trip</Text>
          <CategoryChips
            categories={CATEGORIES}
            selectedId={categoryId}
            onSelect={(id) => {
              setCategoryId(id);
              setSelectedTags(['All']);
            }}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagRow}>
          {tagsForCategory.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => onToggleTag(tag)}
                style={[styles.tagChip, active && styles.tagChipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.listContent}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <ShimmerCard key={idx} />
          ))}
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyResults}>
          <CamelIllustration />
          <Text style={styles.emptyTitle}>No matches</Text>
          <Text style={styles.emptyDesc}>Try a different search or clear filters.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          snapToAlignment="center"
          disableIntervalMomentum
          ItemSeparatorComponent={() => <View style={{ width: cardSpacing }} />}
          contentContainerStyle={{
            paddingHorizontal: (screenWidth - itemWidth) / 2,
            paddingTop: 8,
            paddingBottom: 120 + insets.bottom,
          }}
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <PlaceCard
                place={item}
                added={planIds.includes(item.id)}
                onPress={() => openDetail(item)}
                onToggle={() => togglePlan(item)}
              />
            </View>
          )}
        />
      )}

      <Pressable
        style={[styles.planBadge, { top: insets.top + 10 }]}
        onPress={() => router.push('/summary')}
        accessibilityRole="button"
      >
        <Ionicons name="list" size={16} color="white" />
        <Text style={styles.planBadgeText}>Plan ({planIds.length})</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Wanderly.colors.background,
  },
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
  tagRow: {
    gap: 10,
    paddingBottom: 4,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    letterSpacing: -0.3,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 4,
    gap: 22,
  },
  emptyResults: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '900',
    color: Wanderly.colors.ink,
    fontFamily: Wanderly.fonts.displayItalic,
  },
  emptyDesc: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    color: Wanderly.colors.mutedText,
    fontFamily: Wanderly.fonts.uiRegular,
  },
  planBadge: {
    position: 'absolute',
    right: 16,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Wanderly.colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  planBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
});
