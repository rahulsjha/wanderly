import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

import { Wanderly } from '@/constants/wanderly-theme';

const { width: screenW } = Dimensions.get('window');

export function ShimmerCard({ height = Math.round((screenW - 32) * (9 / 16)) }: { height?: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [t]);

  const sweep = useAnimatedStyle(() => {
    const travel = screenW * 0.9;
    return {
      transform: [{ translateX: -travel + t.value * travel * 2 }],
    };
  });

  return (
    <View style={[styles.card, { height }]} accessibilityLabel="Loading place" accessibilityRole="progressbar">
      <View style={styles.block} />
      <Animated.View style={[styles.sweep, sweep]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(251,247,242,0)', 'rgba(251,247,242,0.55)', 'rgba(251,247,242,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.pillRow}>
          <View style={[styles.pill, { width: 92 }]} />
          <View style={[styles.pill, { width: 128 }]} />
        </View>
        <View style={{ height: 10 }} />
        <View style={[styles.line, { width: '68%' }]} />
        <View style={[styles.line, { width: '48%', marginTop: 8 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(26,16,8,0.10)',
  },
  block: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,16,8,0.06)',
  },
  sweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: screenW * 0.55,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'flex-end',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  pill: {
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(251,247,242,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(251,247,242,0.22)',
  },
  line: {
    height: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(251,247,242,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(251,247,242,0.22)',
  },
});
