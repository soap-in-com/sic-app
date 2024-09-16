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

// export default function MyPage() {
//   const [pushNotificationsEnabled, setPushNotificationsEnabled] =
//     useState(false);
//   const [darkModeEnabled, setDarkModeEnabled] = useState(false);
//   const [fontSize, setFontSize] = useState(16);
//   const [modalVisible, setModalVisible] = useState(false);

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

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
//                 onPress={() => Alert.alert('문의하기 버튼 눌림')}
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
//                 onPress={() => Alert.alert('서비스 이용 약관 버튼 눌림')}
//               >
//                 서비스 이용 약관
//               </MenuButton>
//             </View>
//           </View>

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
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   scrollViewContent: {
//     flexGrow: 1,
//     paddingBottom: 20, // 아래쪽에 추가 패딩을 주어 검은색 배경이 보이지 않도록 설정
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

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define types for navigation stack
type RootStackParamList = {
  MyPage: undefined;
  Inquiry: undefined;
};

type MyPageNavigationProp = StackNavigationProp<RootStackParamList, 'MyPage'>;
type InquiryPageNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Inquiry'
>;

type MyPageProps = {
  navigation: MyPageNavigationProp;
};

type InquiryPageProps = {
  navigation: InquiryPageNavigationProp;
};

// 문의하기 페이지 컴포넌트
function InquiryPage({ navigation }: InquiryPageProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSendPress = () => {
    Alert.alert('문의하기 전송', `제목: ${title}\n내용: ${content}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>뒤로 가기</Text>
      </TouchableOpacity>

      <View style={styles.inquiryForm}>
        <TextInput
          style={styles.input}
          placeholder="제목을 입력하세요"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="내용을 입력하세요"
          value={content}
          onChangeText={setContent}
          multiline
        />
        <Button title="보내기" onPress={handleSendPress} />
      </View>
    </SafeAreaView>
  );
}

// MyPage 컴포넌트
function MyPage({ navigation }: MyPageProps) {
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [modalVisible, setModalVisible] = useState(false);

  const showFontSizeModal = () => {
    setModalVisible(true);
  };

  const changeFontSize = (size: number) => {
    setFontSize(size);
    setModalVisible(false);
  };

  const handleProfilePress = () => {
    Alert.alert('로그인 버튼 클릭됨');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.myProfile}
            onPress={handleProfilePress}
            accessibilityLabel="프로필 사진 및 로그인 버튼"
          >
            <MaterialCommunityIcons
              name="account-circle"
              size={70}
              color="#ccc"
            />
            <Text style={[styles.loginText, { fontSize }]}>
              로그인을 해주세요.
            </Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize }]}>
              앱테마 및 글꼴 설정
            </Text>
            <View style={styles.boxWithBorder}>
              <SettingOption
                label="다크모드"
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                fontSize={fontSize}
              />
              <View style={styles.borderLine} />
              <TouchableOpacity
                onPress={showFontSizeModal}
                accessibilityLabel="글자 크기 조정"
                style={styles.settingOption}
              >
                <Text style={[styles.sectionText, { fontSize }]}>
                  글자 크기 조정
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize }]}>
              앱 정보 및 도움말
            </Text>
            <View style={styles.boxWithBorder}>
              <MenuButton
                fontSize={fontSize}
                versionText="1.0.0 v"
                onPress={undefined}
              >
                앱 버전
              </MenuButton>
              <View style={styles.borderLine} />
              <MenuButton
                fontSize={fontSize}
                onPress={() => navigation.navigate('Inquiry')}
              >
                문의하기
              </MenuButton>
              <View style={styles.borderLine} />
              <MenuButton
                fontSize={fontSize}
                onPress={() => Alert.alert('공지사항 버튼 눌림')}
              >
                공지사항
              </MenuButton>
              <View style={styles.borderLine} />
              <MenuButton
                fontSize={fontSize}
                onPress={() => Alert.alert('서비스 이용 약관 버튼 눌림')}
              >
                서비스 이용 약관
              </MenuButton>
            </View>
          </View>
        </View>

        {/* 글씨 크기 조정 모달 */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { fontSize }]}>
                글자 크기 조정
              </Text>
              <Button title="작게" onPress={() => changeFontSize(15)} />
              <Button title="중간" onPress={() => changeFontSize(18)} />
              <Button title="크게" onPress={() => changeFontSize(21)} />
              <Button title="닫기" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

// MenuButton 컴포넌트
const MenuButton = ({
  children,
  fontSize,
  versionText,
  onPress,
}: {
  children: string;
  fontSize: number;
  versionText?: string;
  onPress?: () => void;
}) => {
  return (
    <View style={styles.menuButtonContainer}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onPress}
        accessibilityLabel={children}
        disabled={!onPress}
      >
        <View style={styles.menuButtonContent}>
          <Text style={[styles.sectionText, { fontSize }]}>{children}</Text>
          {versionText && (
            <Text style={[styles.versionText, { fontSize: fontSize - 2 }]}>
              {versionText}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

// SettingOption 컴포넌트
const SettingOption = ({
  label,
  value,
  onValueChange,
  fontSize,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  fontSize: number;
}) => {
  return (
    <View style={styles.settingOption}>
      <Text style={[styles.sectionText, { fontSize }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
        accessibilityLabel={label}
      />
    </View>
  );
};

// 스택 네비게이션 설정
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MyPage">
        <Stack.Screen
          name="MyPage"
          component={MyPage}
          options={{ title: '설정' }}
        />
        <Stack.Screen
          name="Inquiry"
          component={InquiryPage}
          options={{ title: '문의하기' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  myProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 7,
    gap: 10,
    borderWidth: 2,
    borderRadius: 130,
    borderColor: '#cee3f6',
    backgroundColor: '#eff5fb',
    marginBottom: 40,
    marginTop: 20,
    justifyContent: 'flex-start',
  },
  loginText: {
    fontSize: 16,
    color: '#444',
    fontWeight: '600',
  },
  section: {
    width: '95%',
    alignSelf: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    color: '#777',
  },
  sectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    textAlign: 'left',
    marginLeft: 12,
  },
  menuButtonContainer: {
    width: '100%',
    marginBottom: 10,
  },
  menuButton: {
    paddingVertical: 10,
  },
  menuButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  borderLine: {
    width: '98%',
    height: 0.5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginVertical: 5,
  },
  boxWithBorder: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 7,
    borderWidth: 0,
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    height: 50,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inquiryForm: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 30,
  },
  versionText: {
    color: '#888',
    fontWeight: '400',
    marginRight: 25,
  },
});
