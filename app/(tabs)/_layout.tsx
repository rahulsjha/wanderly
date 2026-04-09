import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 58 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1C1C1E',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: {
          paddingTop: 4,
          paddingBottom: 2,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: '#E5E7EB',
          backgroundColor: '#FFFFFF',
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -2 },
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'compass' : 'compass-outline'} size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'list' : 'list-outline'} size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}


const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
