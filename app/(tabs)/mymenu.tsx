// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import React, { useState } from 'react';
// import {
//   Alert,
//   Button,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const MenuButton = ({
//   children,
//   fontSize,
//   versionText,
//   onPress,
// }: {
//   children: string;
//   fontSize: number;
//   versionText?: string;
//   onPress?: () => void;
// }) => {
//   return (
//     <View style={styles.menuButtonContainer}>
//       <TouchableOpacity
//         style={styles.menuButton}
//         onPress={onPress}
//         accessibilityLabel={children}
//         disabled={!onPress}
//       >
//         <View style={styles.menuButtonContent}>
//           <Text style={[styles.sectionText, { fontSize }]}>{children}</Text>
//           {versionText && (
//             <Text style={[styles.versionText, { fontSize: fontSize - 2 }]}>
//               {versionText}
//             </Text>
//           )}
//         </View>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const SettingOption = ({
//   label,
//   value,
//   onValueChange,
//   fontSize,
// }: {
//   label: string;
//   value: boolean;
//   onValueChange: (value: boolean) => void;
//   fontSize: number;
// }) => {
//   return (
//     <View style={styles.settingOption}>
//       <Text style={[styles.sectionText, { fontSize }]}>{label}</Text>
//       <Switch
//         value={value}
//         onValueChange={onValueChange}
//         trackColor={{ false: '#767577', true: '#81b0ff' }}
//         thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
//         accessibilityLabel={label}
//       />
//     </View>
//   );
// };

// export default function MyMenu() {
//   const [pushNotificationsEnabled, setPushNotificationsEnabled] =
//     useState(false);
//   const [darkModeEnabled, setDarkModeEnabled] = useState(false);
//   const [fontSize, setFontSize] = useState(16); // 기본 글씨 크기
//   const [modalVisible, setModalVisible] = useState(false); // 모달 표시 상태

//   const showFontSizeModal = () => {
//     setModalVisible(true);
//   };

//   const changeFontSize = (size: number) => {
//     setFontSize(size);
//     setModalVisible(false);
//   };

//   const handleProfilePress = () => {
//     Alert.alert('로그인 버튼 클릭됨');
//   };

//   const handleAskPagePress = () => {
//     Alert.alert('문의하기 페이지로 이동합니다.');
//   };

//   const handleTermsOfServicePress = () => {
//     Alert.alert('이용약관 페이지로 이동합니다.');
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.scrollViewContent}>
//       <SafeAreaView>
//         <View style={styles.container}>
//           <TouchableOpacity
//             style={styles.myProfile}
//             onPress={handleProfilePress}
//             accessibilityLabel="프로필 사진 및 로그인 버튼"
//           >
//             <MaterialCommunityIcons
//               name="account-circle"
//               size={70}
//               color="#ccc"
//             />
//             <Text style={[styles.loginText, { fontSize }]}>
//               로그인을 해주세요.
//             </Text>
//           </TouchableOpacity>

//           {/* 앱테마 및 글꼴 설정 */}
//           <View style={styles.section}>
//             <Text style={[styles.sectionTitle, { fontSize }]}>
//               앱테마 및 글꼴 설정
//             </Text>
//             <View style={styles.boxWithBorder}>
//               <SettingOption
//                 label="다크모드"
//                 value={darkModeEnabled}
//                 onValueChange={setDarkModeEnabled}
//                 fontSize={fontSize}
//               />
//               <View style={styles.borderLine} />
//               <TouchableOpacity
//                 onPress={showFontSizeModal}
//                 accessibilityLabel="글자 크기 조정"
//                 style={styles.settingOption}
//               >
//                 <Text style={[styles.sectionText, { fontSize }]}>
//                   글자 크기 조정
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* 앱 정보 및 도움말 */}
//           <View style={styles.section}>
//             <Text style={[styles.sectionTitle, { fontSize }]}>
//               앱 정보 및 도움말
//             </Text>
//             <View style={styles.boxWithBorder}>
//               <MenuButton
//                 fontSize={fontSize}
//                 versionText="1.0.0 v"
//                 onPress={undefined}
//               >
//                 앱 버전
//               </MenuButton>
//               <View style={styles.borderLine} />
//               <MenuButton
//                 fontSize={fontSize}
//                 onPress={handleAskPagePress} // 문의하기 페이지 이동
//               >
//                 문의하기
//               </MenuButton>
//               <View style={styles.borderLine} />
//               <MenuButton
//                 fontSize={fontSize}
//                 onPress={() => Alert.alert('공지사항 버튼 눌림')}
//               >
//                 공지사항
//               </MenuButton>
//               <View style={styles.borderLine} />
//               <MenuButton
//                 fontSize={fontSize}
//                 onPress={handleTermsOfServicePress} // 이용약관 페이지 이동
//               >
//                 서비스 이용 약관
//               </MenuButton>
//             </View>
//           </View>

//           {/* 기타 */}
//           <View style={styles.section}>
//             <Text style={[styles.sectionTitle, { fontSize }]}>기타</Text>
//             <View style={styles.boxWithBorder}>
//               <MenuButton
//                 fontSize={fontSize}
//                 onPress={() => Alert.alert('계정 탈퇴 버튼 눌림')}
//               >
//                 계정 탈퇴
//               </MenuButton>
//             </View>
//           </View>
//         </View>

//         {/* 글씨 크기 조정 모달 */}
//         <Modal
//           visible={modalVisible}
//           transparent={true}
//           animationType="slide"
//           onRequestClose={() => setModalVisible(false)}
//         >
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <Text style={[styles.modalTitle, { fontSize }]}>
//                 글자 크기 조정
//               </Text>
//               <Button title="작게" onPress={() => changeFontSize(15)} />
//               <Button title="중간" onPress={() => changeFontSize(18)} />
//               <Button title="크게" onPress={() => changeFontSize(21)} />
//               <Button title="닫기" onPress={() => setModalVisible(false)} />
//             </View>
//           </View>
//         </Modal>
//       </SafeAreaView>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   scrollViewContent: {
//     flexGrow: 1,
//   },
//   myProfile: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 7,
//     gap: 10,
//     borderWidth: 2,
//     borderRadius: 130,
//     borderColor: '#cee3f6',
//     backgroundColor: '#eff5fb',
//     marginBottom: 40,
//     marginTop: 20,
//     justifyContent: 'flex-start',
//   },
//   loginText: {
//     fontSize: 16,
//     color: '#444',
//     fontWeight: '600',
//   },
//   section: {
//     width: '95%',
//     alignSelf: 'center',
//     marginBottom: 30,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 20,
//     color: '#777',
//   },
//   sectionText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#444',
//     textAlign: 'left',
//     marginLeft: 12,
//   },
//   menuButtonContainer: {
//     width: '100%',
//     marginBottom: 10,
//   },
//   menuButton: {
//     paddingVertical: 10,
//   },
//   menuButtonContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   borderLine: {
//     width: '98%',
//     height: 0.5,
//     backgroundColor: '#ccc',
//     alignSelf: 'center',
//     marginVertical: 5,
//   },
//   boxWithBorder: {
//     backgroundColor: '#f8f8f8',
//     borderRadius: 10,
//     padding: 7,
//     borderWidth: 0,
//   },
//   settingOption: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     height: 50,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 25,
//     borderRadius: 10,
//     width: '80%',
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '500',
//     marginBottom: 30,
//   },
//   versionText: {
//     color: '#888',
//     fontWeight: '400',
//     marginRight: 25,
//   },
// });

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

const data = [
  {
    id: '1',
    image: require('../../assets/images/pill.png'),
    backgroundColor: '#FFE4E1',
  },
  {
    id: '2',
    image: require('../../assets/images/weather.png'),
    backgroundColor: '#FFFFE0',
  },
  {
    id: '3',
    image: require('../../assets/images/store.png'),
    backgroundColor: '#E0FFFF',
  },
  // 필요한 데이터 추가...
];

const LoginPage = () => {
  const [isModalVisible, setModalVisible] = useState(true);
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList<any> | null>(null);
  const [index, setIndex] = useState(0);

  const closeModal = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % data.length);
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: (index + 1) % data.length,
          animated: true,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [index]);

  const renderTextBelowBox = (id: string) => {
    switch (id) {
      case '1':
        return (
          <>
            <Text style={styles.belowBoxText}>편리한</Text>
            <Text style={styles.belowBoxText}>복용약 관리</Text>
          </>
        );
      case '2':
        return (
          <>
            <Text style={styles.belowBoxText}>당신의 일정,</Text>
            <Text style={styles.belowBoxText}>한눈에</Text>
          </>
        );
      case '3':
        return (
          <>
            <Text style={styles.belowBoxText}>내 손 안에서</Text>
            <Text style={styles.belowBoxText}>편의점 찾기</Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        isVisible={isModalVisible}
        swipeDirection="down"
        onSwipeComplete={closeModal}
        style={styles.modal}
        onBackdropPress={closeModal}
      >
        <View style={styles.modalContent}>
          <View style={styles.handle} />
          <FlatList
            ref={flatListRef}
            data={data}
            renderItem={({ item }) => (
              <LinearGradient
                colors={['#FFFFFF', item.backgroundColor]} // 외부 그라데이션
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[styles.box, styles.shadowEffect]} // 그림자 효과 추가
              >
                <LinearGradient
                  colors={['#FFFFFF', item.backgroundColor]} // 내부 그라데이션
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.innerBox}
                >
                  <Image source={item.image} style={styles.image} />
                  <View style={styles.textBelowBox}>
                    {renderTextBelowBox(item.id)}
                  </View>
                </LinearGradient>
              </LinearGradient>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={320}
            decelerationRate="fast"
            bounces={false}
            onScrollToIndexFailed={() => {}}
            contentContainerStyle={{ paddingHorizontal: 30 }}
            style={{ alignSelf: 'center' }}
            snapToAlignment="center"
          />

          <View style={styles.textContainer}>
            <Text style={styles.mainText}>내 손에서 쉽고 간편하게,</Text>
            <Text style={styles.mainText}>"아웃메이트"</Text>
          </View>

          <SafeAreaView style={styles.kakaoContainer}>
            <TouchableOpacity style={styles.kakaoButton}>
              <MaterialCommunityIcons name="chat" size={24} color="black" />
              <Text style={styles.kakaoText}>카카오톡으로 시작하기</Text>
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.previewContainer}>
            <TouchableOpacity onPress={() => closeModal()}>
              <Text style={styles.previewText}>
                비회원으로 <Text style={styles.previewLink}>미리보기</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    height: height * 0.9,
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    marginTop: 10,
  },
  box: {
    width: 300,
    height: 400,
    marginHorizontal: 20,
    marginTop: 60,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 5,
  },
  shadowEffect: {
    shadowColor: '#000', // 그림자 색상
    shadowOffset: {
      width: 0,
      height: 30, // 아주 강하게 아래로 그림자 주기
    },
    shadowOpacity: 0.8, // 그림자를 더 진하게
    shadowRadius: 20, // 그림자를 넓게 퍼뜨리기
    elevation: 40, // 안드로이드 그림자 효과 더 강화
  },
  innerBox: {
    flex: 1,
    borderRadius: 20,
    padding: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  textBelowBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  belowBoxText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  mainText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 4,
  },
  kakaoContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 50,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 17,
    borderRadius: 10,
    width: '100%',
  },
  kakaoText: {
    color: 'black',
    fontSize: 17,
    marginLeft: 10,
    fontWeight: '500',
  },
  previewContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    color: '#808080',
  },
  previewLink: {
    color: '#1E90FF',
    textDecorationLine: 'underline',
  },
});

export default LoginPage;
