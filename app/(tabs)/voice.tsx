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
  const [recording, setRecording] = useState<Audio.Recording | null>(null); // 녹음 객체 상태 추가
  const [transcribedText, setTranscribedText] = useState(''); // 변환된 텍스트 상태
  const scaleAnimation = useRef(new Animated.Value(1)).current; // 애니메이션 상태
  const [volume, setVolume] = useState(1); // 음량 상태
  const silenceTimer = useRef<NodeJS.Timeout | null>(null); // 음성 입력 대기 타이머

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync(); // 마이크 권한 요청
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
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
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);

      // 음성 인식이 끝나면 자동으로 중지
      setTimeout(async () => {
        if (newRecording) {
          await newRecording.stopAndUnloadAsync();
          const uri = newRecording.getURI(); // 파일 URI 획득
          convertSpeechToText(uri); // 녹음된 파일을 텍스트로 변환
        }
      }, 5000); // 5초간 녹음 후 자동 중지
    } catch (err) {
      console.error('녹음 오류:', err);
    }
  };

  // 음성 녹음 중지 함수
  const stopRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (error) {
        console.error('녹음 중지 오류:', error);
      } finally {
        setRecording(null);
        setIsRecording(false);
      }
    }
  };

  // Google Speech-to-Text API로 음성 파일 전송하여 텍스트로 변환
  const convertSpeechToText = async (audioFileUri: string | null) => {
    if (!audioFileUri) {
      console.error('유효한 오디오 파일이 아닙니다.');
      onSave('내용 없음'); // 내용이 없으면 "내용 없음" 저장
      onClose(); // 모달 닫기
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

      // 응답 데이터가 없는 경우 처리
      const transcription =
        response.data?.results?.[0]?.alternatives?.[0]?.transcript ||
        '내용 없음';

      setTranscribedText(transcription);

      // 변환된 텍스트를 부모 컴포넌트에 저장
      setTimeout(() => {
        onSave(transcription); // 3초 후 저장
        onClose(); // 모달 닫기
      }, 3000);
    } catch (error) {
      console.error('음성 인식 오류:', error);
      onSave('내용 없음'); // 오류 발생 시 "내용 없음" 저장
      onClose(); // 모달 닫기
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

        // 음성 입력이 감지되면 타이머를 리셋
        if (currentVolume > 0.1) {
          if (silenceTimer.current) {
            clearTimeout(silenceTimer.current);
          }
          silenceTimer.current = setTimeout(() => {
            handleClose(); // 10초 후 음성이 입력되지 않으면 녹음 중지 및 모달 닫기
          }, 10000); // 10초 타이머
        }
      }, 100);

      return () => {
        clearInterval(interval); // 모달이 닫히면 음량 감지 중지
        if (silenceTimer.current) clearTimeout(silenceTimer.current); // 타이머 초기화
      };
    }
  }, [isVisible]);

  // X 버튼을 눌렀을 때 녹음 중지 및 모달 닫기
  const handleClose = async () => {
    await stopRecording();
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* X 버튼 */}
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
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

          {/* 녹음 상태 텍스트 크기 조정 */}
          <Text style={styles.recordingText}>
            {isRecording ? '녹음 중...' : '녹음 대기 중...'}
          </Text>

          {/* 변환된 텍스트 표시 (크기 조정) */}
          {transcribedText && (
            <Text style={styles.transcribedText}>{transcribedText}</Text>
          )}
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
    top: 10, // X 버튼을 더 위로 올림
    left: 20,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 30, // X 버튼의 텍스트 크기 키움
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
  recordingText: {
    fontSize: 30, // 녹음 상태 텍스트 크기
    color: 'black',
    marginTop: 20,
  },
  transcribedText: {
    fontSize: 35, // 변환된 텍스트 크기
    color: 'black',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default VoiceInputModal;
