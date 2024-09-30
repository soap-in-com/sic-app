import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { KakaoOAuthToken, login } from '@react-native-seoul/kakao-login';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';


const data = [
  { id: '1', image: require('../../assets/images/pill.png'), backgroundColor: '#FFE4E1' },
  { id: '2', image: require('../../assets/images/weather.png'), backgroundColor: '#FFFFE0' },
  { id: '3', image: require('../../assets/images/store.png'), backgroundColor: '#E0FFFF' },
  { id: '4', image: require('../../assets/images/pill.png'), backgroundColor: '#FFE4E1' },
  { id: '5', image: require('../../assets/images/weather.png'), backgroundColor: '#FFFFE0' },
  { id: '6', image: require('../../assets/images/store.png'), backgroundColor: '#E0FFFF' },
  { id: '7', image: require('../../assets/images/pill.png'), backgroundColor: '#FFE4E1' },
  { id: '8', image: require('../../assets/images/weather.png'), backgroundColor: '#FFFFE0' },
  { id: '9', image: require('../../assets/images/store.png'), backgroundColor: '#E0FFFF' },
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
        flatListRef.current.scrollToIndex({ index: (index + 1) % data.length, animated: true });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [index]);

  const renderTextBelowBox = (id: string) => {
    switch (id) {
      case '1':
      case '4':
      case '7':
        return (
          <>
            <Text style={styles.belowBoxText}>편리한</Text>
            <Text style={styles.belowBoxText}>복용약 관리</Text>
          </>
        );
      case '2':
      case '5':
      case '8':
        return (
          <>
            <Text style={styles.belowBoxText}>당신의 일정,</Text>
            <Text style={styles.belowBoxText}>한눈에</Text>
          </>
        );
      case '3':
      case '6':
      case '9':
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

  const handleKakaoLogin = async () => {
    try {
      const token: KakaoOAuthToken = await login();
      console.log('Kakao Login Success:', token);
      // 토큰을 사용하여 로그인 후 처리 로직 추가
      // 예: navigation.navigate('MainPage');
    } catch (error) {
      console.error('Kakao Login Failed:', error);
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
              <View style={styles.box}>
                <LinearGradient
                  colors={['#FFFFFF', item.backgroundColor]} // 그라데이션 색상
                  start={{ x: 0, y: 0 }} // 왼쪽 위
                  end={{ x: 1, y: 1 }} // 오른쪽 아래
                  style={styles.gradient}
                >
                  <Image
                    source={item.image}
                    style={styles.image as any} // 타입 문제 해결
                  />
                  <View style={styles.textBelowBox}>
                    {renderTextBelowBox(item.id)}
                  </View>
                </LinearGradient>
              </View>
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
            <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
              <MaterialCommunityIcons name="chat" size={24} color="black" />
              <Text style={styles.kakaoText}>카카오톡으로 시작하기</Text>
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.previewContainer}>
            <TouchableOpacity onPress={() => closeModal()}>
              <Text style={styles.previewText}>
                비회원으로{' '}
                <Text style={styles.previewLink}>미리보기</Text>
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
    marginHorizontal: 30,
    marginTop: 60,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 15,
  },
  gradient: {
    flex: 1,
    borderRadius: 10,
  },
  image: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 60,
  },
  textBelowBox: {
    marginTop: 50,
    alignItems: 'center',
  },
  belowBoxText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
    lineHeight: 30,
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
