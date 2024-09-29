import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import VoiceInputModal from './voice';

interface ScheduleAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; date: string; time: string }) => void;
}

const ScheduleAddModal: React.FC<ScheduleAddModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [selectedOption, setSelectedOption] = useState<'text' | 'voice'>(
    'text'
  );
  const [inputText, setInputText] = useState('');
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalField, setModalField] = useState<'name' | 'time' | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const translateY = useRef(new Animated.Value(screenHeight * 0.85)).current;

  // 모달이 닫힐 때 상태 초기화 함수
  const resetFields = () => {
    setInputText('');
    setDateText('');
    setTimeText('');
  };

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (visible) {
      resetFields(); // 모달이 열릴 때 필드 초기화
    }
  }, [visible]);

  const toggleVoiceModal = (field: 'name' | 'time') => {
    setModalField(field);
    setIsModalVisible(true);
  };

  const handleSave = () => {
    onSave({
      name: inputText,
      date: dateText,
      time: timeText,
    });
    onClose(); // 모달 닫기
  };

  const handleSaveVoiceInput = (text: string) => {
    if (modalField === 'name') {
      setInputText(text);
    } else if (modalField === 'time') {
      setTimeText(text);
    }
    setIsModalVisible(false); // 음성 입력 완료 후 모달 닫기
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    setDateText(formattedDate);
    hideDatePicker();
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirmTime = (time: Date) => {
    const formattedTime = `${time.getHours().toString().padStart(2, '0')}:${time
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    setTimeText(formattedTime);
    hideTimePicker();
  };

  if (!visible) return null; // 모달이 보이지 않으면 아무것도 렌더링하지 않음

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View>
        <SafeAreaView style={styles.safeArea}>
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
              {/* 선택 옵션: 직접 입력 vs 음성 입력 */}
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
                      source={require('../../assets/images/text_input_icon.png')} // 텍스트 입력 아이콘
                      style={styles.optionIcon}
                    />
                    <Text style={styles.optionText}>직접 입력</Text>
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
                      source={require('../../assets/images/mike.png')} // 음성 입력 아이콘
                      style={styles.optionIcon}
                    />
                    <Text style={styles.optionText}>음성으로 입력</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* 음성 모달 */}
              {isModalVisible && (
                <VoiceInputModal
                  isVisible={isModalVisible}
                  onClose={() => setIsModalVisible(false)}
                  onSave={handleSaveVoiceInput}
                  getVolumeLevel={() => Math.random()} // 임시로 음량 레벨 반환
                />
              )}

              {/* 일정 이름 */}
              <View style={styles.inputRow}>
                <Text style={styles.labelText}>일정 이름</Text>
                <View style={styles.requiredBox}>
                  <Text style={styles.requiredText}>필수</Text>
                </View>
              </View>
              {selectedOption === 'text' ? (
                <TextInput
                  style={[styles.activeInput, { fontSize: 30 }]}
                  placeholder="일정 이름 입력"
                  placeholderTextColor="#aaa"
                  value={inputText}
                  onChangeText={setInputText}
                />
              ) : (
                <TouchableOpacity
                  style={styles.activeInput}
                  onPress={() => toggleVoiceModal('name')}
                >
                  <Text
                    style={{
                      color: inputText ? 'black' : '#aaa',
                      fontSize: 30,
                    }}
                  >
                    {inputText || '음성으로 일정 이름 입력'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* 일정 날짜 (슬라이드 선택) */}
              <View style={styles.inputRow}>
                <Text style={styles.labelText}>일정 날짜</Text>
                <View style={styles.requiredBox}>
                  <Text style={styles.requiredText}>필수</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.activeInput}
                onPress={showDatePicker}
              >
                <Text
                  style={{ color: dateText ? 'black' : '#aaa', fontSize: 30 }}
                >
                  {dateText || '일정 날짜 선택'}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
                locale="ko_KR"
                confirmTextIOS="저장"
                cancelTextIOS="취소"
              />

              {/* 시간 */}
              <View style={styles.inputRow}>
                <Text style={styles.labelText}>시간</Text>
                <View style={styles.optionalBox}>
                  <Text style={styles.optionalText}>선택</Text>
                </View>
              </View>
              {selectedOption === 'text' ? (
                <TextInput
                  style={[styles.activeInput, { fontSize: 30 }]}
                  placeholder="HH:MM 형식으로 입력"
                  placeholderTextColor="#aaa"
                  value={timeText}
                  onChangeText={setTimeText}
                />
              ) : (
                <TouchableOpacity
                  style={styles.activeInput}
                  onPress={() => toggleVoiceModal('time')}
                >
                  <Text
                    style={{
                      color: timeText ? 'black' : '#aaa',
                      fontSize: 30,
                    }}
                  >
                    {timeText || '음성으로 시간 입력'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* 버튼 */}
              <View style={[styles.buttonContainer, { marginTop: -7 }]}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    resetFields(); // 취소 시 필드 초기화
                    onClose();
                  }}
                >
                  <Text style={styles.buttonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>저장</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  requiredBox: {
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  requiredText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  optionalBox: {
    backgroundColor: 'gray',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  optionalText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
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
    minHeight: 60,
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

export default ScheduleAddModal;