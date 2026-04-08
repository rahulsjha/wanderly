import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { SheetBackdrop } from '@/components/wanderly/bottom-sheet-backdrop';
import { CategoryChips } from '@/components/wanderly/category-chips';
import { PlaceCard } from '@/components/wanderly/place-card';
import { PlanCountBadge } from '@/components/wanderly/plan-count-badge';
import { PrimaryButton } from '@/components/wanderly/primary-button';
import { SearchBar } from '@/components/wanderly/search-bar';
import { TagChip } from '@/components/wanderly/tag-chip';
import { Wanderly } from '@/constants/wanderly-theme';
import { CATEGORIES, PLACES } from '@/data/mock-data';
import { categoryLabel, formatDuration } from '@/lib/format';
import { localDestinationForId } from '@/lib/place-assets';
import { unsplashPlaceImageUrl } from '@/lib/place-image';
import { usePlanStore } from '@/store/plan-store';
import type { Place, PlaceCategory } from '@/types/wanderly';
import { JaliPattern } from '@/components/wanderly/jali-pattern';

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
        <Text style={styles.resultsMeta}>{filtered.length} places found</Text>
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
                  <Text style={styles.sheetTitle}>{selected.name}</Text>
                  <Text style={styles.sheetSub}>Rated {selected.rating.toFixed(1)} · {categoryLabel(selected.category)}</Text>
                </View>
              </View>

              <View style={styles.factsRow}>
                <Fact label="Duration" value={formatDuration(selected.estimated_duration_min)} />
                <Fact label="Price" value={selected.price_level} />
                <Fact label="Hours" value={selected.opening_hours} />
              </View>

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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.factValue}>
        {value}
      </Text>
    </View>
  );
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
