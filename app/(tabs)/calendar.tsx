import { Audio } from 'expo-av';
import React, { useRef, useState } from 'react';
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
  const [dateData, setDateData] = useState<DayData[]>(
    generateDateData(today, 50)
  ); // 날짜 데이터
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
    setModalVisible(true); // 모달 열기
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

    // 날짜 형식이 'YYYY-MM-DD'라면 해당 날짜의 인덱스를 찾음
    const formattedDate = getFormattedDate(new Date(data.date));
    const targetIndex = newData.findIndex((day) => day.date === formattedDate);

    if (targetIndex !== -1) {
      // 시간과 이름만 저장
      const label = `${data.name}${data.time ? ` (${data.time})` : ''}`;

      newData[targetIndex].medicines.push({
        label: label, // 라벨 생성
        checked: false,
      });
      setDateData(newData);
    }

    closeModal(); // 모달 닫기
  };

  // 일정 저장 후 상태 업데이트 함수
  const handleSaveSchedule = (data: {
    name: string;
    date: string;
    time: string;
  }) => {
    const newData = [...dateData];

    // 날짜 형식이 'YYYY-MM-DD'라면 해당 날짜의 인덱스를 찾음
    const formattedDate = getFormattedDate(new Date(data.date));
    const targetIndex = newData.findIndex((day) => day.date === formattedDate);

    if (targetIndex !== -1) {
      // 시간과 이름만 저장
      const label = `${data.name}${data.time ? ` (${data.time})` : ''}`;

      newData[targetIndex].schedules.push({
        label: label, // 라벨 생성
        checked: false,
      });
      setDateData(newData); // 상태 업데이트
    }

    closeScheduleAddModal(); // 일정 추가 모달 닫기
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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 삭제 및 취소 버튼을 화면 상단으로 이동 */}
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
                            size={40} // 체크박스 크기 키움
                          />
                        )}
                        <Text
                          style={[
                            styles.medicineText,
                            medicine.checked && styles.checkedText,
                            { flexWrap: 'wrap', flexShrink: 1 }, // 추가된 속성
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
                            checkedColor={schedule.checked ? 'blue' : undefined}
                            containerStyle={styles.checkBoxContainer}
                            size={40} // 체크박스 크기 키움
                          />
                        )}
                        <Text
                          style={[
                            styles.scheduleText,
                            schedule.checked && styles.checkedText,
                            { flexWrap: 'wrap', flexShrink: 1 }, // 추가된 속성
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
            disabled={deleteMode} // 삭제 모드일 때 비활성화
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
            disabled={deleteMode} // 삭제 모드일 때 비활성화
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
            disabled={deleteMode} // 삭제 모드일 때 비활성화
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
            disabled={deleteMode} // 삭제 모드일 때 비활성화
          >
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
    color: '#707070', // 짙은 회색으로 설정
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  medicineItem: {
    flexDirection: 'row', // 가로로 배치
    alignItems: 'center', // 텍스트와 원을 세로로 가운데 정렬
    justifyContent: 'space-between', // 텍스트와 원을 양 끝에 배치
    marginBottom: 10, // 항목 간 간격
    paddingVertical: 10, // 상하 간격을 조금 키움
  },
  scheduleItem: {
    flexDirection: 'row', // 가로로 배치
    alignItems: 'center', // 텍스트와 원을 세로로 가운데 정렬
    justifyContent: 'space-between', // 텍스트와 원을 양 끝에 배치
    marginBottom: 10, // 항목 간 간격
    paddingVertical: 10, // 상하 간격을 조금 키움
  },
  medicineText: {
    fontSize: 25, // 텍스트 크기 키움
    fontWeight: 'bold',
    flexWrap: 'wrap', // 줄바꿈 허용
    flexShrink: 1, // 텍스트가 줄어들면서 줄바꿈
    width: '100%', // 부모 컨테이너에 맞게 너비 설정
  },
  scheduleText: {
    fontSize: 25, // 텍스트 크기 키움
    fontWeight: 'bold',
    flexWrap: 'wrap', // 줄바꿈 허용
    flexShrink: 1, // 텍스트가 줄어들면서 줄바꿈
    width: '100%', // 부모 컨테이너에 맞게 너비 설정
  },
  checkedText: {
    textDecorationLine: 'line-through', // 체크된 항목에 가운데 선 추가
    color: 'gray', // 선택된 항목에 대한 색상 변경
  },
  checkBoxContainer: {
    padding: 0,
    margin: 0,
    marginRight: 10, // 체크박스 여백 추가
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
    width: 25, // 내부 원 크기
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
    backgroundColor: '#f8d7da', // 취소 버튼 색상 설정
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
    opacity: 0.5, // 비활성화 시 투명도 낮춤
  },
  icon: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 50, // 스크롤 시 하단에 추가 여백
  },
});

export default ScheduleAndMedicineScreen;
