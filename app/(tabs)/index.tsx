import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const [previewPlace, setPreviewPlace] = useState<Place | null>(null);
  const [previewImageLoading, setPreviewImageLoading] = useState(false);
  const previewPulse = useRef(new Animated.Value(0)).current;

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

      <Modal visible={!!previewPlace} transparent animationType="slide" onRequestClose={closePreview}>
        <View style={styles.previewRoot}>
          <Pressable style={styles.previewBackdrop} onPress={closePreview} />
          {previewPlace ? (
            <View style={[styles.previewCard, { paddingBottom: 18 + insets.bottom }]}> 
              <View style={styles.previewHero}>
                <Image
                  source={{ uri: previewPlace.image_url }}
                  contentFit="cover"
                  style={styles.previewHeroImage}
                  onLoadStart={() => setPreviewImageLoading(true)}
                  onLoadEnd={() => setPreviewImageLoading(false)}
                />
                {previewImageLoading ? (
                  <Animated.View style={[styles.previewImageLoader, { opacity: previewLoaderOpacity }]}>
                    <View style={styles.previewImageLoaderChip}>
                      <Ionicons name="hourglass-outline" size={13} color="rgba(255,255,255,0.95)" />
                      <Text style={styles.previewImageLoaderText}>Loading preview</Text>
                    </View>
                  </Animated.View>
                ) : null}
                <Pressable style={styles.previewClose} onPress={closePreview} accessibilityRole="button">
                  <Ionicons name="close" size={18} color={Wanderly.colors.text} />
                </Pressable>
              </View>

              <View style={styles.previewContent}>
                <Text style={styles.previewCategory}>{previewPlace.category.toUpperCase()}</Text>
                <Text style={styles.previewTitle}>{previewPlace.name}</Text>

                <View style={styles.previewInfoGrid}>
                  <View style={[styles.previewInfoCard, styles.previewInfoCardWide]}>
                    <Text style={styles.previewInfoLabel}>Opening hours</Text>
                    <Text style={styles.previewInfoValue}>{previewPlace.opening_hours}</Text>
                  </View>
                  <View style={styles.previewInfoCard}>
                    <Text style={styles.previewInfoLabel}>Price level</Text>
                    <Text style={styles.previewInfoValue}>{previewPlace.price_level}</Text>
                  </View>
                  <View style={styles.previewInfoCard}>
                    <Text style={styles.previewInfoLabel}>Duration</Text>
                    <Text style={styles.previewInfoValue}>{previewPlace.estimated_duration_min} min</Text>
                  </View>
                </View>

                <Text style={styles.previewDescription}>{previewPlace.description}</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewTags}>
                  {previewPlace.tags.map((tag) => (
                    <View key={tag} style={styles.previewTag}>
                      <Text style={styles.previewTagText}>{tag}</Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.previewActionRow}>
                  <Pressable
                    style={styles.previewPrimaryBtn}
                    onPress={() => togglePlan(previewPlace)}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name={planIds.includes(previewPlace.id) ? 'heart' : 'heart-outline'}
                      size={16}
                      color="white"
                    />
                    <Text style={styles.previewPrimaryText}>
                      {planIds.includes(previewPlace.id) ? 'Saved in Plan' : 'Add to Plan'}
                    </Text>
                  </Pressable>

                  <Pressable style={styles.previewSecondaryBtn} onPress={closePreview} accessibilityRole="button">
                    <Text style={styles.previewSecondaryText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
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
  previewRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  previewBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  previewCard: {
    backgroundColor: Wanderly.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 20,
  },
  previewHero: {
    height: 220,
    position: 'relative',
  },
  previewHeroImage: {
    width: '100%',
    height: '100%',
  },
  previewImageLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  previewImageLoaderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  previewImageLoaderText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
  previewClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  previewContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  previewCategory: {
    fontSize: 11,
    letterSpacing: 0.8,
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
    fontWeight: '700',
  },
  previewTitle: {
    fontSize: 24,
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.displayItalic,
  },
  previewInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewInfoCard: {
    flex: 1,
    minWidth: 120,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    backgroundColor: Wanderly.colors.surface2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  previewInfoCardWide: {
    minWidth: '100%',
  },
  previewInfoLabel: {
    fontSize: 11,
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewInfoValue: {
    fontSize: 13,
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    fontWeight: '700',
  },
  previewDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  previewTags: {
    gap: 8,
    paddingVertical: 2,
  },
  previewTag: {
    borderRadius: 999,
    backgroundColor: Wanderly.colors.sandstone,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewTagText: {
    fontSize: 12,
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    fontWeight: '600',
  },
  previewActionRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: Wanderly.colors.text,
    paddingVertical: 12,
  },
  previewPrimaryText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
  previewSecondaryBtn: {
    borderRadius: 14,
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  previewSecondaryText: {
    color: Wanderly.colors.text,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
});
