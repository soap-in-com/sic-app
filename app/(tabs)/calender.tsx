import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';

const GOOGLE_CLOUD_API_KEY = 'AIzaSyCRBV4NPRexVT_2yjvT1ogr4lxEWNQjMv4';

type RecordingItem = {
  text: string;
  uri: string;
};

const extractInfoFromText = (
  text: string,
  type: 'schedule' | 'medicine' | 'memo'
) => {
  const dateRegex = /\d{1,2}월 \d{1,2}일/;
  const timeRegex = /(오전|오후)?\s?\d{1,2}시/;

  const dateMatch = text.match(dateRegex);
  const timeMatch = text.match(timeRegex);

  const date = dateMatch ? dateMatch[0] : '';
  const time = timeMatch ? timeMatch[0] : '';

  let remainingText = text.replace(dateRegex, '').replace(timeRegex, '').trim();
  let content = remainingText
    ? remainingText
    : type === 'schedule'
    ? '장소 없음'
    : '내용 없음';

  return [date, time, content].filter(Boolean).join(' ');
};

const ScheduleAndMedicineScreen: React.FC = () => {
  const [isScheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [isMedicineModalVisible, setMedicineModalVisible] = useState(false);
  const [scheduleText, setScheduleText] = useState('');
  const [medicineText, setMedicineText] = useState('');
  const [scheduleList, setScheduleList] = useState<RecordingItem[]>([]);
  const [medicineList, setMedicineList] = useState<RecordingItem[]>([]);
  const [memoText, setMemoText] = useState('');
  const [memoList, setMemoList] = useState<RecordingItem[]>([]);
  const [isMemoModalVisible, setMemoModalVisible] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecordingItem | null>(null);
  const [selectedListType, setSelectedListType] = useState<
    'schedule' | 'medicine' | 'memo' | null
  >(null);
  const [audioUri, setAudioUri] = useState<string | null>(null); // 녹음된 파일 URI 저장

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('권한 거부됨', '앱에서 마이크 접근 권한이 필요합니다.');
      }
    };

    requestPermission();
  }, []);

  const startRecording = async (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!hasPermission || isProcessing) {
      Alert.alert('권한 필요', '마이크 접근 권한이 필요합니다.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.3gp',
          outputFormat: 1,
          audioEncoder: 1,
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
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async (
    setter: React.Dispatch<React.SetStateAction<string>>,
    type: 'schedule' | 'medicine' | 'memo'
  ) => {
    if (!recording || isProcessing) return;

    setIsProcessing(true);
    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setAudioUri(uri); // 녹음된 파일의 URI 저장

      if (uri) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const response = await fetch(
          `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              config: {
                encoding: 'LINEAR16',
                sampleRateHertz: 16000,
                languageCode: 'ko-KR',
                model: 'command_and_search',
              },
              audio: {
                content: base64,
              },
            }),
          }
        );

        const data = await response.json();

        const bestAlternative = data.results
          ?.flatMap((result: any) => result.alternatives)
          .sort((a: any, b: any) => b.confidence - a.confidence)[0];

        const recordedText = bestAlternative?.transcript || '인식 실패';
        setter(recordedText);

        if (recordedText === '인식 실패') {
          Alert.alert('알림', '음성 인식이 실패했습니다. 다시 시도해주세요.');
        }
      }
    } catch (error) {
      console.error('음성 인식 요청 실패', error);
      Alert.alert('오류', '음성 인식 중 문제가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveRecording = (
    text: string,
    listSetter: React.Dispatch<React.SetStateAction<RecordingItem[]>>,
    type: 'schedule' | 'medicine' | 'memo'
  ) => {
    if (text && text !== '인식 실패' && audioUri) {
      const formattedText = extractInfoFromText(text, type);
      listSetter((prevList) => [
        ...prevList,
        { text: formattedText, uri: audioUri },
      ]);
    } else {
      Alert.alert('알림', '인식된 텍스트가 없거나 인식이 실패했습니다.');
    }
  };

  const handleRetake = async (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter('');
    setIsRecording(false);

    if (recording) {
      await recording.stopAndUnloadAsync();
      setRecording(null);
    }
  };

  const resetModal = () => {
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
    setIsRecording(false);
    setIsProcessing(false);
    setAudioUri(null); // 저장된 URI 초기화
    setScheduleText('');
    setMedicineText('');
    setMemoText('');
  };

  const playRecording = async (uri: string) => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false, // 스피커 사용
      });

      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.error('음성 재생 중 오류 발생:', error);
    }
  };

  const openDeleteModal = (
    item: RecordingItem,
    type: 'schedule' | 'medicine' | 'memo'
  ) => {
    setSelectedItem(item);
    setSelectedListType(type);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedItem && selectedListType) {
      const updateList = (list: RecordingItem[]) =>
        list.filter((item) => item !== selectedItem);

      if (selectedListType === 'schedule') {
        setScheduleList(updateList);
      } else if (selectedListType === 'medicine') {
        setMedicineList(updateList);
      } else if (selectedListType === 'memo') {
        setMemoList(updateList);
      }

      setSelectedItem(null);
      setSelectedListType(null);
      setIsDeleteModalVisible(false);
    }
  };

  const renderRecordingList = (
    header: string,
    list: RecordingItem[],
    listSetter: React.Dispatch<React.SetStateAction<RecordingItem[]>>,
    type: 'schedule' | 'medicine' | 'memo'
  ) => (
    <>
      <Text style={styles.listHeader}>{header}</Text>
      {list.map((item, index) => (
        <View key={index} style={styles.listItemContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.listItem}>{item.text}</Text>
          </View>
          <View style={styles.listItemButtons}>
            {item.uri && (
              <TouchableOpacity onPress={() => playRecording(item.uri)}>
                <MaterialIcons
                  name="play-circle-outline"
                  size={40}
                  color="#4CAF50"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => openDeleteModal(item, type)}>
              <MaterialIcons name="delete" size={40} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </>
  );

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.squareButton2}
            onPress={() => {
              resetModal();
              setScheduleModalVisible(true);
            }}
          >
            <Text style={styles.buttonText}>일정등록</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.squareButton1}
            onPress={() => {
              resetModal();
              setMedicineModalVisible(true);
            }}
          >
            <Text style={styles.buttonText}>복용약등록</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.memoButton}
          onPress={() => {
            resetModal();
            setMemoModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>메모등록</Text>
        </TouchableOpacity>

        {renderRecordingList(
          '일정등록내역',
          scheduleList,
          setScheduleList,
          'schedule'
        )}
        {renderRecordingList(
          '복용약등록내역',
          medicineList,
          setMedicineList,
          'medicine'
        )}
        {renderRecordingList('메모등록내역', memoList, setMemoList, 'memo')}

        {/* 삭제 확인 모달 */}
        <Modal
          isVisible={isDeleteModalVisible}
          onBackdropPress={() => setIsDeleteModalVisible(false)}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>삭제하시겠습니까?</Text>
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[styles.bottomButton, styles.saveButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.bottomButtonText}>예</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bottomButton, styles.cancelButton]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.bottomButtonText}>아니요</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 일정 등록 모달 */}
        <Modal
          isVisible={isScheduleModalVisible}
          onModalHide={resetModal}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isRecording
                ? '말이 끝나면 마이크를 한번 더 눌러주세요'
                : '마이크를 누르고 일정을 말해주세요'}
            </Text>
            <TouchableOpacity
              onPress={
                isRecording
                  ? () => stopRecording(setScheduleText, 'schedule')
                  : () => startRecording(setScheduleText)
              }
              style={styles.voiceButton}
            >
              <MaterialIcons
                name="keyboard-voice"
                size={80}
                color={isRecording ? 'red' : '#4CAF50'}
              />
            </TouchableOpacity>
            <Text style={styles.transcriptionText}>{scheduleText}</Text>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => handleRetake(setScheduleText)}
            >
              <Text style={styles.buttonText}>다시 말하기</Text>
            </TouchableOpacity>
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[styles.bottomButton, styles.saveButton]}
                onPress={() => {
                  saveRecording(scheduleText, setScheduleList, 'schedule');
                  setScheduleModalVisible(false);
                }}
              >
                <Text style={styles.bottomButtonText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bottomButton, styles.cancelButton]}
                onPress={() => setScheduleModalVisible(false)}
              >
                <Text style={styles.bottomButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 복용약 등록 모달 */}
        <Modal
          isVisible={isMedicineModalVisible}
          onModalHide={resetModal}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isRecording
                ? '말이 끝나면 마이크를 한번 더 눌러주세요'
                : '마이크를 누르고 복용약 정보를 말해주세요'}
            </Text>
            <TouchableOpacity
              onPress={
                isRecording
                  ? () => stopRecording(setMedicineText, 'medicine')
                  : () => startRecording(setMedicineText)
              }
              style={styles.voiceButton}
            >
              <MaterialIcons
                name="keyboard-voice"
                size={80}
                color={isRecording ? 'red' : '#4CAF50'}
              />
            </TouchableOpacity>
            <Text style={styles.transcriptionText}>{medicineText}</Text>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => handleRetake(setMedicineText)}
            >
              <Text style={styles.buttonText}>다시 말하기</Text>
            </TouchableOpacity>
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[styles.bottomButton, styles.saveButton]}
                onPress={() => {
                  saveRecording(medicineText, setMedicineList, 'medicine');
                  setMedicineModalVisible(false);
                }}
              >
                <Text style={styles.bottomButtonText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bottomButton, styles.cancelButton]}
                onPress={() => setMedicineModalVisible(false)}
              >
                <Text style={styles.bottomButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 메모 등록 모달 */}
        <Modal
          isVisible={isMemoModalVisible}
          onModalHide={resetModal}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isRecording
                ? '말이 끝나면 마이크를 한번 더 눌러주세요'
                : '마이크를 누르고 메모를 말해주세요'}
            </Text>
            <TouchableOpacity
              onPress={
                isRecording
                  ? () => stopRecording(setMemoText, 'memo')
                  : () => startRecording(setMemoText)
              }
              style={styles.voiceButton}
            >
              <MaterialIcons
                name="keyboard-voice"
                size={80}
                color={isRecording ? 'red' : '#4CAF50'}
              />
            </TouchableOpacity>
            <Text style={styles.transcriptionText}>{memoText}</Text>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => handleRetake(setMemoText)}
            >
              <Text style={styles.buttonText}>다시 말하기</Text>
            </TouchableOpacity>
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[styles.bottomButton, styles.saveButton]}
                onPress={() => {
                  saveRecording(memoText, setMemoList, 'memo');
                  setMemoModalVisible(false);
                }}
              >
                <Text style={styles.bottomButtonText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bottomButton, styles.cancelButton]}
                onPress={() => setMemoModalVisible(false)}
              >
                <Text style={styles.bottomButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  squareButton1: {
    flex: 1,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#49277f',
    borderRadius: 8,
    marginHorizontal: 1,
  },
  squareButton2: {
    flex: 1,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff5252',
    borderRadius: 8,
    marginHorizontal: 1,
  },
  memoButton: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
  },
  listHeader: {
    fontSize: 35,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  textContainer: {
    flex: 1,
    marginRight: 20,
  },
  listItem: {
    fontSize: 36,
    flexWrap: 'wrap',
  },
  listItemButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modal: {
    justifyContent: 'center',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 20,
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  voiceButton: {
    marginVertical: 30,
  },
  transcriptionText: {
    fontSize: 30,
    color: '#000',
    marginTop: 20,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  bottomButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  bottomButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  saveButton: {
    backgroundColor: '#fff',
  },
  cancelButton: {
    backgroundColor: '#fff',
  },
  retakeButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
  },
});

export default ScheduleAndMedicineScreen;