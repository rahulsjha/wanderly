import { Tabs } from 'expo-router';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <IconSymbol 
        size={22} 
        name={name} 
        color={focused ? '#000' : '#E5E7EB'} 
        weight={focused ? 'bold' : 'regular'}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 20);
  const screenWidth = Dimensions.get('window').width;
  const tabBarWidth = 200;
  const translateX = (screenWidth - tabBarWidth) / 2 - screenWidth / 2;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1C1C1E',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          flex: 0,
          width: 56,
          height: 64,
          paddingHorizontal: 0,
          marginHorizontal: -2,
        },
        tabBarStyle: {
          position: 'absolute',
          left: '50%',
          bottom: bottomOffset,
          height: 64,
          width: tabBarWidth,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          overflow: 'hidden',
          backgroundColor: 'rgba(28, 28, 52, 0.9)',
          borderWidth: 0,
          borderTopWidth: 0,
          borderRadius: 999,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
          transform: [{ translateX: tabBarWidth / -2 }],
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerFocused: {
    backgroundColor: '#fff',
  },
});
