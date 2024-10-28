import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from 'expo-checkbox';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Medication {
  id: number;
  name: string;
  isChecked: boolean;
  date: string;
}

const MedicationsScreen: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [modalVisible, setModalVisible] = useState(false); // modalVisible 상태 추가

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
    setModalVisible(true); // 모달 열기
  };

  const closeModal = () => {
    setModalVisible(false); // 모달 닫기
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={openModal}>
        <View style={styles.card}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>금일 복용약</Text>
            <Image
              source={require('../../assets/images/pill.png')}
              style={styles.icon}
            />
          </View>
          {medications.slice(0, 3).map((med) => (
            <TouchableOpacity
              key={med.id}
              onPress={() => toggleMedicationChecked(med.id)}
              style={styles.item}
            >
              <CheckBox
                value={med.isChecked}
                onValueChange={() => toggleMedicationChecked(med.id)}
                color={med.isChecked ? '#FFA500' : undefined}
                style={[
                  styles.checkbox,
                  med.isChecked && { borderColor: '#FFA500', borderWidth: 2 },
                ]}
              />
              <Text
                style={[styles.cardText, med.isChecked && styles.strikeThrough]}
              >
                {med.name}
              </Text>
            </TouchableOpacity>
          ))}
          {medications.length > 3 && (
            <Text style={styles.moreText}>+ 더 보기</Text>
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>금일 복용약</Text>
              {medications.map((med) => (
                <TouchableOpacity
                  key={med.id}
                  onPress={() => toggleMedicationChecked(med.id)}
                  style={styles.item}
                >
                  <CheckBox
                    value={med.isChecked}
                    onValueChange={() => toggleMedicationChecked(med.id)}
                    color={med.isChecked ? '#FFA500' : undefined}
                    style={[
                      styles.checkbox,
                      med.isChecked && {
                        borderColor: '#FFA500',
                        borderWidth: 2,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.modalText,
                      med.isChecked && styles.strikeThrough,
                    ]}
                  >
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
    margin: 1,
    marginHorizontal: 5,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFA500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    minHeight: 200,
    width: width * 0.45,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    marginRight: 10,
    marginBottom: 3,
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
    fontSize: 19,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    marginLeft: 10,
    fontSize: 29,
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
  },
  modalContainer: {
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
  checkbox: {
    borderWidth: 2,
    borderColor: '#FFA500',
  },
});

export default MedicationsScreen;
