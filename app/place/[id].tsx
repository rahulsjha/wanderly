import { Wanderly } from '@/constants/wanderly-theme';
import { placesById } from '@/data/mock-data';
import { categoryLabel } from '@/lib/format';
import { usePlanStore } from '@/store/plan-store';
import type { Place } from '@/types/wanderly';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HERO_HEIGHT = 420;

type Tour = {
  id: string;
  title: string;
  days: number;
  priceFromUsd: number;
  rating: number;
  reviews: number;
  imageUrl: string;
};

export default function PlaceDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const placeId = String(params.id ?? '');
  const place = placesById[placeId];

  const isSaved = usePlanStore((s) => (placeId ? s.isInPlan(placeId) : false));
  const add = usePlanStore((s) => s.add);
  const remove = usePlanStore((s) => s.remove);

  const [expanded, setExpanded] = useState(false);
  const [likedTourIds, setLikedTourIds] = useState<Record<string, boolean>>({});

  const seed = useMemo(() => hashStringToInt(placeId || 'wanderly'), [placeId]);

  const reviewsCount = useMemo(() => {
    const r = mulberry32(seed + 7)();
    return Math.floor(80 + r * 420);
  }, [seed]);

  const tours = useMemo(() => buildTours({ place, seed }), [place, seed]);

  if (!place) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 12, paddingHorizontal: 16 }]}>
        <Text style={styles.missingTitle}>Place not found</Text>
        <Text style={styles.missingSub}>This destination may have been removed.</Text>
        <Pressable style={styles.missingBack} onPress={() => router.back()} accessibilityRole="button">
          <Ionicons name="chevron-back" size={18} color={Wanderly.colors.ink} />
          <Text style={styles.missingBackText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const toggleSaved = async () => {
    if (isSaved) remove(place.id);
    else add(place.id);
    await Haptics.impactAsync(isSaved ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Image source={{ uri: place.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} />
        <View style={[styles.heroOverlay, { paddingTop: insets.top + 10 }]}> 
          <CircleIconButton
            icon="chevron-back"
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          />
          <CircleIconButton
            icon={isSaved ? 'heart' : 'heart-outline'}
            onPress={toggleSaved}
            accessibilityLabel={isSaved ? 'Remove from saved' : 'Save place'}
          />
        </View>
      </View>

      <ScrollView
        style={StyleSheet.absoluteFill}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HERO_HEIGHT - 34,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.sheetPad}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{place.name}</Text>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.countryRow}>
                <View style={styles.flagCircle}>
                  <Text style={styles.flagText}>🇮🇳</Text>
                </View>
                <Text style={styles.countryText}>India</Text>
              </View>

              <View style={styles.rightMeta}>
                <View style={styles.ratingPill}>
                  <Ionicons name="star" size={14} color={Wanderly.colors.ink} />
                  <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                </View>
                <Pressable
                  onPress={async () => {
                    await Haptics.selectionAsync();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="View reviews"
                >
                  <Text style={styles.reviewsLink}>{reviewsCount} reviews</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.tagsRow}>
              {place.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.descriptionContainer}>
              <Text numberOfLines={expanded ? undefined : 3} style={styles.desc}>
                {place.description}
              </Text>

              <Pressable
                onPress={() => setExpanded((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={expanded ? 'Collapse description' : 'Read more'}
              >
                <Text style={styles.readMore}>{expanded ? 'Read less' : 'Read more'}</Text>
              </Pressable>
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Upcoming tours</Text>
              <Pressable
                onPress={async () => {
                  await Haptics.selectionAsync();
                }}
                accessibilityRole="button"
                accessibilityLabel="See all tours"
              >
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
          </View>

          <FlatList
            data={tours}
            keyExtractor={(t) => t.id}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={(info) => (
              <TourCard
                item={info.item}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: `/tour/${info.item.id}`,
                    params: {
                      tour_title: info.item.title,
                      tour_days: info.item.days.toString(),
                      tour_price: info.item.priceFromUsd.toString(),
                      tour_rating: info.item.rating.toString(),
                      tour_reviews: info.item.reviews.toString(),
                      tour_imageUrl: info.item.imageUrl,
                    },
                  });
                }}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 22 }}
          />
        </View>
      </ScrollView>

      <View style={[styles.floatingHint, { top: insets.top + 8 }]}>
        <Text style={styles.hintText}>{categoryLabel(place.category)}</Text>
      </View>
    </View>
  );
}

function CircleIconButton({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.circleButton, pressed && { transform: [{ scale: 0.98 }], opacity: 0.96 }]}
    >
      <Ionicons name={icon} size={20} color={Wanderly.colors.ink} />
    </Pressable>
  );
}

function TourCard({
  item,
  onPress,
}: {
  item: Tour;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tourCard, pressed && { opacity: 0.98 }]}>
      <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} />
      <View style={styles.tourContent}>
        <Text numberOfLines={1} style={styles.tourTitle}>
          {item.title}
        </Text>
        <Text style={styles.tourMeta}>
          {item.days} days • from ${item.priceFromUsd}/person
        </Text>
        <View style={styles.tourBottomRow}>
          <View style={styles.tourRatingRow}>
            <Ionicons name="star" size={14} color={'#FFFFFF'} />
            <Text style={styles.tourRatingText}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.tourReviewsText}>{item.reviews} reviews</Text>
          </View>
          <View style={styles.tourArrow}>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function buildTours({ place, seed }: { place: Place | undefined; seed: number }): Tour[] {
  const destinationName = place?.name ?? 'Wanderly';
  const titleBase = destinationName.split(',')[0];
  const r = mulberry32(seed + 99);

  const pick = (arr: string[]) => arr[Math.floor(r() * arr.length) % arr.length];
  const adjectives = ['Iconic', 'Hidden Gems', 'Best of', 'Coastal', 'Mountain', 'City Highlights'];

  const out: Tour[] = [];
  for (let i = 0; i < 3; i++) {
    const days = Math.floor(4 + r() * 6);
    const priceFromUsd = Math.floor(220 + r() * 720);
    const rating = Math.max(4.0, Math.min(5.0, 4.2 + r() * 0.8));
    const reviews = Math.floor(30 + r() * 260);
    const title = `${pick(adjectives)} ${titleBase}`.trim();
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(`${seed}-tour-${i}`)}/900/600`;

    out.push({
      id: `${seed}-tour-${i}`,
      title,
      days,
      priceFromUsd,
      rating,
      reviews,
      imageUrl,
    });
  }

  return out;
}

function hashStringToInt(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Wanderly.colors.background,
  },
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: Wanderly.colors.surface2,
  },
  heroOverlay: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.14)',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  floatingHint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  hintText: {
    marginTop: 52,
    fontSize: 12,
    fontFamily: 'PPMori-SemiBold',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.88)',
  },
  sheet: {
    backgroundColor: Wanderly.colors.surface,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'visible', // Allow shadow to be visible
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -12 },
    elevation: 24,
  },
  handle: {
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.14)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetPad: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  titleRow: {
    paddingTop: 8,
  },
  title: {
    fontSize: 34,
    color: Wanderly.colors.text,
    fontFamily: 'PPMonumentExtended-Regular',
    letterSpacing: -0.7,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flagCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagText: {
    fontSize: 16,
  },
  countryText: {
    fontSize: 16,
    color: Wanderly.colors.text,
    fontFamily: 'PPMori-SemiBold',
  },
  rightMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.10)',
  },
  ratingText: {
    fontSize: 14,
    color: Wanderly.colors.text,
    fontFamily: 'PPMori-SemiBold',
  },
  reviewsLink: {
    color: Wanderly.colors.ink,
    textDecorationLine: 'underline',
    fontSize: 15,
    fontFamily: 'PPMonumentExtended-Regular',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: Wanderly.colors.sandstone,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  tagText: {
    color: Wanderly.colors.ink,
    fontFamily: 'PPMori-Regular',
    fontSize: 13,
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  desc: {
    fontSize: 16,
    fontFamily: 'PPMori-Regular',
    color: Wanderly.colors.text,
    lineHeight: 24,
  },
  readMore: {
    marginTop: 10,
    fontSize: 14,
    color: Wanderly.colors.text,
    textDecorationLine: 'underline',
    fontFamily: 'PPMori-SemiBold',
  },
  sectionHead: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 22,
    color: Wanderly.colors.text,
    fontFamily: 'PPMonumentExtended-Regular',
    letterSpacing: -0.4,
  },
  seeAll: {
    fontSize: 14,
    color: Wanderly.colors.text,
    textDecorationLine: 'underline',
    fontFamily: 'PPMori-SemiBold',
  },
  tourCard: {
    width: 262,
    height: 240,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: Wanderly.colors.surface2,
  },
  tourGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tourContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  tourTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'PPMonumentExtended-Regular',
  },
  tourMeta: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontFamily: 'PPMori-Regular',
    marginTop: 4,
  },
  tourBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tourRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tourRatingText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'PPMori-SemiBold',
  },
  tourReviewsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'PPMori-Regular',
    marginLeft: 4,
  },
  tourArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missingTitle: {
    fontSize: 22,
    color: Wanderly.colors.ink,
    fontFamily: 'PPMonumentExtended-Regular',
  },
  missingSub: {
    marginTop: 8,
    fontSize: 14,
    color: Wanderly.colors.mutedText,
    fontFamily: 'PPMori-Regular',
  },
  missingBack: {
    marginTop: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Wanderly.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.10)',
  },
  missingBackText: {
    fontSize: 13,
    color: Wanderly.colors.ink,
    fontFamily: 'PPMori-SemiBold',
  },
});
