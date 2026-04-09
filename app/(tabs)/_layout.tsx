import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
      <View style={[styles.iconCircle, focused ? styles.iconCircleOn : styles.iconCircleOff]}>
        <IconSymbol size={21} name={name} color={focused ? '#0a0a0a' : 'rgba(255,255,255,0.86)'} />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 20);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0a0a0a',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.86)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          height: 74,
          margin: 0,
          padding: 0,
        },
        tabBarStyle: {
          position: 'absolute',
          left: '15%',
          right: '15%',
          bottom: bottomOffset,
          height: 74,
          paddingTop: 0,
          paddingBottom: 0,
          paddingHorizontal: 0,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          overflow: 'hidden',
          backgroundColor: 'rgba(17,17,17,0.98)',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(255,255,255,0.10)',
          borderTopWidth: 0,
          borderRadius: 999,
          shadowColor: 'rgba(0,0,0,0.45)',
          shadowOpacity: 0.22,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 12 },
          elevation: 14,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="house.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="list.bullet" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="heart.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="plan" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleOn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  iconCircleOff: {
    backgroundColor: 'transparent',
  },
});
