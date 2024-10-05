import AsyncStorage from '@react-native-async-storage/async-storage'; // 추가된 AsyncStorage import
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import MemoModal from './memo';
import RegisterMedicineModal from './pilladd';
import ScheduleAddModal from './scheduleadd';

const { width } = Dimensions.get('window');

// 날짜 포맷 함수
const getFormattedDate = (date: Date): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = days[date.getDay()];
  return `${month}월 ${day}일(${dayOfWeek})`;
};

// 주어진 날짜에서 n일 전후의 날짜를 반환하는 함수
const getDateOffset = (baseDate: Date, offset: number): Date => {
  const newDate = new Date(baseDate);
  newDate.setDate(baseDate.getDate() + offset);
  return newDate;
};

// 타입 정의
interface Medicine {
  label: string;
  checked: boolean;
}

interface Schedule {
  label: string;
  checked: boolean;
}

interface DayData {
  date: string;
  isToday: boolean;
  medicines: Medicine[];
  schedules: Schedule[];
}

interface SelectedItems {
  medicines: { [label: string]: boolean };
  schedules: { [label: string]: boolean };
}

const ScheduleAndMedicineScreen: React.FC = () => {
  const today = new Date();
  const medicineFlatListRef = useRef<FlatList>(null);
  const scheduleFlatListRef = useRef<FlatList>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [memoModalVisible, setMemoModalVisible] = useState(false);
  const [scheduleAddModalVisible, setScheduleAddModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'medicine' | 'schedule' | null>(
    null
  );
  const [dateData, setDateData] = useState<DayData[]>(
    generateDateData(today, 50)
  );
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{
    [date: string]: SelectedItems;
  }>({});
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // 날짜 데이터 생성 함수
  function generateDateData(baseDate: Date, numDays: number): DayData[] {
    const dateData: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 현재 날짜의 자정을 기준으로

    for (let i = -numDays; i <= numDays; i++) {
      const date = getDateOffset(baseDate, i);
      date.setHours(0, 0, 0, 0); // 각 날짜도 자정으로 설정

      dateData.push({
        date: getFormattedDate(date),
        isToday: date.getTime() === today.getTime(), // 오늘 날짜인지 비교하여 설정
        medicines: [],
        schedules: [],
      });
    }

    return dateData;
  }

  // 기존 녹음 중지 및 정리
  const stopExistingRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
      } catch (error) {
        console.error('Stop recording error: ', error);
      }
    }
  };

  // 녹음 시작 함수
  const startRecording = async () => {
    try {
      await stopExistingRecording();

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
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
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error: ', error);
    }
  };

  // 녹음 중지 함수
  const stopRecording = async () => {
    await stopExistingRecording();
  };

  // 체크박스 토글 함수
  const toggleCheckBox = (
    dateIndex: number,
    type: 'medicine' | 'schedule',
    itemIndex: number
  ) => {
    const newData = [...dateData];
    if (type === 'medicine') {
      newData[dateIndex].medicines[itemIndex].checked =
        !newData[dateIndex].medicines[itemIndex].checked;
    } else if (type === 'schedule') {
      newData[dateIndex].schedules[itemIndex].checked =
        !newData[dateIndex].schedules[itemIndex].checked;
    }
    setDateData(newData);
    saveData(newData); // 데이터가 변경될 때마다 저장
  };

  // 데이터 저장 함수
  const saveData = async (data: DayData[]) => {
    try {
      await AsyncStorage.setItem('scheduleMedicineData', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data', error);
    }
  };

  // 앱 로드 시 저장된 데이터 불러오기
  useEffect(() => {
    loadData();
  }, []);

  // AsyncStorage에서 데이터 로드하는 함수
  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('scheduleMedicineData');
      if (storedData !== null) {
        setDateData(JSON.parse(storedData)); // 저장된 데이터를 로드하여 상태 업데이트
      }
    } catch (error) {
      console.error('데이터 저장을 실패했습니다.', error);
    }
  };

  // 오늘 날짜로 스크롤 함수
  const scrollToTodayMedicine = () => {
    if (medicineFlatListRef.current) {
      medicineFlatListRef.current.scrollToIndex({ index: 50, animated: true });
    }
  };

  const scrollToTodaySchedule = () => {
    if (scheduleFlatListRef.current) {
      scheduleFlatListRef.current.scrollToIndex({ index: 50, animated: true });
    }
  };

  // 모달 열기 함수
  const openModal = (type: 'medicine' | 'schedule') => {
    setModalType(type);
    setModalVisible(true);
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setModalVisible(false);
  };

  // 약 저장 후 상태 업데이트 함수
  const handleSaveMedicine = (data: {
    name: string;
    date: string;
    time: string;
  }) => {
    const newData = [...dateData];

    const formattedDate = getFormattedDate(new Date(data.date));
    const targetIndex = newData.findIndex((day) => day.date === formattedDate);

    if (targetIndex !== -1) {
      const label = `${data.name}${data.time ? ` (${data.time})` : ''}`;

      newData[targetIndex].medicines.push({
        label: label,
        checked: false,
      });
      setDateData(newData);
      saveData(newData); // 데이터 저장
    }

    closeModal();
  };

  // 일정 저장 후 상태 업데이트 함수
  const handleSaveSchedule = (data: {
    name: string;
    date: string;
    time: string;
  }) => {
    const newData = [...dateData];

    const formattedDate = getFormattedDate(new Date(data.date));
    const targetIndex = newData.findIndex((day) => day.date === formattedDate);

    if (targetIndex !== -1) {
      const label = `${data.name}${data.time ? ` (${data.time})` : ''}`;

      newData[targetIndex].schedules.push({
        label: label,
        checked: false,
      });
      setDateData(newData);
      saveData(newData); // 데이터 저장
    }

    closeScheduleAddModal();
  };

  // 일정 추가 모달 열기 함수
const openScheduleAddModal = () => {
  setScheduleAddModalVisible(true);
};

  // 일정 추가 모달 닫기 함수
  const closeScheduleAddModal = () => {
    setScheduleAddModalVisible(false);
  };

  // 메모 모달 열기 함수
  const openMemoModal = () => {
    setMemoModalVisible(true);
  };

  // 메모 모달 닫기 함수
  const closeMemoModal = () => {
    setMemoModalVisible(false);
  };

  // 삭제 모드 토글 함수
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedItems({});
  };

  // 항목 선택 토글 함수 (날짜별로 선택)
  const toggleSelectItem = (
    date: string,
    key: string,
    type: 'medicines' | 'schedules'
  ) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedItems = { ...prevSelectedItems };

      if (!updatedItems[date]) {
        updatedItems[date] = { medicines: {}, schedules: {} };
      }

      updatedItems[date][type][key] = !updatedItems[date][type][key];

      return updatedItems;
    });
  };

  // 선택된 항목 삭제 함수
  const deleteSelectedItems = () => {
    const newData = dateData.map((day) => {
      if (!selectedItems[day.date]) return day;

      const medicines = day.medicines.filter(
        (medicine) => !selectedItems[day.date].medicines[medicine.label]
      );
      const schedules = day.schedules.filter(
        (schedule) => !selectedItems[day.date].schedules[schedule.label]
      );

      return { ...day, medicines, schedules };
    });

    setDateData(newData);
    saveData(newData); // 삭제 후 데이터 저장
    setDeleteMode(false);
    setSelectedItems({});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {deleteMode && (
        <View
          style={[styles.actionContainer, styles.actionContainerDeleteMode]}
        >
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={deleteSelectedItems}
          >
            <Text style={styles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={toggleDeleteMode}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* 금일 복용약 */}
        <View style={styles.whiteBox}>
          <TouchableOpacity
            onPress={scrollToTodayMedicine}
            style={styles.headerWithIcon}
          >
            <View style={styles.headerTextWithIcon}>
              <Text style={styles.sectionHeader}>금일 복용약</Text>
              <Image
                source={require('../../assets/images/pill.png')}
                style={styles.headerIcon}
              />
            </View>
          </TouchableOpacity>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={dateData}
            ref={medicineFlatListRef}
            keyExtractor={(item) => item.date}
            contentContainerStyle={styles.scrollViewContent}
            initialScrollIndex={50}
            getItemLayout={(data, index) => ({
              length: width * 0.6,
              offset: (width * 0.6 + 16) * index,
              index,
            })}
            renderItem={({ item, index: dateIndex }) => (
              <View style={styles.dayContainer}>
                <View
                  style={[
                    styles.medicineCard,
                    item.isToday && styles.medicineCardToday,
                  ]}
                >
                  <Text style={styles.dayHeader}>{item.date}</Text>
                  {item.medicines.length === 0 ? (
                    <Text style={styles.noScheduleText}>일정없음</Text>
                  ) : (
                    item.medicines.map((medicine: Medicine, idx: number) => (
                      <View style={styles.medicineItem} key={idx}>
                        {!deleteMode && (
                          <CheckBox
                            checked={medicine.checked}
                            onPress={() =>
                              toggleCheckBox(dateIndex, 'medicine', idx)
                            }
                            checkedColor={
                              medicine.checked ? '#FF6F00' : undefined
                            }
                            containerStyle={styles.checkBoxContainer}
                            size={40}
                          />
                        )}
                        <Text
                          style={[
                            styles.medicineText,
                            medicine.checked && styles.checkedText,
                            { flexWrap: 'wrap', flexShrink: 1 },
                          ]}
                        >
                          {medicine.label}
                        </Text>
                        {deleteMode && (
                          <TouchableOpacity
                            style={[
                              styles.circleButton,
                              selectedItems[item.date]?.medicines[
                                medicine.label
                              ] && styles.circleButtonSelected,
                            ]}
                            onPress={() =>
                              toggleSelectItem(
                                item.date,
                                medicine.label,
                                'medicines'
                              )
                            }
                          >
                            {selectedItems[item.date]?.medicines[
                              medicine.label
                            ] && <View style={styles.circleFill} />}
                          </TouchableOpacity>
                        )}
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}
          />
        </View>

        {/* 오늘의 일정 */}
        <View style={styles.whiteBox}>
          <TouchableOpacity
            onPress={scrollToTodaySchedule}
            style={styles.headerWithIcon}
          >
            <View style={styles.headerTextWithIcon}>
              <Text style={styles.sectionHeader}>오늘의 일정</Text>
              <Image
                source={require('../../assets/images/check.png')}
                style={styles.headerIcon}
              />
            </View>
          </TouchableOpacity>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={dateData}
            ref={scheduleFlatListRef}
            keyExtractor={(item) => item.date}
            contentContainerStyle={styles.scrollViewContent}
            initialScrollIndex={50}
            getItemLayout={(data, index) => ({
              length: width * 0.6,
              offset: (width * 0.6 + 16) * index,
              index,
            })}
            renderItem={({ item, index: dateIndex }) => (
              <View style={styles.dayContainer}>
                <View
                  style={[
                    styles.scheduleCard,
                    item.isToday && styles.scheduleCardToday,
                  ]}
                >
                  <Text style={styles.dayHeader}>{item.date}</Text>
                  {item.schedules.length === 0 ? (
                    <Text style={styles.noScheduleText}>일정없음</Text>
                  ) : (
                    item.schedules.map((schedule: Schedule, idx: number) => (
                      <View style={styles.scheduleItem} key={idx}>
                        {!deleteMode && (
                          <CheckBox
                            checked={schedule.checked}
                            onPress={() =>
                              toggleCheckBox(dateIndex, 'schedule', idx)
                            }
                            checkedColor={
                              schedule.checked ? 'blue' : undefined
                            }
                            containerStyle={styles.checkBoxContainer}
                            size={40}
                          />
                        )}
                        <Text
                          style={[
                            styles.scheduleText,
                            schedule.checked && styles.checkedText,
                            { flexWrap: 'wrap', flexShrink: 1 },
                          ]}
                        >
                          {schedule.label}
                        </Text>
                        {deleteMode && (
                          <TouchableOpacity
                            style={[
                              styles.circleButton,
                              selectedItems[item.date]?.schedules[
                                schedule.label
                              ] && styles.circleButtonSelected,
                            ]}
                            onPress={() =>
                              toggleSelectItem(
                                item.date,
                                schedule.label,
                                'schedules'
                              )
                            }
                          >
                            {selectedItems[item.date]?.schedules[
                              schedule.label
                            ] && <View style={styles.circleFill} />}
                          </TouchableOpacity>
                        )}
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}
          />
        </View>

        {/* 하단 버튼 */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.medicineAddButton,
              deleteMode && styles.disabledButton,
            ]}
            onPress={() => openModal('medicine')}
            disabled={deleteMode}
          >
            <Image
              source={require('../../assets/images/pill.png')}
              style={styles.icon}
            />
            <Text style={styles.actionButtonText}>복용약 추가</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.scheduleAddButton,
              deleteMode && styles.disabledButton,
            ]}
            onPress={openScheduleAddModal}
            disabled={deleteMode}
          >
            <Image
              source={require('../../assets/images/check.png')}
              style={styles.icon}
            />
            <Text style={styles.actionButtonText}>일정 추가</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.memoButton,
              deleteMode && styles.disabledButton,
            ]}
            onPress={openMemoModal}
            disabled={deleteMode}
          >
            <Image
              source={require('../../assets/images/memo.png')}
              style={styles.icon}
            />
            <Text style={styles.actionButtonText}>메모하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteMainButton,
              deleteMode && styles.disabledButton,
            ]}
            onPress={toggleDeleteMode}
            disabled={deleteMode}>
            <Image
              source={require('../../assets/images/close.png')}
              style={styles.icon}
            />
            <Text style={styles.actionButtonText}>복용약, 일정 삭제</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 여백 추가 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 복용약 추가 모달 */}
      <RegisterMedicineModal
        visible={modalVisible && modalType === 'medicine'}
        onClose={closeModal}
        onSave={handleSaveMedicine}
      />

      {/* 메모 모달 */}
      <MemoModal
        visible={memoModalVisible}
        onClose={closeMemoModal}
        onSave={(memo) => {
          console.log('저장된 메모:', memo);
          closeMemoModal();
        }}
        startRecording={startRecording}
        stopRecording={stopRecording}
      />

      {/* 일정 추가 모달 */}
      <ScheduleAddModal
        visible={scheduleAddModalVisible}
        onClose={closeScheduleAddModal}
        onSave={handleSaveSchedule} // 일정 저장 함수 연결
      />
    </SafeAreaView>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaeaea',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
  },
  whiteBox: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionContainerDeleteMode: {
    marginBottom: 20,
  },
  headerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 30,
    height: 30,
    marginLeft: 5,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dayContainer: {
    width: width * 0.6,
    marginRight: 16,
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
  medicineCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medicineCardToday: {
    borderWidth: 2,
    borderColor: '#FF6F00',
  },
  scheduleCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  scheduleCardToday: {
    borderWidth: 2,
    borderColor: '#1565C0',
  },
  dayHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  noScheduleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#707070',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 10,
  },
  medicineText: {
    fontSize: 25,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    flexShrink: 1,
    width: '100%',
  },
  scheduleText: {
    fontSize: 25,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    flexShrink: 1,
    width: '100%',
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  checkBoxContainer: {
    padding: 0,
    margin: 0,
    marginRight: 10,
  },
  circleButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  circleButtonSelected: {
    borderColor: '#FF0000',
  },
  circleFill: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#FF0000',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medicineAddButton: {
    backgroundColor: '#e6f4fa',
  },
  scheduleAddButton: {
    backgroundColor: '#ebf5e0',
  },
  memoButton: {
    backgroundColor: '#f8f3c5',
  },
  deleteMainButton: {
    backgroundColor: '#fec1b9',
  },
  deleteButton: {
    backgroundColor: '#FF6F6F',
  },
  cancelButton: {
    backgroundColor: '#f8d7da',
  },
  actionButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 28,
    marginTop: 8,
  },
  deleteButtonText: {
    color: 'black',
    fontSize: 30,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 30,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  icon: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 50,
  },
});

export default ScheduleAndMedicineScreen;