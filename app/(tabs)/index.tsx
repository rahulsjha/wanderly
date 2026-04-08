import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SheetBackdrop } from '@/components/wanderly/bottom-sheet-backdrop';
import { CategoryChips } from '@/components/wanderly/category-chips';
import { JaliPattern } from '@/components/wanderly/jali-pattern';
import { PlaceCard } from '@/components/wanderly/place-card';
import { PlanCountBadge } from '@/components/wanderly/plan-count-badge';
import { PrimaryButton } from '@/components/wanderly/primary-button';
import { SearchBar } from '@/components/wanderly/search-bar';
import { TagChip } from '@/components/wanderly/tag-chip';
import { Wanderly } from '@/constants/wanderly-theme';
import { CATEGORIES, PLACES } from '@/data/mock-data';
import { categoryLabel, formatDuration } from '@/lib/format';
import { localDestinationForId } from '@/lib/place-assets';
import { placeHindiName } from '@/lib/place-hindi';
import { unsplashPlaceImageUrl } from '@/lib/place-image';
import { usePlanStore } from '@/store/plan-store';
import type { Place, PlaceCategory } from '@/types/wanderly';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<'all' | PlaceCategory>('all');

  const planIds = usePlanStore((s) => s.placeIds);
  const add = usePlanStore((s) => s.add);
  const remove = usePlanStore((s) => s.remove);

  const [selected, setSelected] = useState<Place | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);

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

  const openDetail = useCallback(async (place: Place) => {
    setSelected(place);
    await Haptics.selectionAsync();
    sheetRef.current?.present();
  }, []);

  const togglePlan = useCallback(
    async (place: Place) => {
      const exists = planIds.includes(place.id);
      if (exists) remove(place.id);
      else add(place.id);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [add, remove, planIds]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}> 
      <View style={styles.header}>
        <LinearGradient
          colors={[Wanderly.colors.ink, Wanderly.colors.deepRose, Wanderly.colors.primary]}
          locations={[0, 0.62, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <JaliPattern opacity={0.08} />
        </View>
        <LinearGradient
          colors={['rgba(251,247,242,0.06)', 'rgba(251,247,242,0.66)', Wanderly.colors.warmWhite]}
          locations={[0, 0.62, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.city}>Jaipur</Text>
            <Text style={styles.cityHi}>जयपुर</Text>
            <Text style={styles.subtitle}>Build your perfect day, stop by stop.</Text>
          </View>

          <PlanCountBadge count={planIds.length} onPress={() => router.push('/(tabs)/plan')} />
        </View>

        <View style={styles.controls}>
          <SearchBar value={query} onChange={setQuery} placeholder="Search places, vibes, tags…" />
          <CategoryChips
            categories={CATEGORIES}
            selectedId={categoryId}
            onSelect={(id) => setCategoryId(id)}
          />
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Places</Text>
        <Animated.Text style={[styles.resultsMeta, countAnim]}>{filtered.length} places found</Animated.Text>
      </View>

      <FlashList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            added={planIds.includes(item.id)}
            onPress={() => openDetail(item)}
            onToggle={() => togglePlan(item)}
          />
        )}
      />

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['42%', '92%']}
        backdropComponent={SheetBackdrop}
        backgroundStyle={{ backgroundColor: Wanderly.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(17,24,28,0.22)', width: 44 }}
      >
        {selected ? (
          <View style={styles.sheet}>
            <Image
              source={{ uri: unsplashPlaceImageUrl(selected) }}
              placeholder={localDestinationForId(selected.id)}
              transition={200}
              style={styles.sheetHero}
              contentFit="cover"
            />

            <View style={styles.sheetBody}>
              <View style={styles.sheetTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} ellipsizeMode="tail" style={styles.sheetTitle}>
                    {selected.name}
                  </Text>
                  <Text style={styles.sheetHi}>{placeHindiName(selected)}</Text>
                  <Text style={styles.sheetSub}>
                    Rated {selected.rating.toFixed(1)} · {categoryLabel(selected.category)}
                  </Text>
                </View>
              </View>

              <View style={styles.factsRow}>
                <Fact label="Duration" value={formatDuration(selected.estimated_duration_min)} />
                <Fact label="Price" valueNode={<PriceDots level={selected.price_level} />} />
                <Fact label="Hours" value={selected.opening_hours} />
              </View>

              <View style={styles.tipCard}>
                <Text style={styles.tipKicker}>Insider tip</Text>
                <Text style={styles.tipText}>{insiderTipFor(selected)}</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoRow}
              >
                {(['detail', 'interior', 'street', 'architecture'] as const).map((k) => (
                  <Image
                    key={k}
                    source={{ uri: unsplashPlaceImageUrl(selected, { w: 520, h: 360 }, k) }}
                    placeholder={localDestinationForId(selected.id)}
                    transition={180}
                    contentFit="cover"
                    style={styles.photo}
                  />
                ))}
              </ScrollView>

              <View style={styles.tagsRow}>
                {selected.tags.slice(0, 6).map((t) => (
                  <TagChip key={t} label={t} />
                ))}
              </View>

              <Text style={styles.descFull}>{selected.description}</Text>

              <View style={{ height: 10 }} />

              <PrimaryButton
                label={planIds.includes(selected.id) ? 'Remove from Plan' : 'Add to Plan'}
                onPress={() => togglePlan(selected)}
              />
              <View style={{ height: 14 }} />
            </View>
          </View>
        ) : null}
      </BottomSheetModal>
    </View>
  );
}

function Fact({
  label,
  value,
  valueNode,
}: {
  label: string;
  value?: string;
  valueNode?: ReactNode;
}) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      {valueNode ? (
        <View style={{ marginTop: 2 }}>{valueNode}</View>
      ) : (
        <Text numberOfLines={2} style={styles.factValue}>
          {value}
        </Text>
      )}
    </View>
  );
}

function PriceDots({ level }: { level: string }) {
  if (/free/i.test(level)) {
    return <Text style={styles.factValue}>Free</Text>;
  }

  const count = Math.max(1, (level.match(/\$/g) ?? []).length);
  return (
    <View style={styles.priceRow}>
      {Array.from({ length: 4 }).map((_, idx) => {
        const active = idx < count;
        return <View key={idx} style={[styles.priceDot, active ? styles.priceDotOn : styles.priceDotOff]} />;
      })}
    </View>
  );
}

function insiderTipFor(place: Place) {
  const tags = new Set(place.tags.map((t) => t.toLowerCase()));
  if (tags.has('sunset')) return 'Go 45 minutes before sunset for golden light and fewer crowds.';
  if (tags.has('photography')) return 'Arrive right at opening to catch soft light and clean frames.';
  if (tags.has('rooftop') || tags.has('views')) return 'Ask for the best corner table—views make the stop.';
  if (place.category === 'shopping') return 'Carry cash, start 30% lower, and smile—haggling is part of the fun.';
  if (place.category === 'cafe') return 'Order a chai/coffee plus one local sweet—quick and satisfying.';
  if (place.category === 'restaurant') return 'If you can, go slightly earlier than peak hours for faster service.';
  return 'Keep 10–15 minutes buffer for traffic between stops.';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Wanderly.colors.warmWhite,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(26,16,8,0.08)',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  city: {
    fontSize: 44,
    color: Wanderly.colors.warmWhite,
    letterSpacing: -0.8,
    fontFamily: Wanderly.fonts.displayItalic,
    lineHeight: 50,
  },
  cityHi: {
    marginTop: 2,
    fontSize: 16,
    color: 'rgba(196,146,42,0.95)',
    fontFamily: Wanderly.fonts.devanagari,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(251,247,242,0.82)',
    fontFamily: Wanderly.fonts.ui,
  },
  controls: {
    marginTop: 14,
    gap: 12,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Wanderly.colors.ink,
    letterSpacing: -0.2,
    fontFamily: Wanderly.fonts.uiBold,
  },
  resultsMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.mutedText,
    fontFamily: Wanderly.fonts.ui,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 6,
    gap: 14,
  },
  sheet: {
    flex: 1,
  },
  sheetHero: {
    height: 230,
    width: '100%',
  },
  sheetBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sheetTitle: {
    fontSize: 28,
    color: Wanderly.colors.ink,
    letterSpacing: -0.4,
    fontFamily: Wanderly.fonts.displayItalic,
  },
  sheetHi: {
    marginTop: 2,
    fontSize: 14,
    color: 'rgba(196,146,42,0.95)',
    fontFamily: Wanderly.fonts.devanagari,
  },
  sheetSub: {
    marginTop: 4,
    fontSize: 13,
    color: Wanderly.colors.mutedText,
    fontFamily: Wanderly.fonts.ui,
  },
  factsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fact: {
    flex: 1,
    backgroundColor: Wanderly.colors.surface2,
    borderRadius: 14,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    gap: 4,
  },
  factLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Wanderly.colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: Wanderly.fonts.uiBold,
  },
  factValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.ink,
    opacity: 0.9,
    fontFamily: Wanderly.fonts.ui,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  priceDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  priceDotOn: {
    backgroundColor: Wanderly.colors.primary,
  },
  priceDotOff: {
    backgroundColor: 'rgba(26,16,8,0.10)',
  },
  tipCard: {
    marginTop: 2,
    backgroundColor: Wanderly.colors.sand,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(26,16,8,0.10)',
    padding: 12,
    gap: 6,
  },
  tipKicker: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(26,16,8,0.60)',
    fontFamily: Wanderly.fonts.uiBold,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(26,16,8,0.82)',
    fontFamily: Wanderly.fonts.uiRegular,
  },
  photoRow: {
    paddingTop: 2,
    paddingBottom: 2,
    gap: 10,
  },
  photo: {
    width: 150,
    height: 96,
    borderRadius: 16,
    backgroundColor: Wanderly.colors.surface2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  descFull: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: Wanderly.colors.ink,
    opacity: 0.78,
    fontFamily: Wanderly.fonts.uiRegular,
  },
});
