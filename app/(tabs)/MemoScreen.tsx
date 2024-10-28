import CheckBox from 'expo-checkbox';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const MemoScreen: React.FC = () => {
  const [memos, setMemos] = useState([
    { id: 1, memo: '약 챙기기', isChecked: false, color: '#FFD700' },
    { id: 2, memo: '서류 제출', isChecked: false, color: '#FFD700' },
    { id: 3, memo: '메일 확인', isChecked: false, color: '#FFD700' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);

  const toggleMemoChecked = (id: number) => {
    setMemos((prevMemos) =>
      prevMemos.map((memo) =>
        memo.id === id ? { ...memo, isChecked: !memo.isChecked } : memo
      )
    );
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={openModal}>
        <View style={styles.card}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>오늘의 메모</Text>
            <Image
              source={require('../../assets/images/memo.png')}
              style={styles.icon}
            />
          </View>
          {memos.slice(0, 3).map((memo) => (
            <View key={memo.id.toString()} style={styles.item}>
              <CheckBox
                value={memo.isChecked}
                onValueChange={() => toggleMemoChecked(memo.id)}
                color={memo.color}
                style={styles.checkbox}
              />
              <Text
                style={[
                  styles.cardText,
                  memo.isChecked && styles.strikeThrough,
                ]}
              >
                {memo.memo}
              </Text>
            </View>
          ))}
          {memos.length > 3 && (
            <TouchableOpacity onPress={openModal}>
              <Text style={styles.moreText}>+ 더 보기</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>오늘의 메모</Text>
              {memos.map((memo) => (
                <TouchableOpacity
                  key={memo.id.toString()}
                  onPress={() => toggleMemoChecked(memo.id)}
                  style={styles.item}
                >
                  <CheckBox
                    value={memo.isChecked}
                    onValueChange={() => toggleMemoChecked(memo.id)}
                    color={memo.color}
                    style={styles.checkbox}
                  />
                  <Text
                    style={[
                      styles.modalText,
                      memo.isChecked && styles.strikeThrough,
                    ]}
                  >
                    {memo.memo}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={closeModal}
              style={[styles.closeButton, { backgroundColor: '#FFD700' }]}
            >
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
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    minHeight: 200,
  },
  titleContainer: {
    flexDirection: 'row', // 텍스트와 이미지를 가로로 배치
    alignItems: 'center',
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    marginRight: 10, // 텍스트와 이미지 사이의 간격을 조정
  },
  icon: {
    width: 29,
    height: 24,
    alignSelf: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkbox: {
    marginRight: 10,
    fontSize: 19,
  },
  cardText: {
    fontSize: 19,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'left',
  },
  modalText: {
    marginLeft: 10,
    fontSize: 29,
    fontWeight: 'bold',
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

export default MemoScreen;
