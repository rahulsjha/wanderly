import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { JaliPattern } from '@/components/wanderly/jali-pattern';
import { PrimaryButton } from '@/components/wanderly/primary-button';
import { UndoToast } from '@/components/wanderly/toast';
import { Wanderly } from '@/constants/wanderly-theme';
import { placesById } from '@/data/mock-data';
import { categoryLabel, formatDuration } from '@/lib/format';
import { localDestinationForId } from '@/lib/place-assets';
import { placeHindiName } from '@/lib/place-hindi';
import { unsplashPlaceImageUrl } from '@/lib/place-image';
import { buildTimeline, formatTime } from '@/lib/time';
import { usePlanStore } from '@/store/plan-store';

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
      <LinearGradient
        colors={[Wanderly.colors.ink, Wanderly.colors.deepRose, Wanderly.colors.primary]}
        locations={[0, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <JaliPattern opacity={0.07} />
      </View>
      <LinearGradient
        colors={['rgba(251,247,242,0.08)', 'rgba(251,247,242,0.74)', Wanderly.colors.warmWhite]}
        locations={[0, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Text style={styles.title}>My Plan</Text>
      <Text style={styles.titleHi}>मेरी योजना</Text>
      <Text style={styles.sub}>Start 9:00 AM · Build a realistic day</Text>

      <View style={styles.summaryBar}>
        <SummaryStat label="Stops" value={`${placeIds.length}`} icon="location" />
        <View style={styles.summaryDivider} />
        <SummaryStat label="Total" value={formatDuration(timeline.totalDurationMin)} icon="time" />
        <View style={styles.summaryDivider} />
        <SummaryStat label="Ends" value={formatTime(timeline.end)} icon="flag" />
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
        activationDistance={12}
        onDragBegin={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }}
        onDragEnd={async ({ data }) => {
          reorder(data);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

function SummaryStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statTop}>
        <Ionicons name={icon} size={16} color={Wanderly.colors.gold} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
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

  const activeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isActive ? 1.04 : 1, { damping: 16, stiffness: 240 }) }],
    };
  }, [isActive]);

  return (
    <Animated.View style={[styles.rowWrap, activeStyle, isActive && styles.rowActive]}>
      <View style={styles.row}>
        <View style={styles.orderCol}>
          <View style={styles.orderCircle}>
            <Text style={styles.orderText}>{index + 1}</Text>
          </View>

          {index < timeline.length - 1 ? (
            <View style={styles.timelineLine} />
          ) : (
            <View style={styles.timelineLineEnd} />
          )}
        </View>

        <View style={styles.contentCol}>
          {row?.travelGapMinBefore ? (
            <View style={styles.travelGap}>
              <Ionicons name="car" size={14} color="rgba(26,16,8,0.62)" />
              <Text style={styles.travelText}>{row.travelGapMinBefore} min travel</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <View
              style={[
                styles.cardAccent,
                place ? { backgroundColor: accentForCategory(place.category) } : null,
              ]}
            />
            <Image
              source={{ uri: place ? unsplashPlaceImageUrl(place) : undefined }}
              placeholder={localDestinationForId(item)}
              transition={180}
              contentFit="cover"
              style={styles.thumb}
            />

            <View style={{ flex: 1, gap: 6 }}>
              <View style={styles.cardTop}>
                <View style={styles.titleWrap}>
                  <Text numberOfLines={2} ellipsizeMode="tail" style={styles.cardTitle}>
                    {place?.name ?? 'Unknown place'}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    onLongPress={drag}
                    delayLongPress={120}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Drag to reorder"
                  >
                    <Ionicons name="reorder-three" size={22} color={Wanderly.colors.muted} />
                  </Pressable>
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

              {place ? <Text style={styles.cardHi}>{placeHindiName(place)}</Text> : null}
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function accentForCategory(category: string) {
  switch (category) {
    case 'landmark':
      return Wanderly.colors.primary;
    case 'restaurant':
      return Wanderly.colors.deepRose;
    case 'cafe':
      return Wanderly.colors.gold;
    case 'activity':
      return Wanderly.colors.primary;
    case 'shopping':
      return Wanderly.colors.gold;
    default:
      return Wanderly.colors.primary;
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Wanderly.colors.warmWhite,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Wanderly.colors.border,
    backgroundColor: Wanderly.colors.warmWhite,
  },
  title: {
    fontSize: 32,
    color: Wanderly.colors.ink,
    letterSpacing: -0.6,
    fontFamily: Wanderly.fonts.displayItalic,
  },
  titleHi: {
    marginTop: 2,
    fontSize: 14,
    color: 'rgba(196,146,42,0.95)',
    fontFamily: Wanderly.fonts.devanagari,
  },
  sub: {
    marginTop: 4,
    fontSize: 13,
    color: Wanderly.colors.mutedText,
    fontFamily: Wanderly.fonts.ui,
  },
  summaryCard: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  summaryBar: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 18,
    backgroundColor: Wanderly.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(26,16,8,0.10)',
    shadowColor: 'rgba(26,16,8,1)',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    overflow: 'hidden',
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(26,16,8,0.10)',
  },
  stat: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(26,16,8,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: Wanderly.fonts.uiBold,
  },
  statValue: {
    fontSize: 20,
    color: Wanderly.colors.ink,
    letterSpacing: -0.4,
    fontFamily: Wanderly.fonts.displayItalic,
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
    color: 'rgba(26,16,8,0.78)',
    fontFamily: Wanderly.fonts.ui,
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
    fontFamily: Wanderly.fonts.displayItalic,
  },
  emptyDesc: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: Wanderly.colors.mutedText,
    lineHeight: 18,
    paddingHorizontal: 10,
    fontFamily: Wanderly.fonts.uiRegular,
  },
  rowWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  rowActive: {
    zIndex: 20,
    elevation: 14,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  travelGap: {
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Wanderly.radius.pill,
    backgroundColor: 'rgba(196, 146, 42, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 146, 42, 0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: 'rgba(26,16,8,1)',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  travelText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(26,16,8,0.72)',
    fontFamily: Wanderly.fonts.uiBold,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  contentCol: {
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  orderCol: {
    width: 30,
    alignItems: 'center',
  },
  orderCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Wanderly.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
    fontFamily: Wanderly.fonts.uiBold,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(196, 146, 42, 0.40)',
    marginTop: 10,
    marginBottom: -10,
    borderRadius: 999,
  },
  timelineLineEnd: {
    height: 12,
    marginTop: 10,
    opacity: 0,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 3,
    backgroundColor: Wanderly.colors.primary,
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
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    paddingTop: 10,
    paddingLeft: 12,
    fontSize: 15,
    fontWeight: '900',
    color: Wanderly.colors.ink,
    lineHeight: 20,
    fontFamily: Wanderly.fonts.uiBold,
  },
  cardMeta: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 2,
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.mutedText,
    lineHeight: 16,
    fontFamily: Wanderly.fonts.ui,
  },
  cardHi: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 12,
    fontSize: 12,
    color: 'rgba(196,146,42,0.95)',
    fontFamily: Wanderly.fonts.devanagari,
  },
});
