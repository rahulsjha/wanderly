import { Wanderly } from '@/constants/wanderly-theme';
import { PLACES, placesById } from '@/data/mock-data';
import { categoryLabel } from '@/lib/format';
import { usePlanStore } from '@/store/plan-store';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SheetBackdrop } from '@/components/wanderly/bottom-sheet-backdrop';
import { UndoToast } from '@/components/wanderly/toast';

const HERO_HEIGHT = 420;

export default function PlaceDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const placeId = String(params.id ?? '');
  const place = placesById[placeId];

  const isSaved = usePlanStore((s) => (placeId ? s.isInPlan(placeId) : false));
  const isCheckLater = usePlanStore((s) => (placeId ? s.isCheckLater(placeId) : false));
  const add = usePlanStore((s) => s.add);
  const remove = usePlanStore((s) => s.remove);
  const toggleCheckLater = usePlanStore((s) => s.toggleCheckLater);
  const saveSheetRef = useRef<BottomSheetModal>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const saveSheetSnapPoints = useMemo(() => ['30%'], []);
  const upcomingPlaces = useMemo(() => {
    if (!place) return [];
    const sameCategory = PLACES.filter((p) => p.id !== place.id && p.category === place.category);
    const others = PLACES.filter((p) => p.id !== place.id && p.category !== place.category);
    return [...sameCategory, ...others].slice(0, 10);
  }, [place]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  if (!place) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 12, paddingHorizontal: 16 }]}>
        <Text style={styles.missingTitle}>Place not found</Text>
        <Text style={styles.missingSub}>This destination may have been removed.</Text>
        <Pressable style={styles.missingBack} onPress={handleBack} accessibilityRole="button">
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

  const openSaveSheet = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveSheetRef.current?.present();
  };

  const onSaveNowPress = async () => {
    await toggleSaved();
    setToastMessage(isSaved ? 'Removed from saved' : 'Saved for later');
    setToastVisible(true);
    saveSheetRef.current?.dismiss();
  };

  const onCheckLaterPress = async () => {
    await Haptics.selectionAsync();
    toggleCheckLater(place.id);
    setToastMessage(isCheckLater ? 'Removed from check later' : 'Marked as check later');
    setToastVisible(true);
    saveSheetRef.current?.dismiss();
  };

  const onSharePlacePress = async () => {
    await Haptics.selectionAsync();
    await Share.share({
      message: `${place.name}\n${categoryLabel(place.category)} • ${place.estimated_duration_min} min • ${place.distance_km.toFixed(
        1
      )} km\nOpen: ${place.opening_hours}`,
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Image source={{ uri: place.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} />
      </View>

      <View style={[styles.heroOverlay, { paddingTop: insets.top + 10 }]}> 
        <CircleIconButton
          icon="chevron-back"
          onPress={handleBack}
          accessibilityLabel="Go back"
        />
        <View style={styles.heroActionRow}>
          <CircleIconButton
            icon="share-social-outline"
            onPress={onSharePlacePress}
            accessibilityLabel="Share place"
          />
          <CircleIconButton
            icon={isSaved ? 'heart' : 'heart-outline'}
            onPress={openSaveSheet}
            accessibilityLabel="Open save options"
          />
        </View>
      </View>

      <ScrollView
        style={[StyleSheet.absoluteFill, styles.scrollLayer]}
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
              </View>

              <View style={styles.rightMeta}>
                <View style={styles.ratingPill}>
                  <Ionicons name="star" size={14} color={Wanderly.colors.ink} />
                  <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoPill}>
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>{categoryLabel(place.category)}</Text>
              </View>
              <View style={styles.infoPill}>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{place.estimated_duration_min} min</Text>
              </View>
              <View style={styles.infoPill}>
                <Text style={styles.infoLabel}>Distance</Text>
                <Text style={styles.infoValue}>{place.distance_km.toFixed(1)} km</Text>
              </View>
              <View style={styles.infoPill}>
                <Text style={styles.infoLabel}>Price</Text>
                <Text style={styles.infoValue}>{place.price_level}</Text>
              </View>
            </View>

            <View style={styles.openHoursCard}>
              <Text style={styles.openHoursLabel}>Opening Hours</Text>
              <Text style={styles.openHoursValue}>{place.opening_hours}</Text>
            </View>

            <View style={styles.quickActionsRow}>
              <Pressable onPress={onSharePlacePress} style={styles.quickActionButton} accessibilityRole="button">
                <Ionicons name="share-social-outline" size={16} color="#000000" />
                <Text style={styles.quickActionText}>Share</Text>
              </Pressable>

              <Pressable onPress={onCheckLaterPress} style={styles.quickActionButton} accessibilityRole="button">
                <Ionicons
                  name={isCheckLater ? 'bookmark' : 'bookmark-outline'}
                  size={16}
                  color="#000000"
                />
                <Text style={styles.quickActionText}>{isCheckLater ? 'Checked later' : 'Check later'}</Text>
              </Pressable>
            </View>

            <View style={styles.tagsRow}>
              {place.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Ionicons name="pricetag-outline" size={12} color="#000000" />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.descriptionContainer}>
              <Text style={styles.desc}>
                {place.description}
              </Text>
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Upcoming places</Text>
              <Pressable
                onPress={async () => {
                  await Haptics.selectionAsync();
                  router.push('/');
                }}
                accessibilityRole="button"
                accessibilityLabel="See all places"
              >
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
          </View>

          <FlatList
            data={upcomingPlaces}
            keyExtractor={(p) => p.id}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={(info) => (
              <UpcomingPlaceCard
                place={info.item}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/place/[id]', params: { id: info.item.id } });
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

      <BottomSheetModal
        ref={saveSheetRef}
        index={0}
        snapPoints={saveSheetSnapPoints}
        backdropComponent={(props) => <SheetBackdrop {...props} />}
        enablePanDownToClose
        backgroundStyle={styles.sheetModalBackground}
        handleIndicatorStyle={styles.sheetModalHandle}
      >
        <BottomSheetView style={styles.sheetModalContent}>
          <Text style={styles.sheetModalTitle}>Save options</Text>
          <Text style={styles.sheetModalSubtitle}>Choose how you want to keep this place.</Text>

          <Pressable onPress={onSaveNowPress} style={styles.sheetActionPrimary} accessibilityRole="button">
            <Text style={styles.sheetActionPrimaryText}>{isSaved ? 'Remove from saved' : 'Save place'}</Text>
          </Pressable>

          <Pressable onPress={onCheckLaterPress} style={styles.sheetActionSecondary} accessibilityRole="button">
            <Text style={styles.sheetActionSecondaryText}>{isCheckLater ? 'Checked for later ✓' : 'Check later'}</Text>
          </Pressable>

          <Pressable onPress={onSharePlacePress} style={styles.sheetActionSecondary} accessibilityRole="button">
            <Text style={styles.sheetActionSecondaryText}>Share place</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>

      <UndoToast
        visible={toastVisible}
        message={toastMessage}
        actionLabel="Dismiss"
        onAction={() => setToastVisible(false)}
        onDismiss={() => setToastVisible(false)}
      />
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

function UpcomingPlaceCard({
  place,
  onPress,
}: {
  place: (typeof PLACES)[number];
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tourCard, pressed && { opacity: 0.98 }]}>
      <Image source={{ uri: place.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} />
      <View style={styles.tourContent}>
        <Text numberOfLines={1} style={styles.tourTitle}>
          {place.name}
        </Text>
        <Text style={styles.tourMeta}>
          {categoryLabel(place.category)}
        </Text>
        <Text numberOfLines={2} style={styles.tourDesc}>
          {place.description}
        </Text>
        <View style={styles.tourBottomRow}>
          <View style={styles.tourRatingRow}>
            <Ionicons name="time-outline" size={14} color={'#FFFFFF'} />
            <Text style={styles.tourRatingText}>{place.estimated_duration_min} min</Text>
          </View>
          <View style={styles.tourRatingRow}>
            <Ionicons name="navigate-outline" size={14} color={'#FFFFFF'} />
            <Text style={styles.tourRatingText}>{place.distance_km.toFixed(1)} km</Text>
          </View>
          <View style={styles.tourArrow}>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </View>
        </View>
      </View>
    </Pressable>
  );
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
  scrollLayer: {
    zIndex: 1,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
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
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 16,
  },
  infoPill: {
    minWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#111111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#000000',
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  infoLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'PPMori-Regular',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    marginTop: 2,
    fontSize: 14,
    color: 'white',
    fontFamily: 'PPMori-SemiBold',
  },
  openHoursCard: {
    marginTop: 10,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#111111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#000000',
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  openHoursLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'PPMori-Regular',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  openHoursValue: {
    marginTop: 2,
    fontSize: 14,
    color: 'white',
    fontFamily: 'PPMori-SemiBold',
  },
  quickActionsRow: {
    marginTop: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    gap: 10,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  quickActionText: {
    color: '#000000',
    fontSize: 13,
    fontFamily: 'PPMori-SemiBold',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tagText: {
    color: '#000000',
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
  tourDesc: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PPMori-Regular',
    marginTop: 6,
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
  sheetModalBackground: {
    backgroundColor: Wanderly.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetModalHandle: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sheetModalContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 10,
  },
  sheetModalTitle: {
    fontSize: 18,
    fontFamily: 'PPMonumentExtended-Regular',
    color: Wanderly.colors.text,
  },
  sheetModalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'PPMori-Regular',
    color: Wanderly.colors.textMuted,
    marginBottom: 8,
  },
  sheetActionPrimary: {
    backgroundColor: Wanderly.colors.text,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sheetActionPrimaryText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'PPMori-SemiBold',
  },
  sheetActionSecondary: {
    backgroundColor: Wanderly.colors.surface2,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
  },
  sheetActionSecondaryText: {
    color: Wanderly.colors.text,
    fontSize: 14,
    fontFamily: 'PPMori-SemiBold',
  },
});
