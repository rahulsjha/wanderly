import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArchIllustration } from '@/components/wanderly/empty-illustrations';
import { Wanderly } from '@/constants/wanderly-theme';
import { PLACES } from '@/data/mock-data';
import { selectCheckLaterIds, selectRemoveCheckLater } from '@/store/plan-selectors';
import { usePlanStore } from '@/store/plan-store';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const checkLaterIds = usePlanStore(selectCheckLaterIds);
  const removeCheckLater = usePlanStore(selectRemoveCheckLater);

  const checkLaterPlaces = useMemo(
    () => PLACES.filter((p) => checkLaterIds.includes(p.id)),
    [checkLaterIds]
  );

  if (checkLaterPlaces.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: 120 + insets.bottom }]}>
        <View style={styles.empty}>
          <ArchIllustration />
          <Text style={styles.emptyTitle}>No check later places yet</Text>
          <Text style={styles.emptyDesc}>Tap Check later on a place detail to add it here.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: 120 + insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Check Later</Text>
      </View>

      <View style={styles.list}>
        {checkLaterPlaces.map((p) => (
          <Pressable
            key={p.id}
            onPress={async () => {
              await Haptics.selectionAsync();
              router.push({ pathname: '/place/[id]', params: { id: p.id } });
            }}
            style={styles.row}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={styles.rowSub} numberOfLines={1}>
                {p.description}
              </Text>
              <View style={styles.rowMeta}>
                <View style={styles.rowMetaItem}>
                  <Ionicons name="time-outline" size={12} color={Wanderly.colors.text} />
                  <Text style={styles.rowMetaText}>{p.estimated_duration_min} min</Text>
                </View>
                <View style={styles.rowMetaItem}>
                  <Ionicons name="navigate-outline" size={12} color={Wanderly.colors.text} />
                  <Text style={styles.rowMetaText}>{p.distance_km.toFixed(1)} km</Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                removeCheckLater(p.id);
              }}
              style={styles.rowAction}
            >
              <Ionicons name="bookmark" size={18} color="white" />
            </Pressable>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Wanderly.colors.background,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.displayItalic,
    letterSpacing: -0.3,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  rowSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  rowMeta: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowMetaText: {
    fontSize: 11,
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    fontWeight: '600',
  },
  rowAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Wanderly.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
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
});
