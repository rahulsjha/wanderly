import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Wanderly } from '@/constants/wanderly-theme';

function TabIcon({
  name,
  color,
  focused,
}: {
  name: Parameters<typeof IconSymbol>[0]['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabIconWrap}>
      <IconSymbol size={26} name={name} color={color} />
      <View style={[styles.dot, focused ? styles.dotOn : styles.dotOff]} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Wanderly.colors.primary,
        tabBarInactiveTintColor: 'rgba(251,247,242,0.66)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Wanderly.colors.ink,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: 'rgba(196,146,42,0.55)',
          height: 74,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontFamily: Wanderly.fonts.uiBold,
          fontSize: 11,
          letterSpacing: 0.2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="safari.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'My Plan',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="calendar" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
  },
  dotOn: {
    backgroundColor: Wanderly.colors.gold,
  },
  dotOff: {
    backgroundColor: 'transparent',
  },
});
