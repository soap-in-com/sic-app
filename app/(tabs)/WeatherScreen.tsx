import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import MedicationsScreen from './MedicationsScreen'; // 복용약 컴포넌트
import NotificationsScreen from './NotificationsScreen'; // 필수 확인사항 컴포넌트
import TasksScreen from './TasksScreen'; // 일정 컴포넌트
import WeatherComponent from './WeatherComponent'; // 날씨 컴포넌트

const WeatherScreen: React.FC = () => {
  return (
    <SafeAreaView>
      <ScrollView>
        {/* 날씨 컴포넌트 */}
        <WeatherComponent />

        {/* 일정 컴포넌트 */}
        <TasksScreen />

        {/* 복용약 컴포넌트 */}
        <MedicationsScreen />

        {/* 필수 확인사항 컴포넌트 */}
        <NotificationsScreen />
      </ScrollView>
    </SafeAreaView>
  );
};

export default WeatherScreen;
