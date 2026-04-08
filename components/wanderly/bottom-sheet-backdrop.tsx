import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

export function SheetBackdrop({ animatedIndex, style, onPress }: BottomSheetBackdropProps) {
  const containerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [-1, 0, 1], [0, 0.25, 0.45], Extrapolation.CLAMP);
    return { opacity };
  });

  const merged = useMemo(() => [styles.backdrop, style, containerStyle], [style, containerStyle]);

  return (
    <Animated.View style={merged}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onPress} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000',
  },
});
