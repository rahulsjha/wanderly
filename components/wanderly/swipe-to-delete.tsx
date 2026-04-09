import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable, {
    type SwipeableProps,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
    interpolate,
    useAnimatedStyle,
    type SharedValue,
} from 'react-native-reanimated';

import { Wanderly } from '@/constants/wanderly-theme';

function RightDeleteAction({
  dragX,
  label,
}: {
  dragX: SharedValue<number>;
  label: string;
}) {
  const style = useAnimatedStyle(() => {
    const dx = Math.abs(dragX.value);
    return {
      transform: [{ translateX: interpolate(dx, [0, 120], [40, 0], 'clamp') }],
      opacity: interpolate(dx, [10, 90], [0, 1], 'clamp'),
    };
  });

  return (
    <Animated.View style={[styles.rightAction, style]}>
      <Ionicons name="trash" size={18} color="white" />
      <Text style={styles.rightText}>{label}</Text>
    </Animated.View>
  );
}

export function SwipeToDelete({
  children,
  onFullSwipe,
  label = 'Delete',
  enabled = true,
}: {
  children: ReactNode;
  onFullSwipe: () => void;
  label?: string;
  enabled?: boolean;
}) {
  const renderRightActions: SwipeableProps['renderRightActions'] = (
    _progress: SharedValue<number>,
    dragX: SharedValue<number>
  ) => <RightDeleteAction dragX={dragX} label={label} />;

  return (
    <ReanimatedSwipeable
      enabled={enabled}
      friction={1.25}
      rightThreshold={82}
      overshootRight={false}
      renderRightActions={renderRightActions}
      onSwipeableOpen={onFullSwipe}
    >
      <View>{children}</View>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  rightAction: {
    width: 120,
    marginVertical: 2,
    backgroundColor: Wanderly.colors.danger,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rightText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontFamily: Wanderly.fonts.uiBold,
  },
});
