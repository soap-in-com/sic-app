// import {
//   FontAwesome5,
//   Ionicons,
//   MaterialCommunityIcons,
//   MaterialIcons,
// } from "@expo/vector-icons";
// import polyline from "@mapbox/polyline";
// import axios from "axios";
// import * as Location from "expo-location";
// import React, { useEffect, useState } from "react";
// import {
//   Dimensions,
//   FlatList,
//   Modal,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
// import MapView, { Callout, Circle, Marker, Polyline } from "react-native-maps";

// const GOOGLE_MAPS_API_KEY = "AIzaSyBQrqC_46mSrttHeTAWU6wqG6L23xjnrPQ";

// interface LocationType {
//   latitude: number;
//   longitude: number;
// }

// interface NearbyPlaceType extends LocationType {
//   place_id: string;
//   name: string;
//   type: string;
// }

// export default function App(): JSX.Element {
//   const [location, setLocation] = useState<LocationType | null>(null);
//   const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(
//     null
//   );
//   const [mapRegion, setMapRegion] = useState<{
//     latitude: number;
//     longitude: number;
//     latitudeDelta: number;
//     longitudeDelta: number;
//   } | null>(null);
//   const [routeCoordinates, setRouteCoordinates] = useState<Array<LocationType>>(
//     []
//   );
//   const [nearbyPlaces, setNearbyPlaces] = useState<Array<NearbyPlaceType>>([]);
//   const [modalVisible, setModalVisible] = useState(false);

//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         console.error("위치 접근 권한이 거부되었습니다.");
//         return;
//       }

//       let location = await Location.getCurrentPositionAsync({});
//       setLocation({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//       });

//       setMapRegion({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//         latitudeDelta: 0.0054,
//         longitudeDelta: 0.0054,
//       });

//       fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);

//       Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 1000,
//           distanceInterval: 1,
//         },
//         (newLocation) => {
//           const { latitude, longitude } = newLocation.coords;
//           setLocation({ latitude, longitude });
//         }
//       );
//     })();
//   }, []);

//   const fetchNearbyPlaces = async (latitude: number, longitude: number) => {
//     try {
//       const types = ["police", "pharmacy", "convenience_store"];
//       const promises = types.map((type) =>
//         axios.get(
//           `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&type=${type}&key=${GOOGLE_MAPS_API_KEY}`
//         )
//       );

//       const results = await Promise.all(promises);
//       const places = results.flatMap((result) =>
//         result.data.results.map((place: any) => ({
//           place_id: place.place_id,
//           latitude: place.geometry.location.lat,
//           longitude: place.geometry.location.lng,
//           name: place.name,
//           type: place.types[0],
//         }))
//       );

//       setNearbyPlaces(places.slice(0, 15));
//     } catch (error) {
//       console.error("주변 장소를 가져오는 중 오류 발생:", error);
//     }
//   };

//   const handleMapPress = async (event: any) => {
//     const { latitude, longitude }: { latitude: number; longitude: number } =
//       event.nativeEvent.coordinate;
//     setSelectedLocation({ latitude, longitude });

//     if (location) {
//       fetchRoute(location.latitude, location.longitude, latitude, longitude);
//     }
//   };

//   const fetchRoute = async (
//     startLat: number,
//     startLng: number,
//     endLat: number,
//     endLng: number
//   ) => {
//     try {
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat}&key=${GOOGLE_MAPS_API_KEY}`
//       );

//       if (response.data.routes.length > 0) {
//         const points = response.data.routes[0].overview_polyline.points;
//         const decodedPoints = polyline.decode(points);
//         const routeCoords = decodedPoints.map(
//           ([lat, lng]: [number, number]) => ({
//             latitude: lat,
//             longitude: lng,
//           })
//         );
//         setRouteCoordinates(routeCoords);
//       }
//     } catch (error) {
//       console.error("경로를 가져오는 중 오류 발생:", error);
//     }
//   };

//   const renderPlaceItem = ({ item }: { item: NearbyPlaceType }) => {
//     const typeMap: { [key: string]: string } = {
//       police: "경찰서",
//       convenience_store: "편의점",
//       pharmacy: "약국",
//     };

//     return (
//       <View style={styles.placeItem}>
//         <Text style={styles.placeName}>{item.name}</Text>
//         <Text style={styles.placeType}>{typeMap[item.type] || item.type}</Text>
//       </View>
//     );
//   };

//   const handleCenterMap = () => {
//     if (location) {
//       setMapRegion({
//         latitude: location.latitude,
//         longitude: location.longitude,
//         latitudeDelta: 0.0054,
//         longitudeDelta: 0.0054,
//       });
//       fetchNearbyPlaces(location.latitude, location.longitude); // 내 위치 기준으로 주변 장소 업데이트
//     }
//   };

//   const renderMarkerIcon = (type: string) => {
//     switch (type) {
//       case "police":
//         return (
//           <MaterialCommunityIcons
//             name="police-badge"
//             size={30}
//             color="blue"
//             style={{
//               textShadowColor: "white",
//               textShadowOffset: { width: 1, height: 1 },
//               textShadowRadius: 1,
//             }}
//           />
//         );
//       case "convenience_store":
//         return (
//           <MaterialIcons name="local-grocery-store" size={24} color="skyblue" />
//         );
//       case "pharmacy":
//         return <FontAwesome5 name="clinic-medical" size={24} color="red" />;
//       default:
//         return <Ionicons name="location-outline" size={24} color="black" />;
//     }
//   };

//   const handleRegionChangeComplete = (region: any) => {
//     setMapRegion(region);
//     fetchNearbyPlaces(region.latitude, region.longitude); // 지도의 중심이 변경될 때마다 주변 장소 업데이트
//   };

//   return (
//     <View style={styles.container}>
//       <GooglePlacesAutocomplete
//         placeholder="위치를 검색하세요"
//         onPress={(data, details = null) => {
//           if (details) {
//             const { lat, lng }: { lat: number; lng: number } =
//               details.geometry.location;
//             setSelectedLocation({ latitude: lat, longitude: lng });
//             setMapRegion({
//               latitude: lat,
//               longitude: lng,
//               latitudeDelta: 0.0054,
//               longitudeDelta: 0.0054,
//             });
//             fetchNearbyPlaces(lat, lng);
//           }
//         }}
//         query={{
//           key: GOOGLE_MAPS_API_KEY,
//           language: "ko",
//           components: "country:kr",
//         }}
//         styles={{
//           container: styles.searchContainer,
//           listView: styles.searchListView,
//         }}
//         fetchDetails={true}
//         onFail={(error) => console.error("Google Places API 오류:", error)}
//       />

//       {mapRegion && (
//         <MapView
//           style={styles.map}
//           region={mapRegion}
//           onRegionChangeComplete={handleRegionChangeComplete} // 지도 중심이 변경될 때마다 호출
//           onPress={handleMapPress}
//         >
//           {location && (
//             <Circle
//               center={{
//                 latitude: location.latitude,
//                 longitude: location.longitude,
//               }}
//               radius={10}
//               strokeWidth={10}
//               strokeColor="white"
//               fillColor="blue"
//             />
//           )}

//           {nearbyPlaces.map((place) => (
//             <Marker
//               key={place.place_id}
//               coordinate={{
//                 latitude: place.latitude,
//                 longitude: place.longitude,
//               }}
//             >
//               {renderMarkerIcon(place.type)}
//               <Callout>
//                 <Text>{place.name}</Text>
//               </Callout>
//             </Marker>
//           ))}

//           {selectedLocation && (
//             <Marker
//               coordinate={selectedLocation}
//               title={"선택된 위치"}
//               pinColor="blue"
//             />
//           )}
//           {routeCoordinates.length > 0 && (
//             <Polyline
//               coordinates={routeCoordinates}
//               strokeColor="blue"
//               strokeWidth={4}
//             />
//           )}
//         </MapView>
//       )}

//       <TouchableOpacity
//         style={styles.myLocationButton}
//         onPress={handleCenterMap}
//       >
//         <Ionicons name="locate" size={24} color="white" />
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.listViewButton}
//         onPress={() => setModalVisible(true)}
//       >
//         <Text style={styles.listViewButtonText}>리스트 보기</Text>
//       </TouchableOpacity>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <SafeAreaView style={styles.modalOverlay}>
//           <View style={styles.enlargedModalContent}>
//             <Text style={styles.listHeader}>주변 편의시설</Text>
//             <FlatList
//               data={nearbyPlaces}
//               renderItem={renderPlaceItem}
//               keyExtractor={(item) => item.place_id}
//               contentContainerStyle={styles.flatListContent}
//             />
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setModalVisible(false)}
//             >
//               <Text style={styles.closeButtonText}>닫기</Text>
//             </TouchableOpacity>
//           </View>
//         </SafeAreaView>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   searchContainer: {
//     flex: 0,
//     position: "absolute",
//     width: "100%",
//     zIndex: 1,
//     top: 50,
//   },
//   searchListView: {
//     backgroundColor: "white",
//   },
//   map: {
//     width: "100%",
//     height: "100%",
//   },
//   myLocationButton: {
//     position: "absolute",
//     top: 150,
//     right: 20,
//     backgroundColor: "rgba(0, 112, 255, 1)",
//     borderRadius: 20,
//     padding: 10,
//     zIndex: 2,
//   },
//   listViewButton: {
//     position: "absolute",
//     bottom: 100,
//     left: 20,
//     backgroundColor: "rgba(0, 112, 255, 1)",
//     borderRadius: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     zIndex: 2,
//   },
//   listViewButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   enlargedModalContent: {
//     width: "90%",
//     backgroundColor: "white",
//     borderRadius: 10,
//     paddingVertical: 20,
//     paddingHorizontal: 15,
//     alignItems: "center",
//     maxHeight: "80%",
//   },
//   flatListContent: {
//     flexGrow: 1,
//     justifyContent: "center",
//   },
//   placeItem: {
//     padding: 15, // 글씨 크기에 맞게 패딩을 약간 더 크게 설정
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//     width: Dimensions.get("window").width * 0.8,
//   },
//   placeName: {
//     fontSize: 20, // 글씨 크기를 더 크게 설정
//   },
//   placeType: {
//     fontSize: 18, // 글씨 크기를 더 크게 설정
//     color: "gray",
//   },
//   listHeader: {
//     fontSize: 22, // 글씨 크기를 더 크게 설정
//     fontWeight: "bold",
//     padding: 15, // 헤더의 패딩을 더 크게 설정
//     backgroundColor: "lightgray",
//     width: "100%",
//     textAlign: "center",
//   },
//   closeButton: {
//     marginTop: 20,
//     backgroundColor: "#2196F3",
//     padding: 15, // 버튼 크기에 맞게 패딩 조정
//     borderRadius: 5,
//   },
//   closeButtonText: {
//     color: "white",
//     fontSize: 18, // 글씨 크기를 더 크게 설정
//   },
// });

import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import polyline from "@mapbox/polyline";
import axios from "axios";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Callout, Circle, Marker, Polyline } from "react-native-maps";

const GOOGLE_MAPS_API_KEY = "AIzaSyBQrqC_46mSrttHeTAWU6wqG6L23xjnrPQ";

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
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("위치 접근 권한이 거부되었습니다.");
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
      const types = ["police", "pharmacy", "convenience_store"];
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

      console.log("Fetched Places:", places);

      setNearbyPlaces(places.slice(0, 15));
    } catch (error) {
      console.error("주변 장소를 가져오는 중 오류 발생:", error);
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
      console.error("경로를 가져오는 중 오류 발생:", error);
    }
  };

  const renderPlaceItem = ({ item }: { item: NearbyPlaceType }) => {
    const typeMap: { [key: string]: string } = {
      police: "경찰서",
      convenience_store: "편의점",
      pharmacy: "약국",
    };

    return (
      <View style={styles.placeItem}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeType}>{typeMap[item.type] || item.type}</Text>
      </View>
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
      fetchNearbyPlaces(location.latitude, location.longitude); // 내 위치 기준으로 주변 장소 업데이트
    }
  };

  const renderMarkerIcon = (type: string) => {
    switch (type) {
      case "police":
        return (
          <MaterialCommunityIcons
            name="police-badge"
            size={30}
            color="blue"
            style={{
              textShadowColor: "white",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 1,
            }}
          />
        );
      case "convenience_store":
        return (
          <MaterialIcons name="local-grocery-store" size={24} color="skyblue" />
        );
      case "pharmacy":
        return <FontAwesome5 name="clinic-medical" size={24} color="red" />;
      default:
        return <Ionicons name="location-outline" size={24} color="black" />;
    }
  };

  const handleRegionChangeComplete = (region: any) => {
    setMapRegion(region);
    fetchNearbyPlaces(region.latitude, region.longitude); // 지도의 중심이 변경될 때마다 주변 장소 업데이트
  };

  return (
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
          language: "ko",
          components: "country:kr",
        }}
        styles={{
          container: styles.searchContainer,
          listView: styles.searchListView,
          textInput: {
            color: "black", // 입력된 텍스트 색상
          },
        }}
        textInputProps={{
          placeholderTextColor: "#4A4A4A", // 진한 진회색으로 설정
        }}
        fetchDetails={true}
        onFail={(error) => console.error("Google Places API 오류:", error)}
      />

      {mapRegion && (
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={handleRegionChangeComplete} // 지도 중심이 변경될 때마다 호출
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
            <Marker
              coordinate={selectedLocation}
              title={"선택된 위치"}
              pinColor="blue"
            />
          )}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="blue"
              strokeWidth={4}
            />
          )}
        </MapView>
      )}

      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleCenterMap}
      >
        <Ionicons name="locate" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.listViewButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.listViewButtonText}>리스트 보기</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.enlargedModalContent}>
            <Text style={styles.listHeader}>주변 편의시설</Text>
            <FlatList
              data={nearbyPlaces}
              renderItem={renderPlaceItem}
              keyExtractor={(item) => item.place_id}
              contentContainerStyle={styles.flatListContent}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flex: 0,
    position: "absolute",
    width: "100%",
    zIndex: 1,
    top: 50,
  },
  searchListView: {
    backgroundColor: "white",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  myLocationButton: {
    position: "absolute",
    top: 150,
    right: 20,
    backgroundColor: "rgba(0, 112, 255, 1)",
    borderRadius: 20,
    padding: 10,
    zIndex: 2,
  },
  listViewButton: {
    position: "absolute",
    bottom: 100,
    left: 20,
    backgroundColor: "rgba(0, 112, 255, 1)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    zIndex: 2,
  },
  listViewButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  enlargedModalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    maxHeight: "80%",
  },
  flatListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  placeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: Dimensions.get("window").width * 0.8,
  },
  placeName: {
    fontSize: 20,
  },
  placeType: {
    fontSize: 18,
    color: "gray",
  },
  listHeader: {
    fontSize: 22,
    fontWeight: "bold",
    padding: 15,
    backgroundColor: "lightgray",
    width: "100%",
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
  },
});
