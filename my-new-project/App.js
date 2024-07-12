import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import CalendarScreen from './screens/CalendarScreen';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import MyPageScreen from './screens/MyPageScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="MyPage" component={MyPageScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
