// import Slider from '@react-native-community/slider';
// import { useNavigation } from '@react-navigation/native';
// import React, { useEffect, useState } from 'react';
// import {
//   Image,
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
//   isDarkMode,
// }: {
//   children: string;
//   fontSize: number;
//   versionText?: string;
//   onPress?: () => void;
//   isDarkMode: boolean;
// }) => {
//   return (
//     <View style={styles.menuButtonContainer}>
//       <TouchableOpacity
//         style={styles.menuButton}
//         onPress={onPress || (() => {})}
//         accessibilityLabel={children}
//         disabled={!onPress}
//       >
//         <View style={styles.menuButtonContent}>
//           <Text
//             style={[
//               styles.sectionText,
//               { fontSize, color: isDarkMode ? '#fff' : '#444' },
//             ]}
//           >
//             {children}
//           </Text>
//           {versionText && (
//             <Text
//               style={[
//                 styles.versionText,
//                 { fontSize: fontSize - 2, color: isDarkMode ? '#aaa' : '#888' },
//               ]}
//             >
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
//   isDarkMode,
// }: {
//   label: string;
//   value: boolean;
//   onValueChange: (value: boolean) => void;
//   fontSize: number;
//   isDarkMode: boolean;
// }) => {
//   return (
//     <View style={styles.settingOption}>
//       <Text
//         style={[
//           styles.sectionText,
//           { fontSize, color: isDarkMode ? '#fff' : '#444' },
//         ]}
//       >
//         {label}
//       </Text>
//       <Switch
//         value={value}
//         onValueChange={onValueChange}
//         trackColor={{ false: '#767577', true: '#1E90FF' }}
//         thumbColor={value ? '#fff' : '#f4f3f4'}
//         accessibilityLabel={label}
//         style={styles.switch}
//       />
//     </View>
//   );
// };

// export default function MyPage() {
//   const [pushNotificationsEnabled, setPushNotificationsEnabled] =
//     useState(false);
//   const [darkModeEnabled, setDarkModeEnabled] = useState(false);
//   const [fontSize, setFontSize] = useState(25); // 기본 글자 크기 설정
//   const navigation = useNavigation();

//   useEffect(() => {
//     // 다크모드 상태가 변경될 때마다 콘솔에 로그를 찍어 확인할 수 있습니다.
//     console.log('Dark mode:', darkModeEnabled ? 'Enabled' : 'Disabled');
//   }, [darkModeEnabled]);

//   const handleProfilePress = () => {
//     navigation.navigate('LoginPage' as never);
//   };

//   const handleTermsOfServicePress = () => {
//     navigation.navigate('TermsOfService' as never);
//   };

//   const handleInquiryPress = () => {
//     navigation.navigate('AskPage' as never);
//   };

//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         { backgroundColor: darkModeEnabled ? '#333' : '#fff' },
//       ]}
//     >
//       <View style={styles.headerContainer}>
//         <Text
//           style={[
//             styles.headerText,
//             { fontSize, color: darkModeEnabled ? '#fff' : '#000' },
//           ]}
//         >
//           설정
//         </Text>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollViewContent}>
//         <View style={styles.innerContainer}>
//           <TouchableOpacity
//             style={styles.myProfile}
//             onPress={handleProfilePress}
//             accessibilityLabel="로그인 버튼"
//           >
//             <View style={styles.profileCircle}>
//               <Image
//                 source={require('../../assets/images/user.png')}
//                 style={styles.profileImage}
//                 resizeMode="contain"
//               />
//             </View>
//             <Text
//               style={[
//                 styles.loginText,
//                 {
//                   fontSize,
//                   textDecorationLine: 'underline',
//                   color: darkModeEnabled ? '#fff' : '#444',
//                 },
//               ]}
//             >
//               로그인을 해주세요.
//             </Text>
//           </TouchableOpacity>

//           <View style={styles.section}>
//             <Text
//               style={[
//                 styles.sectionTitle,
//                 {
//                   fontSize: fontSize - 2,
//                   color: darkModeEnabled ? '#aaa' : '#777',
//                 },
//               ]}
//             >
//               앱테마 및 글꼴 설정
//             </Text>
//             <View
//               style={[
//                 styles.boxWithBorder,
//                 { backgroundColor: darkModeEnabled ? '#444' : '#f8f8f8' },
//               ]}
//             >
//               <SettingOption
//                 label="다크모드"
//                 value={darkModeEnabled}
//                 onValueChange={setDarkModeEnabled}
//                 fontSize={fontSize - 4}
//                 isDarkMode={darkModeEnabled}
//               />
//               <View style={styles.borderLine} />
//               <View style={styles.settingOption}>
//                 <Text
//                   style={[
//                     styles.sectionText,
//                     {
//                       fontSize: fontSize - 4,
//                       color: darkModeEnabled ? '#fff' : '#444',
//                     },
//                   ]}
//                 >
//                   글자 크기 조정
//                 </Text>
//                 <Slider
//                   style={styles.slider}
//                   minimumValue={12}
//                   maximumValue={30}
//                   step={1}
//                   value={fontSize}
//                   onValueChange={(value) => setFontSize(value)}
//                   minimumTrackTintColor="#A1C6EA"
//                   maximumTrackTintColor="#d3d3d3"
//                   thumbTintColor="#1E90FF"
//                 />
//               </View>
//             </View>
//           </View>

//           <View style={styles.section}>
//             <Text
//               style={[
//                 styles.sectionTitle,
//                 {
//                   fontSize: fontSize - 2,
//                   color: darkModeEnabled ? '#aaa' : '#777',
//                 },
//               ]}
//             >
//               앱 정보 및 도움말
//             </Text>
//             <View
//               style={[
//                 styles.boxWithBorder,
//                 { backgroundColor: darkModeEnabled ? '#444' : '#f8f8f8' },
//               ]}
//             >
//               <MenuButton
//                 fontSize={fontSize - 4}
//                 versionText="1.0.0 v"
//                 onPress={undefined}
//                 isDarkMode={darkModeEnabled}
//               >
//                 앱 버전
//               </MenuButton>
//               <View style={styles.borderLine} />
//               <MenuButton
//                 fontSize={fontSize - 4}
//                 onPress={handleInquiryPress}
//                 isDarkMode={darkModeEnabled}
//               >
//                 문의하기
//               </MenuButton>
//               <View style={styles.borderLine} />
//               <MenuButton
//                 fontSize={fontSize - 4}
//                 onPress={handleTermsOfServicePress}
//                 isDarkMode={darkModeEnabled}
//               >
//                 서비스 이용 약관
//               </MenuButton>
//             </View>
//           </View>

//           <View style={styles.logoutContainer}>
//             <View style={styles.logoutItem}>
//               <Text
//                 style={[
//                   styles.underlineText,
//                   { color: darkModeEnabled ? '#fff' : '#777' },
//                 ]}
//               >
//                 로그아웃
//               </Text>
//             </View>
//             <View style={styles.logoutItem}>
//               <Text
//                 style={[
//                   styles.underlineText,
//                   { color: darkModeEnabled ? '#fff' : '#777' },
//                 ]}
//               >
//                 계정 탈퇴
//               </Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 8,
//   },
//   scrollViewContent: {
//     flexGrow: 1,
//     paddingBottom: 20,
//   },
//   innerContainer: {
//     padding: 15,
//   },
//   headerContainer: {
//     alignItems: 'flex-start',
//     marginBottom: 10,
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//   },
//   headerText: {
//     fontSize: 30,
//     fontWeight: '700',
//     color: '#000',
//   },
//   myProfile: {
//     alignItems: 'center',
//     padding: 10,
//     marginBottom: 30,
//     marginTop: 20,
//   },
//   profileCircle: {
//     width: 130,
//     height: 130,
//     borderRadius: 100,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     backgroundColor: 'transparent',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 50,
//     marginTop: -15,
//   },
//   profileImage: {
//     width: '75%',
//     height: '75%',
//     borderRadius: 50,
//   },
//   loginText: {
//     fontSize: 30,
//     color: '#444',
//     fontWeight: '600',
//     marginBottom: 30,
//     marginTop: -10,
//   },
//   section: {
//     width: '100%',
//     maxWidth: 500,
//     alignSelf: 'center',
//     marginBottom: 30,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 25,
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
//     paddingVertical: 8,
//   },
//   menuButtonContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   borderLine: {
//     width: '95%',
//     height: 0.5,
//     backgroundColor: '#ccc',
//     alignSelf: 'center',
//     marginVertical: 5,
//   },
//   boxWithBorder: {
//     backgroundColor: '#f8f8f8',
//     borderRadius: 8,
//     padding: 10,
//   },
//   settingOption: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     height: 45,
//   },
//   switch: {
//     transform: [{ scale: 0.95 }],
//     marginRight: 10,
//   },
//   slider: {
//     width: 150,
//     height: 30,
//     marginLeft: 12,
//     marginRight: 8,
//   },
//   versionText: {
//     color: '#888',
//   },
//   logoutContainer: {
//     marginTop: 20,
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   logoutItem: {
//     marginHorizontal: 5,
//   },
//   underlineText: {
//     textDecorationLine: 'underline',
//     color: '#777',
//     fontSize: 16,
//     marginTop: -5,
//   },
// });

// MyPage.tsx
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AskPage from '../AskPage';
import LoginPage from '../LoginPage';
import ProfilePage from '../ProfilePage';
import TermsOfService from '../TermsOfService';

const MenuButton = ({
  children,
  fontSize,
  versionText,
  onPress,
  isDarkMode,
}: {
  children: string;
  fontSize: number;
  versionText?: string;
  onPress?: () => void;
  isDarkMode: boolean;
}) => {
  return (
    <View style={styles.menuButtonContainer}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onPress || (() => {})}
        accessibilityLabel={children}
        disabled={!onPress}
      >
        <View style={styles.menuButtonContent}>
          <Text
            style={[
              styles.sectionText,
              { fontSize, color: isDarkMode ? '#fff' : '#444' },
            ]}
          >
            {children}
          </Text>
          {versionText && (
            <Text
              style={[
                styles.versionText,
                { fontSize: fontSize - 2, color: isDarkMode ? '#aaa' : '#888' },
              ]}
            >
              {versionText}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const SettingOption = ({
  label,
  value,
  onValueChange,
  fontSize,
  isDarkMode,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  fontSize: number;
  isDarkMode: boolean;
}) => {
  return (
    <View style={styles.settingOption}>
      <Text
        style={[
          styles.sectionText,
          { fontSize, color: isDarkMode ? '#fff' : '#444' },
        ]}
      >
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#1E90FF' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
        accessibilityLabel={label}
        style={styles.switch}
      />
    </View>
  );
};

export default function MyPage() {
  const [isAskPageVisible, setIsAskPageVisible] = useState(false);
  const [isLoginPageVisible, setIsLoginPageVisible] = useState(false);
  const [isProfilePageVisible, setIsProfilePageVisible] = useState(false);
  const [isTermsOfServiceVisible, setIsTermsOfServiceVisible] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [fontSize, setFontSize] = useState(25);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: darkModeEnabled ? '#333' : '#fff' },
      ]}
    >
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.headerText,
            { fontSize, color: darkModeEnabled ? '#fff' : '#000' },
          ]}
        >
          설정
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.innerContainer}>
          <TouchableOpacity
            style={styles.myProfile}
            onPress={() => setIsLoginPageVisible(true)}
            accessibilityLabel="로그인 버튼"
          >
            <View style={styles.profileCircle}>
              <Image
                source={require('../../assets/images/user.png')}
                style={styles.profileImage}
                resizeMode="contain"
              />
            </View>
            <Text
              style={[
                styles.loginText,
                {
                  fontSize,
                  textDecorationLine: 'underline',
                  color: darkModeEnabled ? '#fff' : '#444',
                },
              ]}
            >
              로그인을 해주세요.
            </Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  fontSize: fontSize - 2,
                  color: darkModeEnabled ? '#aaa' : '#777',
                },
              ]}
            >
              앱테마 및 글꼴 설정
            </Text>
            <View
              style={[
                styles.boxWithBorder,
                { backgroundColor: darkModeEnabled ? '#444' : '#f8f8f8' },
              ]}
            >
              <SettingOption
                label="다크모드"
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                fontSize={fontSize - 4}
                isDarkMode={darkModeEnabled}
              />
              <View style={styles.borderLine} />
              <View style={styles.settingOption}>
                <Text
                  style={[
                    styles.sectionText,
                    {
                      fontSize: fontSize - 4,
                      color: darkModeEnabled ? '#fff' : '#444',
                    },
                  ]}
                >
                  글자 크기 조정
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={12}
                  maximumValue={30}
                  step={1}
                  value={fontSize}
                  onValueChange={(value) => setFontSize(value)}
                  minimumTrackTintColor="#A1C6EA"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1E90FF"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  fontSize: fontSize - 2,
                  color: darkModeEnabled ? '#aaa' : '#777',
                },
              ]}
            >
              앱 정보 및 도움말
            </Text>
            <View
              style={[
                styles.boxWithBorder,
                { backgroundColor: darkModeEnabled ? '#444' : '#f8f8f8' },
              ]}
            >
              <MenuButton
                fontSize={fontSize - 4}
                versionText="1.0.0 v"
                onPress={undefined}
                isDarkMode={darkModeEnabled}
              >
                앱 버전
              </MenuButton>
              <View style={styles.borderLine} />
              <MenuButton
                fontSize={fontSize - 4}
                onPress={() => setIsAskPageVisible(true)}
                isDarkMode={darkModeEnabled}
              >
                문의하기
              </MenuButton>
              <View style={styles.borderLine} />
              <MenuButton
                fontSize={fontSize - 4}
                onPress={() => setIsTermsOfServiceVisible(true)}
                isDarkMode={darkModeEnabled}
              >
                서비스 이용 약관
              </MenuButton>
            </View>
          </View>

          <View style={styles.logoutContainer}>
            <View style={styles.logoutItem}>
              <Text
                style={[
                  styles.underlineText,
                  { color: darkModeEnabled ? '#fff' : '#777' },
                ]}
              >
                로그아웃
              </Text>
            </View>
            <View style={styles.logoutItem}>
              <Text
                style={[
                  styles.underlineText,
                  { color: darkModeEnabled ? '#fff' : '#777' },
                ]}
              >
                계정 탈퇴
              </Text>
            </View>
          </View>
        </View>

        {/* 모달 컴포넌트 */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={isAskPageVisible}
          onRequestClose={() => setIsAskPageVisible(false)}
        >
          <AskPage onClose={() => setIsAskPageVisible(false)} />
        </Modal>
        <Modal
          animationType="slide"
          transparent={false}
          visible={isLoginPageVisible}
          onRequestClose={() => setIsLoginPageVisible(false)}
        >
          <LoginPage onClose={() => setIsLoginPageVisible(false)} />
        </Modal>
        <Modal
          animationType="slide"
          transparent={false}
          visible={isProfilePageVisible}
          onRequestClose={() => setIsProfilePageVisible(false)}
        >
          <ProfilePage onClose={() => setIsProfilePageVisible(false)} />
        </Modal>
        <Modal
          animationType="slide"
          transparent={false}
          visible={isTermsOfServiceVisible}
          onRequestClose={() => setIsTermsOfServiceVisible(false)}
        >
          <TermsOfService onClose={() => setIsTermsOfServiceVisible(false)} />
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  innerContainer: {
    padding: 15,
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000',
  },
  myProfile: {
    alignItems: 'center',
    padding: 10,
    marginBottom: 30,
    marginTop: 20,
  },
  profileCircle: {
    width: 130,
    height: 130,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    marginTop: -15,
  },
  profileImage: {
    width: '75%',
    height: '75%',
    borderRadius: 50,
  },
  loginText: {
    fontSize: 30,
    color: '#444',
    fontWeight: '600',
    marginBottom: 30,
    marginTop: -10,
  },
  section: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 25,
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
    paddingVertical: 8,
  },
  menuButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  borderLine: {
    width: '95%',
    height: 0.5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginVertical: 5,
  },
  boxWithBorder: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    height: 45,
  },
  switch: {
    transform: [{ scale: 0.95 }],
    marginRight: 10,
  },
  slider: {
    width: 150,
    height: 30,
    marginLeft: 12,
    marginRight: 8,
  },
  versionText: {
    color: '#888',
  },
  logoutContainer: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutItem: {
    marginHorizontal: 5,
  },
  underlineText: {
    textDecorationLine: 'underline',
    color: '#777',
    fontSize: 16,
    marginTop: -5,
  },
});
