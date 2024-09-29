import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import MedicationsScreen from './MedicationsScreen'; // 복용약 컴포넌트
import MemoScreen from './MemoScreen'; // 메모 컴포넌트
import NotificationsScreen from './NotificationsScreen'; // 필수 확인사항 컴포넌트
import TasksScreen from './TasksScreen'; // 일정 컴포넌트
import WeatherComponent from './WeatherComponent'; // 날씨 컴포넌트

const WeatherScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  // 날씨 이미지 배열
  const images = [
    require('../../assets/images/weather/sunny.png'),
    require('../../assets/images/weather/rainy.png'),
    require('../../assets/images/weather/snowy.png'),
    require('../../assets/images/weather/windy.png'),
    require('../../assets/images/weather/thunderstorm.png'),
  ];

  useEffect(() => {
    // 로딩 시간 동안 이미지가 바뀌는 효과
    const imageInterval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // 3초마다 이미지 변경

    // 6초 후 로딩 완료 상태로 변경
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 6000); // 로딩 화면을 6초간 표시

    return () => {
      clearInterval(imageInterval); // 컴포넌트 언마운트 시 이미지 타이머 클리어
      clearTimeout(timeout); // 타이머 클리어
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        {/* 로딩 중일 때 날씨 이미지와 로딩 인디케이터 */}
        <Image source={images[imageIndex]} style={styles.weatherIcon} />
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>날씨를 불러오는 중입니다...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <ScrollView>
        {/* 날씨 컴포넌트 */}
        <WeatherComponent />

        {/* 일정 컴포넌트 */}
        <TasksScreen />

        <View style={styles.sideBySideContainer}>
          {/* 복용약 컴포넌트 */}
          <MedicationsScreen />

          {/* 메모 컴포넌트 */}
          <MemoScreen />
        </View>

        {/* 필수 확인사항 컴포넌트 */}
        <NotificationsScreen />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  sideBySideContainer: {
    flexDirection: 'row', // 복용약과 메모를 가로로 배치
    justifyContent: 'space-between', // 양쪽에 배치
    paddingHorizontal: 10, // 양쪽에 여백 추가
  },
});

export default WeatherScreen;
