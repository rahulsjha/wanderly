import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    UIManager,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Wanderly } from '@/constants/wanderly-theme';
import { placesById } from '@/data/mock-data';
import { categoryLabel, formatDuration, priceScore, totalCostLabel } from '@/lib/format';
import { buildTimeline, formatTime } from '@/lib/time';
import { usePlanStore } from '@/store/plan-store';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabKey = 'schedule' | 'accommodation' | 'booking';

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const placeIds = usePlanStore((s) => s.placeIds);

  const [tab, setTab] = useState<TabKey>('schedule');
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const durationsById = useMemo(() => {
    const out: Record<string, number> = {};
    for (const id of placeIds) out[id] = placesById[id]?.estimated_duration_min ?? 45;
    return out;
  }, [placeIds]);

  const timeline = useMemo(() => buildTimeline(placeIds, durationsById), [placeIds, durationsById]);

  const breakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const id of placeIds) {
      const p = placesById[id];
      if (!p) continue;
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return counts;
  }, [placeIds]);

  const breakdownText = useMemo(() => {
    const parts: string[] = [];
    const order: Array<'landmark' | 'restaurant' | 'cafe' | 'activity' | 'shopping'> = [
      'landmark',
      'restaurant',
      'cafe',
      'activity',
      'shopping',
    ];
    for (const key of order) {
      const v = (breakdown as any)[key] as number | undefined;
      if (!v) continue;
      parts.push(`${v} ${categoryLabel(key)}${v > 1 ? 's' : ''}`);
    }
    return parts.length ? parts.join(' · ') : '—';
  }, [breakdown]);

  const costLabel = useMemo(() => {
    if (placeIds.length === 0) return '—';
    const scores = placeIds.map((id) => priceScore(placesById[id]?.price_level ?? '$'));
    const avg = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length);
    return totalCostLabel(avg);
  }, [placeIds]);

  const sharePlan = async () => {
    const first = placeIds.length ? placesById[placeIds[0]]?.name : undefined;
    await Share.share({
      message: `My Wanderly plan${first ? ` starts at ${first}` : ''}: ${placeIds.length} stops, ${formatDuration(
        timeline.totalDurationMin
      )}.`,
    });
  };

  const toggleExpanded = (dayIdx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDay((prev) => (prev === dayIdx ? null : dayIdx));
  };

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: 120 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color={Wanderly.colors.text} />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.screenTitle}>Iconic Jaipur</Text>
          <Text style={styles.dateRange}>Today – Tomorrow</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable onPress={sharePlan} style={styles.iconButton}>
            <Ionicons name="share-outline" size={22} color={Wanderly.colors.text} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Ionicons name="heart-outline" size={22} color={Wanderly.colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric icon="location" label="Stops" value={`${placeIds.length || '—'}`} />
        <Metric icon="time" label="Total" value={placeIds.length ? formatDuration(timeline.totalDurationMin) : '—'} />
        <Metric icon="wallet" label="Cost" value={costLabel} />
      </View>

      <View style={styles.tabsContainer}>
        <TabPill label="Tour schedule" active={tab === 'schedule'} onPress={() => setTab('schedule')} />
        <TabPill label="Accommodation" active={tab === 'accommodation'} onPress={() => setTab('accommodation')} />
        <TabPill label="Booking details" active={tab === 'booking'} onPress={() => setTab('booking')} />
      </View>

      {tab === 'schedule' && (
        <>
          <Text style={styles.itineraryTitle}>{Math.max(1, timeline.rows.length)}-Days Jaipur Adventure</Text>

          {placeIds.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No places in your plan yet</Text>
              <Text style={styles.emptyDesc}>Add places from Explore and your day-by-day schedule will appear here.</Text>
              <Pressable onPress={() => router.push('/')} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>→ Browse places</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.daysContainer}>
              {timeline.rows.map((row, idx) => {
                const place = placesById[row.id];
                if (!place) return null;
                const isExpanded = expandedDay === idx;

                return (
                  <Pressable
                    key={row.id}
                    onPress={() => toggleExpanded(idx)}
                    style={({ pressed }) => [
                      styles.dayCard,
                      isExpanded ? styles.dayCardExpanded : null,
                      pressed ? styles.dayCardPressed : null,
                    ]}
                  >
                    <View style={styles.dayHeader}>
                      <View style={styles.dayImageContainer}>
                        {place.image_url ? (
                          <Image
                            source={{ uri: place.image_url }}
                            transition={200}
                            contentFit="cover"
                            style={styles.dayImage}
                          />
                        ) : (
                          <View style={styles.dayImageFallback} />
                        )}
                      </View>

                      <View style={styles.dayInfo}>
                        <Text style={styles.dayNumber}>Day {idx + 1}</Text>
                        <Text numberOfLines={2} style={styles.dayTitle}>
                          {place.name}
                        </Text>
                      </View>

                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color={Wanderly.colors.textMuted}
                      />
                    </View>

                    {isExpanded && (
                      <View style={styles.dayContent}>
                        <View style={styles.segmentBlock}>
                          <Text style={styles.segmentLabel}>Morning</Text>
                          <Text style={styles.segmentText}>
                            Arrive in {place.name} to start your day. Expected duration is {formatDuration(row.durationMin)}.
                          </Text>
                        </View>
                        <View style={styles.segmentBlock}>
                          <Text style={styles.segmentLabel}>Afternoon</Text>
                          <Text style={styles.segmentText}>{place.description}</Text>
                        </View>
                        <View style={styles.segmentBlock}>
                          <Text style={styles.segmentLabel}>Evening</Text>
                          <Text style={styles.segmentText}>
                            Relax nearby or grab a quick bite. Ratings: ★ {place.rating.toFixed(1)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Timeline start</Text>
              <Text style={styles.summaryValue}>{formatTime({ hour: 9, minute: 0 })}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total duration</Text>
              <Text style={styles.summaryValue}>{placeIds.length ? formatDuration(timeline.totalDurationMin) : '—'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Breakdown</Text>
              <Text style={styles.summaryValue}>{breakdownText}</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={() => router.push('/')}> 
            <Text style={styles.ctaButtonText}>Book a tour</Text>
          </Pressable>
        </>
      )}

      {tab === 'accommodation' && (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Accommodation</Text>
          <Text style={styles.placeholderText}>
            This section is a placeholder UI to match the design. If you want, I can wire it to real data (or mock hotel
            cards) next.
          </Text>
        </View>
      )}

      {tab === 'booking' && (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Booking details</Text>
          <Text style={styles.placeholderText}>
            Share your schedule, confirm timings, and export your itinerary (placeholder UI).
          </Text>
          <Pressable style={styles.secondaryButton} onPress={sharePlan}>
            <Text style={styles.secondaryButtonText}>Share plan</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={16} color={Wanderly.colors.tint} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function TabPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active ? styles.tabActive : null]}>
      <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Wanderly.colors.background,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.displayItalic,
  },
  dateRange: {
    fontSize: 13,
    fontWeight: '500',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  metrics: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 16,
  },
  metric: {
    flex: 1,
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    padding: 12,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Wanderly.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: Wanderly.colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Wanderly.colors.surface2,
  },
  tabActive: {
    backgroundColor: Wanderly.colors.text,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  tabTextActive: {
    color: 'white',
  },
  itineraryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.displayItalic,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  daysContainer: {
    gap: 14,
    marginBottom: 20,
  },
  dayCard: {
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    overflow: 'hidden',
  },
  dayCardExpanded: {
    backgroundColor: Wanderly.colors.surface2,
    borderColor: 'rgba(0,0,0,0)',
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  dayCardPressed: {
    opacity: 0.96,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  dayImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Wanderly.colors.surface2,
  },
  dayImageFallback: {
    flex: 1,
    backgroundColor: Wanderly.colors.sandstoneDeep,
  },
  dayImage: {
    width: '100%',
    height: '100%',
  },
  dayInfo: {
    flex: 1,
    gap: 4,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    lineHeight: 22,
  },
  dayContent: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 12,
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Wanderly.colors.border,
  },
  segmentBlock: {
    gap: 4,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    fontFamily: Wanderly.fonts.ui,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
    fontFamily: Wanderly.fonts.ui,
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  ctaButton: {
    backgroundColor: Wanderly.colors.text,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    fontFamily: Wanderly.fonts.ui,
  },
  placeholderCard: {
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    marginBottom: 6,
  },
  placeholderText: {
    fontSize: 13,
    lineHeight: 18,
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
    marginBottom: 12,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: Wanderly.colors.surface2,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  emptyCard: {
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    marginBottom: 16,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  emptyButton: {
    alignSelf: 'flex-start',
    backgroundColor: Wanderly.colors.text,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  emptyButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: 'white',
    fontFamily: Wanderly.fonts.ui,
  },
});
