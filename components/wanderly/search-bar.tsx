import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { Wanderly } from '@/constants/wanderly-theme';

export function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const focus = useSharedValue(0);

  const onFocus = useCallback(() => {
    focus.value = withTiming(1, { duration: 160 });
  }, [focus]);

  const onBlur = useCallback(() => {
    focus.value = withTiming(0, { duration: 160 });
  }, [focus]);

  const wrapAnim = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focus.value,
      [0, 1],
      [Wanderly.colors.border, 'rgba(0, 0, 0, 0.15)']
    );

    return {
      borderColor,
      shadowOpacity: 0.06 + focus.value * 0.06,
      transform: [{ scale: 1 + focus.value * 0.01 }],
    };
  });

  return (
    <Animated.View style={[styles.wrap, wrapAnim]}>
      <Ionicons name="search-outline" size={22} color={Wanderly.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? 'Search places…'}
        placeholderTextColor={Wanderly.colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={styles.input}
        returnKeyType="search"
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Wanderly.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 56,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.uiRegular,
  },
});
