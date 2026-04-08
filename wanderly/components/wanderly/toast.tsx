import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Wanderly } from '@/constants/wanderly-theme';

export function UndoToast({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  durationMs = 4200,
}: {
  visible: boolean;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
  durationMs?: number;
}) {
  const translate = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const animIn = useMemo(
    () =>
      Animated.parallel([
        Animated.timing(translate, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]),
    [opacity, translate]
  );

  const animOut = useMemo(
    () =>
      Animated.parallel([
        Animated.timing(translate, { toValue: 40, duration: 160, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]),
    [opacity, translate]
  );

  useEffect(() => {
    if (!visible) return;

    animIn.start();
    const t = setTimeout(() => {
      animOut.start(({ finished }) => {
        if (finished) onDismiss();
      });
    }, durationMs);

    return () => clearTimeout(t);
  }, [visible, animIn, animOut, durationMs, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ translateY: translate }] }]}>
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
    bottom: 18,
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
