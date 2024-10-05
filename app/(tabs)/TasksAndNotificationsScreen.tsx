import CheckBox from 'expo-checkbox';
import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 일정 데이터 타입 정의
type Task = {
  id: number;
  title: string;
  isChecked: boolean;
  date: string;
};

// 알림 데이터 타입 정의
type Notification = {
  id: number;
  message: string;
  isChecked: boolean;
  color: string;
};

const TasksAndNotificationsScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: '병원가기', isChecked: false, date: '2024-09-22' },
    { id: 2, title: '아들과 전화하고 빨래개고 빨래 돌리기', isChecked: true, date: '2024-09-22' },
    { id: 3, title: '장보기', isChecked: true, date: '2024-09-22' },
    { id: 4, title: '장보기', isChecked: true, date: '2024-09-22' },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: '가스점검: 불을 꼭 꺼주세요!', isChecked: true, color: '#32CD32' },
    { id: 2, message: '병원 방문 시 주민등록증 챙기기', isChecked: false, color: '#32CD32' },
    { id: 3, message: '전등을 꺼주세요!', isChecked: false, color: '#32CD32' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<'tasks' | 'notifications' | null>(null);

  // 체크박스 상태 변경 함수 (일정)
  const toggleTaskChecked = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, isChecked: !task.isChecked } : task))
    );
  };

  // 체크박스 상태 변경 함수 (알림)
  const toggleNotificationChecked = (id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) => (notif.id === id ? { ...notif, isChecked: !notif.isChecked } : notif))
    );
  };

  const today = new Date();

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const dayOfWeek = date.toLocaleDateString('ko-KR', { weekday: 'short' });
    return `${day}일(${dayOfWeek})`;
  };

  const todayDateStr = formatDate(today);

  const openModal = (type: 'tasks' | 'notifications') => {
    setSelectedType(type);
    setModalVisible(true); // 모달 열기
  };

  const closeModal = () => {
    setModalVisible(false); // 모달 닫기
    setSelectedType(null);
  };

  // 타입 가드를 사용해 Task와 Notification 구분
  const isNotification = (item: Task | Notification): item is Notification => {
    return (item as Notification).message !== undefined;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 흰색 박스 안에 일정 카드와 필수 확인사항 카드 배치 */}
      <View style={styles.whiteBox}>
        {/* 카드들을 좌우로 배치 */}
        <View style={styles.cardContainer}>
          {/* 오늘 일정 카드 */}
          <TouchableOpacity onPress={() => openModal('tasks')} style={[styles.card, styles.todayCard]}>
            <Text style={styles.dateText}>{todayDateStr}</Text>
            {tasks
              .filter((task) => task.date === '2024-09-22')
              .slice(0, 3)
              .map((task) => (
                <TouchableOpacity key={task.id} onPress={() => toggleTaskChecked(task.id)} style={styles.item}>
                  <CheckBox
                    value={task.isChecked}
                    onValueChange={() => toggleTaskChecked(task.id)}
                    color={'#007AFF'} // 파란색 체크박스
                  />
                  <Text style={[styles.taskText, task.isChecked && styles.strikeThrough]}>
                    {task.title}
                  </Text>
                </TouchableOpacity>
              ))}
            {tasks.filter((task) => task.date === '2024-09-22').length > 3 && (
              <TouchableOpacity onPress={() => openModal('tasks')}>
                <Text style={styles.moreText}>+ 더 보기</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* 필수 확인사항 카드 */}
          <TouchableOpacity onPress={() => openModal('notifications')} style={styles.card}>
            <Text style={styles.title}>필수 확인사항 ✅</Text>
            {notifications.slice(0, 3).map((notif) => (
              <View key={notif.id.toString()} style={styles.item}>
                <CheckBox
                  value={notif.isChecked}
                  onValueChange={() => toggleNotificationChecked(notif.id)}
                  color={notif.color} // 항목에 따라 색상 지정
                  style={styles.checkbox}
                />
                {/* 여기서 flexWrap과 flexShrink 추가 */}
                <Text style={[styles.cardText, notif.isChecked && styles.strikeThrough, { flexWrap: 'wrap', flexShrink: 1 }]}>
                  {notif.message}
                </Text>
              </View>
            ))}
            {notifications.length > 3 && (
              <TouchableOpacity onPress={() => openModal('notifications')}>
                <Text style={styles.moreText}>+ 더 보기</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      </View>

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
              <Text style={styles.modalTitle}>
                {selectedType === 'notifications' ? '필수 확인사항 (전체)' : '오늘의 일정 (전체)'}
              </Text>
              {(selectedType === 'notifications' ? notifications : tasks).map((item) =>
                isNotification(item) ? (
                  <TouchableOpacity key={item.id.toString()} onPress={() => toggleNotificationChecked(item.id)} style={styles.item}>
                    <CheckBox
                      value={item.isChecked}
                      onValueChange={() => toggleNotificationChecked(item.id)}
                      color={item.color}
                      style={styles.checkbox}
                    />
                    <Text style={[styles.modalText, item.isChecked && styles.strikeThrough]}>{item.message}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity key={item.id.toString()} onPress={() => toggleTaskChecked(item.id)} style={styles.item}>
                    <CheckBox
                      value={item.isChecked}
                      onValueChange={() => toggleTaskChecked(item.id)}
                      color={'#007AFF'}
                      style={styles.checkbox}
                    />
                    <Text style={[styles.modalText, item.isChecked && styles.strikeThrough]}>{item.title}</Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
            <TouchableOpacity
              onPress={closeModal}
              style={[
                styles.closeButton,
                selectedType === 'notifications' ? styles.greenButton : styles.blueButton,
              ]}
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
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  whiteBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardContainer: {
    flexDirection: 'row', // 좌우로 배치
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#f5f5f5', // 회색 배경
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    width: '48%', // 각 카드가 화면의 48% 차지
  },
  todayCard: {
    borderWidth: 2,
    borderColor: '#007AFF', // 파란 테두리 색상 적용
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 18, // 카드 크기에 맞춰 텍스트 크기 확대
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
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
    flexWrap: 'wrap', // 텍스트가 넘치면 줄바꿈
    flexShrink: 1, // 글자가 너무 길면 줄어듬
  },
  taskText: {
    fontSize: 16,
    marginLeft: 10, // 체크박스와 텍스트 사이 여백
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
    justifyContent: 'center',
    alignItems: 'center',
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
  blueButton: {
    backgroundColor: '#007AFF', // 파란색 버튼
  },
  greenButton: {
    backgroundColor: '#32CD32', // 초록색 버튼
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TasksAndNotificationsScreen;
