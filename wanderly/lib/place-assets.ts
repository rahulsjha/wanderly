import type { ImageSourcePropType } from 'react-native';

const DEST_IMAGES: ImageSourcePropType[] = [
  require('@/assets/images/dest_1.png'),
  require('@/assets/images/dest_2.png'),
  require('@/assets/images/dest_3.png'),
  require('@/assets/images/dest_4.png'),
  require('@/assets/images/dest_5.png'),
  require('@/assets/images/dest_6.png'),
  require('@/assets/images/dest_7.png'),
  require('@/assets/images/dest_8.png'),
  require('@/assets/images/dest_9.png'),
  require('@/assets/images/dest_10.png'),
  require('@/assets/images/dest_11.png'),
  require('@/assets/images/dest_12.png'),
  require('@/assets/images/dest_13.png'),
];

export function localDestinationForId(placeId: string): ImageSourcePropType {
  const n = Number(placeId.replace(/\D/g, '')) || 1;
  return DEST_IMAGES[(n - 1) % DEST_IMAGES.length];
}
