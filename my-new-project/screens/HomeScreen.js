import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

const icons = {
  Clouds: 'cloud',
  Clear: 'sunny',
  Snow: 'snow',
  Rain: 'rainy',
};

const HomeScreen = () => {
  const [weather, setWeather] = useState({
    temp: 0,
    condition: '',
    city: '',
    country: '',
  });

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      // 전면 및 배경 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한 요청', '위치 권한이 거부되었습니다.');
        return;
      }

      // 현재 위치 정보 얻기
      const locationData = await Location.getCurrentPositionAsync();
      const latitude = locationData.coords.latitude;
      const longitude = locationData.coords.longitude;

      const API_KEY = 'cfc258c75e1da2149c33daffd07a911d';
      const result = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      const temp = result.data.main.temp;
      const condition = result.data.weather[0].main;
      const city = result.data.name;
      const country = result.data.sys.country;

      setWeather({ temp, condition, city, country });
    } catch (error) {
      Alert.alert('위치를 찾을 수가 없습니다.', '위치를 동의해주세요!');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>온도: {weather.temp}°C</Text> 
      <Text>Condition: {weather.condition}</Text>
      <Text>Location: {weather.city}, {weather.country}</Text>
      <Ionicons name={icons[weather.condition]} size={100} color="black" />
    </View>
  );
};

export default HomeScreen;
