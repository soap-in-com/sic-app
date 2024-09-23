// import React, { useRef, useState } from 'react';
// import {
//   Dimensions,
//   FlatList,
//   Image,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { CheckBox } from 'react-native-elements';
// import MemoModal from './memo'; // memo.tsx 모달 컴포넌트 가져오기
// import RegisterMedicineModal from './pilladd'; // pilladd.tsx에서 가져온 모달 컴포넌트
// import ScheduleAddModal from './scheduleadd'; // scheduleadd.tsx에서 가져온 모달 컴포넌트

// const { width } = Dimensions.get('window');

// // 날짜 포맷 함수
// const getFormattedDate = (date: Date): string => {
//   const days = ['일', '월', '화', '수', '목', '금', '토'];
//   const month = date.getMonth() + 1;
//   const day = date.getDate();
//   const dayOfWeek = days[date.getDay()];
//   return `${month}월 ${day}일(${dayOfWeek})`;
// };

// // 주어진 날짜에서 n일 전후의 날짜를 반환하는 함수
// const getDateOffset = (baseDate: Date, offset: number): Date => {
//   const newDate = new Date(baseDate);
//   newDate.setDate(baseDate.getDate() + offset);
//   return newDate;
// };

// // 타입 정의
// interface Medicine {
//   label: string;
//   checked: boolean;
// }

// interface Schedule {
//   label: string;
//   checked: boolean;
// }

// interface DayData {
//   date: string;
//   isToday: boolean;
//   medicines: Medicine[];
//   schedules: Schedule[];
// }

// const ScheduleAndMedicineScreen: React.FC = () => {
//   const today = new Date();
//   const medicineFlatListRef = useRef<FlatList>(null); // 복용약 FlatList 참조
//   const scheduleFlatListRef = useRef<FlatList>(null); // 일정 FlatList 참조
//   const [modalVisible, setModalVisible] = useState(false); // 모달 상태
//   const [memoModalVisible, setMemoModalVisible] = useState(false); // 메모 모달 상태 추가
//   const [scheduleAddModalVisible, setScheduleAddModalVisible] = useState(false); // 일정 추가 모달 상태 추가
//   const [modalType, setModalType] = useState<'medicine' | 'schedule' | null>(
//     null
//   ); // 모달 타입
//   const [dateData, setDateData] = useState<DayData[]>(
//     generateDateData(today, 50)
//   ); // 날짜 데이터
//   const [deleteMode, setDeleteMode] = useState(false); // 삭제 모드 상태 추가
//   const [selectedItems, setSelectedItems] = useState<{
//     [key: string]: boolean;
//   }>({}); // 선택한 항목 상태

//   // 날짜 데이터 생성 함수
//   function generateDateData(baseDate: Date, numDays: number): DayData[] {
//     const dateData: DayData[] = [];
//     for (let i = -numDays; i <= numDays; i++) {
//       const date = getFormattedDate(getDateOffset(baseDate, i));
//       dateData.push({
//         date,
//         isToday: i === 0, // 오늘 날짜인지 여부
//         medicines: [
//           { label: '종합영양제', checked: false },
//           { label: '혈압 약', checked: false },
//           { label: '고지혈증 약', checked: false },
//         ],
//         schedules: [
//           { label: '병원가기', checked: false },
//           { label: '아들과 전화', checked: false },
//           { label: '장보기', checked: false },
//         ],
//       });
//     }
//     return dateData;
//   }

//   // 체크박스 토글 함수
//   const toggleCheckBox = (
//     dateIndex: number,
//     type: 'medicine' | 'schedule',
//     itemIndex: number
//   ) => {
//     const newData = [...dateData];
//     if (type === 'medicine') {
//       newData[dateIndex].medicines[itemIndex].checked =
//         !newData[dateIndex].medicines[itemIndex].checked;
//     } else if (type === 'schedule') {
//       newData[dateIndex].schedules[itemIndex].checked =
//         !newData[dateIndex].schedules[itemIndex].checked;
//     }
//     setDateData(newData);
//   };

//   // 오늘 날짜로 스크롤 함수
//   const scrollToTodayMedicine = () => {
//     if (medicineFlatListRef.current) {
//       medicineFlatListRef.current.scrollToIndex({ index: 50, animated: true });
//     }
//   };

//   const scrollToTodaySchedule = () => {
//     if (scheduleFlatListRef.current) {
//       scheduleFlatListRef.current.scrollToIndex({ index: 50, animated: true });
//     }
//   };

//   // 모달 열기 함수
//   const openModal = (type: 'medicine' | 'schedule') => {
//     setModalType(type);
//     setModalVisible(true); // 모달 열기
//   };

//   // 모달 닫기 함수
//   const closeModal = () => {
//     setModalVisible(false);
//   };

//   // 약 저장 후 상태 업데이트 함수
//   const handleSaveMedicine = (data: {
//     name: string;
//     date: string;
//     time: string;
//     meal: string;
//   }) => {
//     const newData = [...dateData];

//     // 날짜 형식이 'YYYY-MM-DD'라면 해당 날짜의 인덱스를 찾음
//     const formattedDate = getFormattedDate(new Date(data.date));
//     const targetIndex = newData.findIndex((day) => day.date === formattedDate);

//     if (targetIndex !== -1) {
//       newData[targetIndex].medicines.push({
//         label: `${data.name} (${data.time}, ${data.meal})`,
//         checked: false,
//       });
//       setDateData(newData);
//     }

//     closeModal(); // 모달 닫기
//   };

//   // 메모 모달 열기 함수
//   const openMemoModal = () => {
//     setMemoModalVisible(true); // 메모 모달 열기
//   };

//   // 메모 모달 닫기 함수
//   const closeMemoModal = () => {
//     setMemoModalVisible(false); // 메모 모달 닫기
//   };

//   // 일정 추가 모달 열기 함수
//   const openScheduleAddModal = () => {
//     setScheduleAddModalVisible(true); // 일정 추가 모달 열기
//   };

//   // 일정 추가 모달 닫기 함수
//   const closeScheduleAddModal = () => {
//     setScheduleAddModalVisible(false); // 일정 추가 모달 닫기
//   };

//   // 삭제 모드 토글 함수
//   const toggleDeleteMode = () => {
//     setDeleteMode(!deleteMode);
//     setSelectedItems({}); // 선택된 항목 초기화
//   };

//   // 항목 선택 토글 함수
//   const toggleSelectItem = (key: string) => {
//     setSelectedItems((prevSelectedItems) => ({
//       ...prevSelectedItems,
//       [key]: !prevSelectedItems[key],
//     }));
//   };

//   // 선택된 항목 삭제 함수
//   const deleteSelectedItems = () => {
//     const newData = dateData.map((day) => {
//       const medicines = day.medicines.filter(
//         (medicine) => !selectedItems[medicine.label]
//       );
//       const schedules = day.schedules.filter(
//         (schedule) => !selectedItems[schedule.label]
//       );
//       return { ...day, medicines, schedules };
//     });

//     setDateData(newData);
//     setDeleteMode(false);
//     setSelectedItems({});
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView contentContainerStyle={styles.scrollViewContent}>
//         {/* 금일 복용약 */}
//         <View style={styles.whiteBox}>
//           <TouchableOpacity
//             onPress={scrollToTodayMedicine}
//             style={styles.headerWithIcon}
//           >
//             <View style={styles.headerTextWithIcon}>
//               <Text style={styles.sectionHeader}>금일 복용약</Text>
//               <Image
//                 source={require('../../assets/images/pill.png')}
//                 style={styles.headerIcon}
//               />
//             </View>
//           </TouchableOpacity>
//           <FlatList
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             data={dateData}
//             ref={medicineFlatListRef}
//             keyExtractor={(item) => item.date}
//             contentContainerStyle={styles.scrollViewContent}
//             initialScrollIndex={50}
//             getItemLayout={(data, index) => ({
//               length: width * 0.6,
//               offset: (width * 0.6 + 16) * index,
//               index,
//             })}
//             renderItem={({ item, index: dateIndex }) => (
//               <View style={styles.dayContainer}>
//                 <View
//                   style={[
//                     styles.medicineCard,
//                     item.isToday && styles.medicineCardToday,
//                   ]}
//                 >
//                   <Text style={styles.dayHeader}>{item.date}</Text>
//                   {item.medicines.map((medicine: Medicine, idx: number) => (
//                     <View style={styles.medicineItem} key={idx}>
//                       <CheckBox
//                         checked={medicine.checked}
//                         onPress={() =>
//                           toggleCheckBox(dateIndex, 'medicine', idx)
//                         }
//                         checkedColor={medicine.checked ? '#FF6F00' : undefined}
//                         containerStyle={styles.checkBoxContainer}
//                         size={40} // 체크박스 크기 키움
//                       />
//                       <Text
//                         style={[
//                           styles.medicineText,
//                           medicine.checked && styles.checkedText,
//                         ]}
//                       >
//                         {medicine.label}
//                       </Text>
//                       {deleteMode && (
//                         <TouchableOpacity
//                           style={styles.selectButton}
//                           onPress={() => toggleSelectItem(medicine.label)}
//                         >
//                           <Text
//                             style={[
//                               styles.selectButtonText,
//                               selectedItems[medicine.label] &&
//                                 styles.selectedText,
//                             ]}
//                           >
//                             {selectedItems[medicine.label] ? '선택됨' : '선택'}
//                           </Text>
//                         </TouchableOpacity>
//                       )}
//                     </View>
//                   ))}
//                 </View>
//               </View>
//             )}
//           />
//         </View>

//         {/* 오늘의 일정 */}
//         <View style={styles.whiteBox}>
//           <TouchableOpacity
//             onPress={scrollToTodaySchedule}
//             style={styles.headerWithIcon}
//           >
//             <View style={styles.headerTextWithIcon}>
//               <Text style={styles.sectionHeader}>오늘의 일정</Text>
//               <Image
//                 source={require('../../assets/images/check.png')}
//                 style={styles.headerIcon}
//               />
//             </View>
//           </TouchableOpacity>
//           <FlatList
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             data={dateData}
//             ref={scheduleFlatListRef}
//             keyExtractor={(item) => item.date}
//             contentContainerStyle={styles.scrollViewContent}
//             initialScrollIndex={50}
//             getItemLayout={(data, index) => ({
//               length: width * 0.6,
//               offset: (width * 0.6 + 16) * index,
//               index,
//             })}
//             renderItem={({ item, index: dateIndex }) => (
//               <View style={styles.dayContainer}>
//                 <View
//                   style={[
//                     styles.scheduleCard,
//                     item.isToday && styles.scheduleCardToday,
//                   ]}
//                 >
//                   <Text style={styles.dayHeader}>{item.date}</Text>
//                   {item.schedules.map((schedule: Schedule, idx: number) => (
//                     <View style={styles.scheduleItem} key={idx}>
//                       <CheckBox
//                         checked={schedule.checked}
//                         onPress={() =>
//                           toggleCheckBox(dateIndex, 'schedule', idx)
//                         }
//                         checkedColor={schedule.checked ? 'blue' : undefined}
//                         containerStyle={styles.checkBoxContainer}
//                         size={40} // 체크박스 크기 키움
//                       />
//                       <Text
//                         style={[
//                           styles.scheduleText,
//                           schedule.checked && styles.checkedText,
//                         ]}
//                       >
//                         {schedule.label}
//                       </Text>
//                       {deleteMode && (
//                         <TouchableOpacity
//                           style={styles.selectButton}
//                           onPress={() => toggleSelectItem(schedule.label)}
//                         >
//                           <Text
//                             style={[
//                               styles.selectButtonText,
//                               selectedItems[schedule.label] &&
//                                 styles.selectedText,
//                             ]}
//                           >
//                             {selectedItems[schedule.label] ? '선택됨' : '선택'}
//                           </Text>
//                         </TouchableOpacity>
//                       )}
//                     </View>
//                   ))}
//                 </View>
//               </View>
//             )}
//           />
//         </View>

//         {/* 하단 버튼 */}
//         <View style={styles.actionContainer}>
//           <TouchableOpacity
//             style={[styles.actionButton, styles.medicineAddButton]}
//             onPress={() => openModal('medicine')}
//           >
//             <Image
//               source={require('../../assets/images/pill.png')}
//               style={styles.icon}
//             />
//             <Text style={styles.actionButtonText}>복용약 추가</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionButton, styles.scheduleAddButton]}
//             onPress={openScheduleAddModal} // 일정 추가 버튼을 눌렀을 때 모달 열기
//           >
//             <Image
//               source={require('../../assets/images/check.png')}
//               style={styles.icon}
//             />
//             <Text style={styles.actionButtonText}>일정 추가</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.actionContainer}>
//           <TouchableOpacity
//             style={[styles.actionButton, styles.memoButton]}
//             onPress={openMemoModal}
//           >
//             <Image
//               source={require('../../assets/images/memo.png')}
//               style={styles.icon}
//             />
//             <Text style={styles.actionButtonText}>메모하기</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionButton, styles.deleteButton]}
//             onPress={toggleDeleteMode}
//           >
//             <Image
//               source={require('../../assets/images/close.png')}
//               style={styles.icon}
//             />
//             <Text style={styles.actionButtonText}>복용약, 일정 삭제</Text>
//           </TouchableOpacity>
//         </View>

//         {deleteMode && (
//           <View style={styles.actionContainer}>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.deleteButton]}
//               onPress={deleteSelectedItems}
//             >
//               <Text style={styles.deleteButtonText}>선택 항목 삭제</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* 하단 여백 추가 */}
//         <View style={styles.bottomSpacer} />
//       </ScrollView>

//       {/* 복용약 추가 모달 */}
//       <RegisterMedicineModal
//         visible={modalVisible && modalType === 'medicine'}
//         onClose={closeModal}
//         onSave={handleSaveMedicine} // 모달에서 약 저장
//       />

//       {/* 메모 모달 */}
//       <MemoModal
//         visible={memoModalVisible}
//         onClose={closeMemoModal}
//         onSave={(memo) => {
//           console.log('저장된 메모:', memo);
//           closeMemoModal();
//         }}
//       />

//       {/* 일정 추가 모달 */}
//       <ScheduleAddModal
//         visible={scheduleAddModalVisible}
//         onClose={closeScheduleAddModal}
//         onSave={(scheduleData) => {
//           console.log('저장된 일정:', scheduleData);
//           closeScheduleAddModal();
//         }}
//       />
//     </SafeAreaView>
//   );
// };

// // 스타일 정의
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#eaeaea',
//   },
//   scrollViewContent: {
//     paddingHorizontal: 16,
//   },
//   whiteBox: {
//     backgroundColor: '#fff',
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     marginBottom: 16,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//     elevation: 2,
//   },
//   actionContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 10,
//   },
//   headerWithIcon: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerTextWithIcon: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerIcon: {
//     width: 25,
//     height: 25,
//     marginLeft: 5,
//     marginBottom: 14, // 아이콘이 텍스트와 일직선에 맞춰지도록 조정
//   },
//   sectionHeader: {
//     fontSize: 30,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   dayContainer: {
//     width: width * 0.6,
//     marginRight: 16,
//     backgroundColor: '#fff',
//     flexDirection: 'column',
//   },
//   medicineCard: {
//     backgroundColor: '#f5f5f5',
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//     elevation: 2,
//   },
//   medicineCardToday: {
//     borderWidth: 2,
//     borderColor: '#FF6F00',
//   },
//   scheduleCard: {
//     backgroundColor: '#f5f5f5',
//     borderRadius: 10,
//     padding: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//     elevation: 2,
//   },
//   scheduleCardToday: {
//     borderWidth: 2,
//     borderColor: '#1565C0',
//   },
//   dayHeader: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   medicineItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     paddingVertical: 10, // 높이 키움
//   },
//   scheduleItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     paddingVertical: 10, // 높이 키움
//   },
//   medicineText: {
//     fontSize: 22, // 텍스트 크기 키움
//     fontWeight: 'bold',
//   },
//   scheduleText: {
//     fontSize: 22, // 텍스트 크기 키움
//     fontWeight: 'bold',
//   },
//   checkedText: {
//     textDecorationLine: 'line-through', // 체크된 항목에 가운데 선 추가
//     color: 'gray', // 선택된 항목에 대한 색상 변경
//   },
//   checkBoxContainer: {
//     padding: 0,
//     margin: 0,
//     marginRight: 10, // 체크박스 여백 추가
//   },
//   selectButton: {
//     marginLeft: 10,
//     padding: 5,
//     backgroundColor: '#eee',
//     borderRadius: 5,
//   },
//   selectButtonText: {
//     color: '#555',
//   },
//   selectedText: {
//     color: '#FF6F00',
//   },
//   actionButton: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 10,
//     paddingVertical: 20,
//     marginHorizontal: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//     elevation: 2,
//   },
//   medicineAddButton: {
//     backgroundColor: '#e6f4fa',
//   },
//   scheduleAddButton: {
//     backgroundColor: '#ebf5e0',
//   },
//   memoButton: {
//     backgroundColor: '#f8f3c5',
//   },
//   deleteButton: {
//     backgroundColor: '#fec1b9',
//   },
//   actionButtonText: {
//     color: 'black',
//     fontWeight: 'bold',
//     fontSize: 23,
//     marginTop: 8,
//   },
//   deleteButtonText: {
//     color: '#fff',
//     fontSize: 18,
//   },
//   icon: {
//     width: 70,
//     height: 70,
//     marginBottom: 8,
//   },
//   bottomSpacer: {
//     height: 50, // 스크롤 시 하단에 추가 여백
//   },
// });

// export default ScheduleAndMedicineScreen;

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
    [key: string]: boolean;
  }>({}); // 선택한 항목 상태

  // 날짜 데이터 생성 함수
  function generateDateData(baseDate: Date, numDays: number): DayData[] {
    const dateData: DayData[] = [];
    for (let i = -numDays; i <= numDays; i++) {
      const date = getFormattedDate(getDateOffset(baseDate, i));
      dateData.push({
        date,
        isToday: i === 0, // 오늘 날짜인지 여부
        medicines: [
          { label: '종합영양제', checked: false },
          { label: '혈압 약', checked: false },
          { label: '고지혈증 약', checked: false },
        ],
        schedules: [
          { label: '병원가기', checked: false },
          { label: '아들과 전화', checked: false },
          { label: '장보기', checked: false },
        ],
      });
    }
    return dateData;
  }

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
    meal: string;
  }) => {
    const newData = [...dateData];

    // 날짜 형식이 'YYYY-MM-DD'라면 해당 날짜의 인덱스를 찾음
    const formattedDate = getFormattedDate(new Date(data.date));
    const targetIndex = newData.findIndex((day) => day.date === formattedDate);

    if (targetIndex !== -1) {
      newData[targetIndex].medicines.push({
        label: `${data.name} (${data.time}, ${data.meal})`,
        checked: false,
      });
      setDateData(newData);
    }

    closeModal(); // 모달 닫기
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

  // 항목 선택 토글 함수
  const toggleSelectItem = (key: string) => {
    setSelectedItems((prevSelectedItems) => ({
      ...prevSelectedItems,
      [key]: !prevSelectedItems[key],
    }));
  };

  // 선택된 항목 삭제 함수
  const deleteSelectedItems = () => {
    const newData = dateData.map((day) => {
      const medicines = day.medicines.filter(
        (medicine) => !selectedItems[medicine.label]
      );
      const schedules = day.schedules.filter(
        (schedule) => !selectedItems[schedule.label]
      );
      return { ...day, medicines, schedules };
    });

    setDateData(newData);
    setDeleteMode(false);
    setSelectedItems({});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
                  {item.medicines.map((medicine: Medicine, idx: number) => (
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
                        />
                      )}
                      <Text
                        style={[
                          styles.medicineText,
                          medicine.checked && styles.checkedText,
                        ]}
                      >
                        {medicine.label}
                      </Text>
                      {deleteMode && (
                        <CheckBox
                          checked={selectedItems[medicine.label]}
                          onPress={() => toggleSelectItem(medicine.label)}
                          checkedColor="red" // 선택된 항목 빨간색으로 표시
                          containerStyle={styles.checkBoxContainer}
                        />
                      )}
                    </View>
                  ))}
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
                  {item.schedules.map((schedule: Schedule, idx: number) => (
                    <View style={styles.scheduleItem} key={idx}>
                      {!deleteMode && (
                        <CheckBox
                          checked={schedule.checked}
                          onPress={() =>
                            toggleCheckBox(dateIndex, 'schedule', idx)
                          }
                          checkedColor={schedule.checked ? 'blue' : undefined}
                          containerStyle={styles.checkBoxContainer}
                        />
                      )}
                      <Text
                        style={[
                          styles.scheduleText,
                          schedule.checked && styles.checkedText,
                        ]}
                      >
                        {schedule.label}
                      </Text>
                      {deleteMode && (
                        <CheckBox
                          checked={selectedItems[schedule.label]}
                          onPress={() => toggleSelectItem(schedule.label)}
                          checkedColor="red" // 선택된 항목 빨간색으로 표시
                          containerStyle={styles.checkBoxContainer}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          />
        </View>

        {/* 하단 버튼 */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.medicineAddButton]}
            onPress={() => openModal('medicine')}
          >
            <Image
              source={require('../../assets/images/pill.png')}
              style={styles.icon}
            />
            <Text style={styles.actionButtonText}>복용약 추가</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.scheduleAddButton]}
            onPress={openScheduleAddModal} // 일정 추가 버튼을 눌렀을 때 모달 열기
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
            style={[styles.actionButton, styles.memoButton]}
            onPress={openMemoModal}
          >
            <Image
              source={require('../../assets/images/memo.png')}
              style={styles.icon}
            />
            <Text style={styles.actionButtonText}>메모하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={toggleDeleteMode}
          >
            <Image
              source={require('../../assets/images/close.png')}
              style={styles.icon}
            />
            <Text style={styles.actionButtonText}>복용약, 일정 삭제</Text>
          </TouchableOpacity>
        </View>

        {deleteMode && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={deleteSelectedItems}
            >
              <Text style={styles.deleteButtonText}>선택 항목 삭제</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 하단 여백 추가 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 복용약 추가 모달 */}
      <RegisterMedicineModal
        visible={modalVisible && modalType === 'medicine'}
        onClose={closeModal}
        onSave={handleSaveMedicine} // 모달에서 약 저장
      />

      {/* 메모 모달 */}
      <MemoModal
        visible={memoModalVisible}
        onClose={closeMemoModal}
        onSave={(memo) => {
          console.log('저장된 메모:', memo);
          closeMemoModal();
        }}
      />

      {/* 일정 추가 모달 */}
      <ScheduleAddModal
        visible={scheduleAddModalVisible}
        onClose={closeScheduleAddModal}
        onSave={(scheduleData) => {
          console.log('저장된 일정:', scheduleData);
          closeScheduleAddModal();
        }}
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
  headerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 25,
    height: 25,
    marginLeft: 5,
    marginBottom: 14, // 아이콘이 텍스트와 일직선에 맞춰지도록 조정
  },
  sectionHeader: {
    fontSize: 30,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scheduleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkedText: {
    textDecorationLine: 'line-through', // 체크된 항목에 가운데 선 추가
    color: 'gray', // 선택된 항목에 대한 색상 변경
  },
  checkBoxContainer: {
    padding: 0,
    margin: 0,
    marginRight: 5,
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
  deleteButton: {
    backgroundColor: '#fec1b9',
  },
  actionButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 23,
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
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
