import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { Wanderly } from '@/constants/wanderly-theme';
import { placesById } from '@/data/mock-data';
import { categoryLabel, formatDuration } from '@/lib/format';
import { buildBreakdownText, buildCostLabel, buildDurationsById } from '@/lib/plan-derivations';
import { buildTimeline, formatTime } from '@/lib/time';
import { usePlanStore } from '@/store/plan-store';

export default function FinalizeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const placeIds = usePlanStore((s) => s.placeIds);
  const startTime = usePlanStore((s) => s.journeyStartTime);

  const durationsById = useMemo(() => buildDurationsById(placeIds, placesById), [placeIds]);
  const timeline = useMemo(() => buildTimeline(placeIds, durationsById, { start: startTime }), [placeIds, durationsById, startTime]);
  const costLabel = useMemo(() => buildCostLabel(placeIds, placesById), [placeIds]);
  const breakdownText = useMemo(() => buildBreakdownText(placeIds, placesById, ' · '), [placeIds]);

  const mapPoints = useMemo(() => {
    const baseLat = 26.9124;
    const baseLng = 75.7873;
    return placeIds.map((id, index) => {
      const angle = (index * 38 * Math.PI) / 180;
      const radius = 0.025 + (index % 5) * 0.006;
      return {
        id,
        name: placesById[id]?.name ?? `Stop ${index + 1}`,
        lat: baseLat + Math.sin(angle) * radius,
        lng: baseLng + Math.cos(angle) * radius,
      };
    });
  }, [placeIds]);

  const leafletHtml = useMemo(() => {
    const serializedPoints = JSON.stringify(mapPoints);
    return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
      .leaflet-container { background: #eef2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const points = ${serializedPoints};
      const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([26.9124, 75.7873], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      const latLngs = [];
      points.forEach((p, i) => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 7,
          color: '#111',
          weight: 2,
          fillColor: '#fff',
          fillOpacity: 1,
        }).addTo(map);
        marker.bindTooltip(String(i + 1), { permanent: true, direction: 'center', opacity: 1 });
        marker.bindPopup('<b>' + (i + 1) + '. ' + p.name + '</b>');
        latLngs.push([p.lat, p.lng]);
      });

      if (latLngs.length > 1) {
        L.polyline(latLngs, { color: '#111', weight: 3, opacity: 0.85 }).addTo(map);
      }
      if (latLngs.length > 0) {
        map.fitBounds(latLngs, { padding: [24, 24] });
      }
    </script>
  </body>
</html>`;
  }, [mapPoints]);

  const onShare = async () => {
    await Share.share({
      message: `My Wanderly plan: ${placeIds.length} stops, ${formatDuration(timeline.totalDurationMin)}, starts at ${formatTime(startTime)}.`,
    });
  };

  if (!placeIds.length) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}> 
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={22} color={Wanderly.colors.text} />
          </Pressable>
          <Text style={styles.title}>Finalize</Text>
          <View style={styles.iconSpacer} />
        </View>

        <View style={styles.emptyWrap}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="map-outline" size={24} color={Wanderly.colors.text} />
            </View>

            <Text style={styles.emptyTitle}>No journey to finalize yet</Text>
            <Text style={styles.emptyText}>
              Build your itinerary in My Plan and come back to see route map, timeline, and share-ready summary.
            </Text>

            <View style={styles.emptyFeatureRow}>
              <View style={styles.emptyFeaturePill}>
                <Ionicons name="navigate-outline" size={13} color={Wanderly.colors.textMuted} />
                <Text style={styles.emptyFeatureText}>Route map</Text>
              </View>
              <View style={styles.emptyFeaturePill}>
                <Ionicons name="time-outline" size={13} color={Wanderly.colors.textMuted} />
                <Text style={styles.emptyFeatureText}>Timeline</Text>
              </View>
              <View style={styles.emptyFeaturePill}>
                <Ionicons name="share-social-outline" size={13} color={Wanderly.colors.textMuted} />
                <Text style={styles.emptyFeatureText}>Share</Text>
              </View>
            </View>

            <Pressable style={styles.emptyCtaButton} onPress={() => router.push('/summary')}>
              <Ionicons name="list-outline" size={16} color="white" />
              <Text style={styles.primaryButtonText}>Go to My Plan</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}> 
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={22} color={Wanderly.colors.text} />
          </Pressable>
          <Text style={styles.title}>Finalized Journey</Text>
          <Pressable onPress={onShare} style={styles.iconButton}>
            <Ionicons name="share-outline" size={20} color={Wanderly.colors.text} />
          </Pressable>
        </View>

        <View style={styles.metrics}>
          <Metric icon="location" label="Stops" value={String(placeIds.length)} />
          <Metric icon="time" label="Total" value={formatDuration(timeline.totalDurationMin)} />
          <Metric icon="wallet" label="Cost" value={costLabel} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Start time</Text>
          <Text style={styles.cardValue}>{formatTime(startTime)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Category breakdown</Text>
          <Text style={styles.cardValue}>{breakdownText}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Locations map</Text>
          <View style={styles.mapFrame}>
            <WebView
              source={{ html: leafletHtml }}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
              style={styles.mapView}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Location photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
          {placeIds.map((id, index) => {
            const place = placesById[id];
            if (!place) return null;

            return (
              <View key={id} style={styles.photoCard}>
                {place.image_url ? (
                  <Image source={{ uri: place.image_url }} contentFit="cover" style={styles.photo} />
                ) : (
                  <View style={[styles.photo, styles.photoFallback]} />
                )}
                <Text style={styles.photoTitle} numberOfLines={1}>
                  {index + 1}. {place.name}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.timelineWrap}>
          {timeline.rows.map((row, index) => {
            const place = placesById[row.id];
            if (!place) return null;

            return (
              <View style={styles.timelineRow} key={row.id}>
                <View style={styles.timelineTimeCol}>
                  <Text style={styles.timelineTime}>{formatTime(row.start)}</Text>
                  <View style={styles.dot} />
                </View>

                <View style={styles.timelineCard}>
                  <Text style={styles.placeName}>{index + 1}. {place.name}</Text>
                  <Text style={styles.placeMeta}>
                    {categoryLabel(place.category)} · {formatDuration(row.durationMin)} · {place.distance_km} km
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable style={styles.primaryButton} onPress={onShare}>
          <Ionicons name="share-social-outline" size={18} color="white" />
          <Text style={styles.primaryButtonText}>Share plan</Text>
        </Pressable>
      </ScrollView>
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
    backgroundColor: Wanderly.colors.background,
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacer: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.displayItalic,
  },
  metrics: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    padding: 10,
    gap: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  card: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    backgroundColor: Wanderly.colors.surface,
    padding: 12,
    gap: 4,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  mapFrame: {
    marginTop: 8,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  mapView: {
    flex: 1,
  },
  photosRow: {
    gap: 10,
    paddingVertical: 2,
    paddingRight: 4,
  },
  photoCard: {
    width: 150,
    borderRadius: 12,
    backgroundColor: Wanderly.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 102,
  },
  photoFallback: {
    backgroundColor: Wanderly.colors.surface2,
  },
  photoTitle: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 20,
    fontWeight: '700',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.displayItalic,
  },
  timelineWrap: {
    gap: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timelineTimeCol: {
    width: 62,
    alignItems: 'center',
    paddingTop: 8,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '700',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  dot: {
    marginTop: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Wanderly.colors.text,
  },
  timelineCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    backgroundColor: Wanderly.colors.surface,
    padding: 12,
    gap: 4,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '800',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  placeMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: Wanderly.colors.text,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    fontFamily: Wanderly.fonts.ui,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  emptyCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    backgroundColor: Wanderly.colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    gap: 10,
  },
  emptyIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Wanderly.colors.textMuted,
    textAlign: 'center',
    fontFamily: Wanderly.fonts.ui,
    lineHeight: 20,
  },
  emptyFeatureRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  emptyFeaturePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  emptyFeatureText: {
    fontSize: 12,
    color: Wanderly.colors.textMuted,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
  emptyCtaButton: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: Wanderly.colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
