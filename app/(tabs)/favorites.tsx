import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArchIllustration } from '@/components/wanderly/empty-illustrations';
import { Wanderly } from '@/constants/wanderly-theme';
import { PLACES } from '@/data/mock-data';
import { usePlanStore } from '@/store/plan-store';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();

  const savedIds = usePlanStore((s) => s.placeIds);
  const remove = usePlanStore((s) => s.remove);

  const saved = useMemo(() => PLACES.filter((p) => savedIds.includes(p.id)), [savedIds]);

  if (saved.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: 120 + insets.bottom }]}>
        <View style={styles.empty}>
          <ArchIllustration />
          <Text style={styles.emptyTitle}>No saved places yet</Text>
          <Text style={styles.emptyDesc}>Tap the heart on a place to save it for later.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: 120 + insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
      </View>

      <View style={styles.list}>
        {saved.map((p) => (
          <View key={p.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={styles.rowSub} numberOfLines={1}>
                {p.tags.slice(0, 3).join(' · ')}
              </Text>
            </View>

            <Pressable onPress={() => remove(p.id)} style={styles.rowAction}>
              <Ionicons name="heart" size={18} color="white" />
            </Pressable>
          </View>
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
    fontWeight: '600',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
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
