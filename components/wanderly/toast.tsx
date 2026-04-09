import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Wanderly } from '@/constants/wanderly-theme';

export function UndoToast({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  durationMs = 4200,
  bottomOffset = 18,
}: {
  visible: boolean;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
  durationMs?: number;
  bottomOffset?: number;
}) {
  const t = useSharedValue(0);
  const isMounted = useRef(false);

  const wrapStyle = useAnimatedStyle(() => {
    return {
      opacity: t.value,
      transform: [{ translateY: interpolate(t.value, [0, 1], [40, 0]) }],
    };
  });

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      t.value = visible ? 1 : 0;
      return;
    }
    t.value = withTiming(visible ? 1 : 0, { duration: visible ? 180 : 160 });
  }, [t, visible]);

  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => {
      t.value = withTiming(0, { duration: 160 }, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(onDismiss)();
        }
      });
    }, durationMs);
    return () => clearTimeout(timeout);
  }, [durationMs, onDismiss, t, visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrap, { bottom: bottomOffset }, wrapStyle]}>
      <View style={styles.card}>
        <Text style={styles.msg}>{message}</Text>
        <Pressable onPress={onAction} style={styles.action} accessibilityRole="button">
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 24,
  },
  card: {
    backgroundColor: Wanderly.colors.ink,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  msg: {
    flex: 1,
    color: 'white',
    opacity: 0.92,
    fontSize: 13,
    fontWeight: '600',
  },
  action: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  actionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },
});
