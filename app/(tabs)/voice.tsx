// import axios from 'axios';
// import { Audio } from 'expo-av';
// import * as FileSystem from 'expo-file-system';
// import React, { useEffect, useRef, useState } from 'react';
// import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import Modal from 'react-native-modal';

// interface VoiceInputModalProps {
//   isVisible: boolean;
//   onClose: () => void;
//   isRecording: boolean;
// }

// const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
//   isVisible,
//   onClose,
//   isRecording,
// }) => {
//   const [recording, setRecording] = useState<Audio.Recording | null>(null); // 녹음 객체 저장
//   const [transcribedText, setTranscribedText] = useState('음성 인식 중...');
//   const [isRecord, setIsRecord] = useState(false); // 녹음 상태
//   const intervalRef = useRef<NodeJS.Timeout | null>(null); // 주기적으로 음성 전송

//   // 일정 주기마다 음성을 전송하는 함수
//   const sendAudioInChunks = async () => {
//     if (recording) {
//       try {
//         console.log('Sending chunk of audio to Google...');
//         await recording.stopAndUnloadAsync(); // 현재 녹음 중인 음성을 일시적으로 중지
//         const uri = recording.getURI();
//         if (uri) {
//           await sendAudioToGoogle(uri); // 음성을 전송
//         }
//         await recording.startAsync(); // 다시 녹음 시작
//       } catch (err) {
//         console.error('음성 전송 실패', err);
//       }
//     }
//   };

//   // Google API로 오디오 전송 함수
//   const sendAudioToGoogle = async (uri: string) => {
//     try {
//       console.log('Sending audio to Google, URI:', uri);
//       const audioFile = await FileSystem.readAsStringAsync(uri, {
//         encoding: FileSystem.EncodingType.Base64,
//       });

//       const apiKey = 'AIzaSyCRBV4NPRexVT_2yjvT1ogr4lxEWNQjMv4'; // 여기에 구글 API 키를 입력
//       const body = {
//         config: {
//           encoding: 'LINEAR16', // LINEAR16으로 설정
//           sampleRateHertz: 16000,
//           languageCode: 'ko-KR', // 언어 설정 (한국어)
//         },
//         audio: {
//           content: audioFile,
//         },
//       };

//       const response = await axios.post(
//         `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
//         body,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       console.log('Google API response:', response.data);
//       if (response.data && response.data.results) {
//         const transcription = response.data.results
//           .map((result: any) => result.alternatives[0].transcript)
//           .join('\n');
//         setTranscribedText((prevText) => prevText + ' ' + transcription); // 이전 텍스트에 새로운 텍스트 추가
//       } else {
//         setTranscribedText((prevText) => prevText + ' [결과 없음]');
//       }
//     } catch (err) {
//       console.error('Google API error:', err);
//       setTranscribedText((prevText) => prevText + ' [실패]');
//     }
//   };

//   // 녹음 시작 함수
//   const startRecording = async () => {
//     try {
//       console.log('Starting new recording...');
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== 'granted') {
//         alert('마이크 권한이 필요합니다.');
//         return;
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         interruptionModeIOS: 1, // 상수 값을 직접 설정 (1: DO_NOT_MIX)
//         playsInSilentModeIOS: true,
//         shouldDuckAndroid: true,
//         interruptionModeAndroid: 1, // 상수 값을 직접 설정 (1: DO_NOT_MIX)
//         playThroughEarpieceAndroid: false,
//         staysActiveInBackground: true,
//       });

//       setIsRecord(true);

//       const recordingInstance = new Audio.Recording();
//       await recordingInstance.prepareToRecordAsync({
//         android: {
//           extension: '.3gp',
//           outputFormat: 1, // Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_THREE_GPP
//           audioEncoder: 1, // Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_NB
//           sampleRate: 16000,
//           numberOfChannels: 1,
//           bitRate: 96000,
//         },
//         ios: {
//           extension: '.caf',
//           audioQuality: 127, // Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH
//           sampleRate: 16000,
//           numberOfChannels: 1,
//           bitRate: 128000,
//           linearPCMBitDepth: 16,
//           linearPCMIsBigEndian: false,
//           linearPCMIsFloat: false,
//         },
//         web: {
//           mimeType: 'audio/webm',
//           bitsPerSecond: 128000,
//         },
//       });

//       setRecording(recordingInstance);
//       await recordingInstance.startAsync(); // 녹음 시작
//       console.log('Recording started');

//       // 1초마다 음성을 전송하는 인터벌 설정
//       intervalRef.current = setInterval(sendAudioInChunks, 1000);
//     } catch (err) {
//       console.error('녹음 시작 실패', err);
//     }
//   };

//   // 녹음 중지 함수
//   const stopRecording = async () => {
//     try {
//       if (recording) {
//         console.log('Stopping recording...');
//         await recording.stopAndUnloadAsync();
//         clearInterval(intervalRef.current!); // 인터벌 제거
//         intervalRef.current = null; // 초기화
//         const uri = recording.getURI();
//         console.log('Recording stopped, URI:', uri);
//         if (uri) {
//           await sendAudioToGoogle(uri); // 마지막으로 남은 음성 전송
//         }
//       }
//       setRecording(null);
//       setIsRecord(false);
//       onClose(); // 녹음이 끝나면 모달을 닫음
//     } catch (err) {
//       console.error('녹음 중지 실패', err);
//     }
//   };

//   // 모달이 열릴 때 녹음 시작
//   useEffect(() => {
//     if (isVisible && !isRecord) {
//       startRecording(); // 모달이 열리면 바로 녹음을 시작
//     }
//     return () => {
//       // 모달이 닫히면 인터벌 제거
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };
//   }, [isVisible]);

//   return (
//     <Modal
//       isVisible={isVisible}
//       onBackdropPress={onClose}
//       backdropOpacity={0.5}
//     >
//       <View style={styles.modalContainer}>
//         <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//           <Text style={styles.closeButtonText}>✕</Text>
//         </TouchableOpacity>

//         <Text style={styles.instructionText}>
//           말씀하신 후 마이크를 눌러주세요
//         </Text>

//         <View style={styles.transcriptionContainer}>
//           <Text style={styles.transcribedText}>{transcribedText}</Text>
//         </View>

//         <TouchableOpacity
//           style={styles.micButton}
//           onPress={isRecord ? stopRecording : startRecording}
//         >
//           <View style={styles.micOuterCircle}>
//             <View style={styles.micInnerCircle}>
//               <Image
//                 source={require('../../assets/images/mike.png')}
//                 style={styles.micIcon}
//               />
//             </View>
//           </View>
//         </TouchableOpacity>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//     height: '80%',
//     alignSelf: 'center',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 20,
//     left: 20,
//   },
//   closeButtonText: {
//     fontSize: 25,
//     color: '#000',
//   },
//   instructionText: {
//     color: '#333',
//     fontSize: 18,
//     marginBottom: 20,
//   },
//   transcriptionContainer: {
//     height: 100,
//     width: '90%',
//     padding: 10,
//     backgroundColor: '#F0F0F0',
//     borderRadius: 10,
//     marginBottom: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   transcribedText: {
//     color: '#333',
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   micButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   micOuterCircle: {
//     width: 200,
//     height: 200,
//     borderRadius: 100,
//     backgroundColor: '#D3D3D3',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   micInnerCircle: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     backgroundColor: '#f0f0f0',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   micIcon: {
//     width: 90,
//     height: 90,
//     tintColor: '#FF0000',
//   },
// });

// export default VoiceInputModal;

import axios from 'axios';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

interface VoiceInputModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isVisible,
  onClose,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null); // 녹음 객체 저장
  const [transcribedText, setTranscribedText] = useState('음성 인식 중...');
  const [isRecord, setIsRecord] = useState(false); // 녹음 상태
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // 주기적으로 음성 전송

  // 일정 주기마다 음성을 전송하는 함수
  const sendAudioInChunks = async () => {
    if (recording) {
      try {
        console.log('Sending chunk of audio to Google...');
        await recording.stopAndUnloadAsync(); // 현재 녹음 중인 음성을 일시적으로 중지
        const uri = recording.getURI();
        if (uri) {
          await sendAudioToGoogle(uri); // 음성을 전송
        }
        await recording.startAsync(); // 다시 녹음 시작
      } catch (err) {
        console.error('음성 전송 실패', err);
      }
    }
  };

  // Google API로 오디오 전송 함수
  const sendAudioToGoogle = async (uri: string) => {
    try {
      console.log('Sending audio to Google, URI:', uri);
      const audioFile = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const apiKey = 'AIzaSyCRBV4NPRexVT_2yjvT1ogr4lxEWNQjMv4'; // 여기에 구글 API 키를 입력
      const body = {
        config: {
          encoding: 'LINEAR16', // LINEAR16으로 설정
          sampleRateHertz: 16000,
          languageCode: 'ko-KR', // 언어 설정 (한국어)
        },
        audio: {
          content: audioFile,
        },
      };

      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Google API response:', response.data);
      if (response.data && response.data.results) {
        const transcription = response.data.results
          .map((result: any) => result.alternatives[0].transcript)
          .join('\n');
        setTranscribedText((prevText) => prevText + ' ' + transcription); // 이전 텍스트에 새로운 텍스트 추가
      } else {
        setTranscribedText((prevText) => prevText + ' [결과 없음]');
      }
    } catch (err) {
      console.error('Google API error:', err);
      setTranscribedText((prevText) => prevText + ' [실패]');
    }
  };

  // 녹음 시작 함수
  const startRecording = async () => {
    try {
      console.log('Starting new recording...');
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('마이크 권한이 필요합니다.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: 1, // 상수 값을 직접 설정 (1: DO_NOT_MIX)
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1, // 상수 값을 직접 설정 (1: DO_NOT_MIX)
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      setIsRecord(true);

      const recordingInstance = new Audio.Recording();
      await recordingInstance.prepareToRecordAsync({
        android: {
          extension: '.3gp',
          outputFormat: 1, // Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_THREE_GPP
          audioEncoder: 1, // Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_NB
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 96000,
        },
        ios: {
          extension: '.caf',
          audioQuality: 127, // Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      setRecording(recordingInstance);
      await recordingInstance.startAsync(); // 녹음 시작
      console.log('Recording started');

      // 1초마다 음성을 전송하는 인터벌 설정
      intervalRef.current = setInterval(sendAudioInChunks, 1000);
    } catch (err) {
      console.error('녹음 시작 실패', err);
    }
  };

  // 녹음 중지 함수
  const stopRecording = async () => {
    try {
      if (recording) {
        console.log('Stopping recording...');
        await recording.stopAndUnloadAsync();
        clearInterval(intervalRef.current!); // 인터벌 제거
        intervalRef.current = null; // 초기화
        const uri = recording.getURI();
        console.log('Recording stopped, URI:', uri);
        if (uri) {
          await sendAudioToGoogle(uri); // 마지막으로 남은 음성 전송
        }
      }
      setRecording(null);
      setIsRecord(false);
      onClose(); // 녹음이 끝나면 모달을 닫음
    } catch (err) {
      console.error('녹음 중지 실패', err);
    }
  };

  // 모달이 열릴 때 녹음 시작
  useEffect(() => {
    if (isVisible && !isRecord) {
      startRecording(); // 모달이 열리면 바로 녹음을 시작
    }
    return () => {
      // 모달이 닫히면 인터벌 제거
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isVisible]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.5}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.instructionText}>
          말씀하신 내용이 실시간으로 표시됩니다.
        </Text>

        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcribedText}>{transcribedText}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '80%',
    alignSelf: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  closeButtonText: {
    fontSize: 25,
    color: '#000',
  },
  instructionText: {
    color: '#333',
    fontSize: 18,
    marginBottom: 20,
  },
  transcriptionContainer: {
    height: 100,
    width: '90%',
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transcribedText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VoiceInputModal;
