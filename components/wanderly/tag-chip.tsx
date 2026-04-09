import { Wanderly } from '@/constants/wanderly-theme';
import { StyleSheet, Text, View } from 'react-native';

export function TagChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Wanderly.radius.pill,
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  text: {
    fontSize: 12,
    color: Wanderly.colors.ink,
    opacity: 0.8,
  },
});
