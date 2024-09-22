// import React, { useRef, useState } from 'react';
// import {
//   Animated,
//   Dimensions,
//   Image,
//   PanResponder,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import Modal from 'react-native-modal';
// import { SafeAreaView } from 'react-native-safe-area-context';

// interface MemoModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onSave: (memo: string) => void;
// }

// const MemoModal: React.FC<MemoModalProps> = ({ visible, onClose, onSave }) => {
//   const [memo, setMemo] = useState('');
//   const [selectedOption, setSelectedOption] = useState<'text' | 'voice'>(
//     'text'
//   );

//   const screenHeight = Dimensions.get('window').height;
//   const translateY = useRef(new Animated.Value(screenHeight * 0.9)).current; // 초기 모달 높이 설정

//   // PanResponder를 사용하여 드래그로 모달 높이 조절
//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (_, gestureState) =>
//         Math.abs(gestureState.dy) > 5,
//       onPanResponderMove: (_, gestureState) => {
//         const newHeight = screenHeight - gestureState.dy;
//         if (
//           newHeight <= screenHeight * 0.9 &&
//           newHeight >= screenHeight * 0.3
//         ) {
//           translateY.setValue(newHeight);
//         }
//       },
//       onPanResponderRelease: (_, gestureState) => {
//         if (gestureState.dy > 200) {
//           onClose();
//         } else {
//           Animated.spring(translateY, {
//             toValue: screenHeight * 0.9,
//             useNativeDriver: false,
//           }).start();
//         }
//       },
//     })
//   ).current;

//   // 저장 버튼 클릭 핸들러
//   const handleSave = () => {
//     onSave(memo); // 저장할 메모 전달
//     setMemo(''); // 저장 후 초기화
//     onClose(); // 모달 닫기
//   };

//   return (
//     <Modal
//       isVisible={visible}
//       onBackdropPress={onClose}
//       style={styles.modal}
//       avoidKeyboard
//     >
//       <SafeAreaView style={styles.safeAreaView}>
//         <Animated.View
//           style={[
//             styles.modalContent,
//             { height: translateY, position: 'absolute', bottom: 0 },
//           ]}
//           {...panResponder.panHandlers}
//         >
//           {/* 모달 핸들 */}
//           <View style={styles.handleBar} />

//           {/* 직접 입력과 음성으로 입력 버튼 */}
//           <View style={styles.optionContainer}>
//             <TouchableOpacity
//               style={[
//                 styles.optionButton,
//                 selectedOption === 'text' && styles.selectedOption,
//               ]}
//               onPress={() => setSelectedOption('text')}
//             >
//               <Image
//                 source={require('../../assets/images/text_input_icon.png')}
//                 style={styles.optionIcon}
//               />
//               <Text style={styles.optionText}>직접 입력</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.optionButton,
//                 selectedOption === 'voice' && styles.selectedOption,
//               ]}
//               onPress={() => setSelectedOption('voice')}
//             >
//               <Image
//                 source={require('../../assets/images/mike.png')}
//                 style={styles.optionIcon}
//               />
//               <Text style={styles.optionText}>음성으로 입력</Text>
//             </TouchableOpacity>
//           </View>

//           {/* 음성으로 입력 모드일 때 마이크 이미지 표시 */}
//           {selectedOption === 'voice' && (
//             <View style={styles.micContainer}>
//               <Image
//                 source={require('../../assets/images/mike.png')}
//                 style={styles.micImage}
//               />
//             </View>
//           )}

//           {/* 메모 입력 영역 */}
//           <TextInput
//             style={styles.textArea}
//             placeholder="내용을 입력하세요..."
//             value={memo}
//             onChangeText={setMemo}
//             editable={selectedOption === 'text'} // 직접 입력 모드일 때만 수정 가능
//             multiline
//           />

//           {/* 저장 및 취소 버튼 */}
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
//               <Text style={styles.buttonText}>취소</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//               <Text style={styles.buttonText}>저장</Text>
//             </TouchableOpacity>
//           </View>
//         </Animated.View>
//       </SafeAreaView>
//     </Modal>
//   );
// };

// // 스타일 정의
// const styles = StyleSheet.create({
//   modal: {
//     justifyContent: 'flex-end',
//     margin: 0,
//   },
//   safeAreaView: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'transparent',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     justifyContent: 'flex-start',
//     width: '100%',
//   },
//   handleBar: {
//     width: 50,
//     height: 5,
//     backgroundColor: '#ccc',
//     borderRadius: 2.5,
//     alignSelf: 'center',
//     marginVertical: 10,
//   },
//   optionContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 20,
//   },
//   optionButton: {
//     flex: 1,
//     backgroundColor: '#f2f2f2',
//     paddingVertical: 15,
//     alignItems: 'center',
//     borderRadius: 10,
//     marginHorizontal: 5,
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   selectedOption: {
//     borderColor: '#007BFF',
//   },
//   optionIcon: {
//     width: 50,
//     height: 50,
//     marginBottom: 5,
//   },
//   optionText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   micContainer: {
//     alignItems: 'center',
//     marginVertical: 10,
//   },
//   micImage: {
//     width: 100,
//     height: 100,
//   },
//   textArea: {
//     flex: 1,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 10,
//     textAlignVertical: 'top',
//     marginBottom: 20,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   cancelButton: {
//     flex: 1,
//     backgroundColor: '#ccc',
//     paddingVertical: 12,
//     borderRadius: 10,
//     marginRight: 10,
//     alignItems: 'center',
//   },
//   saveButton: {
//     flex: 1,
//     backgroundColor: '#007BFF',
//     paddingVertical: 12,
//     borderRadius: 10,
//     marginLeft: 10,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default MemoModal;

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
