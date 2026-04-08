import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Wanderly } from '@/constants/wanderly-theme';
import { usePlanStore } from '@/store/plan-store';
import { placesById } from '@/data/mock-data';
import { buildTimeline, formatTime } from '@/lib/time';
import { categoryLabel, formatDuration } from '@/lib/format';
import { localDestinationForId } from '@/lib/place-assets';
import { PrimaryButton } from '@/components/wanderly/primary-button';
import { UndoToast } from '@/components/wanderly/toast';

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const placeIds = usePlanStore((s) => s.placeIds);
  const reorder = usePlanStore((s) => s.reorder);
  const removeAt = usePlanStore((s) => s.removeAt);
  const lastRemoved = usePlanStore((s) => s.lastRemoved);
  const undoRemove = usePlanStore((s) => s.undoRemove);
  const clearUndo = usePlanStore((s) => s.clearUndo);

  const durationsById = useMemo(() => {
    const out: Record<string, number> = {};
    for (const id of placeIds) out[id] = placesById[id]?.estimated_duration_min ?? 45;
    return out;
  }, [placeIds]);

  const timeline = useMemo(() => buildTimeline(placeIds, durationsById), [placeIds, durationsById]);
  const warning = timeline.totalDurationMin > 10 * 60;

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>My Plan</Text>
      <Text style={styles.sub}>Start 9:00 AM · Build a realistic day</Text>

      <View style={styles.summaryCard}>
        <SummaryPill label="Stops" value={`${placeIds.length}`} icon="location" />
        <SummaryPill label="Total" value={formatDuration(timeline.totalDurationMin)} icon="time" />
        <SummaryPill label="Ends" value={formatTime(timeline.end)} icon="flag" />
      </View>

      {warning ? (
        <View style={styles.warning}>
          <Ionicons name="warning" size={16} color={Wanderly.colors.warning} />
          <Text style={styles.warningText}>
            Your plan exceeds 10 hours. Consider removing a stop.
          </Text>
        </View>
      ) : null}

      <View style={{ height: 12 }} />

      <PrimaryButton
        label={placeIds.length === 0 ? 'Browse places' : 'View Trip Summary'}
        onPress={() => {
          if (placeIds.length === 0) router.push('/(tabs)');
          else router.push('/summary');
        }}
        variant={placeIds.length === 0 ? 'ghost' : 'primary'}
      />
    </View>
  );

  if (placeIds.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header}
        <View style={styles.empty}>
          <Image
            source={require('@/assets/images/dest_8.png')}
            style={styles.emptyImage}
            contentFit="cover"
          />
          <Text style={styles.emptyTitle}>Your day plan is empty</Text>
          <Text style={styles.emptyDesc}>
            Head to Explore, add a few places, then drag to reorder into a perfect timeline.
          </Text>
          <View style={{ height: 10 }} />
          <PrimaryButton label="Go to Explore" onPress={() => router.push('/(tabs)')} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <DraggableFlatList
        data={placeIds}
        keyExtractor={(id) => id}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: 70 }}
        onDragBegin={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onDragEnd={async ({ data }) => {
          reorder(data);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        renderItem={(params) => (
          <TimelineRow
            {...params}
            index={params.getIndex?.() ?? 0}
            timeline={timeline.rows}
            onRemove={(idx) => {
              removeAt(idx);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
          />
        )}
      />

      <UndoToast
        visible={!!lastRemoved}
        message="Removed from plan"
        actionLabel="Undo"
        onAction={() => undoRemove()}
        onDismiss={() => clearUndo()}
      />
    </View>
  );
}

function SummaryPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={16} color={Wanderly.colors.tint} />
      <View style={{ gap: 2 }}>
        <Text style={styles.pillLabel}>{label}</Text>
        <Text style={styles.pillValue}>{value}</Text>
      </View>
    </View>
  );
}

function TimelineRow({
  item,
  drag,
  isActive,
  index,
  timeline,
  onRemove,
}: RenderItemParams<string> & {
  index: number;
  timeline: { id: string; start: { hour: number; minute: number }; end: { hour: number; minute: number }; travelGapMinBefore?: number }[];
  onRemove: (index: number) => void;
}) {
  const place = placesById[item];
  const row = timeline[index];

  return (
    <View style={[styles.rowWrap, isActive && styles.rowActive]}>
      {row?.travelGapMinBefore ? (
        <View style={styles.travelGap}>
          <View style={styles.travelLine} />
          <Text style={styles.travelText}>{row.travelGapMinBefore} min travel</Text>
          <View style={styles.travelLine} />
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.orderCol}>
          <View style={styles.orderCircle}>
            <Text style={styles.orderText}>{index + 1}</Text>
          </View>
          <View style={styles.timelineLine} />
        </View>

        <View style={{ flex: 1, gap: 10 }}>
          <View style={styles.card}>
            <Image
              source={{ uri: place?.image_url }}
              placeholder={localDestinationForId(item)}
              transition={180}
              contentFit="cover"
              style={styles.thumb}
            />

            <View style={{ flex: 1, gap: 6 }}>
              <View style={styles.cardTop}>
                <Text numberOfLines={2} style={styles.cardTitle}>
                  {place?.name ?? 'Unknown place'}
                </Text>

                <View style={styles.actions}>
                  <Ionicons
                    name="reorder-three"
                    size={22}
                    color={Wanderly.colors.muted}
                    onPressIn={drag}
                    accessibilityLabel="Drag to reorder"
                  />
                  <Ionicons
                    name="close"
                    size={20}
                    color={Wanderly.colors.danger}
                    onPress={() => onRemove(index)}
                    accessibilityLabel="Remove from plan"
                  />
                </View>
              </View>

              <Text style={styles.cardMeta}>
                {row ? `${formatTime(row.start)} – ${formatTime(row.end)}` : ''}
                {place ? ` · ${categoryLabel(place.category)} · ${formatDuration(place.estimated_duration_min)}` : ''}
              </Text>
            </View>
          </View>
        </View>
      </View>
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
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Wanderly.colors.border,
    backgroundColor: Wanderly.colors.surface2,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Wanderly.colors.ink,
    letterSpacing: -0.6,
  },
  sub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: Wanderly.colors.ink,
    opacity: 0.62,
  },
  summaryCard: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  pillLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Wanderly.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  pillValue: {
    fontSize: 13,
    fontWeight: '900',
    color: Wanderly.colors.ink,
  },
  warning: {
    marginTop: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(245, 158, 11, 0.22)',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(17,24,28,0.78)',
  },
  empty: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyImage: {
    width: 190,
    height: 190,
    borderRadius: 32,
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '900',
    color: Wanderly.colors.ink,
  },
  emptyDesc: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: Wanderly.colors.muted,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  rowWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  rowActive: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  travelGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 42,
    paddingRight: 12,
    paddingBottom: 10,
  },
  travelLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(17,24,28,0.10)',
  },
  travelText: {
    fontSize: 12,
    fontWeight: '800',
    color: Wanderly.colors.muted,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  orderCol: {
    width: 30,
    alignItems: 'center',
  },
  orderCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Wanderly.colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(10, 126, 164, 0.22)',
    marginTop: 10,
    borderRadius: 2,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    overflow: 'hidden',
  },
  thumb: {
    width: 88,
    height: 88,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    paddingTop: 10,
    paddingLeft: 12,
    fontSize: 15,
    fontWeight: '900',
    color: Wanderly.colors.ink,
    lineHeight: 20,
  },
  cardMeta: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 12,
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.muted,
    lineHeight: 16,
  },
});
