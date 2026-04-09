import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Wanderly } from '@/constants/wanderly-theme';

export function CamelIllustration({ size = 168 }: { size?: number }) {
  const stroke = 'rgba(26,16,8,0.18)';
  const fill = 'rgba(232,96,44,0.10)';

  return (
    <View style={[styles.wrap, { width: size, height: size }]} accessibilityRole="image" accessibilityLabel="Camel illustration">
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Circle cx="100" cy="100" r="92" fill={fill} />
        <Path
          d="M45 128c10-8 12-24 22-28 6-2 10 10 17 9 10-2 10-17 18-20 10-4 18 12 27 12 11 0 16-10 25-6 9 4 10 18 17 23 6 5 12 3 15 10 2 4 0 9-4 12-6 5-15 4-22 1-7-3-12-10-18-10-7 0-12 9-20 11-12 3-18-8-28-6-9 2-12 16-23 17-10 1-14-10-21-11-10-1-17 11-28 9-7-1-14-6-15-13-1-4 2-8 8-11z"
          fill="rgba(242,232,217,0.72)"
          stroke={stroke}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <Path
          d="M146 80c7 0 12 6 12 13 0 6-3 11-7 11-5 0-6-4-9-7-2-3-7-4-8-8-1-5 5-9 12-9z"
          fill="rgba(196,146,42,0.16)"
          stroke={stroke}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

export function ArchIllustration({ size = 190 }: { size?: number }) {
  const stroke = 'rgba(26,16,8,0.16)';
  const sand = Wanderly.colors.sand;

  return (
    <View style={[styles.wrap, { width: size, height: size }]} accessibilityRole="image" accessibilityLabel="Rajasthani arch illustration">
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Path
          d="M42 170V98c0-32 26-58 58-58s58 26 58 58v72"
          fill="none"
          stroke={stroke}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <Path
          d="M60 170V102c0-22 18-40 40-40s40 18 40 40v68"
          fill={sand}
          stroke={stroke}
          strokeWidth={2}
        />
        <Path
          d="M78 170v-60c0-12 10-22 22-22s22 10 22 22v60"
          fill="rgba(232,96,44,0.10)"
          stroke={stroke}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
