import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from 'expo-checkbox';
import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 일정 데이터 타입 정의
type Task = {
  id: number;
  title: string;  // Title을 저장할 필드
  isChecked: boolean;
  date: string;
  label?: string;  // label 속성을 선택적으로 추가
};

// 알림 데이터 타입 정의
type Notification = {
  id: number;
  message: string;  // Message를 저장할 필드
  isChecked: boolean;
  color: string;
};

// DayData 타입 정의
interface DayData {
  date: string;
  isToday: boolean;
  schedules: Task[];
}

const TasksAndNotificationsScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: '가스점검: 불을 꼭 꺼주세요!', isChecked: true, color: '#32CD32' },
    { id: 2, message: '병원 방문 시 주민등록증 챙기기', isChecked: false, color: '#32CD32' },
    { id: 3, message: '전등을 꺼주세요!', isChecked: false, color: '#32CD32' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<'tasks' | 'notifications' | null>(null);

  // 날짜 포맷 함수
  const getFormattedDate = (date: Date): string => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}월 ${day}일(${dayOfWeek})`;
  };

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

   // 오늘의 일정만 필터링하는 함수
   const loadTodayTasks = async () => {
    try {
      const storedData = await AsyncStorage.getItem('scheduleMedicineData');
      
      if (storedData !== null) {
        const parsedData: DayData[] = JSON.parse(storedData);
        const todayFormattedDate = getFormattedDate(new Date()); // 오늘의 날짜를 맞춰서 형식화
        // 오늘의 데이터를 찾아 일정만 필터링
        const todayData = parsedData.find((day: DayData) => day.date === todayFormattedDate);

        if (todayData && todayData.schedules ) {
          console.log("오늘의 일정 데이터:", todayData.schedules);  // 불러온 오늘의 일정 데이터를 출력
          const tasks = todayData.schedules.map((schedule, index) => ({
            id: index,
            title: schedule.label || '',
            isChecked: schedule.isChecked,
            date: todayFormattedDate,  // date 속성 추가
          }));
        
          setTasks(tasks);  // 오늘의 일정을 설정
        } else {
          setTasks([]);  // 오늘 일정이 없을 경우 빈 배열로 설정
        }
      } 
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  useEffect(() => {
    loadTodayTasks();
  }, []);

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
            <Text style={styles.dateText}>{getFormattedDate(new Date())}</Text>
            {tasks.length > 0 ? (
              tasks.slice(0, 3).map((task, index) => (
                <TouchableOpacity key={task.id ? task.id.toString() : index.toString()} onPress={() => toggleTaskChecked(task.id)} style={styles.item}>
                  <CheckBox
                    value={task.isChecked}
                    onValueChange={() => toggleTaskChecked(task.id)}
                    color={'#007AFF'} // 파란색 체크박스
                  />
                  <Text style={[styles.taskText, task.isChecked && styles.strikeThrough]}>
                    {task.title || '일정을 불러올 수 없습니다.'}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noTasksText}>일정이 없습니다.</Text> // 일정이 없는 경우
            )}
            {tasks.length > 3 && (
              <TouchableOpacity onPress={() => openModal('tasks')}>
                <Text style={styles.moreText}>+ 더 보기</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* 필수 확인사항 카드 */}
          <TouchableOpacity onPress={() => openModal('notifications')} style={[styles.card, styles.notificationsCard]}>
            <Text style={styles.title}>필수 확인사항 ✅</Text>
            {notifications.slice(0, 3).map((notif, index) => (
              <View key={notif.id ? notif.id.toString() : index.toString()} style={styles.item}>
                <CheckBox
                  value={notif.isChecked}
                  onValueChange={() => toggleNotificationChecked(notif.id)}
                  color={notif.color} // 항목에 따라 색상 지정
                  style={styles.checkbox}
                />
                <Text style={[styles.cardText, notif.isChecked && styles.strikeThrough, { flexWrap: 'wrap', flexShrink: 1 }]}>
                  {notif.message || '내용을 불러올 수 없습니다.'}
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

            {/* 일정이 없을 경우 '일정이 없습니다' 표시 */}
            {selectedType === 'tasks' && tasks.length === 0 && (
              <Text style={styles.noTasksModalText}>일정이 없습니다.</Text>
            )}

              {(selectedType === 'notifications' ? notifications : tasks).map((item) =>
                isNotification(item) ? (
                  <TouchableOpacity key={item.id?.toString()} onPress={() => toggleNotificationChecked(item.id)} style={styles.item}>
                    <CheckBox
                      value={item.isChecked}
                      onValueChange={() => toggleNotificationChecked(item.id)}
                      color={item.color}
                      style={styles.checkbox}
                    />
                    <Text style={[styles.modalText, item.isChecked && styles.strikeThrough]}>{item.message || '내용을 불러올 수 없습니다.'}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity key={item.id?.toString()} onPress={() => toggleTaskChecked(item.id)} style={styles.item}>
                    <CheckBox
                      value={item.isChecked}
                      onValueChange={() => toggleTaskChecked(item.id)}
                      color={'#007AFF'}
                      style={styles.checkbox}
                    />
                    <Text style={[styles.modalText, item.isChecked && styles.strikeThrough]}>{item.title || '일정을 불러올 수 없습니다.'}</Text>
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
    padding: 16,
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
  notificationsCard: {
    borderWidth: 2, // 필수 확인사항 카드에 테두리 적용
    borderColor: '#32CD32', // 테두리 색상을 초록색으로 설정 (필수 확인사항 카드)
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
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
  noTasksModalText: {
    fontSize: 26, 
    textAlign: 'center',
    color: '#000000',
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  noTasksText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#707070',
    marginTop: 6,
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
    flexWrap: 'wrap', // 텍스트가 길면 줄바꿈
    flexShrink: 1, // 길면 줄어듦
    width: '90%', // 텍스트의 최대 너비 설정
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