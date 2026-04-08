import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  return (
    <View style={styles.wrap}>
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
      />
    </View>
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
