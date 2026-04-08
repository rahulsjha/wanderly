import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';

import { PLACES, CATEGORIES } from '@/data/mock-data';
import type { Place, PlaceCategory } from '@/types/wanderly';
import { Wanderly } from '@/constants/wanderly-theme';
import { usePlanStore } from '@/store/plan-store';
import { SearchBar } from '@/components/wanderly/search-bar';
import { CategoryChips } from '@/components/wanderly/category-chips';
import { PlaceCard } from '@/components/wanderly/place-card';
import { PlanCountBadge } from '@/components/wanderly/plan-count-badge';
import { PrimaryButton } from '@/components/wanderly/primary-button';
import { TagChip } from '@/components/wanderly/tag-chip';
import { SheetBackdrop } from '@/components/wanderly/bottom-sheet-backdrop';
import { categoryLabel, formatDuration } from '@/lib/format';
import { localDestinationForId } from '@/lib/place-assets';

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
        <Image
          source={require('@/assets/images/bg_2.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.68)', 'rgba(255,255,255,0)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.city}>Jaipur</Text>
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
        <Text style={styles.resultsMeta}>{filtered.length} nearby picks</Text>
      </View>

      <FlashList
        data={filtered}
        keyExtractor={(p) => p.id}
        estimatedItemSize={128}
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
              source={{ uri: selected.image_url }}
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
    backgroundColor: Wanderly.colors.surface2,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Wanderly.colors.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  city: {
    fontSize: 30,
    fontWeight: '900',
    color: Wanderly.colors.ink,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: Wanderly.colors.ink,
    opacity: 0.62,
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
  },
  resultsMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.muted,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    fontSize: 22,
    fontWeight: '900',
    color: Wanderly.colors.ink,
    letterSpacing: -0.3,
  },
  sheetSub: {
    marginTop: 4,
    fontSize: 13,
    color: Wanderly.colors.muted,
    fontWeight: '600',
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
    color: Wanderly.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  factValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.ink,
    opacity: 0.9,
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
  },
});
