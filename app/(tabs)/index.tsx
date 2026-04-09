import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
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

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const screenWidth = Dimensions.get('window').width;
  const featuredCardWidth = Math.round(screenWidth * 0.82);
  const cardSpacing = 8;
  const itemWidth = featuredCardWidth + cardSpacing;

  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<'all' | PlaceCategory>('all');

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const planIds = usePlanStore((s) => s.placeIds);
  const add = usePlanStore((s) => s.add);
  const remove = usePlanStore((s) => s.remove);
  const listRef = useRef<any>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLACES.filter((p) => {
      const categoryOk = categoryId === 'all' ? true : p.category === categoryId;
      if (!categoryOk) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, categoryId]);

  const countBump = useSharedValue(1);
  useEffect(() => {
    countBump.value = 0.96;
    countBump.value = withSpring(1, { damping: 14, stiffness: 240 });
  }, [filtered.length, countBump]);

  const countAnim = useAnimatedStyle(() => ({
    transform: [{ scale: countBump.value }],
  }));

  const scrollX = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

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

  const resultsLabel = useMemo(() => {
    if (filtered.length === 0) return 'No places found';
    const allAdded = planIds.length > 0 && planIds.length === PLACES.length;
    if (allAdded && query.trim() === '' && categoryId === 'all') return 'All places in your plan';
    return `${filtered.length} places found`;
  }, [categoryId, filtered.length, planIds.length, query]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}> 
      <View style={styles.header}>
        <View style={styles.greetingSection}>
          <View>
            <Text style={styles.greeting}>Hello, Vanessa</Text>
            <Text style={styles.subGreeting}>Welcome to Wanderly</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar value={query} onChange={setQuery} placeholder="Search" />
          </View>
          <View style={styles.filterIconCircle}>
            <Ionicons name="options-outline" size={20} color="white" />
          </View>
        </View>
        
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Select your next trip</Text>
          <CategoryChips
            categories={CATEGORIES}
            selectedId={categoryId}
            onSelect={(id) => setCategoryId(id)}
          />
        </View>
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
        <Animated.FlatList
          ref={listRef}
          data={filtered}
          keyExtractor={(p) => p.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: (screenWidth - itemWidth) / 2,
            paddingTop: 8,
            paddingBottom: 120 + insets.bottom,
          }}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          snapToAlignment="center"
          disableIntervalMomentum
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => (
            <AnimatedPlace index={index} scrollX={scrollX} itemWidth={itemWidth}>
              <View style={{ height: 14 }} />
              <View style={{ width: featuredCardWidth }}>
                <PlaceCard
                  place={item}
                  added={planIds.includes(item.id)}
                  onPress={() => openDetail(item)}
                  onToggle={() => togglePlan(item)}
                  onNext={() => {
                    if (index < filtered.length - 1) {
                      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
                    }
                  }}
                />
              </View>
            </AnimatedPlace>
          )}
        />
      )}
    </View>
  );
}

function AnimatedPlace({ children, index, scrollX, itemWidth }: any) {
  const style = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * itemWidth, index * itemWidth, (index + 1) * itemWidth];
    const scale = interpolate(scrollX.value, inputRange, [0.88, 1, 0.88], Extrapolation.CLAMP);         
    
    return {
      width: itemWidth,
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ scale }],
    };
  });

  return <Animated.View style={style}>{children}</Animated.View>;
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
  filterIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 4,
    gap: 22,
  },
  carouselContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 30,
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
});
