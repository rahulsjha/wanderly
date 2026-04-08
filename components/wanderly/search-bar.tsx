import { Wanderly } from '@/constants/wanderly-theme';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

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
      ['rgba(26, 16, 8, 0.12)', 'rgba(196, 146, 42, 0.70)']
    );

    return {
      borderColor,
      shadowOpacity: 0.10 + focus.value * 0.10,
      transform: [{ scale: 1 + focus.value * 0.01 }],
    };
  });

  return (
    <Animated.View style={[styles.wrap, wrapAnim]}>
      <Ionicons name="search" size={18} color={Wanderly.colors.gold} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? 'Search places'}
        placeholderTextColor={Wanderly.colors.mutedText}
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
    backgroundColor: Wanderly.colors.sand,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(26, 16, 8, 0.12)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: 'rgba(26,16,8,1)',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Wanderly.colors.ink,
    fontFamily: Wanderly.fonts.uiRegular,
  },
});
