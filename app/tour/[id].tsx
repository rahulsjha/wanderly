import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useGlobalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Wanderly } from '../../constants/wanderly-theme';

export default function TourDetailScreen() {
  const insets = useSafeAreaInsets();
  const global = useGlobalSearchParams<{
    tour_title: string;
    tour_days: string;
    tour_price: string;
    tour_rating: string;
    tour_reviews: string;
    tour_imageUrl: string;
  }>();

  const { tour_title, tour_days, tour_price, tour_rating, tour_reviews, tour_imageUrl } = global;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: tour_imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            locations={[0, 0.5]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>
            {tour_title}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={14} color={Wanderly.colors.ink} />
              <Text style={styles.ratingText}>{parseFloat(tour_rating).toFixed(1)}</Text>
            </View>
            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
              }}
              accessibilityRole="button"
              accessibilityLabel="View reviews">
              <Text style={styles.reviewsLink}>{tour_reviews} reviews</Text>
            </Pressable>
          </View>
          <Text style={styles.details}>
            {tour_days} days tour • Starts from ${tour_price}/person
          </Text>
          <Text style={styles.description}>
            Embark on an unforgettable journey through the heart of India. This tour is a deep dive into the
            culture, history, and natural beauty of the region. From ancient temples to bustling markets, you&apos;ll
            experience the best of what this incredible destination has to offer.
          </Text>
        </View>
      </ScrollView>

      <Pressable
        onPress={async () => {
          await Haptics.selectionAsync();
          router.back();
        }}
        style={[styles.backButton, { top: insets.top + 16 }]}
        accessibilityRole="button"
        accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={24} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Wanderly.colors.surface,
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'PPMonumentExtended-Regular',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Wanderly.colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  ratingText: {
    color: Wanderly.colors.ink,
    fontFamily: 'PPMori-SemiBold',
    fontSize: 14,
  },
  reviewsLink: {
    color: Wanderly.colors.ink,
    textDecorationLine: 'underline',
    fontSize: 15,
    fontFamily: 'PPMonumentExtended-Regular',
  },
  details: {
    fontSize: 16,
    fontFamily: 'PPMori-Regular',
    color: Wanderly.colors.textMuted,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'PPMori-Regular',
    lineHeight: 24,
    color: Wanderly.colors.text,
  },
});
