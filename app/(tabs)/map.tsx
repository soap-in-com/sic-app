import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import polyline from '@mapbox/polyline';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Callout, Circle, Marker, Polyline } from 'react-native-maps';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBQrqC_46mSrttHeTAWU6wqG6L23xjnrPQ';

interface LocationType {
  latitude: number;
  longitude: number;
}

interface NearbyPlaceType extends LocationType {
  place_id: string;
  name: string;
  type: string;
}

export default function App(): JSX.Element {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(
    null
  );
  const [mapRegion, setMapRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<LocationType>>(
    []
  );
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<NearbyPlaceType>>([]);

  // BottomSheet ref와 snapPoints 설정
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('위치 접근 권한이 거부되었습니다.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0054,
        longitudeDelta: 0.0054,
      });

      fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setLocation({ latitude, longitude });
        }
      );
    })();
  }, []);

  const fetchNearbyPlaces = async (latitude: number, longitude: number) => {
    try {
      const types = ['police', 'pharmacy', 'convenience_store'];
      const promises = types.map((type) =>
        axios.get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&type=${type}&key=${GOOGLE_MAPS_API_KEY}`
        )
      );

      const results = await Promise.all(promises);
      const places = results.flatMap((result) =>
        result.data.results.map((place: any) => ({
          place_id: place.place_id,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          name: place.name,
          type: place.types[0],
        }))
      );

      console.log('Fetched Places:', places);

      setNearbyPlaces(places.slice(0, 15));
    } catch (error) {
      console.error('주변 장소를 가져오는 중 오류 발생:', error);
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude }: { latitude: number; longitude: number } =
      event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });

    if (location) {
      fetchRoute(location.latitude, location.longitude, latitude, longitude);
    }
  };

  const fetchRoute = async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.routes.length > 0) {
        const points = response.data.routes[0].overview_polyline.points;
        const decodedPoints = polyline.decode(points);
        const routeCoords = decodedPoints.map(
          ([lat, lng]: [number, number]) => ({
            latitude: lat,
            longitude: lng,
          })
        );
        setRouteCoordinates(routeCoords);
      }
    } catch (error) {
      console.error('경로를 가져오는 중 오류 발생:', error);
    }
  };

  const handlePlacePress = (place: NearbyPlaceType) => {
    setSelectedLocation({
      latitude: place.latitude,
      longitude: place.longitude,
    });
    setMapRegion({
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.0054,
      longitudeDelta: 0.0054,
    });
  };

  const renderPlaceItem = ({ item }: { item: NearbyPlaceType }) => {
    const typeMap: { [key: string]: string } = {
      police: '경찰서',
      convenience_store: '편의점',
      pharmacy: '약국',
    };

    return (
      <TouchableOpacity onPress={() => handlePlacePress(item)}>
        <View style={styles.placeItem}>
          <Text style={styles.placeName}>{item.name}</Text>
          <Text style={styles.placeType}>
            {typeMap[item.type] || item.type}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleCenterMap = () => {
    if (location) {
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0054,
        longitudeDelta: 0.0054,
      });
      fetchNearbyPlaces(location.latitude, location.longitude);
    }
  };

  const renderMarkerIcon = (type: string) => {
    switch (type) {
      case 'police':
        return (
          <MaterialCommunityIcons
            name="police-badge"
            size={30}
            color="blue"
            style={{
              textShadowColor: 'white',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 1,
            }}
          />
        );
      case 'convenience_store':
        return (
          <MaterialIcons name="local-grocery-store" size={24} color="skyblue" />
        );
      case 'pharmacy':
        return <FontAwesome5 name="clinic-medical" size={24} color="red" />;
      default:
        return <Ionicons name="location-outline" size={24} color="black" />;
    }
  };

  const handleRegionChangeComplete = (region: any) => {
    setMapRegion(region);
    fetchNearbyPlaces(region.latitude, region.longitude);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <GooglePlacesAutocomplete
          placeholder="위치를 검색하세요"
          onPress={(data, details = null) => {
            if (details) {
              const { lat, lng }: { lat: number; lng: number } =
                details.geometry.location;
              setSelectedLocation({ latitude: lat, longitude: lng });
              setMapRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.0054,
                longitudeDelta: 0.0054,
              });
              fetchNearbyPlaces(lat, lng);
            }
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'ko',
            components: 'country:kr',
          }}
          styles={{
            container: styles.searchContainer,
            listView: styles.searchListView,
            textInput: {
              color: 'black',
            },
          }}
          textInputProps={{
            placeholderTextColor: '#4A4A4A',
          }}
          fetchDetails={true}
          onFail={(error) => console.error('Google Places API 오류:', error)}
        />

        {mapRegion && (
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={handleRegionChangeComplete}
            onPress={handleMapPress}
          >
            {location && (
              <Circle
                center={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                radius={10}
                strokeWidth={10}
                strokeColor="white"
                fillColor="blue"
              />
            )}

            {nearbyPlaces.map((place) => (
              <Marker
                key={place.place_id}
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
              >
                {renderMarkerIcon(place.type)}
                <Callout>
                  <Text>{place.name}</Text>
                </Callout>
              </Marker>
            ))}

            {selectedLocation && (
              <Marker coordinate={selectedLocation}>
                <Ionicons name="location" size={30} color="red" />
              </Marker>
            )}

            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor="blue"
            />
          </MapView>
        )}

        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={handleCenterMap}
        >
          <Ionicons name="locate" size={24} color="white" />
        </TouchableOpacity>

        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.bottomSheetTitle}>주변 장소 목록</Text>
            <FlatList
              data={nearbyPlaces}
              renderItem={renderPlaceItem}
              keyExtractor={(item) => item.place_id}
              contentContainerStyle={styles.flatListContainer}
            />
          </View>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 20,
  },
  contentContainer: {
    padding: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  flatListContainer: {
    paddingBottom: 16,
  },
  placeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeType: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  searchListView: {
    backgroundColor: 'white',
  },
});
