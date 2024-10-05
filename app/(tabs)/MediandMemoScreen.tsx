import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from 'expo-checkbox';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface Medication {
  id: number;
  name: string;
  isChecked: boolean;
}

interface Memo {
  id: number;
  memo: string;
  isChecked: boolean;
  color: string;
}

const MemoScreen: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([
    { id: 1, memo: '서류 제출', isChecked: false, color: '#FFD700' },
    { id: 2, memo: '메일 확인', isChecked: false, color: '#FFD700' },
    { id: 3, memo: '회의 참석', isChecked: false, color: '#FFD700' },
    { id: 4, memo: '전화하기', isChecked: false, color: '#FFD700' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleMemoChecked = (id: number) => {
    setMemos((prevMemos) =>
      prevMemos.map((memo) => (memo.id === id ? { ...memo, isChecked: !memo.isChecked } : memo))
    );
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
          {memos.slice(0, 3).map((memo) => (
            <TouchableOpacity key={memo.id.toString()} onPress={() => toggleMemoChecked(memo.id)} style={styles.item}>
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
          ))}
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
              {memos.map((memo) => (
                <TouchableOpacity key={memo.id.toString()} onPress={() => toggleMemoChecked(memo.id)} style={styles.item}>
                  <CheckBox
                    value={memo.isChecked}
                    onValueChange={() => toggleMemoChecked(memo.id)}
                    color={memo.color}
                    style={styles.checkbox}
                  />
                  <Text style={[styles.modalText, memo.isChecked && styles.strikeThrough]}>
                    {memo.memo}
                  </Text>
                </TouchableOpacity>
              ))}
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
  const [medications, setMedications] = useState<Medication[]>([
    { id: 1, name: '약 먹기', isChecked: false },
    { id: 2, name: '운동하기', isChecked: false },
    { id: 3, name: '미팅 참석', isChecked: false },
  ]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadMedications = async () => {
      try {
        const savedMedications = await AsyncStorage.getItem('medications');
        if (savedMedications) {
          setMedications(JSON.parse(savedMedications));
        }
      } catch (error) {
        console.error('복용약 불러오기를 실패하였습니다.', error);
      }
    };

    loadMedications();
  }, []);

  const toggleMedicationChecked = (id: number) => {
    const updatedMedications = medications.map((med) =>
      med.id === id ? { ...med, isChecked: !med.isChecked } : med
    );
    setMedications(updatedMedications);
    AsyncStorage.setItem('medications', JSON.stringify(updatedMedications));
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
          {medications.slice(0, 3).map((med) => (
            <TouchableOpacity key={med.id.toString()} onPress={() => toggleMedicationChecked(med.id)} style={styles.item}>
              <CheckBox
                value={med.isChecked}
                onValueChange={() => toggleMedicationChecked(med.id)}
                color="#FFA500"
                style={styles.checkbox}
              />
              <Text style={[styles.cardText, med.isChecked && styles.strikeThrough]}>
                {med.name}
              </Text>
            </TouchableOpacity>
          ))}
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
              {medications.map((med) => (
                <TouchableOpacity key={med.id.toString()} onPress={() => toggleMedicationChecked(med.id)} style={styles.item}>
                  <CheckBox
                    value={med.isChecked}
                    onValueChange={() => toggleMedicationChecked(med.id)}
                    color="#FFA500"
                    style={styles.checkbox}
                  />
                  <Text style={[styles.modalText, med.isChecked && styles.strikeThrough]}>
                    {med.name}
                  </Text>
                </TouchableOpacity>
              ))}
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
    marginVertical: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 20,
    minHeight: 215,
    width: (width * 0.48) - 20,
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 7,
    marginRight: 10,
  },
  icon: {
    width: 27,
    height: 24,
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
    fontSize: 18,
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
