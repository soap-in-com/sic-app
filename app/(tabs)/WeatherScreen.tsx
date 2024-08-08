import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

// Weather 타입 정의
interface Weather {
  temp: number;
  temp_min: number;
  temp_max: number;
  condition: string;
  location: string;
  pm10: number;
  pm2_5: number;
  date: string;
}

// OpenWeatherMap API 키
const API_KEY = '724e4827102510377b55ebc097c13897';

// 날씨 조건에 따른 아이콘 매핑
const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  Clouds: 'cloud',
  Clear: 'sunny',
  Snow: 'snow',
  Rain: 'rainy',
  Drizzle: 'rainy-outline',
  Thunderstorm: 'thunderstorm',
  Mist: 'cloud-outline',
  Smoke: 'cloud-outline',
  Haze: 'cloud-outline',
  Dust: 'cloud-outline',
  Fog: 'cloud-outline',
  Sand: 'cloud-outline',
  Ash: 'cloud-outline',
  Squall: 'cloud-outline',
  Tornado: 'cloud-outline',
};

const WeatherScreen: React.FC = () => {
  const [weather, setWeather] = useState<Weather>({
    temp: 0,
    temp_min: 0,
    temp_max: 0,
    condition: '',
    location: '',
    pm10: 0,
    pm2_5: 0,
    date: '',
  });

  const systemTheme = useColorScheme(); // 시스템 테마 감지
  const [theme, setTheme] = useState<'light' | 'dark'>(systemTheme || 'light'); // 테마 상태 관리

  useEffect(() => {
    const fetchWeather = async () => {
      await getLocation();
    };

    fetchWeather();
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', status);
      if (status !== 'granted') {
        Alert.alert('위치 권한 요청', '위치 권한이 거부되었습니다.');
        return;
      }

      const locationData = await Location.getCurrentPositionAsync();
      console.log('Location data:', locationData);
      const latitude = locationData.coords.latitude;
      const longitude = locationData.coords.longitude;

      const weatherResult = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      console.log('Weather data:', weatherResult.data);

      const temp = roundTemperature(weatherResult.data.main.temp);
      const condition = weatherResult.data.weather[0].main;

      // 날씨 예보 데이터를 사용하여 최저/최고 온도 계산
      const forecastResult = await axios.get(
        `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      console.log('Forecast data:', forecastResult.data);

      const { minTemp, maxTemp } = calculateMinMaxTemp(forecastResult.data);

      const locationResult = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );

      console.log('Location data:', locationResult.data);

      const address = locationResult.data.address;
      const locationComponents = [
        address.city || address.town || address.village || '',
        address.suburb || address.neighbourhood || address.state_district || address.state || '',
        address.country,
      ];
      const location = locationComponents.filter(component => component).join(', ');

      const pollutionResult = await axios.get(
        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      );

      console.log('Pollution data:', pollutionResult.data);

      const pm10 = pollutionResult.data.list[0].components.pm10;
      const pm2_5 = pollutionResult.data.list[0].components.pm2_5;

      const date = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });

      setWeather({ temp, temp_min: minTemp, temp_max: maxTemp, condition, location, pm10, pm2_5, date });
    } catch (error) {
      Alert.alert('위치를 찾을 수가 없습니다.', '위치를 동의해주세요!');
      console.error(error);
    }
  };

  const roundTemperature = (temp: number) => {
    const roundedTemp = Math.floor(temp);
    if ((temp - roundedTemp) >= 0.5) {
      return Math.ceil(temp);
    }
    return roundedTemp;
  };

  const calculateMinMaxTemp = (forecastData: any) => {
    let minTemp = Number.MAX_VALUE;
    let maxTemp = Number.MIN_VALUE;

    forecastData.list.forEach((item: any) => {
      const temp = item.main.temp;
      if (temp < minTemp) {
        minTemp = temp;
      }
      if (temp > maxTemp) {
        maxTemp = temp;
      }
    });

    return { minTemp: roundTemperature(minTemp), maxTemp: roundTemperature(maxTemp) };
  };

  const getAirQualityLevel = (pm: number) => {
    if (pm <= 30) return '좋음';
    if (pm <= 80) return '보통';
    return '나쁨';
  };

  const getAirQualityMessage = (pm10: number) => {
    const pm10Level = getAirQualityLevel(pm10);
    let message = '';

    if (pm10Level === '나쁨') {
      message = '미세먼지 농도가 높습니다. 마스크를 착용하세요! 😷';
    }

    return { pm10Level, message };
  };

  const { pm10Level, message } = getAirQualityMessage(weather.pm10);

  // 비가 올 때 우산 메시지를 추가합니다.
  const umbrellaMessage = weather.condition.includes('Rain') ? '우산을 챙기세요! ☔' : '';

  return (
    <View style={[styles.container, theme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
        <Text style={theme === 'dark' ? styles.darkText : styles.lightText}>
          {theme === 'dark' ? '🌚' : '🌞'}
        </Text>
      </TouchableOpacity>
      <Text style={[styles.dateText, theme === 'dark' ? styles.darkText : styles.lightText]}>{weather.date}</Text>
      <View style={styles.weatherContainer}>
        <Ionicons name={icons[weather.condition] || 'alert'} size={100} color={theme === 'dark' ? 'white' : 'black'} />
        <Text style={[styles.temperatureText, theme === 'dark' ? styles.darkText : styles.lightText]}>{weather.temp}°C</Text>
      </View>
      <Text style={[styles.minMaxText, theme === 'dark' ? styles.darkText : styles.lightText]}>최저: {weather.temp_min}°C / 최고: {weather.temp_max}°C</Text>
      <Text style={[styles.locationText, theme === 'dark' ? styles.darkText : styles.lightText]}>{weather.location}</Text>
      <Text style={[styles.pollutionText, theme === 'dark' ? styles.darkText : styles.lightText]}>미세먼지: {weather.pm10} µg/m³ ({pm10Level})</Text>
      {umbrellaMessage ? <Text style={[styles.umbrellaMessageText, theme === 'dark' ? styles.darkText : styles.lightText]}>{umbrellaMessage}</Text> : null}
      {message ? <Text style={[styles.messageText, theme === 'dark' ? styles.darkText : styles.lightText]}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightContainer: {
    backgroundColor: '#FFF',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  dateText: {
    fontSize: 18,
    marginVertical: 5,
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#FFF',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  temperatureText: {
    fontSize: 48,
    marginLeft: 10,
  },
  minMaxText: {
    fontSize: 16,
    marginVertical: 5,
  },
  locationText: {
    fontSize: 14,
    marginVertical: 5,
  },
  pollutionText: {
    fontSize: 14,
    marginVertical: 5,
  },
  umbrellaMessageText: {
    fontSize: 16,
    marginVertical: 5,
  },
  messageText: {
    fontSize: 16,
    marginVertical: 5,
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
});

export default WeatherScreen;
