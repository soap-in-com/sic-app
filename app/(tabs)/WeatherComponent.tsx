import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

interface Weather {
  temp: number;
  condition: string;
  location: string;
  minTemp: number;
  maxTemp: number;
  pm10: number;
  date: string;
  dayOfWeek: string;
}

const API_KEY = '724e4827102510377b55ebc097c13897';

const WeatherComponent: React.FC = () => {
  const [weather, setWeather] = useState<Weather | null>(null);

  const holidays = [
    '2024-01-01', '2024-02-09', '2024-02-10', '2024-02-11', '2024-03-01',
    '2024-04-10', '2024-05-05', '2024-05-15', '2024-06-06', '2024-08-15',
    '2024-09-17', '2024-09-18', '2024-09-19', '2024-10-03', '2024-10-09',
    '2024-12-25', '2025-01-01', '2025-01-28', '2025-01-29', '2025-01-30',
    '2025-03-01', '2025-05-05', '2025-06-06', '2025-08-15', '2025-10-03', 
    '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08', '2025-10-09', 
    '2025-12-25', '2026-01-01', '2026-02-16', '2026-02-17', '2026-02-18', 
    '2026-03-01', '2026-03-02', '2026-05-05', '2026-06-06', '2026-08-15', 
    '2026-08-17', '2026-09-24', '2026-09-25', '2026-09-26', '2026-10-03', 
    '2026-10-05', '2026-10-09', '2026-12-25', '2027-01-01', '2027-02-06', 
    '2027-02-07', '2027-02-08', '2027-02-09', '2027-03-01', '2027-05-05', 
    '2027-05-13', '2027-06-06', '2027-08-15', '2027-08-16', '2027-09-14', 
    '2027-09-15', '2027-09-16', '2027-10-03', '2027-10-04', '2027-10-09',
    '2027-10-11', '2027-12-25', '2028-01-01', '2028-01-26', '2028-01-27', 
    '2028-01-28', '2028-03-01', '2028-05-02', '2028-05-05', '2028-06-06', 
    '2028-08-15', '2028-10-02', '2028-10-03', '2028-10-04', '2028-10-05',
    '2028-10-09', '2028-12-25', '2029-01-01', '2029-02-13', '2029-02-14',
    '2029-02-15', '2029-03-01', '2029-05-05', '2029-06-06', '2029-08-15',
    '2029-09-21', '2029-09-22', '2029-10-03', '2029-10-09', '2029-12-25',
  ];

  const isHoliday = (date: string) => holidays.includes(date);

  const getDayOfWeekColor = (day: string, date: string) => {
    if (isHoliday(date) || day === '일') {
      return 'red'; 
    } else if (day === '토') {
      return 'blue'; 
    } else {
      return 'black'; 
    }
  };

  const getShortDayOfWeek = (day: string) => {
    switch (day) {
      case 'Sunday': return '일';
      case 'Monday': return '월';
      case 'Tuesday': return '화';
      case 'Wednesday': return '수';
      case 'Thursday': return '목';
      case 'Friday': return '금';
      case 'Saturday': return '토';
      default: return '';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clouds': return require('../../assets/images/weather/cloudy.png');
      case 'Clear': return require('../../assets/images/weather/sunny.png');
      case 'Rain': return require('../../assets/images/weather/rainy.png');
      case 'Snow': return require('../../assets/images/weather/snowy.png');
      case 'Thunderstorm': return require('../../assets/images/weather/thunderstorm.png');
      case 'Wind': return require('../../assets/images/weather/windy.png');
      default: return null;
    }
  };

  const getPreparednessMessage = (temp: number, condition: string, pm10: number) => {
    if (temp >= 33) return { message: '날씨가 너무 더우니 외출을 자제해주세요!', icon: require('../../assets/images/temperature.png') };
    if (condition === 'Rain') return { message: '비가 오고 있으니 우산을 준비해주세요!', icon: require('../../assets/images/umbrella.png') };
    if (condition === 'Snow' || temp < 0) return { message: '날씨가 너무 추우니 옷을 따뜻하게 입어주세요!', icon: require('../../assets/images/muffler.png') };
    if (pm10 > 80) return { message: '미세먼지 농도가 나쁘니 마스크를 착용해주세요!', icon: require('../../assets/images/mask.png') };
    return { message: '', icon: null };
  };

  useEffect(() => {
    const fetchWeatherData = async (latitude: number, longitude: number, location: string) => {
      try {
        const weatherResult = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
        const temp = Math.round(weatherResult.data.main.temp);
        const condition = weatherResult.data.weather[0].main;

        const pollutionResult = await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
        const pm10 = pollutionResult.data.list[0]?.components.pm10 ?? 0;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
        const dayOfWeek = getShortDayOfWeek(date.toLocaleString('en-US', { weekday: 'long' }));

        setWeather({
          temp,
          condition,
          location,
          minTemp: temp - 5,
          maxTemp: temp + 5,
          pm10,
          date: formattedDate,
          dayOfWeek,
        });
      } catch (error) {
        Alert.alert('날씨 정보를 불러올 수 없습니다.', '잠시 후 다시 시도해주세요.');
      }
    };

    const fetchLocationAndWeather = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('위치 권한 필요', '앱을 사용하려면 위치 권한이 필요합니다.');
          return;
        }

        const locationData = await Location.getCurrentPositionAsync();
        const latitude = locationData.coords.latitude;
        const longitude = locationData.coords.longitude;

        const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        const city = reverseGeocode[0].city || reverseGeocode[0].region;
        const district = reverseGeocode[0].district;
        const formattedLocation = `${city} ${district}`;

        fetchWeatherData(latitude, longitude, formattedLocation);
      } catch (error) {
        Alert.alert('위치 정보를 불러올 수 없습니다.', '위치 정보를 다시 시도해주세요.');
      }
    };

    fetchLocationAndWeather();
  }, []);

  if (!weather) {
    return null;
  }

  const preparedness = getPreparednessMessage(weather.temp, weather.condition, weather.pm10);

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'blue';
    if (temp < 20) return 'lightblue';
    if (temp < 30) return 'black';
    if (temp < 35) return 'orange';
    return 'red';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={[styles.dateText, { fontWeight: 'bold', color: 'black' }]}>
          {weather.date} <Text style={{ color: getDayOfWeekColor(weather.dayOfWeek, weather.date) }}>({weather.dayOfWeek})</Text>
        </Text>
        <Text style={[styles.locationText, { fontWeight: 'bold' }]}>{weather.location}</Text>

        {getWeatherIcon(weather.condition) && (
          <Image source={getWeatherIcon(weather.condition)} style={styles.weatherIcon} />
        )}

        <Text style={[styles.temperatureText, { color: getTemperatureColor(weather.temp) }]}>{weather.temp}°</Text>

        <View style={styles.weatherDetailsContainer}>
          <Text style={styles.minMaxText}>
            <Text style={styles.minMaxLabel}>최저 기온: </Text>
            <Text style={{ color: 'blue', fontWeight: 'bold', fontSize: 20 }}>{weather.minTemp}°</Text>
            <Text style={styles.minMaxLabel}> 최고 기온: </Text>
            <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 20 }}>{weather.maxTemp}°</Text>
          </Text>
          <Text style={styles.minMaxText}>
            <Text style={styles.minMaxLabel}>미세먼지: </Text>
            <Text style={{ color: 'blue', fontWeight: 'bold', fontSize: 20 }}>{weather.pm10 <= 30 ? '좋음' : weather.pm10 <= 80 ? '보통' : weather.pm10 <= 150 ? '나쁨' : '매우 나쁨'}</Text>
          </Text>
        </View>

        {preparedness.message !== '' && (
          <View style={styles.preparednessContainer}>
            <Text style={styles.preparednessMessage}>{preparedness.message}</Text>
            {preparedness.icon && <Image source={preparedness.icon} style={styles.preparednessIcon} />}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

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
  cardContainer: {
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 5, 
    elevation: 3, 
    margin: 4, 
    width: '98%',
    height: 430,
    alignItems: 'center', 
  },
  weatherIcon: {
    width: 130,
    height: 130,
    marginBottom: 3,
  },
  dateText: {
    fontSize: 29,
    color: '#000',
    marginBottom: 3,
  },
  locationText: {
    fontSize: 26,
    marginBottom: 14,
    color: '#000',
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
  preparednessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  preparednessMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  preparednessIcon: {
    width: 30,
    height: 30,
    marginLeft: 4,
  
  },
});

export default WeatherComponent;
