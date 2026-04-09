import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Wanderly } from '@/constants/wanderly-theme';

export default function ExploreMoreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: 120 + insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="grid-outline" size={22} color={Wanderly.colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Coming soon</Text>
          <Text style={styles.cardSub}>This tab is a placeholder to match the 4-icon navigation.</Text>
        </View>
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
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Wanderly.colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
  },
  cardSub: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
});
