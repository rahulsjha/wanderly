import { Wanderly } from '@/constants/wanderly-theme';
import { categoryLabel, formatDuration } from '@/lib/format';
import { localDestinationForId } from '@/lib/place-assets';
import { placeHindiName } from '@/lib/place-hindi';
import { unsplashPlaceImageUrl } from '@/lib/place-image';
import type { Place } from '@/types/wanderly';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

export function PlaceCard({
  place,
  added,
  onPress,
  onToggle,
}: {
  place: Place;
  added: boolean;
  onPress: () => void;
  onToggle: () => void;
}) {
  const duration = useMemo(() => formatDuration(place.estimated_duration_min), [place.estimated_duration_min]);
  const imageUrl = useMemo(() => unsplashPlaceImageUrl(place), [place]);

  const addScale = useSharedValue(1);
  const ring = useSharedValue(0);
  const ribbonT = useSharedValue(added ? 1 : 0);

  useEffect(() => {
    ribbonT.value = withTiming(added ? 1 : 0, { duration: added ? 240 : 160 });
  }, [added, ribbonT]);

  const addStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 1 - ring.value,
    transform: [{ scale: 0.6 + ring.value * 1.7 }],
  }));

  const ribbonStyle = useAnimatedStyle(() => {
    const t = ribbonT.value;
    return {
      opacity: t,
      transform: [{ translateX: interpolate(t, [0, 1], [16, 0]) }],
    };
  });

  const onToggleWithDelight = async () => {
    addScale.value = withSequence(
      withSpring(0.86, { damping: 12, stiffness: 260 }),
      withSpring(1.15, { damping: 12, stiffness: 240 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );
    ring.value = 0;
    ring.value = withTiming(1, { duration: 520 });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, added && styles.cardAdded, pressed && { opacity: 0.98 }]}
      accessibilityRole="button"
      accessibilityLabel={`Open details for ${place.name}`}
    >
      <View style={styles.hero}>
        <Image
          source={{ uri: imageUrl }}
          placeholder={localDestinationForId(place.id)}
          transition={220}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(26,16,8,0)', 'rgba(26,16,8,0.42)', 'rgba(26,16,8,0.78)']}
          locations={[0, 0.58, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.topRow}>
          <View style={styles.categoryGlass}>
            <Text style={styles.categoryText}>{categoryLabel(place.category)}</Text>
          </View>

          {added ? (
            <View style={styles.ribbonWrap} pointerEvents="none">
              <Animated.View style={[styles.ribbon, ribbonStyle]}>
                <Text style={styles.ribbonText}>In your plan</Text>
              </Animated.View>
            </View>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaPills}>
            <View style={styles.metaGlass}>
              <Ionicons name="star" size={14} color={Wanderly.colors.gold} />
              <Text style={styles.metaGlassText}>{place.rating.toFixed(1)}</Text>
            </View>
            <View style={styles.metaGlass}>
              <Ionicons name="time" size={14} color="rgba(255,255,255,0.92)" />
              <Text style={styles.metaGlassText}>{duration}</Text>
            </View>
          </View>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggleWithDelight();
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={added ? `Remove ${place.name} from plan` : `Add ${place.name} to plan`}
          >
            <Animated.View style={[styles.addWrap, addStyle, added ? styles.addWrapAdded : null]}>
              <Animated.View style={[styles.ring, ringStyle]} pointerEvents="none" />
              <Ionicons
                name={added ? 'checkmark' : 'add'}
                size={22}
                color="white"
              />
            </Animated.View>
          </Pressable>
        </View>

        <View style={styles.titleBlock}>
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.title}>
            {place.name}
          </Text>
          <Text numberOfLines={1} style={styles.hindi}>
            {placeHindiName(place)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Wanderly.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  cardAdded: {
    borderWidth: 2,
    borderColor: 'rgba(232, 96, 44, 0.70)',
    shadowColor: 'rgba(232, 96, 44, 1)',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  hero: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  topRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  categoryGlass: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Wanderly.radius.pill,
    backgroundColor: 'rgba(251, 247, 242, 0.20)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(251, 247, 242, 0.28)',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 0.2,
    fontFamily: Wanderly.fonts.ui,
  },
  ribbonWrap: {
    position: 'absolute',
    right: -52,
    top: 10,
    transform: [{ rotate: '45deg' }],
  },
  ribbon: {
    backgroundColor: Wanderly.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 70,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.26)',
  },
  ribbonText: {
    color: 'rgba(255,255,255,0.94)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: Wanderly.fonts.uiBold,
  },
  bottomRow: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  metaPills: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  metaGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Wanderly.radius.pill,
    backgroundColor: 'rgba(251, 247, 242, 0.20)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(251, 247, 242, 0.28)',
  },
  metaGlassText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.92)',
    fontFamily: Wanderly.fonts.uiBold,
  },
  addWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Wanderly.colors.primary,
    shadowColor: 'rgba(26,16,8,1)',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  addWrapAdded: {
    backgroundColor: Wanderly.colors.success,
  },
  ring: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Wanderly.colors.gold,
  },
  titleBlock: {
    position: 'absolute',
    left: 12,
    right: 72,
    bottom: 50,
    gap: 4,
  },
  title: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.98)',
    fontFamily: Wanderly.fonts.displayItalic,
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  hindi: {
    fontSize: 13,
    color: 'rgba(196, 146, 42, 0.95)',
    fontFamily: Wanderly.fonts.devanagari,
  },
});
