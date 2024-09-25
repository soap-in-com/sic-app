import CheckBox from 'expo-checkbox';
import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 알림 및 메모 기능을 위한 데이터 정의
const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: '가스점검: 불을 꼭 꺼주세요!', isChecked: true, color: '#32CD32' }, // 초록색
    { id: 2, message: '병원 방문 시 주민등록증 챙기기', isChecked: false, color: '#32CD32' }, // 초록색
    { id: 3, message: '전등을 꺼주세요!', isChecked: false, color: '#32CD32' }, // 초록색
    { id: 4, message: '회의자료 확인', isChecked: false, color: '#FFA500' }, // 노란색
    { id: 5, message: '업무 마무리', isChecked: false, color: '#FFA500' }, // 노란색
    { id: 6, message: '전화 응대하기', isChecked: false, color: '#FFA500' }, // 노란색
  ]);

  const [modalVisible, setModalVisible] = useState(false);

  // 체크박스 상태 변경 함수
  const toggleNotificationChecked = (id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) => (notif.id === id ? { ...notif, isChecked: !notif.isChecked } : notif))
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
      {/* 카드 클릭 시 모달 열기 */}
      <TouchableOpacity onPress={openModal}>
        <View style={styles.card}>
          <Text style={styles.title}>필수 확인사항 ✅</Text>
          {notifications.slice(0, 3).map((notif) => (
            <View key={notif.id.toString()} style={styles.item}>
              <CheckBox
                value={notif.isChecked}
                onValueChange={() => toggleNotificationChecked(notif.id)}
                color={notif.color} // 항목에 따라 색상 지정
                style={styles.checkbox}
              />
              <Text style={[styles.cardText, notif.isChecked && styles.strikeThrough]}>
                {notif.message}
              </Text>
            </View>
          ))}
          {notifications.length > 3 && (
            <TouchableOpacity onPress={openModal}>
              <Text style={styles.moreText}>+ 더 보기</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* 모달 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {/* 모달 제목 */}
              <Text style={styles.modalTitle}>필수 확인사항</Text>
              {notifications.map((notif) => (
                <TouchableOpacity key={notif.id.toString()} onPress={() => toggleNotificationChecked(notif.id)} style={styles.item}>
                  <CheckBox
                    value={notif.isChecked}
                    onValueChange={() => toggleNotificationChecked(notif.id)}
                    color={notif.color} // 항목에 따라 색상 지정
                    style={styles.checkbox}
                  />
                  <Text style={[styles.modalText, notif.isChecked && styles.strikeThrough]}>
                    {notif.message}
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
    padding: 10, // 카드의 바깥쪽 여백 담당
    marginHorizontal: 5,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3, // 안드로이드 그림자 효과
    borderWidth: 2, // 바깥쪽 테두리 두께
    borderColor: '#32CD32', // 초록색 테두리
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkbox: {
    marginRight: 10,
  },
  cardText: {
    fontSize: 16,
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
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center', // 모달을 수직으로 가운데 정렬
    alignItems: 'center', // 모달을 수평으로 가운데 정렬
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 배경 어둡게 처리
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
    textAlign: 'center',
  },
  modalText: {
    marginLeft: 10,
    fontSize: 16,
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

export default NotificationsScreen;
