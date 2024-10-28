import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native'; // useNavigation 훅 임포트
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AskPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigation = useNavigation(); // useNavigation 훅 사용

  // 뒤로 가기 버튼을 눌렀을 때 실행될 함수
  const handleBackPress = () => {
    navigation.goBack(); // 뒤로 가기
  };

  // 문의 내용 보내기 함수
  const handleSubmit = () => {
    if (!title || !content) {
      Alert.alert('', '제목과 내용을 입력해주세요.'); // 제목과 내용을 입력하지 않았을 때 알림 표시
      return;
    }
    // 문의를 보내는 로직을 여기에 추가
    Alert.alert('', '문의가 성공적으로 전송되었습니다.'); // 전송 성공 알림
    setTitle('');
    setContent('');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 상단 바: 뒤로 가기 버튼과 가운데 정렬된 제목 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문의하기</Text>
        {/* 오른쪽 여백을 위한 빈 텍스트 컴포넌트 */}
        <Text style={{ width: 24 }}> </Text>
      </View>

      {/* 제목 입력 필드 */}
      <TextInput
        style={[styles.input, styles.inputTitle]}
        placeholder="제목을 입력해주세요."
        placeholderTextColor="#444"
        value={title}
        onChangeText={setTitle}
      />

      {/* 내용 입력 필드 */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="문의 내용을 입력해주세요."
        placeholderTextColor="#444"
        value={content}
        onChangeText={setContent}
        multiline={true}
      />

      {/* 보내기 버튼 */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>보내기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AskPage;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  inputTitle: {
    fontSize: 18,
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
    fontSize: 18,
  },
  submitButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
