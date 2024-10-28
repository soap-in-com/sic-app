// import Ionicons from '@expo/vector-icons/Ionicons'; // Ionicons import 추가
// import BottomSheet from '@gorhom/bottom-sheet';
// import polyline from '@mapbox/polyline';
// import axios from 'axios';
// import * as Location from 'expo-location';
// import { useEffect, useMemo, useRef, useState } from 'react';
// import {
//   Alert,
//   FlatList,
//   Image,
//   Platform,
//   StyleSheet,
//   Text,
//   ToastAndroid,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import 'react-native-gesture-handler';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import 'react-native-get-random-values';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
// import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
// import { v4 as uuidv4 } from 'uuid';

// const GOOGLE_MAPS_API_KEY = 'AIzaSyBQrqC_46mSrttHeTAWU6wqG6L23xjnrPQ';
// const id = uuidv4(); // UUID를 생성합니다.
// console.log(id);

// interface LocationType {
//   latitude: number;
//   longitude: number;
// }

// interface NearbyPlaceType extends LocationType {
//   place_id: string;
//   name: string;
//   type: string;
//   distance?: number; // 거리 추가
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

//   const sheetRef = useRef<BottomSheet>(null);
//   const snapPoints = useMemo(() => ['20%', '50%', '80%'], []);

//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         console.error('위치 접근 권한이 거부되었습니다.');
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
//       const types = [
//         'police',
//         'pharmacy',
//         'convenience_store',
//         'hospital',
//         'bank',
//         'toilet',
//       ];
//       const promises = types.map((type) =>
//         axios.get(
//           `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&type=${type}&key=${GOOGLE_MAPS_API_KEY}`
//         )
//       );

//       const results = await Promise.all(promises);
//       const places = results.flatMap((result) =>
//         result.data.results.map((place: any) => {
//           const placeLocation = {
//             latitude: place.geometry.location.lat,
//             longitude: place.geometry.location.lng,
//           };

//           // 거리 계산 추가
//           const distance = calculateDistance(
//             latitude,
//             longitude,
//             placeLocation.latitude,
//             placeLocation.longitude
//           );

//           return {
//             place_id: place.place_id,
//             latitude: placeLocation.latitude,
//             longitude: placeLocation.longitude,
//             name: place.name,
//             type: place.types[0],
//             distance: distance, // 거리 추가
//           };
//         })
//       );
//       setNearbyPlaces(places.slice(0, 45));
//     } catch (error) {
//       console.error('주변 장소를 가져오는 중 오류 발생:', error);
//     }
//   };

//   // 두 지점 사이의 거리를 계산하는 함수 (미터 단위)
//   const calculateDistance = (
//     lat1: number,
//     lon1: number,
//     lat2: number,
//     lon2: number
//   ): number => {
//     const R = 6371e3; // 지구 반지름 (미터)
//     const dLat = degreesToRadians(lat2 - lat1);
//     const dLon = degreesToRadians(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(degreesToRadians(lat1)) *
//         Math.cos(degreesToRadians(lat2)) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c; // 거리 (미터)
//     return Math.round(distance); // 반올림하여 미터 단위로 반환
//   };

//   const degreesToRadians = (degrees: number) => {
//     return degrees * (Math.PI / 180);
//   };

//   const fetchRoute = async (
//     startLat: number,
//     startLng: number,
//     endLat: number,
//     endLng: number
//   ) => {
//     try {
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat},${endLng}&key=${GOOGLE_MAPS_API_KEY}`
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
//       console.error('경로를 가져오는 중 오류 발생:', error);
//     }
//   };

//   const handlePlacePress = (place: NearbyPlaceType) => {
//     setSelectedLocation({
//       latitude: place.latitude,
//       longitude: place.longitude,
//     });
//     setMapRegion({
//       latitude: place.latitude,
//       longitude: place.longitude,
//       latitudeDelta: 0.0054,
//       longitudeDelta: 0.0054,
//     });
//   };

//   const handleCenterMap = () => {
//     if (location) {
//       setMapRegion({
//         latitude: location.latitude,
//         longitude: location.longitude,
//         latitudeDelta: 0.0054,
//         longitudeDelta: 0.0054,
//       });
//     }
//   };

//   // 주변에 해당 시설이 없을 때 처리 함수
//   const handleNoNearbyPlace = () => {
//     // 현재 위치로 돌아오기
//     if (location) {
//       setMapRegion({
//         latitude: location.latitude,
//         longitude: location.longitude,
//         latitudeDelta: 0.0054,
//         longitudeDelta: 0.0054,
//       });
//     }

//     // "주변에 시설이 없습니다." 알림 띄우기
//     if (Platform.OS === 'android') {
//       ToastAndroid.show('주변에 시설이 없습니다.', ToastAndroid.SHORT);
//     } else {
//       Alert.alert('알림', '주변에 시설이 없습니다.');
//     }
//   };

//   // 경찰서 버튼을 눌렀을 때 가장 가까운 경찰서로 이동
//   const handlePoliceStationPress = () => {
//     if (nearbyPlaces.length > 0) {
//       const nearestPolice = nearbyPlaces
//         .filter((place) => place.type === 'police')
//         .reduce(
//           (prev, curr) =>
//             prev.distance && curr.distance && prev.distance < curr.distance
//               ? prev
//               : curr,
//           nearbyPlaces[0]
//         );

//       if (nearestPolice) {
//         setMapRegion({
//           latitude: nearestPolice.latitude,
//           longitude: nearestPolice.longitude,
//           latitudeDelta: 0.0054,
//           longitudeDelta: 0.0054,
//         });

//         setSelectedLocation({
//           latitude: nearestPolice.latitude,
//           longitude: nearestPolice.longitude,
//         });
//       } else {
//         handleNoNearbyPlace();
//       }
//     } else {
//       handleNoNearbyPlace();
//     }
//   };

//   // 병원 버튼을 눌렀을 때 가장 가까운 병원으로 이동
//   const handleHospitalPress = () => {
//     if (nearbyPlaces.length > 0) {
//       const nearestHospital = nearbyPlaces
//         .filter((place) => place.type === 'hospital')
//         .reduce(
//           (prev, curr) =>
//             prev.distance && curr.distance && prev.distance < curr.distance
//               ? prev
//               : curr,
//           nearbyPlaces[0]
//         );

//       if (nearestHospital) {
//         setMapRegion({
//           latitude: nearestHospital.latitude,
//           longitude: nearestHospital.longitude,
//           latitudeDelta: 0.0054,
//           longitudeDelta: 0.0054,
//         });

//         setSelectedLocation({
//           latitude: nearestHospital.latitude,
//           longitude: nearestHospital.longitude,
//         });
//       } else {
//         handleNoNearbyPlace();
//       }
//     } else {
//       handleNoNearbyPlace();
//     }
//   };

//   // 약국 버튼을 눌렀을 때 가장 가까운 병원으로 이동
//   const handlepharmacyPress = () => {
//     if (nearbyPlaces.length > 0) {
//       const nearestpharmacy = nearbyPlaces
//         .filter((place) => place.type === 'pharmacy')
//         .reduce(
//           (prev, curr) =>
//             prev.distance && curr.distance && prev.distance < curr.distance
//               ? prev
//               : curr,
//           nearbyPlaces[0]
//         );

//       if (nearestpharmacy) {
//         setMapRegion({
//           latitude: nearestpharmacy.latitude,
//           longitude: nearestpharmacy.longitude,
//           latitudeDelta: 0.0054,
//           longitudeDelta: 0.0054,
//         });

//         setSelectedLocation({
//           latitude: nearestpharmacy.latitude,
//           longitude: nearestpharmacy.longitude,
//         });
//       } else {
//         handleNoNearbyPlace();
//       }
//     } else {
//       handleNoNearbyPlace();
//     }
//   };

//   // 은행 버튼을 눌렀을 때 가장 가까운 병원으로 이동
//   const handlebankPress = () => {
//     if (nearbyPlaces.length > 0) {
//       const nearestbank = nearbyPlaces
//         .filter((place) => place.type === 'bank')
//         .reduce(
//           (prev, curr) =>
//             prev.distance && curr.distance && prev.distance < curr.distance
//               ? prev
//               : curr,
//           nearbyPlaces[0]
//         );

//       if (nearestbank) {
//         setMapRegion({
//           latitude: nearestbank.latitude,
//           longitude: nearestbank.longitude,
//           latitudeDelta: 0.0054,
//           longitudeDelta: 0.0054,
//         });

//         setSelectedLocation({
//           latitude: nearestbank.latitude,
//           longitude: nearestbank.longitude,
//         });
//       } else {
//         handleNoNearbyPlace();
//       }
//     } else {
//       handleNoNearbyPlace();
//     }
//   };

//   // 상점 버튼을 눌렀을 때 가장 가까운 병원으로 이동
//   const handlestorePress = () => {
//     if (nearbyPlaces.length > 0) {
//       const nearestsore = nearbyPlaces.reduce(
//         (prev, curr) =>
//           prev.distance && curr.distance && prev.distance < curr.distance
//             ? prev
//             : curr,
//         nearbyPlaces[0]
//       );

//       if (nearestsore) {
//         setMapRegion({
//           latitude: nearestsore.latitude,
//           longitude: nearestsore.longitude,
//           latitudeDelta: 0.0054,
//           longitudeDelta: 0.0054,
//         });

//         setSelectedLocation({
//           latitude: nearestsore.latitude,
//           longitude: nearestsore.longitude,
//         });
//       } else {
//         handleNoNearbyPlace();
//       }
//     } else {
//       handleNoNearbyPlace();
//     }
//   };

//   const getPlaceIcon = (type: string) => {
//     switch (type) {
//       case 'police':
//         return require('../../assets/images/icon/police.png');
//       case 'pharmacy':
//         return require('../../assets/images/icon/pharmacy.png');
//       case 'convenience_store':
//         return require('../../assets/images/icon/store.png');
//       case 'hospital':
//         return require('../../assets/images/icon/heart.png');
//       case 'bank':
//         return require('../../assets/images/icon/coin.png');
//       case 'toilet':
//         return require('../../assets/images/icon/toilet.png');
//       default:
//         return null;
//     }
//   };

//   const getPlaceStyle = (type: string) => {
//     switch (type) {
//       case 'police':
//         return {
//           width: 20,
//           height: 20,
//         };
//       case 'pharmacy':
//         return {
//           width: 50,
//           height: 50,
//         };
//       case 'convenience_store':
//         return {
//           width: 30,
//           height: 30,
//         };
//       case 'hospital':
//         return {
//           width: 30,
//           height: 30,
//         };
//       case 'bank':
//         return {
//           width: 30,
//           height: 30,
//         };
//       case 'toilet':
//         return {
//           width: 30,
//           height: 30,
//         };
//       default:
//         return {
//           width: 25,
//           height: 25,
//         };
//     }
//   };

//   const renderMarkerIcon = (type: string, place: NearbyPlaceType) => {
//     return (
//       <Marker
//         key={place.place_id}
//         coordinate={{
//           latitude: place.latitude,
//           longitude: place.longitude,
//         }}
//       >
//         <View>
//           <Image source={getPlaceIcon(type)} style={getPlaceStyle(type)} />
//         </View>
//       </Marker>
//     );
//   };

//   const renderPlaceItem = ({ item }: { item: NearbyPlaceType }) => {
//     return (
//       <TouchableOpacity onPress={() => handlePlacePress(item)}>
//         <View style={styles.placeItem}>
//           <Image
//             source={getPlaceIcon(item.type)}
//             style={{ width: 30, height: 30, marginRight: 10 }}
//           />
//           <Text style={styles.placeName}>{item.name}</Text>
//           <View>
//             <Text style={styles.placeDistance}>
//               현 위치에서 {item.distance}m ⭢
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <View style={styles.container}>
//         <GooglePlacesAutocomplete
//           placeholder="위치를 검색하세요"
//           onPress={(data, details = null) => {
//             if (details) {
//               const { lat, lng }: { lat: number; lng: number } =
//                 details.geometry.location;
//               setSelectedLocation({ latitude: lat, longitude: lng });
//               setMapRegion({
//                 latitude: lat,
//                 longitude: lng,
//                 latitudeDelta: 0.0054,
//                 longitudeDelta: 0.0054,
//               });
//               fetchNearbyPlaces(lat, lng);
//             }
//           }}
//           query={{
//             key: GOOGLE_MAPS_API_KEY,
//             language: 'ko',
//             components: 'country:kr',
//           }}
//           styles={{
//             container: styles.searchContainer,
//             listView: styles.searchListView,
//             textInput: {
//               color: 'black',
//             },
//           }}
//           textInputProps={{
//             placeholderTextColor: '#4A4A4A',
//           }}
//           fetchDetails={true}
//           onFail={(error) => console.error('Google Places API 오류:', error)}
//         />

//         {mapRegion && (
//           <MapView
//             style={styles.map}
//             region={mapRegion}
//             onRegionChangeComplete={(region) => setMapRegion(region)}
//             onPress={(event) => {
//               const { latitude, longitude } = event.nativeEvent.coordinate;
//               setSelectedLocation({ latitude, longitude });
//               if (location) {
//                 fetchRoute(
//                   location.latitude,
//                   location.longitude,
//                   latitude,
//                   longitude
//                 );
//               }
//             }}
//           >
//             {location && (
//               <Circle
//                 center={{
//                   latitude: location.latitude,
//                   longitude: location.longitude,
//                 }}
//                 radius={10}
//                 strokeWidth={10}
//                 strokeColor="white"
//                 fillColor="blue"
//               />
//             )}

//             {nearbyPlaces.map((place) => renderMarkerIcon(place.type, place))}

//             {selectedLocation && (
//               <Marker coordinate={selectedLocation}>
//                 <Ionicons name="location" size={30} color="red" />
//               </Marker>
//             )}

//             <Polyline
//               coordinates={routeCoordinates}
//               strokeWidth={4}
//               strokeColor="blue"
//             />
//           </MapView>
//         )}

//         <TouchableOpacity
//           style={styles.myLocationButton}
//           onPress={handleCenterMap}
//         >
//           <Image
//             source={require('../../assets/images/icon/star.png')}
//             style={styles.buttonImage}
//           />
//           <Text style={styles.rapidstar}>현재 위치</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.policeButton}
//           onPress={handlePoliceStationPress}
//         >
//           <Image
//             source={require('../../assets/images/icon/police.png')}
//             style={styles.buttonImage}
//           />
//           <Text style={styles.rapidstar}>경찰</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.heartBTN} onPress={handleHospitalPress}>
//           <Image
//             source={require('../../assets/images/icon/heart.png')}
//             style={styles.buttonImage}
//           />
//           <Text style={styles.rapidstar}>병원</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.pharmacytBTN}
//           onPress={handlepharmacyPress}
//         >
//           <Image
//             source={require('../../assets/images/icon/pharmacy.png')}
//             style={styles.buttonImage}
//           />
//           <Text style={styles.rapidstar}>약국</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.coinBTN} onPress={handlebankPress}>
//           <Image
//             source={require('../../assets/images/icon/coin.png')}
//             style={styles.buttonImage}
//           />
//           <Text style={styles.rapidstar}>은행</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.storeBTN} onPress={handlestorePress}>
//           <Image
//             source={require('../../assets/images/icon/store.png')}
//             style={styles.buttonImage}
//           />
//           <Text style={styles.rapidstar}>상점</Text>
//         </TouchableOpacity>

//         <BottomSheet
//           ref={sheetRef}
//           snapPoints={snapPoints}
//           enablePanDownToClose={false}
//         >
//           <View style={styles.contentContainer}>
//             <Text style={styles.bottomSheetTitle}>주변 장소 목록</Text>
//             <FlatList
//               data={nearbyPlaces}
//               renderItem={renderPlaceItem}
//               keyExtractor={(item) => item.place_id}
//               contentContainerStyle={styles.flatListContainer}
//             />
//           </View>
//         </BottomSheet>
//       </View>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   myLocationButton: {
//     position: 'absolute',
//     bottom: 380,
//     right: 240,
//     padding: 10,
//     borderRadius: 100,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'column',
//     zIndex: 2,
//     backgroundColor: 'white',
//   },
//   policeButton: {
//     position: 'absolute',
//     bottom: 370,
//     right: 10,
//     padding: 10,
//     borderRadius: 100,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'column',
//     zIndex: 2,
//     backgroundColor: 'white',
//   },
//   heartBTN: {
//     position: 'absolute',
//     bottom: 320,
//     right: 10,
//     padding: 10,
//     borderRadius: 100,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'column',
//     zIndex: 2,
//     backgroundColor: 'white',
//   },
//   pharmacytBTN: {
//     position: 'absolute',
//     bottom: 270,
//     right: 10,
//     padding: 10,
//     borderRadius: 100,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'column',
//     zIndex: 2,
//     backgroundColor: 'white',
//   },
//   coinBTN: {
//     position: 'absolute',
//     bottom: 220,
//     right: 10,
//     padding: 10,
//     borderRadius: 100,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'column',
//     zIndex: 2,
//     backgroundColor: 'white',
//   },
//   storeBTN: {
//     position: 'absolute',
//     bottom: 170,
//     right: 10,
//     padding: 10,
//     borderRadius: 100,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'column',
//     zIndex: 2,
//     backgroundColor: 'white',
//   },
//   contentContainer: {
//     padding: 16,
//   },
//   bottomSheetTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   flatListContainer: {
//     paddingBottom: 16,
//   },
//   placeItem: {
//     padding: 5,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   placeName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     flex: 1,
//     textAlign: 'left',
//   },
//   placeDistance: {
//     fontSize: 14,
//     color: '#666',
//   },
//   searchContainer: {
//     position: 'absolute',
//     width: '90%',
//     top: '8%',
//     alignSelf: 'center', // 가로로 중앙 정렬
//     zIndex: 1,
//   },
//   searchListView: {
//     backgroundColor: 'white',
//   },
//   rapidstar: {
//     fontSize: 14,
//     color: '#000000',
//   },
//   buttonImage: {
//     width: 25,
//     height: 25,
//   },
// });
