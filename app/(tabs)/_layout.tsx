import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { Wanderly } from '@/constants/wanderly-theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Wanderly.colors.primary,
        tabBarInactiveTintColor: Wanderly.colors.text,
        tabBarStyle: {
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: Wanderly.colors.background,
          borderRadius: 15,
          height: 70,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarIcon: ({ color }) => <Ionicons size={28} name="compass-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarIcon: ({ color }) => <Ionicons size={28} name="heart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarIcon: ({ color }) => <Ionicons size={28} name="document-text-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
