import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from 'expo-checkbox';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface Medication {
  id: number;
  label: string;
  isChecked: boolean;
}

interface DayData {
  date: string;         // 날짜 (YYYY-MM-DD 형식)
  isToday: boolean;     // 오늘 날짜 여부
  medicines: Medication[]; // 복용약 배열
}

interface Memo {
  id: number;
  memo: string;
  isChecked: boolean;
  color: string;
}

const MemoScreen: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]); // 초기 메모 배열을 빈 배열로 수정
  const [modalVisible, setModalVisible] = useState(false);

  // 메모 저장 함수
  const saveMemos = async (newMemos: Memo[]) => {
    const today = new Date().toISOString().split('T')[0];  // 오늘의 날짜 (YYYY-MM-DD)
    try {
      await AsyncStorage.setItem(`memo_${today}`, JSON.stringify(newMemos));  // 메모 저장
      console.log('메모가 저장되었습니다:', newMemos);
    } catch (error) {
      console.error('메모 저장 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    const loadMemos = async () => {
      const today = new Date().toISOString().split('T')[0]; // 오늘 날짜
      try {
        const savedMemos = await AsyncStorage.getItem(`memo_${today}`);
        console.log('불러온 메모 데이터:', savedMemos);
        
        if (savedMemos !== null) {  // null이 아닌지 확실히 확인
          const parsedMemos = JSON.parse(savedMemos);
          setMemos(parsedMemos);  // 저장된 데이터로 상태 업데이트
        } else {
          setMemos([]);  // 저장된 데이터가 없을 경우 빈 배열 설정
          console.log('저장된 메모가 없습니다.');
        }
      } catch (error) {
        console.error('메모 불러오기를 실패하였습니다.', error);
      }
    };
    
    loadMemos();
  }, []);

  const toggleMemoChecked = (id: number) => {
    const updatedMemos = memos.map((memo) =>
      memo.id === id ? { ...memo, isChecked: !memo.isChecked } : memo
    );
    setMemos(updatedMemos);
    saveMemos(updatedMemos);  // 메모 상태가 변경되면 저장
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <>
       <TouchableOpacity onPress={openModal}>
        <View style={[styles.card, styles.memoCard]}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>오늘의 메모</Text>
            <Image source={require('../../assets/images/memo.png')} style={styles.icon} />
          </View>
          {memos.length === 0 ? (
  <Text style={styles.noDataText}>메모가 없습니다.</Text>
) : (
  memos.slice(0, 3).map((memo, index) => (
    <TouchableOpacity key={memo.id ? memo.id.toString() : `memo_${index}`} onPress={() => toggleMemoChecked(memo.id)} style={styles.item}>
      <CheckBox
        value={memo.isChecked}
        onValueChange={() => toggleMemoChecked(memo.id)}
        color={memo.color}
        style={styles.checkbox}
      />
      <Text style={[styles.cardText, memo.isChecked && styles.strikeThrough]}>
        {memo.memo}
      </Text>
    </TouchableOpacity>
  ))
)}
          {memos.length > 3 && (
            <TouchableOpacity onPress={openModal}>
              <Text style={styles.moreText}>+ 더 보기</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <ScrollView>
        <Text style={styles.modalTitle}>오늘의 메모</Text>
        {memos.length === 0 ? (
          <Text style={styles.modalText}>메모가 없습니다.</Text>
        ) : (
          memos.map((memo, index) => (
            <TouchableOpacity key={memo.id !== undefined ? memo.id.toString() : index.toString()} onPress={() => toggleMemoChecked(memo.id)} style={styles.item}>
              <CheckBox
                value={memo.isChecked}
                onValueChange={() => toggleMemoChecked(memo.id)}
                color={memo.color}
                style={styles.checkbox}
              />
              <Text style={[styles.modalText, memo.isChecked && styles.strikeThrough, { flexWrap: 'wrap', flexShrink: 1 }]}>
                {memo.memo}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <TouchableOpacity onPress={closeModal} style={[styles.closeButton, { backgroundColor: '#FFD700' }]}>
        <Text style={styles.closeButtonText}>닫기</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </>
  );
};

const MedicationsScreen: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);  // 빈 배열로 초기화
  const [modalVisible, setModalVisible] = useState(false);

  // 날짜 포맷 함수
  const getFormattedDate = (date: Date): string => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = days[date.getDay()]; // 요일
  return `${month}월 ${day}일(${dayOfWeek})`;
};

  // 복용약 데이터를 불러오는 함수
  const loadTodayMedications = async () => {
    try {
      const storedData = await AsyncStorage.getItem('scheduleMedicineData');
      console.log('Stored data:', storedData); // 저장된 데이터를 확인
      
      if (storedData !== null) {
        const parsedData: DayData[] = JSON.parse(storedData);
        const todayFormattedDate = getFormattedDate(new Date()); // 오늘의 날짜를 맞춰서 형식화
        console.log('Today\'s formatted date:', todayFormattedDate); // 오늘 날짜를 로그에 출력

        // 오늘의 데이터를 찾아 복용약만 필터링
        const todayData = parsedData.find((day: DayData) => day.date === todayFormattedDate);
        console.log('Today Data:', todayData); // 오늘 데이터를 확인

        if (todayData && Array.isArray(todayData.medicines) && todayData.medicines.length > 0) {
          console.log("오늘의 복용약 데이터:", todayData.medicines);  // 불러온 오늘의 복용약 데이터를 출력
          setMedications(todayData.medicines);  // 오늘의 복용약을 설정
        } else {
          setMedications([]);  // 오늘 복용약이 없을 경우 빈 배열로 설정
          console.log("오늘 복용약을 불러올 수 없습니다.");
        }
      } else {
        console.log("저장된 복용약 데이터가 없습니다.");
      }
    } catch (error) {
      console.error('복용약 데이터를 불러오는 중 오류가 발생했습니다:', error);
    }
  };

    useEffect(() => {
      loadTodayMedications();
  }, []);

  const toggleMedicationChecked = (id: number) => {
    const updatedMedications = medications.map((med) =>
      med.id === id ? { ...med, isChecked: !med.isChecked } : med
    );
    setMedications(updatedMedications);

      // 변경된 복용약 데이터를 저장하는 함수 호출
  saveTodayMedications(updatedMedications);
};

const saveTodayMedications = async (updatedMedications: Medication[]) => {
  const today = getFormattedDate(new Date());  // 오늘 날짜
  try {
    const storedData = await AsyncStorage.getItem('scheduleMedicineData');
    let parsedData = storedData ? JSON.parse(storedData) : [];

    // 오늘 날짜 데이터를 찾음
    const todayDataIndex = parsedData.findIndex((day: DayData) => day.date === today);

    if (todayDataIndex !== -1) {
      // 오늘 날짜 데이터가 있으면 업데이트
      parsedData[todayDataIndex].medicines = updatedMedications;
    } else {
      // 없으면 새로 추가
      parsedData.push({ date: today, isToday: true, medicines: updatedMedications });
    }

    // 저장
    await AsyncStorage.setItem('scheduleMedicineData', JSON.stringify(parsedData));
    console.log('복용약 데이터가 저장되었습니다.');
  } catch (error) {
    console.error('복용약 저장 중 오류가 발생했습니다.', error);
  }
};

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={openModal}>
        <View style={[styles.card, styles.medicationCard]}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>금일 복용약</Text>
            <Image source={require('../../assets/images/pill.png')} style={styles.icon} />
          </View>
          {medications.length === 0 ? (
  <Text style={styles.noDataText}>복용약이 없습니다.</Text>
) : (
  medications.slice(0, 3).map((med) => (
    <TouchableOpacity key={med.id ? med.id.toString() : 'med_${index}'} onPress={() => toggleMedicationChecked(med.id)} style={styles.item}>
      <CheckBox
        value={med.isChecked}
        onValueChange={() => toggleMedicationChecked(med.id)}
        color="#FFA500"
        style={styles.checkbox}
      />
      <Text style={[styles.cardText, med.isChecked && styles.strikeThrough]}>
        {med.label}
      </Text>
    </TouchableOpacity>
  ))
)}
{medications.length > 3 && (
  <TouchableOpacity onPress={openModal}>
    <Text style={styles.moreText}>+ 더 보기</Text>
  </TouchableOpacity>
)}
          {medications.length > 3 && (
            <TouchableOpacity onPress={openModal}>
              <Text style={styles.moreText}>+ 더 보기</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>금일 복용약</Text>
              {medications.length === 0 ? (
          <Text style={styles.modalText}>복용약이 없습니다.</Text> // <- 모달 안에 표시되는 '복용약이 없습니다'
        ) : (
              medications.map((med, index) => (
                <TouchableOpacity key={med?.id ? med.id.toString() : `med_${index}`} onPress={() => toggleMedicationChecked(med.id)} style={styles.item}>
                  <CheckBox
                    value={med.isChecked}
                    onValueChange={() => toggleMedicationChecked(med.id)}
                    color="#FFA500"
                    style={styles.checkbox}
                  />
                  <Text style={[styles.modalText, med.isChecked && styles.strikeThrough,  { flexWrap: 'wrap', flexShrink: 1 }]}>
                    {med.label}
                  </Text>
                </TouchableOpacity>
              )))}
            </ScrollView>
            <TouchableOpacity onPress={closeModal} style={[styles.closeButton, { backgroundColor: '#FFA500' }]}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const MediandMemoScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardWrapper}>
        <MemoScreen />
        <MedicationsScreen />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cardWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginVertical: 4,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 20,
    minHeight: 215,
    width: (width * 0.48) - 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  memoCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  medicationCard: {
    borderColor: '#FFA500',
    borderWidth: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    marginRight: 5,
  },
  icon: {
    width: 25,
    height: 23,
    alignSelf: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  cardText: {
    marginLeft: 10,
    fontSize: 16,
    flexWrap: 'wrap', // 텍스트가 넘치면 줄바꿈
    flexShrink: 1, // 글자가 너무 길면 줄어듬
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  moreText: {
    marginTop: 10,
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkbox: {
    borderWidth: 2,
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    marginLeft: 10,
    fontSize: 28,
    textAlign: 'center',
  },
  closeButton: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MediandMemoScreen;