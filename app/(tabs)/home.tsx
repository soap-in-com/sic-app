import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Weather {
  temp: number; // 현재 온도
  temp_min: number; // 최저 온도
  temp_max: number; // 최고 온도
  condition: string; // 날씨 상태 (예: "Clear", "Rain")
  location: string; // 위치 정보 (도시, 국가)
  pm10: number; // 미세먼지 수치
  pm2_5: number; // 초미세먼지 수치
  date: string; // 현재 날짜
}

interface Medication {
  id: number; // 복용약 ID
  name: string; // 복용약 이름
  time: string; // 복용 시간
}

interface Schedule {
  id: number; // 일정 ID
  title: string; // 일정 제목
  time: string; // 일정 시간
}

const API_KEY = "724e4827102510377b55ebc097c13897"; // OpenWeatherMap API 키
const MEDICATION_KEY = "@medications"; // AsyncStorage에서 복용약 데이터를 저장하는 키
const SCHEDULE_KEY = "@schedules"; // AsyncStorage에서 일정 데이터를 저장하는 키

const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  // 날씨 상태에 따라 아이콘 매핑
  Clouds: "cloud",
  Clear: "sunny",
  Snow: "snow",
  Rain: "rainy",
  Drizzle: "rainy-outline",
  Thunderstorm: "thunderstorm",
  Mist: "cloud-outline",
  Smoke: "cloud-outline",
  Haze: "cloud-outline",
  Dust: "cloud-outline",
  Fog: "cloud-outline",
  Sand: "cloud-outline",
  Ash: "cloud-outline",
  Squall: "cloud-outline",
  Tornado: "cloud-outline",
};

const WeatherScreen: React.FC = () => {
  const [weather, setWeather] = useState<Weather>({
    temp: 0,
    temp_min: 0,
    temp_max: 0,
    condition: "",
    location: "",
    pm10: 0,
    pm2_5: 0,
    date: "",
  });

  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    // 앱이 로드될 때 실행되는 함수
    const fetchWeather = async () => {
      try {
        await getLocation(); // 위치를 가져와서 날씨 데이터를 불러옴
      } catch (error) {
        Alert.alert(
          "날씨 데이터를 불러오지 못했습니다.",
          "잠시 후 다시 시도해주세요."
        );
        console.error("Weather fetch error:", error);
      }
    };

    const loadMedications = async () => {
      // 복용약 데이터를 AsyncStorage에서 불러옴
      try {
        const jsonValue = await AsyncStorage.getItem(MEDICATION_KEY);
        const loadedMedications =
          jsonValue != null ? JSON.parse(jsonValue) : {};
        const today = new Date().toISOString().split("T")[0];
        setMedications(loadedMedications[today] || []);
      } catch (e) {
        Alert.alert(
          "복용약을 불러오지 못했습니다.",
          "잠시 후 다시 시도해주세요."
        );
        console.error("Failed to load medications from storage:", e);
      }
    };

    const loadSchedules = async () => {
      // 일정을 AsyncStorage에서 불러옴
      try {
        const jsonValue = await AsyncStorage.getItem(SCHEDULE_KEY);
        const loadedSchedules = jsonValue != null ? JSON.parse(jsonValue) : {};
        const today = new Date().toISOString().split("T")[0];
        setSchedules(loadedSchedules[today] || []);
      } catch (e) {
        Alert.alert(
          "일정을 불러오지 못했습니다.",
          "잠시 후 다시 시도해주세요."
        );
        console.error("Failed to load schedules from storage:", e);
      }
    };

    fetchWeather(); // 날씨 정보 불러오기
    loadMedications(); // 복용약 정보 불러오기
    loadSchedules(); // 일정 정보 불러오기
  }, []);

  const getLocation = async () => {
    // 위치 권한 요청 및 현재 위치를 기반으로 날씨 정보 가져오기
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("위치 권한 요청", "위치 권한이 거부되었습니다.");
        return;
      }

      const locationData = await Location.getCurrentPositionAsync();
      const latitude = locationData.coords.latitude;
      const longitude = locationData.coords.longitude;

      // 현재 위치를 기반으로 날씨 정보 불러오기
      const weatherResult = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      const temp = roundTemperature(weatherResult.data.main.temp); // 온도 반올림
      const condition = weatherResult.data.weather[0].main; // 날씨 상태

      // 예보 데이터를 통해 최저/최고 온도 계산
      const forecastResult = await axios.get(
        `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      const { minTemp, maxTemp } = calculateMinMaxTemp(forecastResult.data);

      // 위치 이름 불러오기
      const locationResult = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );

      const address = locationResult.data.address;
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.state_district ||
        "";
      const country = "대한민국";
      const location = `${city}, ${country}`;

      // 대기오염 정보 불러오기
      const pollutionResult = await axios.get(
        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      );

      const pm10 = pollutionResult.data.list[0].components.pm10; // 미세먼지 농도
      const pm2_5 = pollutionResult.data.list[0].components.pm2_5; // 초미세먼지 농도

      const date = new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });

      // 상태 업데이트
      setWeather({
        temp,
        temp_min: minTemp,
        temp_max: maxTemp,
        condition,
        location,
        pm10,
        pm2_5,
        date,
      });
    } catch (error) {
      Alert.alert("위치를 찾을 수가 없습니다.", "위치를 동의해주세요!");
      console.error("Location or Weather fetch error:", error);
    }
  };

  // 온도 반올림 함수
  const roundTemperature = (temp: number) => {
    const roundedTemp = Math.floor(temp);
    if (temp - roundedTemp >= 0.5) {
      return Math.ceil(temp);
    }
    return roundedTemp;
  };

  // 예보 데이터에서 최저/최고 온도 계산
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

    return {
      minTemp: roundTemperature(minTemp),
      maxTemp: roundTemperature(maxTemp),
    };
  };

  // 미세먼지 농도에 따른 메시지 생성
  const getAirQualityLevel = (pm: number) => {
    if (pm <= 30) return "좋음";
    if (pm <= 80) return "보통";
    return "나쁨";
  };

  const getAirQualityMessage = (pm10: number) => {
    const pm10Level = getAirQualityLevel(pm10);
    let message = "";

    if (pm10Level === "나쁨") {
      message = "미세먼지 농도가 높습니다. 마스크를 착용하세요! 😷";
    }

    return { pm10Level, message };
  };

  // 날씨에 따른 준비물 메시지 생성
  const getWeatherPreparationMessage = (condition: string, temp: number) => {
    let preparationMessage = "";

    if (condition.includes("Rain")) {
      preparationMessage = "우산을 챙기세요! ☔";
    } else if (temp >= 35) {
      preparationMessage = "외출을 자제해주세요! ☀️";
    } else if (condition.includes("Snow")) {
      preparationMessage = "따뜻한 옷을 입으세요! 🧥";
    }

    return preparationMessage;
  };

  const { pm10Level, message } = getAirQualityMessage(weather.pm10); // 미세먼지 관련 메시지
  const preparationMessage = getWeatherPreparationMessage(
    weather.condition,
    weather.temp
  ); // 날씨 관련 메시지

  // 알림 사항 정의 (고정된 목록)
  const alerts = [
    { id: 1, task: "가스 점검하기 🔥" },
    { id: 2, task: "불끄기 확인하기 💡" },
    { id: 3, task: "병원 갈 때 주민증 챙기기 🪪" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Text style={styles.dateText}>{weather.date}</Text>
          <View style={styles.weatherContainer}>
            <Ionicons
              name={icons[weather.condition] || "alert"}
              size={100}
              color="black"
            />
            <Text style={styles.temperatureText}>{weather.temp}°C</Text>
          </View>
          <Text style={styles.minMaxText}>
            최저: {weather.temp_min}°C / 최고: {weather.temp_max}°C
          </Text>
          <Text style={styles.locationText}>{weather.location}</Text>
          <Text style={styles.pollutionText}>
            미세먼지: {weather.pm10} µg/m³ ({pm10Level})
          </Text>
          {preparationMessage ? (
            <Text style={styles.preparationMessageText}>
              {preparationMessage}
            </Text>
          ) : null}
          {message ? <Text style={styles.messageText}>{message}</Text> : null}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>알림 사항</Text>
          <FlatList
            data={alerts}
            renderItem={({ item }) => (
              <View style={styles.todoItem}>
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color="orange"
                />
                <Text style={styles.todoText}>{item.task}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>알림 사항이 없습니다.</Text>
            }
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>오늘의 복용약 💊</Text>
          <FlatList
            data={medications}
            renderItem={({ item }) => (
              <View style={styles.medicationItem}>
                <Text style={styles.medicationText}>
                  {item.name} {item.time && `- ${item.time}`}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>오늘 복용할 약이 없습니다.</Text>
            }
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>오늘의 일정 📆</Text>
          <FlatList
            data={schedules}
            renderItem={({ item }) => (
              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleText}>
                  {item.title} {item.time && `- ${item.time}`}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>오늘 일정이 없습니다.</Text>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  headerContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  dateText: {
    fontSize: 30,
    marginVertical: 5,
    color: "#000",
  },
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  temperatureText: {
    fontSize: 70,
    marginLeft: 10,
    color: "#000",
  },
  minMaxText: {
    fontSize: 30,
    marginVertical: 5,
    color: "#000",
  },
  locationText: {
    fontSize: 50,
    marginVertical: 5,
    color: "#000",
  },
  pollutionText: {
    fontSize: 30,
    marginVertical: 5,
    color: "#000",
  },
  preparationMessageText: {
    fontSize: 16,
    marginVertical: 5,
    color: "#000",
  },
  messageText: {
    fontSize: 16,
    marginVertical: 5,
    color: "#000",
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 30,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#1e90ff",
    textAlign: "center",
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    width: "100%",
  },
  todoText: {
    fontSize: 30,
    marginLeft: 10,
    color: "#000",
  },
  medicationItem: {
    marginVertical: 5,
  },
  medicationText: {
    fontSize: 20,
    color: "#000",
  },
  scheduleItem: {
    marginVertical: 5,
  },
  scheduleText: {
    fontSize: 20,
    color: "#000",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
  },
});

export default WeatherScreen;
