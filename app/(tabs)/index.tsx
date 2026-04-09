import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CamelIllustration } from '@/components/wanderly/empty-illustrations';
import { ExploreToolbar } from '@/components/wanderly/explore/explore-toolbar';
import { PlacePreviewModal } from '@/components/wanderly/explore/place-preview-modal';
import { PlaceCard } from '@/components/wanderly/place-card';
import { ShimmerCard } from '@/components/wanderly/shimmer-card';
import { Wanderly } from '@/constants/wanderly-theme';
import { CATEGORIES, PLACES } from '@/data/mock-data';
import { selectAddPlace, selectPlaceIds, selectRemovePlace } from '@/store/plan-selectors';
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
  const [previewPlace, setPreviewPlace] = useState<Place | null>(null);
  const [previewImageLoading, setPreviewImageLoading] = useState(false);
  const previewPulse = useRef(new Animated.Value(0)).current;

  const planIds = usePlanStore(selectPlaceIds);
  const add = usePlanStore(selectAddPlace);
  const remove = usePlanStore(selectRemovePlace);
  const sortLabel = sort === 'rating' ? 'Rating' : sort === 'distance' ? 'Distance' : 'Duration';

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 220);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!previewPlace) {
      setPreviewImageLoading(false);
      return;
    }
    setPreviewImageLoading(true);
  }, [previewPlace]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(previewPulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(previewPulse, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [previewPulse]);

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
    setPreviewPlace(place);
  }, []);

  const closePreview = useCallback(async () => {
    await Haptics.selectionAsync();
    setPreviewPlace(null);
  }, []);

  const previewLoaderOpacity = previewPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.34, 0.7],
  });

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
      <ExploreToolbar
        query={query}
        onChangeQuery={setQuery}
        onSearch={triggerSearch}
        sortLabel={sortLabel}
        onCycleSort={cycleSort}
        categories={CATEGORIES}
        categoryId={categoryId}
        onSelectCategory={(id) => {
          setCategoryId(id);
          setSelectedTags(['All']);
        }}
        tags={tagsForCategory}
        selectedTags={selectedTags}
        onToggleTag={onToggleTag}
      />

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
          <Pressable
            style={styles.resetFiltersButton}
            onPress={() => {
              setQuery('');
              setDebouncedQuery('');
              setCategoryId('all');
              setSelectedTags(['All']);
            }}
            accessibilityRole="button"
            accessibilityLabel="Reset filters"
            accessibilityHint="Clears search text and selected filters"
          >
            <Text style={styles.resetFiltersText}>Reset filters</Text>
          </Pressable>
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
        accessibilityLabel="Open my plan"
        accessibilityHint="Opens your itinerary summary screen"
      >
        <Ionicons name="list" size={16} color="white" />
        <Text style={styles.planBadgeText}>Plan ({planIds.length})</Text>
      </Pressable>

      <PlacePreviewModal
        visible={!!previewPlace}
        place={previewPlace}
        bottomInset={insets.bottom}
        loadingOpacity={previewLoaderOpacity}
        imageLoading={previewImageLoading}
        isInPlan={!!previewPlace && planIds.includes(previewPlace.id)}
        onClose={closePreview}
        onTogglePlan={() => {
          if (previewPlace) void togglePlan(previewPlace);
        }}
        onImageLoadStart={() => setPreviewImageLoading(true)}
        onImageLoadEnd={() => setPreviewImageLoading(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Wanderly.colors.background,
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
  resetFiltersButton: {
    marginTop: 6,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Wanderly.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetFiltersText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
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
