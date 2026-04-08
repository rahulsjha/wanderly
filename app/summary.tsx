import React, { useMemo } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Wanderly } from '@/constants/wanderly-theme';
import { usePlanStore } from '@/store/plan-store';
import { placesById } from '@/data/mock-data';
import { buildTimeline, formatTime } from '@/lib/time';
import { categoryLabel, formatDuration, priceScore, totalCostLabel } from '@/lib/format';
import { PrimaryButton } from '@/components/wanderly/primary-button';

export default function SummaryModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const placeIds = usePlanStore((s) => s.placeIds);

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

  const costLabel = useMemo(() => {
    if (placeIds.length === 0) return '—';
    const scores = placeIds.map((id) => priceScore(placesById[id]?.price_level ?? '$'));
    const avg = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length);
    return totalCostLabel(avg);
  }, [placeIds]);

  const breakdownText = useMemo(() => {
    const parts: string[] = [];
    const order: (keyof typeof breakdown)[] = ['landmark', 'restaurant', 'cafe', 'activity', 'shopping'] as any;
    for (const key of order) {
      const v = (breakdown as any)[key] as number | undefined;
      if (!v) continue;
      parts.push(`${v} ${categoryLabel(key as any)}${v > 1 ? 's' : ''}`);
    }
    return parts.length ? parts.join(' · ') : '—';
  }, [breakdown]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.hero}>
        <Image
          source={require('@/assets/images/bg_3.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.heroTop}>
          <Text style={styles.title}>Trip Summary</Text>
          <Ionicons name="close" size={24} color={Wanderly.colors.ink} onPress={() => router.back()} />
        </View>

        <Text style={styles.sub}>Your Jaipur day, laid out clearly.</Text>

        <View style={styles.metrics}>
          <Metric icon="location" label="Stops" value={`${placeIds.length}`} />
          <Metric icon="time" label="Total" value={formatDuration(timeline.totalDurationMin)} />
          <Metric icon="wallet" label="Cost" value={costLabel} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <Text style={styles.sectionMeta}>{formatTime({ hour: 9, minute: 0 })} start</Text>
        </View>

        {timeline.rows.map((row, idx) => {
          const place = placesById[row.id];
          if (!place) return null;
          return (
            <View key={row.id} style={styles.item}>
              <View style={styles.itemTimeCol}>
                <Text style={styles.itemTime}>{formatTime(row.start)}</Text>
                <Text style={styles.itemTimeSub}>{formatDuration(row.durationMin)}</Text>
              </View>

              <View style={styles.itemCard}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {idx + 1}. {place.name}
                </Text>
                <Text style={styles.itemMeta}>
                  {categoryLabel(place.category)} · {place.price_level} · {place.opening_hours}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Breakdown</Text>
        </View>
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownText}>{breakdownText}</Text>
        </View>

        <View style={styles.mapCard}>
          <LinearGradient
            colors={['rgba(10,126,164,0.12)', 'rgba(243,201,181,0.22)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.mapRow}>
            <Ionicons name="map" size={18} color={Wanderly.colors.tint} />
            <Text style={styles.mapTitle}>Map preview</Text>
          </View>
          <Text style={styles.mapSub}>A static visualization placeholder (no maps SDK).</Text>
        </View>

        <PrimaryButton
          label="Share Plan"
          onPress={async () => {
            await Share.share({
              message: `My Jaipur day plan: ${placeIds.length} stops, ${formatDuration(timeline.totalDurationMin)}.`,
            });
          }}
        />
        <View style={{ height: 18 }} />
      </View>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Wanderly.colors.surface2,
  },
  hero: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Wanderly.colors.border,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Wanderly.colors.ink,
    letterSpacing: -0.5,
  },
  sub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: Wanderly.colors.ink,
    opacity: 0.62,
  },
  metrics: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    padding: 12,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Wanderly.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: Wanderly.colors.ink,
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  sectionHead: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Wanderly.colors.ink,
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: '800',
    color: Wanderly.colors.muted,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  itemTimeCol: {
    width: 86,
    paddingTop: 6,
  },
  itemTime: {
    fontSize: 13,
    fontWeight: '900',
    color: Wanderly.colors.ink,
  },
  itemTimeSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.muted,
  },
  itemCard: {
    flex: 1,
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    padding: 12,
    gap: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Wanderly.colors.ink,
    lineHeight: 18,
  },
  itemMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.muted,
    lineHeight: 16,
  },
  breakdownCard: {
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    padding: 12,
  },
  breakdownText: {
    fontSize: 13,
    fontWeight: '800',
    color: Wanderly.colors.ink,
    opacity: 0.85,
  },
  mapCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    padding: 14,
    gap: 6,
    backgroundColor: Wanderly.colors.surface,
  },
  mapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Wanderly.colors.ink,
  },
  mapSub: {
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.muted,
  },
});
