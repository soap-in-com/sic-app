import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScheduleAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    date: string;
    time: string;
    meal: string;
  }) => void;
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
  const [mealText, setMealText] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [isDateEnabled, setIsDateEnabled] = useState(false);
  const [isTimeEnabled, setIsTimeEnabled] = useState(false);
  const [isMealEnabled, setIsMealEnabled] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const translateY = useRef(new Animated.Value(screenHeight * 0.85)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        const newHeight = screenHeight - gestureState.dy;
        if (
          newHeight <= screenHeight * 0.85 &&
          newHeight >= screenHeight * 0.3
        ) {
          translateY.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 200) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: screenHeight * 0.85,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleEnableInput = (inputType: 'name' | 'date' | 'time' | 'meal') => {
    setIsRecording(true);
    if (inputType === 'name') {
      setIsDateEnabled(false);
      setIsTimeEnabled(false);
      setIsMealEnabled(false);
    } else if (inputType === 'date' && !isRecording) {
      setIsDateEnabled(true);
    } else if (inputType === 'time' && !isRecording) {
      setIsTimeEnabled(true);
    } else if (inputType === 'meal' && !isRecording) {
      setIsMealEnabled(true);
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      setIsRecording(false);
      if (isDateEnabled === false) {
        setIsDateEnabled(true);
      } else if (isTimeEnabled === false) {
        setIsTimeEnabled(true);
      } else if (isMealEnabled === false) {
        setIsMealEnabled(true);
      }
    }
  };

  const handleSave = () => {
    onSave({ name: inputText, date: dateText, time: timeText, meal: mealText });
    onClose();
  };

  const handleOptionChange = (option: 'text' | 'voice') => {
    setSelectedOption(option);
    setInputText('');
    setDateText('');
    setTimeText('');
    setMealText('');
    setIsDateEnabled(false);
    setIsTimeEnabled(false);
    setIsMealEnabled(false);
    setIsRecording(false);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    visible && (
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
          {...panResponder.panHandlers}
        >
          <View style={styles.handleBar} />

          <View style={styles.content}>
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedOption === 'text' && styles.selectedOption,
                ]}
                onPress={() => handleOptionChange('text')}
              >
                <View style={styles.optionContent}>
                  <Image
                    source={require('../../assets/images/text_input_icon.png')}
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
                onPress={() => handleOptionChange('voice')}
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

            {selectedOption === 'voice' && (
              <View style={styles.micContainer}>
                <TouchableOpacity onPress={handleMicPress}>
                  <Image
                    source={require('../../assets/images/mike.png')}
                    style={styles.micIcon}
                  />
                </TouchableOpacity>
                {isRecording && (
                  <Text style={styles.micStatusText}>녹음 중입니다</Text>
                )}
              </View>
            )}

            <Text style={styles.labelText}>
              일정 이름 {/* 음성 모드일 때 텍스트 변경 */}
            </Text>
            {selectedOption === 'text' ? (
              <TextInput
                style={styles.activeInput}
                placeholder="이름 입력"
                value={inputText}
                onChangeText={setInputText}
              />
            ) : (
              <TouchableOpacity
                style={styles.activeInput}
                onPress={() => handleEnableInput('name')}
              >
                <Text
                  style={{
                    color: inputText ? 'black' : '#aaa',
                    fontSize: 20,
                  }}
                >
                  {isRecording
                    ? '말씀 하신 후 마이크를 눌러 정지하세요.'
                    : inputText || '이름 입력 버튼'}
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.labelText}>일정 날짜</Text>
            {selectedOption === 'text' ? (
              <TextInput
                style={
                  isDateEnabled ? styles.activeInput : styles.disabledInput
                }
                placeholder="날짜 입력"
                value={dateText}
                onChangeText={setDateText}
                editable={isDateEnabled}
              />
            ) : (
              <TouchableOpacity
                style={
                  isDateEnabled ? styles.activeInput : styles.disabledInput
                }
                onPress={() => handleEnableInput('date')}
                disabled={!isDateEnabled}
              >
                <Text
                  style={{
                    color: dateText ? 'black' : '#aaa',
                    fontSize: 20,
                  }}
                >
                  {isRecording
                    ? '말씀 하신 후 마이크를 눌러 정지하세요.'
                    : dateText || '일정 날짜 버튼'}
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.labelText}>시간</Text>
            {selectedOption === 'text' ? (
              <TextInput
                style={
                  isTimeEnabled ? styles.activeInput : styles.disabledInput
                }
                placeholder="시간 입력"
                value={timeText}
                onChangeText={setTimeText}
                editable={isTimeEnabled}
              />
            ) : (
              <TouchableOpacity
                style={
                  isTimeEnabled ? styles.activeInput : styles.disabledInput
                }
                onPress={() => handleEnableInput('time')}
                disabled={!isTimeEnabled}
              >
                <Text
                  style={{
                    color: timeText ? 'black' : '#aaa',
                    fontSize: 20,
                  }}
                >
                  {isRecording
                    ? '말씀 하신 후 마이크를 눌러 정지하세요.'
                    : timeText || '시간 버튼'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={[styles.buttonContainer, { marginTop: -7 }]}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    )
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
    borderTopLeftRadius: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  activeInput: {
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 25,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    textAlign: 'left',
    fontSize: 20,
  },
  disabledInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    textAlign: 'left',
    color: '#888',
    fontSize: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectedOption: {
    borderColor: '#007BFF',
    borderWidth: 2,
  },
  micContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  micStatusText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  micIcon: {
    width: 100,
    height: 100,
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
    fontSize: 20,
  },
});

export default ScheduleAddModal;
