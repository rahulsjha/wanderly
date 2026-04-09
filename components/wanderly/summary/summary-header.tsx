import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Wanderly } from '@/constants/wanderly-theme';

type Props = {
  onBack: () => void;
  onShare: () => void;
};

export function SummaryHeader({ onBack, onShare }: Props) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
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
          onPress={onShare}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Share plan"
          accessibilityHint="Opens system share for your current itinerary"
        >
          <Ionicons name="share-outline" size={22} color={Wanderly.colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
