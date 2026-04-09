import { useEffect, useMemo, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { SheetBackdrop } from '@/components/wanderly/bottom-sheet-backdrop';
import { Wanderly } from '@/constants/wanderly-theme';
import type { Place } from '@/types/wanderly';

type Props = {
  visible: boolean;
  place: Place | null;
  bottomInset: number;
  loadingOpacity: Animated.AnimatedInterpolation<number>;
  imageLoading: boolean;
  isInPlan: boolean;
  onClose: () => void;
  onTogglePlan: () => void;
  onImageLoadStart: () => void;
  onImageLoadEnd: () => void;
};

export function PlacePreviewModal({
  visible,
  place,
  bottomInset,
  loadingOpacity,
  imageLoading,
  isInPlan,
  onClose,
  onTogglePlan,
  onImageLoadStart,
  onImageLoadEnd,
}: Props) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['55%', '90%'], []);

  useEffect(() => {
    if (visible && place) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, place]);

  const handleSheetChanges = (index: number) => {
    if (index === -1 && visible) {
      onClose();
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={(props) => <SheetBackdrop {...props} />}
      enablePanDownToClose
      onChange={handleSheetChanges}
      handleIndicatorStyle={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
      backgroundStyle={{ backgroundColor: Wanderly.colors.surface, borderRadius: 28 }}
    >
        {place ? (
          <BottomSheetScrollView 
             contentContainerStyle={{ paddingBottom: 18 + bottomInset }}
             showsVerticalScrollIndicator={false}
          >
            <View style={styles.previewHero}>
              <Image
                source={{ uri: place.image_url }}
                contentFit="cover"
                style={styles.previewHeroImage}
                onLoadStart={onImageLoadStart}
                onLoadEnd={onImageLoadEnd}
              />
              {imageLoading ? (
                <Animated.View style={[styles.previewImageLoader, { opacity: loadingOpacity }]}>
                  <View style={styles.previewImageLoaderChip}>
                    <Ionicons name="hourglass-outline" size={13} color="rgba(255,255,255,0.95)" />
                    <Text style={styles.previewImageLoaderText}>Loading preview</Text>
                  </View>
                </Animated.View>
              ) : null}
              <Pressable style={styles.previewClose} onPress={onClose} accessibilityRole="button">
                <Ionicons name="close" size={18} color={Wanderly.colors.text} />
              </Pressable>
            </View>

            <View style={styles.previewContent}>
              <Text style={styles.previewCategory}>{place.category.toUpperCase()}</Text>
              <Text style={styles.previewTitle}>{place.name}</Text>

              <View style={styles.previewInfoGrid}>
                <View style={[styles.previewInfoCard, styles.previewInfoCardWide]}>
                  <Text style={styles.previewInfoLabel}>Opening hours</Text>
                  <Text style={styles.previewInfoValue}>{place.opening_hours}</Text>
                </View>
                <View style={styles.previewInfoCard}>
                  <Text style={styles.previewInfoLabel}>Price level</Text>
                  <Text style={styles.previewInfoValue}>{place.price_level}</Text>
                </View>
                <View style={styles.previewInfoCard}>
                  <Text style={styles.previewInfoLabel}>Duration</Text>
                  <Text style={styles.previewInfoValue}>{place.estimated_duration_min} min</Text>
                </View>
              </View>

              <Text style={styles.previewDescription}>{place.description}</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewTags}>
                {place.tags.map((tag) => (
                  <View key={tag} style={styles.previewTag}>
                    <Text style={styles.previewTagText}>{tag}</Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.previewActionRow}>
                <Pressable
                  style={styles.previewPrimaryBtn}
                  onPress={onTogglePlan}
                  accessibilityRole="button"
                  accessibilityLabel={isInPlan ? 'Remove from plan' : 'Add to plan'}
                  accessibilityHint="Updates your itinerary selection"
                >
                  <Ionicons name={isInPlan ? 'heart' : 'heart-outline'} size={16} color="white" />
                  <Text style={styles.previewPrimaryText}>{isInPlan ? 'Saved in Plan' : 'Add to Plan'}</Text>
                </Pressable>

                <Pressable
                  style={styles.previewSecondaryBtn}
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close preview"
                  accessibilityHint="Returns to the explore list"
                >
                  <Text style={styles.previewSecondaryText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </BottomSheetScrollView>
        ) : <View />}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  previewCard: {
    backgroundColor: Wanderly.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 20,
  },
  previewHero: {
    height: 220,
    position: 'relative',
    marginTop: -8, // Optional: slightly tuck under the handle indicator
  },
  previewHeroImage: {
    width: '100%',
    height: '100%',
  },
  previewImageLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  previewImageLoaderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  previewImageLoaderText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
  previewClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  previewContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  previewCategory: {
    fontSize: 11,
    letterSpacing: 0.8,
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
    fontWeight: '700',
  },
  previewTitle: {
    fontSize: 24,
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.displayItalic,
  },
  previewInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewInfoCard: {
    flex: 1,
    minWidth: 120,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    backgroundColor: Wanderly.colors.surface2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  previewInfoCardWide: {
    minWidth: '100%',
  },
  previewInfoLabel: {
    fontSize: 11,
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewInfoValue: {
    fontSize: 13,
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    fontWeight: '700',
  },
  previewDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Wanderly.colors.textMuted,
    fontFamily: Wanderly.fonts.ui,
  },
  previewTags: {
    gap: 8,
    paddingVertical: 2,
  },
  previewTag: {
    borderRadius: 999,
    backgroundColor: Wanderly.colors.sandstone,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewTagText: {
    fontSize: 12,
    color: Wanderly.colors.text,
    fontFamily: Wanderly.fonts.ui,
    fontWeight: '600',
  },
  previewActionRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: Wanderly.colors.text,
    paddingVertical: 12,
  },
  previewPrimaryText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
  previewSecondaryBtn: {
    borderRadius: 14,
    backgroundColor: Wanderly.colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Wanderly.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  previewSecondaryText: {
    color: Wanderly.colors.text,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Wanderly.fonts.ui,
  },
});
