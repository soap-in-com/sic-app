import axios from 'axios';
import CheckBox from 'expo-checkbox';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface Weather {
  temp: number;
  temp_min: number;
  temp_max: number;
  condition: string;
  location: string;
  pm10: number;
  date: string;
}

interface Task {
  id: number;
  title: string;
  isChecked: boolean;
  date: string;
}

interface Medication {
  id: number;
  name: string;
  isChecked: boolean;
}

interface Notification {
  id: number;
  message: string;
  isChecked: boolean;
}

const API_KEY = '724e4827102510377b55ebc097c13897';

const WeatherScreen: React.FC = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  // 로딩 시 보여줄 이미지 배열
  const images = [
    require('../../assets/images/weather/sunny.png'), // 해 이미지
    require('../../assets/images/weather/rainy.png'), // 비 이미지
    require('../../assets/images/weather/snowy.png'), // 눈 이미지
  ];

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: '병원가기', isChecked: true, date: '2024-09-30' },
    { id: 2, title: '아들과 전화', isChecked: false, date: '2024-09-30' },
    { id: 3, title: '장보기', isChecked: false, date: '2024-10-01' },
  ]);

  const [medications, setMedications] = useState<Medication[]>([
    { id: 1, name: '종합영양제', isChecked: false },
    { id: 2, name: '혈압 약', isChecked: true },
    { id: 3, name: '고지혈증 약', isChecked: false },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: '가스점검: 불을 꼭 꺼주세요!', isChecked: true },
    { id: 2, message: '병원 방문 시 주민등록증 챙기기', isChecked: false },
  ]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);

        let latitude: number;
        let longitude: number;
        let formattedLocation: string = '알 수 없음';

        if (Platform.OS === 'web') {
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;

                const reverseGeocode = await axios.get(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ko`
                );
                formattedLocation = `${reverseGeocode.data.city} ${reverseGeocode.data.locality}`;
                fetchWeatherData(latitude, longitude, formattedLocation);
              },
              (error) => {
                console.error('Error getting location in web:', error);
                Alert.alert(
                  '위치 권한 요청',
                  '위치 정보를 가져올 수 없습니다.'
                );
                setLoading(false);
              }
            );
          } else {
            Alert.alert(
              '지원되지 않음',
              '이 브라우저는 위치 정보를 지원하지 않습니다.'
            );
            setLoading(false);
          }
        } else {
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
        }
      } catch (error) {
        Alert.alert(
          '날씨 정보를 불러올 수 없습니다.',
          '잠시 후 다시 시도해주세요.'
        );
        console.error(error);
        setLoading(false);
      }
    };

    const fetchWeatherData = async (
      latitude: number,
      longitude: number,
      location: string
    ) => {
      try {
        const weatherResult = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );

        const temp = Math.round(weatherResult.data.main.temp);
        const temp_min = Math.round(weatherResult.data.main.temp_min);
        const temp_max = weatherResult.data.main.temp_max
          ? Math.round(weatherResult.data.main.temp_max)
          : 0;
        const condition = weatherResult.data.weather[0].main;

        const pollutionResult = await axios.get(
          `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        );
        const pm10 = pollutionResult.data.list[0]?.components.pm10 ?? 0;

        const date = new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        });

        setWeather({
          temp,
          temp_min,
          temp_max,
          condition,
          location,
          pm10,
          date,
        });
      } catch (error) {
        Alert.alert(
          '날씨 정보를 불러올 수 없습니다.',
          '잠시 후 다시 시도해주세요.'
        );
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    // 3초마다 이미지가 변경되도록 설정
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // 3초마다 변경

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 클리어
  }, []);

  const getAirQualityLevel = (pm10: number): string => {
    if (pm10 <= 15) {
      return '좋음';
    } else if (pm10 <= 35) {
      return '보통';
    } else if (pm10 <= 75) {
      return '나쁨';
    } else {
      return '매우 나쁨';
    }
  };

  const getAirQualityColor = (pm10: number): string => {
    if (pm10 <= 15) {
      return 'blue';
    } else if (pm10 <= 35) {
      return 'green';
    } else {
      return 'red';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clouds':
        return require('../../assets/images/weather/cloudy.png'); // 로컬 이미지 경로
      case 'Clear':
        return require('../../assets/images/weather/sunny.png'); // 로컬 이미지 경로
      case 'Rain':
        return require('../../assets/images/weather/rainy.png'); // 로컬 이미지 경로
      case 'Snow':
        return require('../../assets/images/weather/snowy.png'); // 로컬 이미지 경로
      default:
        return null; // 디폴트 이미지는 없음
    }
  };

  const getWeatherWarningMessage = (): string => {
    if (weather?.condition === 'Rain') {
      return '비가 오고 있으니 우산을 챙기세요!';
    }
    if (weather?.pm10 !== undefined && weather.pm10 > 800) {
      return '황사로 인해 미세먼지가 계속 지속될 것으로 예상됩니다. 마스크를 착용하세요!';
    }
    if (weather?.temp_max !== undefined && weather.temp_max >= 33) {
      return '온도가 너무 높으니 외출을 자제하세요!';
    }
    if (
      weather?.condition === 'Snow' &&
      weather?.temp_max !== undefined &&
      weather.temp_max <= 0
    ) {
      return '폭설이 예상됩니다. 24시간 동안 20cm 이상 쌓일 수 있으니 조심하세요!';
    }
    return '';
  };

  const toggleTaskChecked = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, isChecked: !task.isChecked } : task
      )
    );
  };

  const toggleMedicationChecked = (id: number) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, isChecked: !med.isChecked } : med
      )
    );
  };

  const toggleNotificationChecked = (id: number) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, isChecked: !notif.isChecked } : notif
      )
    );
  };

  const getPreparationMessage = (): string => {
    if (weather?.condition === 'Rain') {
      return '비가 오면 우산을 꼭 챙기세요! ☔';
    } else if (weather?.pm10 !== undefined && weather.pm10 > 75) {
      return '미세먼지가 심하면 마스크 착용을 잊지 마세요! 😷';
    } else if (weather?.temp_max !== undefined && weather.temp_max >= 33) {
      return '폭염 시 시원한 옷차림과 물을 충분히 챙기세요! 🥵';
    } else if (weather?.condition === 'Snow') {
      return '눈이 올 때는 미끄러지지 않도록 주의하세요! ❄️';
    }
    return '';
  };

  // 오늘과 내일 날짜 가져오기
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date: Date): string => {
    return `${date.getDate()}`; // 날짜만 간단하게 가져오기
  };

  const filterTasksByDate = (date: string) => {
    return tasks.filter((task) => task.date === date);
  };

  const todayDateStr = formatDate(today); // 오늘 날짜
  const tomorrowDateStr = formatDate(tomorrow); // 내일 날짜

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={images[imageIndex]} // 현재 이미지 인덱스에 따라 이미지 변경
            style={styles.weatherIcon}
          />
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
      <ScrollView>
        <View style={styles.headerContainer}>
          <Text style={styles.dateText}>{weather.date}</Text>
          <Text style={styles.locationText}>{weather.location}</Text>

          {/* 이미지 렌더링 */}
          {getWeatherIcon(weather.condition) && (
            <Image
              source={getWeatherIcon(weather.condition)} // 날씨에 따라 다른 아이콘 표시
              style={styles.weatherIcon} // 스타일 적용
            />
          )}

          <Text style={styles.temperatureText}>{weather.temp}°</Text>

          {/* 최저/최고 기온과 미세먼지 정보 */}
          <View style={styles.weatherDetailsContainer}>
            <Text style={styles.minMaxText}>
              <Text style={styles.minMaxLabel}>최저 기온: </Text>
              <Text style={{ color: 'blue', fontWeight: 'bold', fontSize: 20 }}>
                {weather.temp_min}°
              </Text>{' '}
              <Text style={styles.minMaxLabel}>최고 기온: </Text>
              <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 20 }}>
                {weather.temp_max}°
              </Text>
            </Text>
            <Text style={styles.minMaxText}>
              <Text style={styles.minMaxLabel}>미세먼지: </Text>
              <Text
                style={{
                  color: getAirQualityColor(weather.pm10),
                  fontWeight: 'bold',
                  fontSize: 20,
                }}
              >
                {getAirQualityLevel(weather.pm10)}
              </Text>
            </Text>
          </View>

          {/* 조건에 맞는 준비물 문구 */}
          {getPreparationMessage() && (
            <View style={styles.preparationContainer}>
              <Text style={styles.preparationText}>
                {getPreparationMessage()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>{getWeatherWarningMessage()}</Text>
        </View>

        <View style={styles.taskRow}>
          {/* 오늘의 일정 */}
          <View style={[styles.dateCard, styles.todayCard]}>
            <Text style={styles.sectionTitle}>
              오늘의 일정 ({todayDateStr}일)
            </Text>
            {filterTasksByDate('2024-09-30').map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <CheckBox
                  value={task.isChecked}
                  onValueChange={() => toggleTaskChecked(task.id)}
                />
                <Text
                  style={[
                    styles.taskText,
                    task.isChecked && styles.strikeThrough,
                  ]}
                >
                  {task.title}
                </Text>
              </View>
            ))}
          </View>

          {/* 내일의 일정 */}
          <View style={styles.dateCard}>
            <Text style={styles.sectionTitle}>
              내일의 일정 ({tomorrowDateStr}일)
            </Text>
            {filterTasksByDate('2024-10-01').map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <CheckBox
                  value={task.isChecked}
                  onValueChange={() => toggleTaskChecked(task.id)}
                />
                <Text
                  style={[
                    styles.taskText,
                    task.isChecked && styles.strikeThrough,
                  ]}
                >
                  {task.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>금일 복용약 💊</Text>
          {medications.map((med) => (
            <View key={med.id} style={styles.taskItem}>
              <CheckBox
                value={med.isChecked}
                onValueChange={() => toggleMedicationChecked(med.id)}
              />
              <Text
                style={[styles.taskText, med.isChecked && styles.strikeThrough]}
              >
                {med.name}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>필수 확인사항 ✅</Text>
          {notifications.map((notif) => (
            <View key={notif.id} style={styles.taskItem}>
              <CheckBox
                value={notif.isChecked}
                onValueChange={() => toggleNotificationChecked(notif.id)}
              />
              <Text
                style={[
                  styles.taskText,
                  notif.isChecked && styles.strikeThrough,
                ]}
              >
                {notif.message}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  imageContainer: {
    marginBottom: 20,
  },
  weatherIcon: {
    width: 100, // 이미지 너비
    height: 100, // 이미지 높이
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
    fontSize: 23, // 5px 키움
    color: '#000',
  },
  locationText: {
    fontSize: 29, // 5px 키움
    color: '#000',
  },
  weatherDetailsContainer: {
    marginBottom: 15,
    alignItems: 'center', // 중앙 정렬
  },
  temperatureText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ff8c00',
    marginLeft: 28, // 오른쪽으로 살짝 이동
  },
  minMaxText: {
    fontSize: 20, // 글씨 크기 키움
    fontWeight: 'bold', // 굵게 설정
    color: '#000', // 기본 글씨 색은 검정
  },
  minMaxLabel: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  warningContainer: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  warningText: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  todayCard: {
    borderColor: '#ff6347', // 테두리 색상
    borderWidth: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskText: {
    fontSize: 18,
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  preparationContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  preparationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 5,
  },
});

export default WeatherScreen;
