// import { FontAwesome } from '@expo/vector-icons';
// import axios from 'axios';
// import { Audio } from 'expo-av';
// import * as FileSystem from 'expo-file-system';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Animated,
//   Easing,
//   Modal,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// interface VoiceInputModalProps {
//   isVisible: boolean;
//   onClose: () => void;
//   onSave: (transcribedText: string) => void;
//   getVolumeLevel: () => number;
// }

// const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
//   isVisible,
//   onClose,
//   onSave,
//   getVolumeLevel,
// }) => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);
//   const [transcribedText, setTranscribedText] = useState('');
//   const scaleAnimation = useRef(new Animated.Value(1)).current;
//   const [volume, setVolume] = useState(1);
//   const silenceTimer = useRef<NodeJS.Timeout | null>(null);

//   // 녹음 중지 함수
//   const stopRecording = async () => {
//     if (recording) {
//       try {
//         const status = await recording.getStatusAsync();
//         if (status.isRecording) {
//           await recording.stopAndUnloadAsync(); // 녹음 중지 및 언로드
//           setRecording(null); // 녹음 객체 초기화
//         }
//       } catch (error) {
//         console.error('녹음 중지 오류:', error);
//       } finally {
//         setIsRecording(false); // 녹음 상태를 false로 설정
//       }
//     }
//   };

//   // 녹음 상태 초기화 함수
//   const resetRecordingState = async () => {
//     await stopRecording(); // 무조건 녹음을 중지하여 초기화
//     setTranscribedText(''); // 변환된 텍스트 초기화
//     setRecording(null); // 녹음 객체 초기화
//   };

//   // 녹음 시작 함수
//   const startRecording = async () => {
//     try {
//       if (recording) {
//         return; // 이미 녹음 중이면 새로운 녹음을 시작하지 않음
//       }

//       await Audio.requestPermissionsAsync(); // 마이크 권한 요청
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const newRecording = new Audio.Recording();
//       await newRecording.prepareToRecordAsync({
//         android: {
//           extension: '.3gp',
//           outputFormat: 2,
//           audioEncoder: 3,
//           sampleRate: 16000,
//           numberOfChannels: 1,
//           bitRate: 96000,
//         },
//         ios: {
//           extension: '.caf',
//           audioQuality: 127,
//           sampleRate: 16000,
//           numberOfChannels: 1,
//           bitRate: 128000,
//         },
//         web: {
//           mimeType: 'audio/webm',
//           bitsPerSecond: 128000,
//         },
//       });
//       await newRecording.startAsync();
//       setRecording(newRecording); // 녹음 객체 설정
//       setIsRecording(true);

//       // 녹음 자동 종료
//       setTimeout(async () => {
//         if (newRecording) {
//           await stopRecording(); // 녹음 종료
//           const uri = newRecording.getURI();
//           if (uri) {
//             const transcription = await convertSpeechToText(uri); // 텍스트 변환
//             setTranscribedText(transcription); // 변환된 텍스트 저장
//           }
//         }
//       }, 5000);
//     } catch (err) {
//       console.error('녹음 오류:', err);
//       setRecording(null); // 녹음 객체 초기화
//       setIsRecording(false); // 녹음 상태 false로 설정
//     }
//   };

//   // 음성 텍스트 변환 함수, string을 반환하도록 변경
//   const convertSpeechToText = async (
//     audioFileUri: string | null
//   ): Promise<string> => {
//     if (!audioFileUri) {
//       console.error('유효한 오디오 파일이 아닙니다.');
//       return '내용 없음';
//     }

//     const apiKey = 'AIzaSyCRBV4NPRexVT_2yjvT1ogr4lxEWNQjMv4'; // Google API 키 입력

//     try {
//       const base64Audio = await FileSystem.readAsStringAsync(audioFileUri, {
//         encoding: FileSystem.EncodingType.Base64,
//       });

//       const response = await axios.post(
//         `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
//         {
//           config: {
//             encoding: 'LINEAR16',
//             sampleRateHertz: 16000,
//             languageCode: 'ko-KR',
//           },
//           audio: {
//             content: base64Audio,
//           },
//         }
//       );

//       const transcription =
//         response.data?.results?.[0]?.alternatives?.[0]?.transcript ||
//         '내용 없음';

//       return transcription; // 변환된 텍스트 반환
//     } catch (error) {
//       console.error('음성 인식 오류:', error);
//       return '내용 없음';
//     }
//   };

//   const animateScale = (volume: number) => {
//     Animated.timing(scaleAnimation, {
//       toValue: 1 + volume * 0.5,
//       duration: 100,
//       easing: Easing.inOut(Easing.ease),
//       useNativeDriver: true,
//     }).start();
//   };

//   // 모달이 열릴 때마다 녹음 상태 초기화 및 녹음 시작
//   useEffect(() => {
//     const initRecording = async () => {
//       await resetRecordingState(); // 이전 녹음 상태 초기화
//       await startRecording(); // 새로운 녹음 시작
//     };

//     if (isVisible) {
//       setTimeout(() => {
//         initRecording(); // 일정 시간 이후 녹음 시작
//       }, 800);
//     }

//     return () => {
//       if (silenceTimer.current) {
//         clearTimeout(silenceTimer.current); // 타이머 정리
//       }
//     };
//   }, [isVisible]);

//   useEffect(() => {
//     if (isRecording) {
//       const interval = setInterval(() => {
//         const newVolume = getVolumeLevel(); // 음량 레벨 업데이트
//         setVolume(newVolume);
//         animateScale(newVolume);
//       }, 100);
//       return () => clearInterval(interval);
//     }
//   }, [isRecording, getVolumeLevel]);

//   return (
//     <Modal visible={isVisible} transparent animationType="fade">
//       <View style={styles.modalContainer}>
//         <TouchableOpacity
//           style={styles.closeButton} // X 버튼 스타일 고정
//           onPress={() => {
//             resetRecordingState();
//             onClose();
//           }}
//         >
//           <Text style={styles.closeButtonText}>X</Text>
//         </TouchableOpacity>
//         <View style={styles.modalContent}>
//           {/* 마이크 아이콘 */}
//           <Animated.View
//             style={[
//               styles.iconContainer,
//               { transform: [{ scale: scaleAnimation }] },
//             ]}
//           >
//             <FontAwesome name="microphone" size={120} color="#ff6961" />
//           </Animated.View>

//           {/* 녹음중 텍스트 */}
//           <Text style={styles.recordingText}>
//             {isRecording ? '녹음 중...' : '녹음이 종료되었습니다.'}
//           </Text>

//           {/* 다시 말하기 버튼 */}
//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={async () => {
//               await resetRecordingState(); // 녹음 초기화
//               await startRecording(); // 다시 녹음 시작
//             }}
//           >
//             <FontAwesome
//               name="repeat"
//               size={24}
//               color="white"
//               style={styles.retryIcon}
//             />
//             <Text style={styles.retryButtonText}>다시 말하기</Text>
//           </TouchableOpacity>

//           {/* 저장 버튼 */}
//           <TouchableOpacity
//             style={styles.saveButton}
//             onPress={async () => {
//               if (recording) {
//                 const uri = recording.getURI();
//                 const transcription = await convertSpeechToText(uri); // 텍스트 변환
//                 onSave(transcription); // 텍스트 저장
//               } else {
//                 onSave('내용 없음');
//               }
//               resetRecordingState(); // 녹음 상태 초기화
//               onClose(); // 모달 닫기
//             }}
//           >
//             <Text style={styles.saveButtonText}>저장</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     alignItems: 'center',
//   },
//   iconContainer: {
//     marginBottom: 40, // 마이크 아이콘 아래 여백
//   },
//   recordingText: {
//     fontSize: 40, // 녹음중 텍스트 크기
//     fontWeight: 'bold',
//     color: 'white', // 텍스트 색상
//     textAlign: 'center',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 60,
//     right: 60,
//     padding: 10,
//     zIndex: 20, // 다른 요소 위에 위치하도록 설정
//   },
//   closeButtonText: {
//     fontSize: 70,
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   retryButton: {
//     backgroundColor: '#007BFF',
//     padding: 20, // 다시 말하기 버튼 크기
//     borderRadius: 10, // 둥근 버튼
//     marginTop: 20, // 버튼과 마이크 사이 여백
//     flexDirection: 'row', // 아이콘과 텍스트 나란히 배치
//     alignItems: 'center',
//   },
//   retryIcon: {
//     marginRight: 20, // 아이콘과 텍스트 사이 간격
//   },
//   retryButtonText: {
//     fontSize: 32, // 텍스트 크기
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   saveButton: {
//     backgroundColor: '#28A745',
//     padding: 22, // 저장 버튼 크기
//     borderRadius: 30,
//     marginTop: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   saveButtonText: {
//     fontSize: 35,
//     color: 'white',
//     fontWeight: 'bold',
//     marginHorizontal: 20,
//   },
// });

// export default VoiceInputModal;

import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface VoiceInputModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (transcribedText: string) => void;
  getVolumeLevel: () => number;
}

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isVisible,
  onClose,
  onSave,
  getVolumeLevel,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const [volume, setVolume] = useState(1);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = async () => {
    if (recording) {
      try {
        const status = await recording.getStatusAsync();
        if (status.isRecording) {
          await recording.stopAndUnloadAsync();
          setRecording(null);
        }
      } catch (error) {
        console.error('녹음 중지 오류:', error);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const resetRecordingState = async () => {
    await stopRecording();
    setTranscribedText('');
    setRecording(null);
  };

  const startRecording = async () => {
    try {
      if (recording) return;

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.3gp',
          outputFormat: 2,
          audioEncoder: 3,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 96000,
        },
        ios: {
          extension: '.caf',
          audioQuality: 127,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);

      setTimeout(async () => {
        if (newRecording) {
          await stopRecording();
          const uri = newRecording.getURI();
          if (uri) {
            const transcription = await convertSpeechToText(uri);
            setTranscribedText(transcription);
          }
        }
      }, 5000);
    } catch (err) {
      console.error('녹음 오류:', err);
      setRecording(null);
      setIsRecording(false);
    }
  };

  const convertSpeechToText = async (
    audioFileUri: string | null
  ): Promise<string> => {
    if (!audioFileUri) {
      console.error('유효한 오디오 파일이 아닙니다.');
      return '내용 없음';
    }

    const apiKey = 'AIzaSyCRBV4NPRexVT_2yjvT1ogr4lxEWNQjMv4';

    try {
      const base64Audio = await FileSystem.readAsStringAsync(audioFileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'ko-KR',
          },
          audio: {
            content: base64Audio,
          },
        }
      );

      const transcription =
        response.data?.results?.[0]?.alternatives?.[0]?.transcript ||
        '내용 없음';

      return transcription;
    } catch (error) {
      console.error('음성 인식 오류:', error);
      return '내용 없음';
    }
  };

  const animateScale = (volume: number) => {
    Animated.timing(scaleAnimation, {
      toValue: 1 + volume * 0.5,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const initRecording = async () => {
      await resetRecordingState();
      await startRecording();
    };

    if (isVisible) {
      setTimeout(() => {
        initRecording();
      }, 800);
    }

    return () => {
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        const newVolume = getVolumeLevel();
        setVolume(newVolume);
        animateScale(newVolume);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRecording, getVolumeLevel]);

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            resetRecordingState();
            onClose();
          }}
        >
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        <View style={styles.modalContent}>
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: scaleAnimation }] },
            ]}
          >
            <FontAwesome name="microphone" size={120} color="#ff6961" />
          </Animated.View>

          <Text style={styles.recordingText}>
            {isRecording ? '녹음 중...' : '녹음이 종료되었습니다.'}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={async () => {
              await resetRecordingState();
              await startRecording();
            }}
          >
            <FontAwesome
              name="repeat"
              size={24}
              color="white"
              style={styles.retryIcon}
            />
            <Text style={styles.retryButtonText}>다시 말하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={async () => {
              if (recording) {
                const uri = recording.getURI();
                const transcription = await convertSpeechToText(uri);
                onSave(transcription);
              } else {
                onSave('내용 없음');
              }
              resetRecordingState();
              onClose();
            }}
          >
            <Text style={styles.saveButtonText}>저장</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  recordingText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 60,
    padding: 10,
    zIndex: 20,
  },
  closeButtonText: {
    fontSize: 70,
    color: 'white',
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#007BFF',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryIcon: {
    marginRight: 20,
  },
  retryButtonText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#28A745',
    padding: 22,
    borderRadius: 30,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 35,
    color: 'white',
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
});

export default VoiceInputModal;
