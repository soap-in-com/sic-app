import AsyncStorage from '@react-native-async-storage/async-storage';
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
import MemoModal from './memo'; // memo.tsx 모달 컴포넌트 가져오기
import RegisterMedicineModal from './pilladd'; // pilladd.tsx에서 가져온 모달 컴포넌트
import ScheduleAddModal from './scheduleadd'; // scheduleadd.tsx에서 가져온 모달 컴포넌트

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
  id: number; // 고유 ID 추가
  label: string;
  checked: boolean;
}

interface Schedule {
  id: number;  // 고유 ID 필드 추가
  label: string;
  checked: boolean;
}

interface DayData {
  date: string;
  isToday: boolean;
  medicines: Medicine[];
  schedules: Schedule[];
}

// 선택된 항목 상태 타입 정의
interface SelectedItems {
  medicines: { [label: string]: boolean };
  schedules: { [label: string]: boolean };
}

const ScheduleAndMedicineScreen: React.FC = () => {
  const today = new Date();
  const medicineFlatListRef = useRef<FlatList>(null); // 복용약 FlatList 참조
  const scheduleFlatListRef = useRef<FlatList>(null); // 일정 FlatList 참조
  const [modalVisible, setModalVisible] = useState(false); // 모달 상태
  const [memoModalVisible, setMemoModalVisible] = useState(false); // 메모 모달 상태 추가
  const [scheduleAddModalVisible, setScheduleAddModalVisible] = useState(false); // 일정 추가 모달 상태 추가
  const [modalType, setModalType] = useState<'medicine' | 'schedule' | null>(
    null
  ); // 모달 타입
  const [dateData, setDateData] = useState<DayData[]>(generateDateData(today, 50)); // 날짜 데이터 생성 및 저장
  const [todayIndex, setTodayIndex] = useState<number>(0);  // 오늘 날짜의 인덱스를 저장하는 상태 추가
  const [deleteMode, setDeleteMode] = useState(false); // 삭제 모드 상태 추가
  const [selectedItems, setSelectedItems] = useState<{
    [date: string]: SelectedItems;
  }>({}); // 선택한 항목 상태
  const [recording, setRecording] = useState<Audio.Recording | null>(null); // 녹음 객체 상태
  const [isRecording, setIsRecording] = useState(false); // 녹음 상태 관리

  // 날짜 데이터 생성 함수
  function generateDateData(baseDate: Date, numDays: number): DayData[] {
    const dateData: DayData[] = [];
    for (let i = -numDays; i <= numDays; i++) {
      const date = getFormattedDate(getDateOffset(baseDate, i));
      dateData.push({
        date,
        isToday: i === 0, // 오늘 날짜인지 여부
        medicines: [],
        schedules: [],
      });
    }
    return dateData;
  }

  // 오늘 날짜의 인덱스를 찾는 함수
  const findTodayIndex = (data: DayData[]) => {
    const formattedToday = getFormattedDate(today);  // 오늘 날짜를 포맷팅하여 저장
    return data.findIndex(day => day.date === formattedToday);  // dateData 배열에서 오늘 날짜와 일치하는 인덱스를 반환
  };

   // useEffect를 통해 오늘 날짜 인덱스를 설정
   useEffect(() => {
    const index = findTodayIndex(dateData);  // 오늘 날짜 인덱스를 계산
    if (index >= 0) {
      setTodayIndex(index);  // 계산된 인덱스를 상태에 저장하여 오늘 날짜 인덱스를 설정
    }
  }, [dateData]);  // dateData가 변경될 때마다 오늘 날짜 인덱스를 계산


 // updateTodayFlag 함수 추가
 const updateTodayFlag = (data: DayData[]) => {
  const today = new Date();
  const formattedToday = getFormattedDate(today);

  return data.map(day => ({
    ...day,
    isToday: day.date === formattedToday, // 오늘 날짜인지 확인 후 플래그 설정
  }));
};

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
      await stopExistingRecording(); // 기존 녹음이 있으면 정리

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.3gp',
          outputFormat: 1, // 1: MPEG_4 format
          audioEncoder: 1, // 1: AAC LC codec
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 96000,
        },
        ios: {
          extension: '.caf',
          audioQuality: 127, // High quality
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
    await stopExistingRecording(); // 기존 녹음이 있으면 중지
  };

  // 데이터 저장 함수 (AsyncStorage 사용)
  const saveDataToStorage = async (data: string) => {
    try {
      await AsyncStorage.setItem('scheduleMedicineData', data);
      console.log('Data saved:', data); // 저장된 데이터를 확인
    } catch (error) {
      console.error('Failed to save data to AsyncStorage:', error);
    }
  };

  // 데이터 로드 함수
  const loadDataFromStorage = async () => {
    try {
      const storedData = await AsyncStorage.getItem('scheduleMedicineData');
      if (storedData !== null) { 
        console.log('Loaded Data:', storedData);  // 로그로 불러온 데이터 확인
        let parsedData = JSON.parse(storedData); // 파싱된 데이터를 저장할 변수 선언
        parsedData = updateTodayFlag(parsedData); // 오늘 날짜 플래그 업데이트
        setDateData(parsedData); // 업데이트된 데이터를 상태에 반영
      }
    } catch (error) {
      console.error('Failed to load data from AsyncStorage:', error);
    }
  };

    // 초기 데이터 로딩을 위해 useEffect 추가
  useEffect(() => {
    // 앱 시작 시 데이터 불러오기
    loadDataFromStorage();
  }, []);

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
    saveDataToStorage(JSON.stringify(newData)); // 상태 변경 후 저장
  };

  // 오늘 날짜로 스크롤 함수
  const scrollToTodayMedicine = () => {
    if (medicineFlatListRef.current) {
      medicineFlatListRef.current.scrollToIndex({ index: todayIndex, animated: true });
    }
  };

  const scrollToTodaySchedule = () => {
    if (scheduleFlatListRef.current) {
      scheduleFlatListRef.current.scrollToIndex({ index: todayIndex, animated: true });
    }
  };

  // 모달 열기 함수
  const openModal = (type: 'medicine' | 'schedule') => {
    setModalType(type);
    setModalVisible(true); // 모달 열기
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setModalVisible(false);
  };

  // 약 저장 후 상태 업데이트 함수
  const handleSaveMedicine = async (data: {
    name: string;
    date: string;
    time: string;
  }) => {
    const newData = [...dateData];
    const formattedDate = getFormattedDate(new Date(data.date));
    const targetIndex = newData.findIndex((day) => day.date === formattedDate);
  
    if (targetIndex !== -1) {
      const label = `${data.name}${data.time ? ` (${data.time})` : ''}`;
      const medicationId = Date.now(); // 고유 ID 생성


      // Medicine 객체로 복용약 데이터를 추가
    newData[targetIndex].medicines.push({
      id: medicationId,
      label: label,
      checked: false,
    });

     // 전체 복용약 데이터를 가져와 업데이트
     try {
      const allMedicationsString = await AsyncStorage.getItem('allMedications');
      const allMedications = allMedicationsString ? JSON.parse(allMedicationsString) : {};

      // 해당 날짜의 복용약 데이터를 업데이트
      allMedications[formattedDate] = newData[targetIndex].medicines;

      // 전체 복용약 데이터를 다시 저장
      await AsyncStorage.setItem('allMedications', JSON.stringify(allMedications));
    } catch (error) {
      console.error('복용약 데이터를 저장하는 중 오류가 발생했습니다:', error);
    }
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
      const scheduleId = Date.now(); // 고유 ID 추가
      
      newData[targetIndex].schedules.push({
        id: scheduleId, // 고유 ID 추가
        label: label,
        checked: false,
      });
      setDateData(newData); // 상태 업데이트
      saveDataToStorage(JSON.stringify(newData)); // 상태 저장
    }

    closeScheduleAddModal();
  };

  // 메모 모달 열기 함수
  const openMemoModal = () => {
    setMemoModalVisible(true); // 메모 모달 열기
  };

  // 메모 모달 닫기 함수
  const closeMemoModal = () => {
    setMemoModalVisible(false); // 메모 모달 닫기
  };

  // 일정 추가 모달 열기 함수
  const openScheduleAddModal = () => {
    setScheduleAddModalVisible(true); // 일정 추가 모달 열기
  };

  // 일정 추가 모달 닫기 함수
  const closeScheduleAddModal = () => {
    setScheduleAddModalVisible(false); // 일정 추가 모달 닫기
  };

  // 삭제 모드 토글 함수
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedItems({}); // 선택된 항목 초기화
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
    setDeleteMode(false);
    setSelectedItems({});
    saveDataToStorage(JSON.stringify(newData)); // 상태 저장
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
            initialScrollIndex={todayIndex}
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
            initialScrollIndex={todayIndex}
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
            disabled={deleteMode}
          >
            <Image
              source={require('../../assets/images/close.png')}
              style={styles.icon}
            />
            <Text style={styles.actionButtonText}>복용약, 일정 삭제</Text>
          </TouchableOpacity>
        </View>

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
        onSave={handleSaveSchedule}
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
    marginBottom: 20, // 간격 조정: 삭제 취소 버튼과 금일 복용약 사이의 간격
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
    marginBottom: 14, // 아이콘이 텍스트와 일직선에 맞춰지도록 조정
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
