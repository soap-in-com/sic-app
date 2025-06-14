import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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

const AskPage = ({ onClose }: { onClose: () => void }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 문의 내용 보내기 함수
  const handleSubmit = () => {
    if (!title || !content) {
      Alert.alert('', '제목과 내용을 입력해주세요.');
      return;
    }
    Alert.alert('', '문의가 성공적으로 전송되었습니다.');
    setTitle('');
    setContent('');
    onClose(); // 전송 후 모달 닫기
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 상단 바: 뒤로 가기 버튼과 가운데 정렬된 제목 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문의하기</Text>
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
    // 상단바와의 간격을 위한 padding 설정
    paddingTop: Platform.OS === 'ios' ? 80 : 20,
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
