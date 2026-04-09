import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeToDelete } from '@/components/wanderly/swipe-to-delete';
import { UndoToast } from '@/components/wanderly/toast';
import { Wanderly } from '@/constants/wanderly-theme';
import { placesById } from '@/data/mock-data';
import { categoryLabel, formatDuration } from '@/lib/format';
import { buildBreakdownText, buildCostLabel, buildDurationsById } from '@/lib/plan-derivations';
import { addMinutes, buildTimeline, formatTime, minutesFromTime, type TimeOfDay } from '@/lib/time';
import { usePlanStore } from '@/store/plan-store';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabKey = 'schedule' | 'accommodation' | 'booking';

type OpeningRange = { start: number; end: number };

function parseTimeToken(token: string): number | null {
  const m = token.trim().match(/(\d{1,2})\s*:\s*(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  const ampm = m[3].toUpperCase() as 'AM' | 'PM';
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  const hour24 = (hh % 12) + (ampm === 'PM' ? 12 : 0);
  return hour24 * 60 + mm;
}

function parseOpeningRanges(openingHours?: string):
  | { kind: 'unknown' }
  | { kind: 'always' }
  | { kind: 'ranges'; ranges: OpeningRange[] } {
  if (!openingHours) return { kind: 'unknown' };
  const raw = openingHours.trim();
  const lower = raw.toLowerCase();
  if (!raw) return { kind: 'unknown' };
  if (lower.includes('open 24 hours')) return { kind: 'always' };
  if (lower.includes('shows at')) return { kind: 'unknown' };

  const ranges: OpeningRange[] = [];
  const segments = raw.split(',').map((s) => s.trim()).filter(Boolean);
  for (const seg of segments) {
    const parts = seg.split('-');
    if (parts.length !== 2) continue;
    const start = parseTimeToken(parts[0]);
    const end = parseTimeToken(parts[1]);
    if (start == null || end == null) continue;
    ranges.push({ start, end });
  }

  if (!ranges.length) return { kind: 'unknown' };
  return { kind: 'ranges', ranges };
}

function isSpanWithinRange(startMin: number, endMin: number, range: OpeningRange) {
  if (range.start === range.end) return true;
  if (range.end > range.start) return startMin >= range.start && endMin <= range.end;
  const inLate = startMin >= range.start && endMin <= 24 * 60;
  const inEarly = startMin >= 0 && endMin <= range.end;
  return inLate || inEarly;
}

function hasOpeningConflict(openingHours: string | undefined, startMin: number, endMin: number): boolean {
  const parsed = parseOpeningRanges(openingHours);
  if (parsed.kind !== 'ranges') return false;
  const ok = parsed.ranges.some((range) => isSpanWithinRange(startMin, endMin, range));
  return !ok;
}

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const placeIds = usePlanStore((s) => s.placeIds);
  const reorder = usePlanStore((s) => s.reorder);
  const removeAt = usePlanStore((s) => s.removeAt);
  const undoRemove = usePlanStore((s) => s.undoRemove);
  const clearUndo = usePlanStore((s) => s.clearUndo);
  const lastRemoved = usePlanStore((s) => s.lastRemoved);
  const startTime = usePlanStore((s) => s.journeyStartTime);
  const setJourneyStartTime = usePlanStore((s) => s.setJourneyStartTime);

  const [tab, setTab] = useState<TabKey>('schedule');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [startTimeInput, setStartTimeInput] = useState(() => formatTime(startTime));
  const [startTimeError, setStartTimeError] = useState<string | null>(null);

  useEffect(() => {
    setStartTimeInput(formatTime(startTime));
  }, [startTime]);

  const durationsById = useMemo(() => {
    return buildDurationsById(placeIds, placesById);
  }, [placeIds]);

  const timeline = useMemo(
    () => buildTimeline(placeIds, durationsById, { start: startTime }),
    [placeIds, durationsById, startTime]
  );

  const totalTripMin = useMemo(() => {
    return timeline.rows.reduce((sum, row) => sum + row.durationMin + (row.travelGapMinBefore ?? 0), 0);
  }, [timeline.rows]);

  const endTime = useMemo(() => addMinutes(startTime, totalTripMin), [startTime, totalTripMin]);

  const breakdownText = useMemo(() => {
    return buildBreakdownText(placeIds, placesById, ' · ');
  }, [placeIds]);

  const costLabel = useMemo(() => {
    return buildCostLabel(placeIds, placesById);
  }, [placeIds]);

  const sharePlan = async () => {
    const first = placeIds.length ? placesById[placeIds[0]]?.name : undefined;
    await Share.share({
      message: `My Wanderly plan${first ? ` starts at ${first}` : ''}: ${placeIds.length} stops, ${formatDuration(
        totalTripMin
      )}.`,
    });
  };

  const shiftStartTime = (deltaMin: number) => {
    setJourneyStartTime(addMinutes(startTime, deltaMin));
    setStartTimeError(null);
  };

  const moveStop = (from: number, to: number) => {
    if (to < 0 || to >= placeIds.length) return;
    const next = placeIds.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    reorder(next);
  };

  const applyStartTimeInput = () => {
    const parsed = parseTimeToken(startTimeInput);
    if (parsed == null) {
      setStartTimeError('Use format like 9:30 AM');
      return;
    }
    const next: TimeOfDay = { hour: Math.floor(parsed / 60) % 24, minute: parsed % 60 };
    setJourneyStartTime(next);
    setStartTimeError(null);
  };

  const toggleExpanded = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}
      >
      <ScrollView
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 220 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to previous screen"
        >
          <Ionicons name="chevron-back" size={24} color={Wanderly.colors.text} />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.screenTitle}>My Plan</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={sharePlan}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Share plan"
            accessibilityHint="Opens system share for your current itinerary"
          >
            <Ionicons name="share-outline" size={22} color={Wanderly.colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric icon="location" label="Stops" value={`${placeIds.length || '—'}`} />
        <Metric icon="time" label="Total" value={placeIds.length ? formatDuration(totalTripMin) : '—'} />
        <Metric icon="wallet" label="Cost" value={costLabel} />
      </View>


      {tab === 'schedule' && (
        <>
          <Text style={styles.itineraryTitle}>1-Day Iconic Jaipur Plan</Text>

          {totalTripMin > 10 * 60 && (
            <View style={styles.alertCard}>
              <Ionicons name="alert-circle" size={18} color={Wanderly.colors.danger} />
              <View style={styles.alertTextWrap}>
                <Text style={styles.alertTitle}>Long day ahead</Text>
                <Text style={styles.alertText}>
                  Your plan is over 10 hours. Consider reordering or removing a stop.
                </Text>
              </View>
            </View>
          )}

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
              <DraggableFlatList
                data={placeIds}
                keyExtractor={(item) => item}
                scrollEnabled={false}
                activationDistance={10}
                onDragBegin={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                }}
                onDragEnd={({ data }) => reorder(data)}
                renderItem={({ item, drag, isActive, getIndex }: RenderItemParams<string>) => {
                  const index = getIndex?.() ?? 0;
                  const row = timeline.rows[index];
                  const place = placesById[item];
                  if (!place || !row) return null;
                  const isExpanded = expandedId === item;
                  const startMin = minutesFromTime(row.start);
                  const endMin = minutesFromTime(row.end);
                  const conflict = hasOpeningConflict(place.opening_hours, startMin, endMin);

                  const handleRemove = () => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    removeAt(index);
                  };

                  return (
                    <View style={styles.timelineItemWrap}>
                      {row.travelGapMinBefore ? (
                        <View style={styles.gapRow}>
                          <View style={styles.gapLine} />
                          <Text style={styles.gapText}>Travel gap · {row.travelGapMinBefore} min</Text>
                        </View>
                      ) : null}
                      <SwipeToDelete onFullSwipe={handleRemove}>
                        <Pressable
                          onPress={() => toggleExpanded(item)}
                          accessibilityRole="button"
                          accessibilityLabel={`${place.name} stop details`}
                          accessibilityHint="Double tap to expand or collapse details"
                          accessibilityState={{ expanded: isExpanded }}
                          style={({ pressed }) => [
                            styles.dayCard,
                            isExpanded ? styles.dayCardExpanded : null,
                            pressed ? styles.dayCardPressed : null,
                            isActive ? styles.dayCardActive : null,
                          ]}
                        >
                          <View style={styles.dayHeader}>
                            <View style={styles.dayPrimaryRow}>
                              <Pressable
                                onLongPress={drag}
                                style={styles.dragHandle}
                                accessibilityRole="button"
                                accessibilityLabel={`Reorder ${place.name}`}
                                accessibilityHint="Long press and drag to reorder this stop"
                              >
                                <Ionicons name="reorder-three" size={20} color={Wanderly.colors.textMuted} />
                              </Pressable>

                              <View style={styles.orderBadge}>
                                <Text style={styles.orderText}>{index + 1}</Text>
                              </View>

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
                                <Text numberOfLines={1} style={styles.dayNumber}>
                                  Stop {index + 1} · {categoryLabel(place.category)}
                                </Text>
                                <Text numberOfLines={2} style={styles.dayTitle}>
                                  {place.name}
                                </Text>
                                <View style={styles.dayMetaRow}>
                                  <Text numberOfLines={1} style={styles.dayTimeText}>
                                    {formatTime(row.start)} – {formatTime(row.end)} · {formatDuration(row.durationMin)}
                                  </Text>
                                  <Ionicons
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color={Wanderly.colors.textMuted}
                                  />
                                </View>
                              </View>

                              <Pressable
                                onPress={handleRemove}
                                style={styles.removeButton}
                                accessibilityRole="button"
                                accessibilityLabel={`Remove ${place.name}`}
                                accessibilityHint="Removes this stop from your plan"
                              >
                                <Ionicons name="trash-outline" size={18} color={Wanderly.colors.textMuted} />
                              </Pressable>
                            </View>

                            <View style={styles.reorderAltRow}>
                              <Pressable
                                onPress={() => moveStop(index, index - 1)}
                                style={[styles.reorderAltButton, index === 0 ? styles.reorderAltButtonDisabled : null]}
                                disabled={index === 0}
                                accessibilityRole="button"
                                accessibilityLabel={`Move ${place.name} up`}
                                accessibilityHint="Moves this stop one position earlier"
                              >
                                <Ionicons name="arrow-up" size={13} color={Wanderly.colors.textMuted} />
                              </Pressable>
                              <Pressable
                                onPress={() => moveStop(index, index + 1)}
                                style={[
                                  styles.reorderAltButton,
                                  index === placeIds.length - 1 ? styles.reorderAltButtonDisabled : null,
                                ]}
                                disabled={index === placeIds.length - 1}
                                accessibilityRole="button"
                                accessibilityLabel={`Move ${place.name} down`}
                                accessibilityHint="Moves this stop one position later"
                              >
                                <Ionicons name="arrow-down" size={13} color={Wanderly.colors.textMuted} />
                              </Pressable>
                              <Text style={styles.reorderHint}>Long-press drag handle to reorder</Text>
                            </View>
                          </View>

                        <View style={styles.timeRow}>
                          <Text style={styles.timeLabel}>{formatTime(row.start)}</Text>
                          <View style={styles.timeBar}>
                            <View style={[styles.timeFill, conflict ? styles.timeFillConflict : null]} />
                          </View>
                          <Text style={styles.timeLabel}>{formatTime(row.end)}</Text>
                        </View>

                        {conflict && (
                          <View style={styles.conflictRow}>
                            <Ionicons name="alert-circle" size={14} color={Wanderly.colors.danger} />
                            <Text style={styles.conflictText}>Outside opening hours</Text>
                          </View>
                        )}

                        {isExpanded && (
                          <View style={styles.dayContent}>
                            <View style={styles.segmentBlock}>
                              <Text style={styles.segmentLabel}>Plan</Text>
                              <Text style={styles.segmentText}>{place.description}</Text>
                            </View>
                            <View style={styles.segmentBlock}>
                              <Text style={styles.segmentLabel}>Details</Text>
                              <Text style={styles.segmentText}>
                                Estimated time: {place.estimated_duration_min} min · Distance: {place.distance_km} km
                              </Text>
                            </View>
                            <View style={styles.segmentBlock}>
                              <Text style={styles.segmentLabel}>Opening hours</Text>
                              <Text style={styles.segmentText}>{place.opening_hours}</Text>
                            </View>
                            <View style={styles.segmentBlock}>
                              <Text style={styles.segmentLabel}>Price & tags</Text>
                              <Text style={styles.segmentText}>
                                {place.price_level} · {place.tags?.join(', ') || '—'}
                              </Text>
                            </View>
                            <View style={styles.metaGrid}>
                              <View style={styles.metaPill}>
                                <Ionicons name="time" size={12} color={Wanderly.colors.textMuted} />
                                <Text style={styles.metaText}>Duration: {place.estimated_duration_min} min</Text>
                              </View>
                              <View style={styles.metaPill}>
                                <Ionicons name="navigate" size={12} color={Wanderly.colors.textMuted} />
                                <Text style={styles.metaText}>Distance: {place.distance_km} km</Text>
                              </View>
                              <View style={styles.metaPillWide}>
                                <Ionicons name="time-outline" size={12} color={Wanderly.colors.textMuted} />
                                <Text style={styles.metaText}>Hours: {place.opening_hours}</Text>
                              </View>
                              <View style={styles.metaPill}>
                                <Ionicons name="pricetag" size={12} color={Wanderly.colors.textMuted} />
                                <Text style={styles.metaText}>Price: {place.price_level}</Text>
                              </View>
                              {place.tags?.length ? (
                                <View style={styles.metaPillWide}>
                                  <Ionicons name="pricetags" size={12} color={Wanderly.colors.textMuted} />
                                  <Text style={styles.metaText}>Tags: {place.tags.join(', ')}</Text>
                                </View>
                              ) : null}
                            </View>
                          </View>
                        )}
                        </Pressable>
                      </SwipeToDelete>
                    </View>
                  );
                }}
              />
            </View>
          )}

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Timeline start</Text>
              <View style={styles.startTimeRow}>
                <Pressable
                  style={styles.timeAdjust}
                  onPress={() => shiftStartTime(-15)}
                  accessibilityRole="button"
                  accessibilityLabel="Start 15 minutes earlier"
                >
                  <Ionicons name="remove" size={14} color={Wanderly.colors.text} />
                </Pressable>
                <Pressable
                  style={styles.timeAdjust}
                  onPress={() => shiftStartTime(15)}
                  accessibilityRole="button"
                  accessibilityLabel="Start 15 minutes later"
                >
                  <Ionicons name="add" size={14} color={Wanderly.colors.text} />
                </Pressable>
              </View>
            </View>
            <View style={styles.startInputRow}>
              <TextInput
                value={startTimeInput}
                onChangeText={setStartTimeInput}
                placeholder="e.g. 9:30 AM"
                placeholderTextColor={Wanderly.colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                style={styles.startInput}
                returnKeyType="done"
                onSubmitEditing={applyStartTimeInput}
                selectionColor={Wanderly.colors.text}
              />
              <Pressable
                style={styles.applyButton}
                onPress={applyStartTimeInput}
                accessibilityRole="button"
                accessibilityLabel="Apply start time"
                accessibilityHint="Updates the full timeline from entered start time"
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </Pressable>
            </View>
            {startTimeError ? <Text style={styles.startInputError}>{startTimeError}</Text> : null}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total duration</Text>
              <Text style={styles.summaryValue}>{placeIds.length ? formatDuration(totalTripMin) : '—'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>End time</Text>
              <Text style={styles.summaryValue}>{placeIds.length ? formatTime(endTime) : '—'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Breakdown</Text>
              <Text style={styles.summaryValue}>{breakdownText}</Text>
            </View>
          </View>

          <Pressable
            style={styles.ctaButton}
            onPress={() => router.push('/')}
            accessibilityRole="button"
            accessibilityLabel="Browse places"
            accessibilityHint="Opens explore screen to add more places"
          > 
            <Text style={styles.ctaButtonText}>Book a tour</Text>
          </Pressable>

          <Pressable
            style={styles.finalizeButton}
            onPress={() => router.push('/finalize')}
            accessibilityRole="button"
            accessibilityLabel="Finalize plan"
            accessibilityHint="Opens final itinerary summary with map and timeline"
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={Wanderly.colors.text} />
            <Text style={styles.finalizeButtonText}>Finalize Plan</Text>
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
      <UndoToast
        visible={!!lastRemoved}
        message="Stop removed"
        actionLabel="Undo"
        onAction={undoRemove}
        onDismiss={clearUndo}
        bottomOffset={insets.bottom + 86}
      />
    </View>
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  alertCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 59, 48, 0.2)',
    marginBottom: 16,
  },
  alertTextWrap: {
    flex: 1,
    gap: 2,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  alertText: {
    fontSize: 12,
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
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
  timelineItemWrap: {
    gap: 8,
  },
  gapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  gapLine: {
    width: 18,
    height: 1,
    backgroundColor: Wanderly.colors.border,
  },
  gapText: {
    fontSize: 11,
    fontWeight: '700',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
  dayCardActive: {
    opacity: 0.96,
    transform: [{ scale: 1.01 }],
  },
  dayCardPressed: {
    opacity: 0.96,
  },
  dayHeader: {
    gap: 10,
    padding: 14,
  },
  dayPrimaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Wanderly.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Wanderly.fonts.ui,
  },
  dragHandle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Wanderly.colors.surface2,
    flexShrink: 0,
  },
  reorderAltRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    marginLeft: 86,
    paddingRight: 6,
  },
  reorderAltButton: {
    width: 28,
    height: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  reorderAltButtonDisabled: {
    opacity: 0.35,
  },
  reorderHint: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  dayImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Wanderly.colors.surface2,
    flexShrink: 0,
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
    minWidth: 0,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    lineHeight: 20,
  },
  dayMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayTimeText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    flexShrink: 0,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  timeBar: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: Wanderly.colors.surface2,
    overflow: 'hidden',
  },
  timeFill: {
    flex: 1,
    backgroundColor: Wanderly.colors.text,
  },
  timeFillConflict: {
    backgroundColor: Wanderly.colors.danger,
  },
  conflictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  conflictText: {
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.danger,
    fontFamily: Wanderly.fonts.ui,
  },
  dayContent: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 12,
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Wanderly.colors.border,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  metaPillWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
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
  startTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeAdjust: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Wanderly.colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  startInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  startInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    fontSize: 13,
  },
  applyButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Wanderly.colors.text,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
  startInputError: {
    marginTop: -2,
    fontSize: 12,
    color: Wanderly.colors.danger,
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
  finalizeButton: {
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  finalizeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Wanderly.colors.text,
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
