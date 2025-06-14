import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import MediandMemoScreen from "../MediandMemoScreen"; // MediandMemoScreen 컴포넌트로 교체
import TasksAndNotificationsScreen from "../TasksAndNotificationsScreen"; // 일정 및 필수 확인사항 컴포넌트 통합
import WeatherComponent from "../WeatherComponent"; // 날씨 컴포넌트

const WeatherScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  // 날씨 이미지 배열
  const images = [
    require("../../assets/images/weather/sunny.png"),
    require("../../assets/images/weather/rainy.png"),
    require("../../assets/images/weather/snowy.png"),
    require("../../assets/images/weather/windy.png"),
    require("../../assets/images/weather/thunderstorm.png"),
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

        {/* 일정 및 필수 확인사항 통합 컴포넌트 */}
        <TasksAndNotificationsScreen />

        {/* 복용약 및 메모 통합 컴포넌트 */}
        <MediandMemoScreen />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  weatherIcon: {
    width: 130,
    height: 130,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default WeatherScreen;
