import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import VoiceInputModal from './voice'; // voice.tsx에서 가져옴

interface MemoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { content: string }) => void;
  startRecording: () => Promise<void>; // 녹음 시작 함수 전달
  stopRecording: () => Promise<void>; // 녹음 중지 함수 전달
}

const MemoModal: React.FC<MemoModalProps> = ({
  visible,
  onClose,
  onSave,
  startRecording, // props로 녹음 시작 함수 받아옴
  stopRecording, // props로 녹음 중지 함수 받아옴
}) => {
  const [selectedOption, setSelectedOption] = useState<'text' | 'voice'>(
    'text'
  );
  const [contentText, setContentText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const translateY = useRef(new Animated.Value(screenHeight * 0.85)).current;

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (visible) {
      setContentText(''); // 모달이 열릴 때 필드 초기화
    }
  }, [visible]);

  // 음성 입력 모달 열기
  const toggleVoiceModal = async () => {
    setContentText(''); // 음성 입력 모달이 열릴 때마다 텍스트 초기화
    await stopRecording(); // 기존 녹음 중지
    setIsModalVisible(true); // 음성 입력 모달 열기
  };

  const handleSave = () => {
    onSave({
      content: contentText, // 저장 시 현재 텍스트를 저장
    });
    onClose(); // 모달 닫기
  };

  const handleSaveVoiceInput = async (text: string) => {
    setContentText(text); // 음성 입력 결과로 텍스트 덮어쓰기
    await stopRecording(); // 녹음 중지
    setIsModalVisible(false); // 음성 입력 완료 후 모달 닫기
  };

  if (!visible) return null; // 모달이 보이지 않으면 아무것도 렌더링하지 않음

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              height: translateY,
              position: 'absolute',
              bottom: 0,
            },
          ]}
        >
          <View style={styles.handleBar} />
          <View style={styles.content}>
            {/* 옵션 선택 */}
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedOption === 'text' && styles.selectedOption,
                ]}
                onPress={() => setSelectedOption('text')}
              >
                <View style={styles.optionContent}>
                  <Image
                    source={require('../../assets/images/text_input_icon.png')}
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionText}>텍스트 입력</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedOption === 'voice' && styles.selectedOption,
                ]}
                onPress={() => setSelectedOption('voice')}
              >
                <View style={styles.optionContent}>
                  <Image
                    source={require('../../assets/images/mike.png')}
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionText}>음성으로 입력</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 음성 입력 모달 */}
            {isModalVisible && (
              <VoiceInputModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSave={handleSaveVoiceInput}
                getVolumeLevel={() => Math.random()} // 임시로 음량 레벨 반환
              />
            )}

            <Text style={styles.labelText}>
              메모 내용 <Text style={styles.requiredText}>[필수]</Text>
            </Text>
            {selectedOption === 'text' ? (
              <TextInput
                style={[styles.activeInput, { fontSize: 30, minHeight: 400 }]} // 세로 길이 400으로 설정
                placeholder="내용 입력"
                placeholderTextColor="#aaa"
                value={contentText}
                onChangeText={setContentText}
                multiline
                returnKeyType="default"
              />
            ) : (
              <TouchableOpacity
                style={[styles.activeInput, { minHeight: 400 }]} // 세로 길이 400으로 설정
                onPress={toggleVoiceModal}
              >
                <Text
                  style={{
                    color: contentText ? 'black' : '#aaa',
                    fontSize: 30,
                  }}
                >
                  {contentText || '내용 입력'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={[styles.buttonContainer, { marginTop: -7 }]}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setContentText(''); // 취소 시 필드 초기화
                  onClose();
                }}
              >
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopRightRadius: 20,
  },
  handleBar: {
    width: 50,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  labelText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requiredText: {
    color: 'red',
    fontSize: 20,
  },
  activeInput: {
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 18,
    marginBottom: 15,
    backgroundColor: '#fff',
    textAlign: 'left',
    minHeight: 400, // 내용 입력 칸의 세로 길이 설정
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5,
    minHeight: 60,
  },
  optionContent: {
    alignItems: 'center',
  },
  optionIcon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  optionText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  selectedOption: {
    borderColor: '#007BFF',
    borderWidth: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 35,
  },
});

export default MemoModal;
