import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfilePage = () => {
  const [isModalVisible, setModalVisible] = useState(true);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [nickname, setNickname] = useState('');
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 모달 닫기 함수
  const closeModal = () => {
    setModalVisible(false);
  };

  // 이미지 모달 토글 함수
  const toggleImageModal = () => {
    setImageModalVisible(!isImageModalVisible);
  };

  // 닉네임 변경 함수
  const handleNicknameChange = (text: string) => {
    setNickname(text);
    setPlaceholderVisible(text === '');
  };

  // 닉네임 저장 함수
  const saveNickname = () => {
    if (nickname) {
      console.log('닉네임 저장:', nickname);
    }
    closeModal();
  };

  // 갤러리에서 이미지 선택 함수
  const pickImageFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      toggleImageModal(); // Close the image modal after selecting an image
    }
  };

  // 기본 이미지로 변경
  const resetToDefaultImage = () => {
    setProfileImage(null);
    toggleImageModal(); // Close the image modal after resetting to default image
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeModal}
        onSwipeComplete={closeModal} // 스와이프 시 모달 닫기
        swipeDirection={['down']} // 아래로 스와이프 가능
        style={styles.modal}
      >
        {isImageModalVisible ? (
          <View style={styles.imageModalContent}>
            <Text style={styles.profileSettingText}>프로필 사진 설정</Text>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.imageModalOption}
              onPress={pickImageFromGallery}
            >
              <Text style={styles.imageModalOptionText}>
                앨범에서 사진 선택
              </Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.imageModalOption}
              onPress={resetToDefaultImage}
            >
              <Text style={styles.imageModalOptionText}>
                기본 이미지로 변경
              </Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.imageModalOption}
              onPress={toggleImageModal}
            >
              <Text style={[styles.imageModalOptionText, { color: '#1E90FF' }]}>
                닫기
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.modalContent}>
            <View style={styles.handle} />
            <Text style={styles.editProfileText}>프로필 수정</Text>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={toggleImageModal}
            >
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require('../../assets/images/user.png')
                }
                style={profileImage ? styles.imageFilled : styles.imageDefault}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={styles.profileContainer}>
              <Text style={styles.nicknameLabel}>이름</Text>
              <TextInput
                style={styles.nicknameInput}
                value={nickname}
                onChangeText={handleNicknameChange}
                placeholder={placeholderVisible ? '이름을 입력해주세요.' : ''}
                placeholderTextColor="#aaa"
                maxLength={20}
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={saveNickname}>
              <Text style={styles.saveButtonText}>저장하기</Text>
            </TouchableOpacity>
          </View>
        )}
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
    marginTop: 20,
  },
  editProfileText: {
    color: '#1E90FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderColor: '#ccc',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 40,
    overflow: 'hidden',
  },
  imageFilled: {
    width: '100%',
    height: '100%',
  },
  imageDefault: {
    width: 120,
    height: 120,
  },
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  nicknameLabel: {
    alignSelf: 'flex-start',
    fontSize: 18,
    color: '#000',
    marginBottom: 15,
    marginLeft: 15,
  },
  nicknameInput: {
    width: '95%',
    height: 50,
    borderColor: '#1E90FF',
    borderWidth: 1.5,
    borderRadius: 60,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    overflow: 'hidden',
  },
  saveButton: {
    backgroundColor: '#1E90FF',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 300,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageModalContent: {
    backgroundColor: '#F3F3F3',
    padding: 30,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.24,
    marginHorizontal: 15,
    marginBottom: 35,
  },
  profileSettingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    color: '#888',
  },
  separator: {
    height: 1,
    width: '120%',
    backgroundColor: '#ccc',
  },
  imageModalOption: {
    width: '100%',
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalOptionText: {
    fontSize: 18,
    color: '#1E90FF',
    textAlign: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    marginTop: -3,
  },
});

export default ProfilePage;
