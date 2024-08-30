import axios from 'axios';
import React, { useState } from 'react';
import { Button, Image, Text, TextInput, View } from 'react-native';

const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
const GOOGLE_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY';

interface WeatherData {
    temp: number;
    description: string;
    icon: string;
}

export default function WeatherApp() {
    const [city, setCity] = useState<string>('');
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [currentTime, setCurrentTime] = useState<string>('');

    const handleSearch = () => {
        if (city.trim() === '') {
            alert('Please enter a city name.');
            return;
        }
        fetchPlaceDetails(city);
    };

    const fetchPlaceDetails = async (city: string) => {
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`,
                {
                    params: {
                        input: city,
                        inputtype: 'textquery',
                        fields: 'name,geometry',
                        key: GOOGLE_API_KEY,
                        language: 'en', // 결과를 영어로 받도록 설정
                    }
                }
            );

            if (response.data.candidates.length > 0) {
                const placeName = response.data.candidates[0].name;
                fetchWeatherData(placeName);
            } else {
                alert('No place found with the entered name.');
            }
        } catch (error) {
            console.error('Error fetching place details:', error);
            alert('Failed to fetch place details. Please try again.');
        }
    };

    const fetchWeatherData = async (city: string) => {
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather`,
                {
                    params: {
                        q: city,
                        units: 'metric',
                        appid: WEATHER_API_KEY,
                    }
                }
            );

            const { temp } = response.data.main;
            const description = response.data.weather[0].description;
            const icon = response.data.weather[0].icon;
            const timezoneOffset = response.data.timezone;

            setWeatherData({ temp, description, icon });

            // 현재 시간을 계산합니다.
            const localTime = new Date(new Date().getTime() + timezoneOffset * 1000);
            setCurrentTime(localTime.toLocaleTimeString());

        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please check the city name and try again.');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                placeholder="Enter city name"
                value={city}
                onChangeText={setCity}
                style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <Button title="Search" onPress={handleSearch} />
            {weatherData && (
                <View style={{ marginTop: 20 }}>
                    <Text>Temperature: {weatherData.temp}°C</Text>
                    <Text>Weather: {weatherData.description}</Text>
                    <Image
                        source={{ uri: `http://openweathermap.org/img/w/${weatherData.icon}.png` }}
                        style={{ width: 50, height: 50 }}
                    />
                    <Text>Current Time: {currentTime}</Text>
                </View>
            )}
        </View>
    );
}
