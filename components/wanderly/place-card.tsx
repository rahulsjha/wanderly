import { Wanderly } from '@/constants/wanderly-theme';
import { categoryLabel } from '@/lib/format';
import type { Place } from '@/types/wanderly';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

export function PlaceCard({
  place,
  added,
  onPress,
  onToggle,
  style,
}: {
  place: Place;
  added: boolean;
  onPress: () => void;
  onToggle: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [pulse]);

  const onToggleWithDelight = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.72],
  });

  return (
    <View style={[styles.shadowShell, style]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, added && styles.cardAdded, pressed && { opacity: 0.985 }]}
        accessibilityRole="button"
        accessibilityLabel={`Open details for ${place.name}`}
      >
        <Image
          source={{ uri: place.image_url }}
          transition={220}
          contentFit="cover"
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />

        {imageLoading ? (
          <Animated.View style={[styles.loadingOverlay, { opacity: pulseOpacity }]}>
            <View style={styles.loadingChip}>
              <Ionicons name="hourglass-outline" size={14} color="rgba(255,255,255,0.95)" />
              <Text style={styles.loadingText}>Loading</Text>
            </View>
          </Animated.View>
        ) : null}

        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.88)']}
          locations={[0, 0.45, 1]}
          style={styles.bottomGradient}
        />


        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onToggleWithDelight();
          }}
          style={styles.heartButton}
        >
          <Ionicons name={added ? 'heart' : 'heart-outline'} size={24} color="rgba(255,255,255,0.85)" />
        </Pressable>

        <View style={styles.bottomContent}>
          <View style={styles.bottomLeft}>
            <Text style={styles.locationDescriptor}>{categoryLabel(place.category)}</Text>
            <Text numberOfLines={2} style={styles.locationName}>
              {place.name}
            </Text>
            <Text numberOfLines={2} style={styles.description}>
              {place.description}
            </Text>
            <Text style={styles.durationInline}>⏱ {place.estimated_duration_min} min</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="star-outline" size={14} color="#FFFFFF" />
                <Text style={styles.metaText}>{place.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="location-outline" size={14} color="#FFFFFF" />
                <Text style={styles.metaText}>{place.distance_km} km</Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable style={styles.seeMoreBar} onPress={onPress}>
          <Text style={styles.seeMoreText}>See more</Text>
          <View style={styles.seeMoreArrowCircle}>
            <Ionicons name="chevron-forward" size={24} color="#111111" style={{ marginLeft: 2 }} />
          </View>
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowShell: {
    shadowColor: 'rgba(0,0,0,0.26)',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  card: {
    width: '100%',
    aspectRatio: 0.78,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: Wanderly.colors.surface2,
  },
  cardAdded: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22,22,24,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  loadingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '74%',
  },
  heartButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 96,
    left: 20,
    right: 20,
    zIndex: 5,
  },
  bottomLeft: {
    gap: 2,
  },
  locationDescriptor: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Wanderly.fonts.ui,
  },
  locationName: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    fontFamily: Wanderly.fonts.uiBold,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: Wanderly.fonts.ui,
  },
  durationInline: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Wanderly.fonts.ui,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    fontFamily: Wanderly.fonts.ui,
  },
  seeMoreBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(22,22,24,0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  seeMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: Wanderly.fonts.ui,
  },
  seeMoreArrowCircle: {
    position: 'absolute',
    right: 6,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
