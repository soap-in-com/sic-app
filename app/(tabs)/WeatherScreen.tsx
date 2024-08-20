import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

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

interface Todo {
  id: number;
  task: string;
  time: string;
  completed: boolean;
}

type Todos = {
  [date: string]: Todo[];
};

const API_KEY = '724e4827102510377b55ebc097c13897';
const STORAGE_KEY = '@todos';

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

  const [todos, setTodos] = useState<Todo[]>([]);
  
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(systemTheme || 'light');

  useEffect(() => {
    const fetchWeather = async () => {
      await getLocation();
    };

    const loadTodos = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        const loadedTodos = jsonValue != null ? JSON.parse(jsonValue) : {};
        const today = new Date().toISOString().split('T')[0];
        setTodos(loadedTodos[today] || []);
      } catch (e) {
        console.error('Failed to load todos from storage:', e);
      }
    };

    fetchWeather();
    loadTodos();
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleTodo = (id: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한 요청', '위치 권한이 거부되었습니다.');
        return;
      }

      const locationData = await Location.getCurrentPositionAsync();
      const latitude = locationData.coords.latitude;
      const longitude = locationData.coords.longitude;

      const weatherResult = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      const temp = roundTemperature(weatherResult.data.main.temp);
      const condition = weatherResult.data.weather[0].main;

      const forecastResult = await axios.get(
        `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      const { minTemp, maxTemp } = calculateMinMaxTemp(forecastResult.data);

      const locationResult = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );

      const address = locationResult.data.address;
      const city = address.city || address.town || address.village || address.state_district || '';
      const country = '대한민국';
      const location = `${city}, ${country}`;

      const pollutionResult = await axios.get(
        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      );

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
  const umbrellaMessage = weather.condition.includes('Rain') ? '우산을 챙기세요! ☔' : '';
  const hatMessage = weather.temp >= 33 ? '모자를 챙기세요! 🧢' : ''; // 33도 이상일 때 문구 추가

  return (
    <SafeAreaView style={[styles.container, theme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
        {hatMessage ? <Text style={[styles.hatMessageText, theme === 'dark' ? styles.darkText : styles.lightText]}>{hatMessage}</Text> : null}
        {message ? <Text style={[styles.messageText, theme === 'dark' ? styles.darkText : styles.lightText]}>{message}</Text> : null}
        
        {/* 할 일 목록 표시 */}
        <View style={styles.todoContainer}>
          <Text style={styles.todoTitle}>오늘의 할 일</Text>
          {todos.length > 0 ? (
            todos.map(todo => (
              <TouchableOpacity key={todo.id} onPress={() => toggleTodo(todo.id)}>
                <View style={styles.todoItem}>
                  <Ionicons
                    name={todo.completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={todo.completed ? 'green' : 'grey'}
                  />
                  <Text style={styles.todoText}>
                    {todo.task} {todo.time && `- ${todo.time}`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.todoText}>오늘 할 일이 없습니다.</Text>
          )}
        </View>
      </ScrollView>

      {/* 길찾기 버튼 */}
      <TouchableOpacity style={styles.navigationButton}>
        <Ionicons name="navigate-outline" size={24} color="white" />
        <Text style={styles.navigationButtonText}>길찾기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingVertical: 20,
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
  hatMessageText: {
    fontSize: 16,
    marginVertical: 5,
    color: 'red', // 모자 문구를 빨간색으로 강조
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
  navigationButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigationButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  todoContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center', // 할 일 목록 중앙 정렬
  },
  todoTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#1e90ff',
    textAlign: 'center', // 타이틀 중앙 정렬
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    width: '100%',
  },
  todoText: {
    fontSize: 18, // 텍스트 크기를 좀 더 크게
    marginLeft: 10,
    color: '#000', // 텍스트 색상을 검정으로
  },
});

export default WeatherScreen;
