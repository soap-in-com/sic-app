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
interface MemoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (memo: string) => void;
}

const MemoModal: React.FC<MemoModalProps> = ({ visible, onClose, onSave }) => {
  const [selectedOption, setSelectedOption] = useState<'text' | 'voice'>(
    'text'
  );
  const [memoText, setMemoText] = useState('');

  const [isRecording, setIsRecording] = useState(false);

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

  const handleMicPress = () => {
    if (isRecording) {
      setIsRecording(false);
    }
  };

  const handleSave = () => {
    onSave(memoText);
    onClose();
  };

  const handleOptionChange = (option: 'text' | 'voice') => {
    setSelectedOption(option);
    setMemoText('');
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

            <Text style={styles.labelText}>메모 내용</Text>
            {selectedOption === 'text' ? (
              <TextInput
                style={styles.activeInput}
                placeholder="메모를 입력하세요"
                value={memoText}
                onChangeText={setMemoText}
                multiline
              />
            ) : (
              <TouchableOpacity
                style={styles.activeInput}
                onPress={() => setIsRecording(true)}
              >
                <Text
                  style={{
                    color: memoText ? 'black' : '#aaa',
                    fontSize: 20,
                  }}
                >
                  {isRecording
                    ? '말씀 하신 후 마이크를 눌러 정지하세요.'
                    : memoText || '메모를 입력하세요'}
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
    minHeight: 100, // 메모 작성 공간을 늘리기 위해 추가
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

export default MemoModal;
