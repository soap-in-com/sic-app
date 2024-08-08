import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";

const GOOGLE_CLOUD_API_KEY = "AIzaSyCRBV4NPRexVT_2yjvT1ogr4lxEWNQjMv4"; // API 키를 여기에 추가하세요.

type RecordingItem = {
  text: string;
  uri: string;
};

const ScheduleAndMedicineScreen: React.FC = () => {
  const [isScheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [isMedicineModalVisible, setMedicineModalVisible] = useState(false);
  const [scheduleText, setScheduleText] = useState("");
  const [medicineText, setMedicineText] = useState("");
  const [scheduleList, setScheduleList] = useState<RecordingItem[]>([]);
  const [medicineList, setMedicineList] = useState<RecordingItem[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecordingItem | null>(null);
  const [selectedListSetter, setSelectedListSetter] = useState<React.Dispatch<
    React.SetStateAction<RecordingItem[]>
  > | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === "granted");
      if (status !== "granted") {
        Alert.alert("권한 거부됨", "앱에서 마이크 접근 권한이 필요합니다.");
      }
    };

    requestPermission();
  }, []);

  const startRecording = async (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!hasPermission || isProcessing) {
      Alert.alert("권한 필요", "마이크 접근 권한이 필요합니다.");
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording...");
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: ".3gp",
          outputFormat: 1,
          audioEncoder: 1,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 96000,
        },
        ios: {
          extension: ".caf",
          audioQuality: 127,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      });
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async (
    setter: React.Dispatch<React.SetStateAction<string>>,
    listSetter: React.Dispatch<React.SetStateAction<RecordingItem[]>>
  ) => {
    console.log("Stopping recording...");
    if (!recording || isProcessing) return;

    setIsProcessing(true); // 처리 중 상태 설정

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);
      setRecording(null);

      if (uri) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const response = await fetch(
          `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              config: {
                encoding: "LINEAR16",
                sampleRateHertz: 16000,
                languageCode: "ko-KR",
                model: "command_and_search",
              },
              audio: {
                content: base64,
              },
            }),
          }
        );

        const data = await response.json();
        console.log(data); // 응답 데이터 확인을 위한 로그

        const bestAlternative = data.results
          ?.flatMap((result: any) => result.alternatives)
          .sort((a: any, b: any) => b.confidence - a.confidence)[0];

        const recordedText = bestAlternative?.transcript || "인식 실패";
        setter(recordedText);

        listSetter((prevList) => [
          ...prevList,
          { text: recordedText, uri: uri },
        ]);
      }
    } catch (error) {
      console.error("음성 인식 요청 실패", error);
      Alert.alert(
        "오류",
        "음성 인식 중 문제가 발생했습니다. 다시 시도해 주세요."
      );
    } finally {
      setIsProcessing(false); // 처리 중 상태 해제
    }
  };

  const handleSave = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    listSetter: React.Dispatch<React.SetStateAction<RecordingItem[]>>,
    text: string
  ) => {
    listSetter((prevList) => [...prevList, { text, uri: "" }]);
    setter("");
  };

  const handleRetake = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter("");
    setRecording(null);
  };

  const playRecording = async (uri: string) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  const confirmDeleteItem = (
    item: RecordingItem,
    listSetter: React.Dispatch<React.SetStateAction<RecordingItem[]>>
  ) => {
    setSelectedItem(item);
    setSelectedListSetter(() => listSetter);
    setDeleteModalVisible(true);
  };

  const deleteItem = () => {
    if (selectedItem && selectedListSetter) {
      selectedListSetter((prevList) =>
        prevList.filter((item) => item !== selectedItem)
      );
      setDeleteModalVisible(false);
      setSelectedItem(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.squareButton2}
          onPress={() => setScheduleModalVisible(true)}
        >
          <Text style={styles.buttonText}>일정등록</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.squareButton1}
          onPress={() => setMedicineModalVisible(true)}
        >
          <Text style={styles.buttonText}>복용약등록</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.listHeader}>일정등록내역</Text>
      <FlatList
        data={scheduleList}
        renderItem={({ item }) => (
          <View style={styles.listItemContainer}>
            <Text style={styles.listItem}>{item.text}</Text>
            <View style={styles.listItemButtons}>
              {item.uri ? (
                <TouchableOpacity onPress={() => playRecording(item.uri)}>
                  <MaterialIcons
                    name="play-circle-outline"
                    size={30}
                    color="#4CAF50"
                  />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() => confirmDeleteItem(item, setScheduleList)}
              >
                <MaterialIcons name="delete" size={30} color="#f44336" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <Text style={styles.listHeader}>복용약등록내역</Text>
      <FlatList
        data={medicineList}
        renderItem={({ item }) => (
          <View style={styles.listItemContainer}>
            <Text style={styles.listItem}>{item.text}</Text>
            <View style={styles.listItemButtons}>
              {item.uri ? (
                <TouchableOpacity onPress={() => playRecording(item.uri)}>
                  <MaterialIcons
                    name="play-circle-outline"
                    size={30}
                    color="#4CAF50"
                  />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() => confirmDeleteItem(item, setMedicineList)}
              >
                <MaterialIcons name="delete" size={30} color="#f44336" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <Modal isVisible={isScheduleModalVisible} style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>일정을 말해주세요</Text>
          <TouchableOpacity
            onPress={
              recording
                ? () => stopRecording(setScheduleText, setScheduleList)
                : () => startRecording(setScheduleText)
            }
            style={styles.voiceButton}
          >
            <MaterialIcons name="keyboard-voice" size={80} color="#4CAF50" />
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
                handleSave(setScheduleText, setScheduleList, scheduleText);
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

      <Modal isVisible={isMedicineModalVisible} style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>복용약 정보를 말해주세요</Text>
          <TouchableOpacity
            onPress={
              recording
                ? () => stopRecording(setMedicineText, setMedicineList)
                : () => startRecording(setMedicineText)
            }
            style={styles.voiceButton}
          >
            <MaterialIcons name="keyboard-voice" size={80} color="#4CAF50" />
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
                handleSave(setMedicineText, setMedicineList, medicineText);
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

      <Modal isVisible={isDeleteModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>정말로 삭제하시겠습니까?</Text>
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.bottomButton, styles.saveButton]}
              onPress={deleteItem}
            >
              <Text style={styles.bottomButtonText}>삭제</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomButton, styles.cancelButton]}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.bottomButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  squareButton1: {
    flex: 1,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#49277f",
    borderRadius: 8,
    marginHorizontal: 1,
  },
  squareButton2: {
    flex: 1,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff5252",
    borderRadius: 8,
    marginHorizontal: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "bold",
  },
  listHeader: {
    fontSize: 35,
    fontWeight: "bold",
    marginBottom: 10,
  },
  listItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  listItem: {
    fontSize: 30,
  },
  listItemButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  modal: {
    justifyContent: "center",
    margin: 0, // 화면 전체를 사용하도록 설정
  },
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    margin: 20,
  },
  modalTitle: {
    fontSize: 30, // 글씨 크기를 30으로 설정
    fontWeight: "bold",
    marginBottom: 20,
  },
  voiceButton: {
    marginVertical: 30, // 음성 인식 버튼의 위아래 간격 설정
  },
  transcriptionText: {
    fontSize: 30, // 변환된 텍스트 크기 설정
    color: "#000",
    marginTop: 20,
    textAlign: "center",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  bottomButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "#fff", // 버튼 배경을 흰색으로 설정
  },
  bottomButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50", // 버튼 텍스트 색상을 지정
  },
  saveButton: {
    backgroundColor: "#fff", // 저장 버튼 배경을 흰색으로 설정
  },
  cancelButton: {
    backgroundColor: "#fff", // 취소 버튼 배경을 흰색으로 설정
  },
  retakeButton: {
    backgroundColor: "#FFC107",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
  },
});

export default ScheduleAndMedicineScreen;
