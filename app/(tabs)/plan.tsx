import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArchIllustration } from '@/components/wanderly/empty-illustrations';
import { Wanderly } from '@/constants/wanderly-theme';
import { placesById } from '@/data/mock-data';
import { categoryLabel, formatDuration } from '@/lib/format';
import { buildTimeline, formatTime, TimelineRow } from '@/lib/time';
import { usePlanStore } from '@/store/plan-store';

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const placeIds = usePlanStore((s) => s.placeIds);
  const reorder = usePlanStore((s) => s.reorder);
  const removePlace = usePlanStore((s) => s.remove);

  const durationsById = useMemo(() => {
    const out: Record<string, number> = {};
    for (const id of placeIds) out[id] = placesById[id]?.estimated_duration_min ?? 45;
    return out;
  }, [placeIds]);

  const timeline = useMemo(() => buildTimeline(placeIds, durationsById), [placeIds, durationsById]);

  if (placeIds.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: 120 + insets.bottom }]}>
        <View style={styles.empty}>
          <ArchIllustration />
          <Text style={styles.emptyTitle}>Your journey has no shape yet</Text>
          <Text style={styles.emptyDesc}>Add places from Explore to build your perfect Jaipur day</Text>
          <Pressable onPress={() => router.push('/')} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>→ Browse Places</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<TimelineRow>) => {
    const place = placesById[item.id];
    if (!place) return null;
    const index = getIndex() ?? 0;

    return (
      <ScaleDecorator>
        <View style={[styles.timelineRow, isActive && styles.timelineRowActive]}>
          <View style={styles.timelineLeft}>
            <Text style={styles.timeText}>{formatTime(item.start)}</Text>
            <View style={styles.timelineLine}>
              <View style={[styles.timelineDot, isActive && styles.timelineDotActive]} />
              {index < placeIds.length - 1 && <View style={styles.travelLine} />}
            </View>
          </View>

          <Pressable style={styles.itemCard} onLongPress={drag} delayLongPress={150}>
            <View style={styles.itemHeader}>
              <View style={styles.itemTitleRow}>
                <Text style={styles.orderNumber}>{index + 1}.</Text>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {place.name}
                </Text>
              </View>
              <Pressable
                hitSlop={10}
                onPress={() => removePlace(item.id)}
                style={styles.removeBtn}>
                <Ionicons name="close" size={20} color={Wanderly.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.itemMetaRow}>
              <Text style={styles.itemMeta}>
                {categoryLabel(place.category)} • {formatDuration(item.durationMin)} here
              </Text>
            </View>

            {item.travelGapMinBefore ? (
              <View style={styles.travelGap}>
                <Ionicons name="car-outline" size={14} color={Wanderly.colors.textMuted} />
                <Text style={styles.travelText}>{item.travelGapMinBefore} min travel</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </ScaleDecorator>
    );
  };

  const ListHeaderComponent = () => (
    <View style={styles.headerArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Wanderly.colors.text} />
        </Pressable>
        <Text style={styles.screenTitle}>Plan Your Timeline</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Stops</Text>
          <Text style={styles.summaryValue}>{placeIds.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Time</Text>
          <Text style={styles.summaryValue}>{formatDuration(timeline.totalDurationMin)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Start / End</Text>
          <Text style={styles.summaryValue}>
            {formatTime({ hour: 9, minute: 0 })} – {formatTime(timeline.end)}
          </Text>
        </View>
      </View>

      {timeline.totalDurationMin > 600 && (
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={18} color="#B45309" />
          <Text style={styles.warningText}>
            Your schedule exceeds 10 hours. Consider removing items or splitting into a second day.
          </Text>
        </View>
      )}

      <Text style={styles.instructions}>Press and hold to reorder stops.</Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={[styles.screen, { paddingTop: insets.top }]}>
      <DraggableFlatList
        data={timeline.rows}
        onDragEnd={({ data }) => reorder(data.map((r) => r.id))}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Wanderly.colors.background,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerArea: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.displayItalic,
  },
  summaryCard: {
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  warningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
    fontFamily: Wanderly.fonts.ui,
    lineHeight: 18,
  },
  instructions: {
    fontSize: 13,
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 100,
  },
  timelineRowActive: {
    opacity: 0.85,
    transform: [{ scale: 1.02 }],
  },
  timelineLeft: {
    width: 60,
    alignItems: 'center',
    marginRight: 10,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    marginBottom: 6,
    marginTop: 2,
  },
  timelineLine: {
    flex: 1,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Wanderly.colors.textMuted,
    borderWidth: 2,
    borderColor: Wanderly.colors.background,
    zIndex: 1,
  },
  timelineDotActive: {
    backgroundColor: Wanderly.colors.text,
    transform: [{ scale: 1.2 }],
  },
  travelLine: {
    width: 2,
    flex: 1,
    backgroundColor: Wanderly.colors.border,
    marginTop: -2,
    marginBottom: -16,
  },
  itemCard: {
    flex: 1,
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Wanderly.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  itemTitleRow: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    marginRight: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    flex: 1,
  },
  removeBtn: {
    backgroundColor: Wanderly.colors.surface2,
    borderRadius: 12,
    padding: 4,
  },
  itemMetaRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  itemMeta: {
    fontSize: 13,
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  travelGap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Wanderly.colors.surface2,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  travelText: {
    fontSize: 12,
    color: Wanderly.colors.textMuted,
    fontWeight: '600',
    fontFamily: Wanderly.fonts.ui,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.displayItalic,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 12,
    backgroundColor: Wanderly.colors.text,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    fontFamily: Wanderly.fonts.ui,
  },
});
