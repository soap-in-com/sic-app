// import { Tabs } from 'expo-router';

// import { TabBarIcon } from '@/components/navigation/TabBarIcon';
// import { Colors } from '@/constants/Colors';
// import { useColorScheme } from '@/hooks/useColorScheme';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         headerShown: false,
//       }}
//     >
//       <Tabs.Screen
//         name="WeatherScreen"
//         options={{
//           title: '홈',
//           tabBarIcon: ({ color, focused }) => (
//             <TabBarIcon
//               name={focused ? 'home' : 'home-outline'}
//               color={color}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="calendar"
//         options={{
//           title: '일정',
//           tabBarIcon: ({ color, focused }) => (
//             <TabBarIcon
//               name={focused ? 'calendar-number' : 'calendar-number-outline'}
//               color={color}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="map"
//         options={{
//           title: '지도',
//           tabBarIcon: ({ color, focused }) => (
//             <TabBarIcon name={focused ? 'map' : 'map-outline'} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="MyPage"
//         options={{
//           title: '설정',
//           tabBarIcon: ({ color, focused }) => (
//             <TabBarIcon
//               name={focused ? 'settings' : 'settings-outline'}
//               color={color}
//             />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

// app/_layout.tsx
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="WeatherScreen"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '일정',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'calendar-number' : 'calendar-number-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: '지도',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'map' : 'map-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="MyPage"
        options={{
          title: '설정',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'settings' : 'settings-outline'}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
