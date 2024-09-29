import CheckBox from 'expo-checkbox';
import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Medication 타입 정의
interface Medication {
  id: number;
  name: string;
  isChecked: boolean;
  date: string;
}

const MedicationsScreen: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([
    { id: 1, name: '종합영양제', isChecked: false, date: '2024-09-19' },
    { id: 2, name: '혈압 약', isChecked: true, date: '2024-09-19' },
    { id: 3, name: '고지혈증 약', isChecked: false, date: '2024-09-19' },
    { id: 4, name: '비타민C', isChecked: false, date: '2024-09-19' }, // 추가 약
  ]);

  const [modalVisible, setModalVisible] = useState(false);

  // 체크박스 상태 변경 함수
  const toggleMedicationChecked = (id: number) => {
    setMedications((prevMedications) =>
      prevMedications.map((med) => (med.id === id ? { ...med, isChecked: !med.isChecked } : med))
    );
  };

  const openModal = () => {
    setModalVisible(true);  // 모달 열기
  };

  const closeModal = () => {
    setModalVisible(false);  // 모달 닫기
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 카드 클릭 시 모달 열기 */}
      <TouchableOpacity onPress={openModal}>
        <View style={styles.card}>
          <Text style={styles.title}>
            금일 복용약 <Text style={{ fontSize: 20 }}>💊</Text>
          </Text>
          {/* 외부 체크박스 리스트 */}
          {medications.slice(0, 3).map((med) => (
            <TouchableOpacity key={med.id} onPress={() => toggleMedicationChecked(med.id)} style={styles.item}>
              <CheckBox
                value={med.isChecked}
                onValueChange={() => toggleMedicationChecked(med.id)}
                color={med.isChecked ? '#FFA500' : undefined}
              />
              <Text style={[styles.cardText, med.isChecked && styles.strikeThrough]}>
                {med.name}
              </Text>
            </TouchableOpacity>
          ))}
          {/* 3개 이상일 경우 '더 보기' 표시 */}
          {medications.length > 3 && (
            <Text style={styles.moreText}>+ 더 보기</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* 모달 */}
      <Modal
        visible={modalVisible}  // 모달 열림 여부 제어
        animationType="slide"  // 슬라이드 애니메이션
        transparent={true}  // 모달 배경 투명하게 처리
        onRequestClose={closeModal}  // 뒤로가기 버튼으로 모달 닫기
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              {/* 모달 내부 '금일 복용약' 제목 추가 */}
              <Text style={styles.modalTitle}>금일 복용약 💊</Text>
              {/* 모달 내부 체크박스 리스트 */}
              {medications.map((med) => (
                <TouchableOpacity key={med.id} onPress={() => toggleMedicationChecked(med.id)} style={styles.item}>
                  <CheckBox
                    value={med.isChecked}
                    onValueChange={() => toggleMedicationChecked(med.id)}
                    color={med.isChecked ? '#FFA500' : undefined}
                  />
                  <Text style={[styles.modalText, med.isChecked && styles.strikeThrough]}>
                    {med.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    margin: 3,  // 바깥쪽 여백 추가
    marginHorizontal: 5,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10, // 테두리 둥글기
    padding: 20,
    borderWidth: 2,   // 테두리 두께 설정
    borderColor: '#FFA500',  // 테두리 색상
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'left',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  cardText: {
    marginLeft: 10,
    fontSize: 19,
  },
  modalTitle: {
    fontSize: 24,  // 모달 제목 크기 설정
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'left',
  },
  modalText: {
    marginLeft: 10,
    fontSize: 29, // 모달 내부 텍스트 크기를 29으로 설정
    fontWeight: 'bold',
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  moreText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'left',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // 모달 배경 투명하게 설정
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  closeButton: {
    backgroundColor: '#FFA500',
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

export default MedicationsScreen;
