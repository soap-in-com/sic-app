import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

interface Weather {
  temp: number;
  temp_min: number;
  temp_max: number;
  condition: string;
  location: string;
  pm10: number;
  date: string;
  dayOfWeek: string;
}

const API_KEY = '724e4827102510377b55ebc097c13897';

const WeatherComponent: React.FC = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  const images = [
    require('../../assets/images/weather/sunny.png'),
    require('../../assets/images/weather/rainy.png'),
    require('../../assets/images/weather/snowy.png'),
    require('../../assets/images/weather/windy.png'),
    require('../../assets/images/weather/thunderstorm.png'),
  ];

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);

        let latitude: number;
        let longitude: number;
        let formattedLocation: string = '알 수 없음';

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('위치 권한 요청', '위치 권한이 거부되었습니다.');
          setLoading(false);
          return;
        }

        const locationData = await Location.getCurrentPositionAsync();
        latitude = locationData.coords.latitude;
        longitude = locationData.coords.longitude;

        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const address = reverseGeocode[0];
        const city = address.city || address.region;
        const district = address.district;
        formattedLocation = `${city} ${district}`;

        fetchWeatherData(latitude, longitude, formattedLocation);
      } catch (error) {
        Alert.alert('날씨 정보를 불러올 수 없습니다.', '잠시 후 다시 시도해주세요.');
        console.error(error);
        setLoading(false);
      }
    };

    const fetchWeatherData = async (latitude: number, longitude: number, location: string) => {
      try {
        const weatherResult = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );

        const temp = Math.round(weatherResult.data.main.temp);
        const temp_min = Math.round(weatherResult.data.main.temp_min);
        const temp_max = weatherResult.data.main.temp_max ? Math.round(weatherResult.data.main.temp_max) : 0;
        const condition = weatherResult.data.weather[0].main;

        const pollutionResult = await axios.get(
          `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        );
        const pm10 = pollutionResult.data.list[0]?.components.pm10 ?? 0;

        // 날짜와 요일 계산
        const date = new Date();
        const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
        const dayOfWeek = date.toLocaleString('ko-KR', { weekday: 'long' }); // 요일 가져오기 (예: "일요일")

        setWeather({
          temp,
          temp_min,
          temp_max,
          condition,
          location,
          pm10,
          date: formattedDate,
          dayOfWeek,
        });
      } catch (error) {
        Alert.alert('날씨 정보를 불러올 수 없습니다.', '잠시 후 다시 시도해주세요.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 공휴일 및 설날, 추석 리스트
  const holidays = [
    '2024-01-01', '2024-02-09', '2024-02-10', '2024-02-11', '2024-03-01',
    '2024-04-10', '2024-05-05', '2024-05-15', '2024-06-06', '2024-08-15',
    '2024-09-17', '2024-09-18', '2024-09-19', '2024-10-03', '2024-10-09',
    '2024-12-25', '2025-01-01', '2025-01-28', '2025-01-29', '2025-01-30',
    '2025-05-05', '2025-06-06', '2025-08-15', '2025-10-03', '2025-10-09',
    '2026-01-01', '2026-02-16', '2026-02-17', '2026-02-18', '2026-03-01',
    '2026-05-05', '2026-06-06', '2026-08-15', '2026-10-03', '2026-10-09',
    '2026-12-25',
    '2027-01-01', '2027-02-06', '2027-02-07', '2027-02-08', '2027-03-01',
    '2027-05-05', '2027-06-06', '2027-08-15', '2027-10-03', '2027-10-09',
    '2027-12-25',
    '2028-01-01', '2028-01-26', '2028-01-27', '2028-01-28', '2028-03-01',
    '2028-05-05', '2028-06-06', '2028-08-15', '2028-10-03', '2028-10-09',
    '2028-12-25',
    '2029-01-01', '2029-02-13', '2029-02-14', '2029-02-15', '2029-03-01',
    '2029-05-05', '2029-06-06', '2029-08-15', '2029-10-03', '2029-10-09',
    '2029-12-25',
  ];

  const isHoliday = (date: string) => holidays.includes(date);

  const getDayOfWeekColor = (day: string, date: string) => {
    if (isHoliday(date) || day === '일요일') {
      return 'red'; // 공휴일 또는 일요일일 경우 빨간색
    } else if (day === '토요일') {
      return 'blue'; // 토요일일 경우 파란색
    } else {
      return 'black'; // 평일은 검은색
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clouds':
        return require('../../assets/images/weather/cloudy.png');
      case 'Clear':
        return require('../../assets/images/weather/sunny.png');
      case 'Rain':
        return require('../../assets/images/weather/rainy.png');
      case 'Snow':
        return require('../../assets/images/weather/snowy.png');
      case 'Thunderstorm':
        return require('../../assets/images/weather/thunderstorm.png');
      case 'Drizzle':
        return require('../../assets/images/weather/sunny&cloud.png');
      case 'Wind':
        return require('../../assets/images/weather/windy.png');
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.imageContainer}>
          <Image source={images[imageIndex]} style={styles.weatherIcon} />
        </View>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>날씨 정보를 불러오는 중입니다...</Text>
      </SafeAreaView>
    );
  }

  if (!weather) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>날씨 정보를 불러올 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.dateText, { color: 'black' }]}>
          {weather.date} <Text style={{ color: getDayOfWeekColor(weather.dayOfWeek, weather.date) }}>({weather.dayOfWeek})</Text>
        </Text>
        <Text style={styles.locationText}>
          <Text style={styles.boldText}>{weather.location}</Text>
        </Text>

        {getWeatherIcon(weather.condition) && (
          <Image source={getWeatherIcon(weather.condition)} style={styles.weatherIcon} />
        )}

        <Text style={styles.temperatureText}>{weather.temp}°</Text>

        <View style={styles.weatherDetailsContainer}>
          <Text style={styles.minMaxText}>
            <Text style={styles.minMaxLabel}>최저 기온: </Text>
            <Text style={{ color: 'blue', fontWeight: 'bold', fontSize: 20 }}>{weather.temp_min}°</Text>{' '}
            <Text style={styles.minMaxLabel}>최고 기온: </Text>
            <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 20 }}>{weather.temp_max}°</Text>
          </Text>
          <Text style={styles.minMaxText}>
            <Text style={styles.minMaxLabel}>미세먼지: </Text>
            <Text style={{ color: 'blue', fontWeight: 'bold', fontSize: 20 }}>좋음</Text>
          </Text>
          {weather.temp_max - weather.temp_min >= 10 && (
            <Text style={styles.warningText}>일교차가 크니 겉옷을 챙겨주세요!</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 20,
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 23,
    color: '#000',
  },
  locationText: {
    fontSize: 29,
    color: '#000',
  },
  boldText: {
    fontWeight: 'bold',
  },
  temperatureText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ff8c00',
    marginLeft: 28,
  },
  weatherDetailsContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  minMaxText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  minMaxLabel: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  warningText: {
    marginTop: 10,
    fontSize: 16,
    color: 'orange',
  },
});

export default WeatherComponent;
