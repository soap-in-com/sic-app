import { FontAwesome } from '@expo/vector-icons'; // 마이크 아이콘
import axios from 'axios'; // HTTP 요청을 위한 axios
import { Audio } from 'expo-av'; // expo-av 사용
import * as FileSystem from 'expo-file-system'; // 파일 시스템 사용
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
  onSave: (transcribedText: string) => void; // 저장 함수
  getVolumeLevel: () => number; // 음량 레벨 반환 함수
}

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isVisible,
  onClose,
  onSave,
  getVolumeLevel,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState(''); // 변환된 텍스트 상태
  const scaleAnimation = useRef(new Animated.Value(1)).current; // 애니메이션 상태
  const [volume, setVolume] = useState(1); // 음량 상태

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync(); // 마이크 권한 요청
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.3gp',
          outputFormat: 2, // Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4
          audioEncoder: 3, // Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC
          sampleRate: 16000, // 샘플링 레이트
          numberOfChannels: 1, // 모노
          bitRate: 96000, // 비트레이트
        },
        ios: {
          extension: '.caf',
          audioQuality: 127, // Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH
          sampleRate: 16000, // 샘플링 레이트
          numberOfChannels: 1, // 모노
          bitRate: 128000, // 비트레이트
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });
      await recording.startAsync();
      setIsRecording(true);

      // 음성 인식이 끝나면 자동으로 중지
      setTimeout(async () => {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI(); // 파일 URI 획득
        convertSpeechToText(uri); // 녹음된 파일을 텍스트로 변환
      }, 5000); // 5초간 녹음 후 자동 중지
    } catch (err) {
      console.error('녹음 오류:', err);
    }
  };

  // Google Speech-to-Text API로 음성 파일 전송하여 텍스트로 변환
  const convertSpeechToText = async (audioFileUri: string | null) => {
    if (!audioFileUri) {
      console.error('유효한 오디오 파일이 아닙니다.');
      return;
    }

    const apiKey = 'AIzaSyCRBV4NPRexVT_2yjvT1ogr4lxEWNQjMv4'; // 구글 API 키 입력

    try {
      const base64Audio = await FileSystem.readAsStringAsync(audioFileUri, {
        encoding: FileSystem.EncodingType.Base64, // Base64로 변환
      });

      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'ko-KR', // 한국어 인식
          },
          audio: {
            content: base64Audio,
          },
        }
      );

      const transcription =
        response.data.results[0]?.alternatives[0]?.transcript ||
        '음성 인식 실패';
      setTranscribedText(transcription);

      // 변환된 텍스트를 부모 컴포넌트에 저장
      setTimeout(() => {
        onSave(transcription); // 3초 후 저장
        onClose(); // 모달 닫기
      }, 3000);
    } catch (error) {
      console.error('음성 인식 오류:', error);
    }
  };

  // 애니메이션
  const animateScale = (volume: number) => {
    Animated.timing(scaleAnimation, {
      toValue: 1 + volume * 0.5, // 음량에 따라 애니메이션 범위 설정
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  // 모달이 열리면 자동으로 녹음 시작 및 음량 감지
  useEffect(() => {
    if (isVisible) {
      startRecording(); // 모달이 열리면 자동 녹음 시작
      const interval = setInterval(() => {
        const currentVolume = getVolumeLevel(); // 음량 가져오기
        setVolume(currentVolume);
        animateScale(currentVolume); // 음량에 따른 애니메이션 조절
      }, 100);

      return () => clearInterval(interval); // 모달이 닫히면 음량 감지 중지
    }
  }, [isVisible]);

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* X 버튼 */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>음성 인식 중...</Text>
          <View style={styles.centerContainer}>
            {/* 음량에 따라 원 크기를 변화시키는 애니메이션 */}
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [{ scale: scaleAnimation }],
                },
              ]}
            />
            <View style={styles.micContainer}>
              <View style={styles.innerCircle}>
                <FontAwesome name="microphone" size={50} color="white" />
              </View>
            </View>
          </View>

          <Text>{isRecording ? '녹음 중...' : '녹음 대기 중...'}</Text>
          {/* 변환된 텍스트 표시 */}
          {transcribedText && <Text>{transcribedText}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  modalContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  modalTitle: {
    fontSize: 35,
    color: 'black',
    marginBottom: 40,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pulseCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderColor: 'rgba(255, 0, 0, 0.7)',
    borderWidth: 2,
  },
  micContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VoiceInputModal;
