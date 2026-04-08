import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { Place } from '@/types/wanderly';
import { Wanderly } from '@/constants/wanderly-theme';
import { categoryLabel, formatDuration } from '@/lib/format';
import { localDestinationForId } from '@/lib/place-assets';

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

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: place.image_url }}
          placeholder={localDestinationForId(place.id)}
          transition={180}
          contentFit="cover"
          style={styles.image}
        />
        {added ? (
          <View style={styles.addedBadge}>
            <Ionicons name="checkmark" size={14} color="white" />
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text numberOfLines={2} style={styles.title}>
            {place.name}
          </Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            style={[styles.cta, added ? styles.ctaAdded : styles.ctaAdd]}
            accessibilityRole="button"
            accessibilityLabel={added ? `Remove ${place.name} from plan` : `Add ${place.name} to plan`}
          >
            <Text style={[styles.ctaText, added ? styles.ctaTextAdded : styles.ctaTextAdd]}>
              {added ? 'Added' : 'Add'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{categoryLabel(place.category)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color={Wanderly.colors.warning} />
            <Text style={styles.metaText}>{place.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={14} color={Wanderly.colors.muted} />
            <Text style={styles.metaText}>{duration}</Text>
          </View>
        </View>

        <Text numberOfLines={2} style={styles.desc}>
          {place.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Wanderly.colors.surface,
    borderRadius: Wanderly.radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    overflow: 'hidden',
  },
  imageWrap: {
    width: 110,
    height: 110,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Wanderly.colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Wanderly.colors.ink,
    lineHeight: 20,
  },
  cta: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ctaAdd: {
    backgroundColor: 'rgba(10, 126, 164, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(10, 126, 164, 0.22)',
  },
  ctaAdded: {
    backgroundColor: Wanderly.colors.tint,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  ctaTextAdd: {
    color: Wanderly.colors.tintDeep,
  },
  ctaTextAdded: {
    color: 'white',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Wanderly.radius.pill,
    backgroundColor: 'rgba(243, 201, 181, 0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(230, 169, 142, 0.55)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(17,24,28,0.85)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: Wanderly.colors.ink,
    opacity: 0.75,
    fontWeight: '600',
  },
  desc: {
    fontSize: 12,
    color: Wanderly.colors.ink,
    opacity: 0.6,
    lineHeight: 16,
  },
});
