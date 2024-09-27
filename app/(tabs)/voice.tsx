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

  // 녹음 중지 함수
  const stopRecording = async () => {
    if (recording) {
      try {
        const status = await recording.getStatusAsync();
        if (status.isRecording) {
          console.log('Stopping and unloading recording...');
          await recording.stopAndUnloadAsync(); // 녹음 중지 및 언로드
        }
      } catch (error) {
        console.error('녹음 중지 오류:', error);
      } finally {
        setRecording(null); // 녹음 객체 초기화
        setIsRecording(false);
      }
    }
  };

  // 녹음 상태 초기화 함수
  const resetRecordingState = async () => {
    if (recording) {
      await stopRecording(); // 무조건 녹음을 중지하여 초기화
    }
    setTranscribedText(''); // 변환된 텍스트 초기화
  };

  // 녹음 시작 함수
  const startRecording = async () => {
    try {
      if (recording) {
        console.log(
          '기존 녹음 객체가 존재하므로 새로운 녹음을 시작할 수 없습니다.'
        );
        return;
      }

      await Audio.requestPermissionsAsync(); // 마이크 권한 요청
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
      setRecording(newRecording); // 녹음 객체 설정
      setIsRecording(true);

      // 녹음 자동 종료
      setTimeout(async () => {
        if (newRecording) {
          await stopRecording(); // 녹음 종료
          const uri = newRecording.getURI();
          convertSpeechToText(uri); // 텍스트 변환
        }
      }, 5000);
    } catch (err) {
      console.error('녹음 오류:', err);
    }
  };

  // 음성 텍스트 변환 함수
  const convertSpeechToText = async (audioFileUri: string | null) => {
    if (!audioFileUri) {
      console.error('유효한 오디오 파일이 아닙니다.');
      onSave('내용 없음');
      onClose();
      return;
    }

    const apiKey = 'AIzaSyCRBV4NPRexVT_2yjvT1ogr4lxEWNQjMv4'; // Google API 키 입력

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

      setTranscribedText(transcription); // 변환된 텍스트 저장

      setTimeout(() => {
        onSave(transcription); // 부모 컴포넌트에 저장
        onClose(); // 모달 닫기
      }, 3000);
    } catch (error) {
      console.error('음성 인식 오류:', error);
      onSave('내용 없음');
      onClose();
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

  // 모달이 열릴 때마다 녹음 상태 초기화 및 녹음 시작
  useEffect(() => {
    const initRecording = async () => {
      await resetRecordingState(); // 이전 녹음 상태 초기화
      await startRecording(); // 새로운 녹음 시작
    };

    if (isVisible) {
      setTimeout(() => {
        initRecording(); // 일정 시간 대기 후 녹음 시작
      }, 500); // 0.5초 지연 후 녹음 시작

      const interval = setInterval(() => {
        const currentVolume = getVolumeLevel();
        setVolume(currentVolume);
        animateScale(currentVolume);

        if (currentVolume > 0.1) {
          if (silenceTimer.current) {
            clearTimeout(silenceTimer.current);
          }
          silenceTimer.current = setTimeout(() => {
            handleClose();
          }, 10000);
        }
      }, 100);

      return () => {
        clearInterval(interval); // 녹음 상태 감지 종료
        if (silenceTimer.current) clearTimeout(silenceTimer.current); // 타이머 초기화
      };
    } else {
      stopRecording(); // 모달이 닫히면 무조건 녹음 중지
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
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>음성 인식 중...</Text>
          <View style={styles.centerContainer}>
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

          <Text style={styles.recordingText}>
            {isRecording ? '녹음 중...' : '녹음 대기 중...'}
          </Text>

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
    top: -150,
    left: 20,
    zIndex: 10,
    padding: 20, // 터치 영역을 넓히기 위해 padding 추가
  },
  closeButtonText: {
    fontSize: 50, // X 버튼 크기를 키움
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
    fontSize: 30,
    color: 'black',
    marginTop: 20,
  },
  transcribedText: {
    fontSize: 35,
    color: 'black',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default VoiceInputModal;
