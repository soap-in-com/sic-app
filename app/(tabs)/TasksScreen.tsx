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

const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: '병원가기', isChecked: false, date: '2024-09-22' },
    { id: 2, title: '아들과 전화', isChecked: true, date: '2024-09-22' },
    { id: 3, title: '장보기', isChecked: true, date: '2024-09-22' },
    { id: 4, title: '장보기', isChecked: true, date: '2024-09-22' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // 체크박스 상태 변경 함수
  const toggleTaskChecked = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, isChecked: !task.isChecked } : task))
    );
  };

  const today = new Date();

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const dayOfWeek = date.toLocaleDateString('ko-KR', { weekday: 'short' });
    return `${day}일(${dayOfWeek})`;
  };

  const todayDateStr = formatDate(today);

  const openModal = (date: string) => {
    setSelectedDate(date);
    setModalVisible(true); // 모달 열기
  };

  const closeModal = () => {
    setModalVisible(false); // 모달 닫기
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardsContainer}>
        {/* 흰색 박스 안에 회색 카드 */}
        <View style={styles.whiteBox}>
          <TouchableOpacity onPress={() => openModal('2024-09-22')} style={[styles.card, styles.todayCard]}>
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
              <TouchableOpacity onPress={() => openModal('2024-09-22')}>
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
              <Text style={styles.modalTitle}>오늘의 일정 (전체)</Text>
              {tasks
                .filter((task) => task.date === selectedDate)
                .map((task) => (
                  <TouchableOpacity key={task.id} onPress={() => toggleTaskChecked(task.id)} style={styles.item}>
                    <CheckBox
                      value={task.isChecked}
                      onValueChange={() => toggleTaskChecked(task.id)}
                      color={'#007AFF'} // 파란색 체크박스
                    />
                    <Text style={[styles.modalTaskText, task.isChecked && styles.strikeThrough]}>
                      {task.title}
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
    flex: 1,
    backgroundColor: '#f5f5f5',
    margin: 5,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  whiteBox: {
    width: '100%', // 흰색 박스의 가로 크기
    backgroundColor: '#fff', // 흰색 배경
    borderRadius: 10,
    padding: 10, // 흰색 박스 내부의 여백
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  card: {
    backgroundColor: '#f5f5f5', // 회색 배경
    borderRadius: 10,
    padding: 20, // 카드 크기를 키우기 위해 패딩을 더 넓게 설정
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  todayCard: {
    borderWidth: 2,
    borderColor: '#007AFF', // 파란 테두리 색상 적용
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
    justifyContent: 'flex-start',
    marginVertical: 5,
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
    fontSize: 19,
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
    width: '80%', // 모달 가로 크기
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start', // 왼쪽 정렬
  },
  modalTitle: {
    fontSize: 25, // 모달 안의 글씨 크기
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  modalTaskText: {
    fontSize: 29, // 모달 체크박스 항목의 글씨 크기
    marginLeft: 10,
    textAlign: 'left', // 텍스트 왼쪽 정렬
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    width: '100%', // 닫기 버튼이 모달 가로 크기에 맞도록 설정
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TasksScreen;
