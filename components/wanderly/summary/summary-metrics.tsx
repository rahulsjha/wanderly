import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Wanderly } from '@/constants/wanderly-theme';

type Props = {
  stops: number;
  totalDuration: string;
  costLabel: string;
};

export function SummaryMetrics({ stops, totalDuration, costLabel }: Props) {
  return (
    <View style={styles.metrics}>
      <Metric icon="location" label="Stops" value={`${stops || '—'}`} />
      <Metric icon="time" label="Total" value={stops ? totalDuration : '—'} />
      <Metric icon="wallet" label="Cost" value={costLabel} />
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
});
