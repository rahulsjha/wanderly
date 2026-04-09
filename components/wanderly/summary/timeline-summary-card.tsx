import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Wanderly } from '@/constants/wanderly-theme';

type Props = {
  startTimeInput: string;
  onChangeStartTimeInput: (value: string) => void;
  onShiftEarlier: () => void;
  onShiftLater: () => void;
  onApplyStartTime: () => void;
  startTimeError: string | null;
  totalDurationLabel: string;
  endTimeLabel: string;
  breakdownText: string;
};

export function TimelineSummaryCard({
  startTimeInput,
  onChangeStartTimeInput,
  onShiftEarlier,
  onShiftLater,
  onApplyStartTime,
  startTimeError,
  totalDurationLabel,
  endTimeLabel,
  breakdownText,
}: Props) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Timeline start</Text>
        <View style={styles.startTimeRow}>
          <Pressable
            style={styles.timeAdjust}
            onPress={onShiftEarlier}
            accessibilityRole="button"
            accessibilityLabel="Start 15 minutes earlier"
          >
            <Ionicons name="remove" size={14} color={Wanderly.colors.text} />
          </Pressable>
          <Pressable
            style={styles.timeAdjust}
            onPress={onShiftLater}
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
          onChangeText={onChangeStartTimeInput}
          placeholder="e.g. 9:30 AM"
          placeholderTextColor={Wanderly.colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.startInput}
          returnKeyType="done"
          onSubmitEditing={onApplyStartTime}
          selectionColor={Wanderly.colors.text}
        />
        <Pressable
          style={styles.applyButton}
          onPress={onApplyStartTime}
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
        <Text style={styles.summaryValue}>{totalDurationLabel}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>End time</Text>
        <Text style={styles.summaryValue}>{endTimeLabel}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Breakdown</Text>
        <Text style={styles.summaryValue}>{breakdownText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
