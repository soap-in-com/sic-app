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

        // weather 배열에서 상태와 설명을 모두 가져옴
        const condition = weatherResult.data.weather[0].main;
        const description = weatherResult.data.weather[0].description;

        const pollutionResult = await axios.get(
          `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        );
        const pm10 = pollutionResult.data.list[0]?.components.pm10 ?? 0;

        // 날짜와 요일 계산
        const date = new Date();
        const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
        const dayOfWeek = date.toLocaleString('ko-KR', { weekday: 'short' }); // 요일을 간략하게 표시

        setWeather({
          temp,
          temp_min,
          temp_max,
          condition: description, // 더 구체적인 날씨 설명을 사용
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

  // 날씨에 따른 아이콘 반환 함수 추가
  const getWeatherIcon = (condition: string) => {
    if (condition.includes('clear')) {
      return require('../../assets/images/weather/sunny.png'); // 맑은 날씨
    } else if (condition.includes('cloud')) {
      return require('../../assets/images/weather/cloudy.png'); // 흐린 날씨
    } else if (condition.includes('rain')) {
      return require('../../assets/images/weather/rainy.png'); // 비오는 날씨
    } else if (condition.includes('snow')) {
      return require('../../assets/images/weather/snowy.png'); // 눈 오는 날씨
    } else if (condition.includes('thunderstorm')) {
      return require('../../assets/images/weather/thunderstorm.png'); // 천둥 번개
    } else {
      return null; // 기본 이미지는 필요 없으므로 null 반환
    }
  };

  // 공휴일 및 설날, 추석 리스트
  const holidays = [
    '2024-01-01', '2024-02-09', '2024-02-10', '2024-02-11', '2024-03-01',
    '2024-04-10', '2024-05-05', '2024-05-15', '2024-06-06', '2024-08-15',
    '2024-09-17', '2024-09-18', '2024-09-19', '2024-10-03', '2024-10-09',
    '2024-12-25', '2025-01-01', '2025-01-28', '2025-01-29', '2025-01-30',
    '2025-05-05', '2025-06-06', '2025-08-15', '2025-10-03', '2025-10-09',
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

  // 온도에 따른 색상 설정
  const getTemperatureColor = (temp: number) => {
    if (temp <= 0) return 'blue';
    if (temp > 0 && temp <= 15) return 'skyblue';
    if (temp > 15 && temp <= 25) return 'black';
    if (temp > 25 && temp <= 30) return 'orange';
    return 'red'; // 31도 이상일 경우 빨간색
  };

  // 미세먼지 농도에 따른 색상 설정
  const getPm10Color = (pm10: number) => {
    if (pm10 <= 30) return 'blue';
    if (pm10 > 30 && pm10 <= 80) return 'green';
    if (pm10 > 80 && pm10 <= 150) return 'orange';
    return 'red'; // 151 이상일 경우 빨간색
  };

  // 날씨에 따른 준비물 문구 반환
  const getPreparednessMessage = (condition: string) => {
    if (condition.includes('clear')) {
      return '햇볕이 강하니 선크림을 꼭 바르세요!';
    } else if (condition.includes('cloud')) {
      return '흐린 날씨이니 우산을 챙기세요.';
    } else if (condition.includes('rain')) {
      return '비가 오니 우산을 꼭 챙기세요!';
    } else if (condition.includes('snow')) {
      return '눈이 오니 따뜻하게 입고 나가세요!';
    } else if (condition.includes('thunderstorm')) {
      return '천둥 번개가 치니 외출을 자제하세요.';
    } else {
      return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
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
        <Text style={[styles.dateText]}>
          {weather.date} <Text style={{ color: getDayOfWeekColor(weather.dayOfWeek, weather.date) }}>({weather.dayOfWeek})</Text>
        </Text>
        <Text style={styles.locationText}>
          {weather.location}
        </Text>

        {/* 날씨 상태에 따른 아이콘이 존재할 경우만 표시 */}
        {getWeatherIcon(weather.condition) && (
          <Image source={getWeatherIcon(weather.condition)} style={styles.weatherIcon} />
        )}

        <Text style={[styles.temperatureText, { color: getTemperatureColor(weather.temp) }]}>
          {weather.temp}°
        </Text>

        <View style={styles.weatherDetailsContainer}>
          <Text style={styles.minMaxText}>
            <Text style={styles.minMaxLabel}>최저 기온: </Text>
            <Text style={{ color: 'blue', fontWeight: 'bold', fontSize: 20 }}>{weather.temp_min}°</Text>{' '}
            <Text style={styles.minMaxLabel}>최고 기온: </Text>
            <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 20 }}>{weather.temp_max}°</Text>
          </Text>
          <Text style={styles.minMaxText}>
            <Text style={styles.minMaxLabel}>미세먼지: </Text>
            <Text style={{ color: getPm10Color(weather.pm10), fontWeight: 'bold', fontSize: 20 }}>
              {weather.pm10 <= 30 ? '좋음' : weather.pm10 <= 80 ? '보통' : weather.pm10 <= 150 ? '나쁨' : '매우 나쁨'}
            </Text>
          </Text>
          {weather.temp_max - weather.temp_min >= 10 && (
            <Text style={styles.warningText}>일교차가 크니 겉옷을 챙겨주세요!</Text>
          )}
          <Text style={styles.preparednessMessage}>{getPreparednessMessage(weather.condition)}</Text>
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
    fontSize: 26, // 날짜 텍스트 크기 키움
    fontWeight: 'bold', // 날짜 텍스트 두껍게
    color: '#000',
  },
  locationText: {
    fontSize: 24, // 위치 텍스트 크기
    color: '#000',
  },
  temperatureText: {
    fontSize: 72,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 20,
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
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
  preparednessMessage: {
    fontSize: 20,
    color: '#000',
    marginTop: 10,
  },
});

export default WeatherComponent;
