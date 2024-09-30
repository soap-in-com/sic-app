import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AskPage from './AskPage';
import LoginPage from './LoginPage'; // LoginPage 임포트
import MyPage from './MyPage';
import TermsOfService from './TermsOfService';

const BottomTab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Bottom Tabs 내비게이터
function BottomTabs() {
  return (
    <BottomTab.Navigator>
      <BottomTab.Screen name="MyPage" component={MyPage} />
      {/* 다른 탭 화면들 */}
    </BottomTab.Navigator>
  );
}

// 전체 내비게이터
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="TermsOfService" component={TermsOfService} />
        <Stack.Screen name="AskPage" component={AskPage} />
        <Stack.Screen name="LoginPage" component={LoginPage} /> {/* LoginPage 추가 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
