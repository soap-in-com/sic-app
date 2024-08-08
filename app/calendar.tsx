// import { Ionicons } from '@expo/vector-icons';
// import { Picker } from '@react-native-picker/picker';
// import React, { useEffect, useState } from 'react';
// import {
//   Dimensions,
//   FlatList,
//   Keyboard,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   StyleSheet,
//   Switch,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { Calendar, LocaleConfig } from 'react-native-calendars';

// // 한국어 설정
// LocaleConfig.locales['kr'] = {
//   monthNames: [
//     '1월',
//     '2월',
//     '3월',
//     '4월',
//     '5월',
//     '6월',
//     '7월',
//     '8월',
//     '9월',
//     '10월',
//     '11월',
//     '12월',
//   ],
//   monthNamesShort: [
//     '1월',
//     '2월',
//     '3월',
//     '4월',
//     '5월',
//     '6월',
//     '7월',
//     '8월',
//     '9월',
//     '10월',
//     '11월',
//     '12월',
//   ],
//   dayNames: [
//     '일요일',
//     '월요일',
//     '화요일',
//     '수요일',
//     '목요일',
//     '금요일',
//     '토요일',
//   ],
//   dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
//   today: '오늘',
// };
// LocaleConfig.defaultLocale = 'kr';

// interface Todo {
//   id: number;
//   task: string;
//   time: string;
//   completed: boolean;
// }

// type Todos = {
//   [date: string]: Todo[];
// };

// const CalendarScreen: React.FC = () => {
//   const today = new Date().toISOString().split('T')[0];
//   const [selectedDate, setSelectedDate] = useState<string>(today);
//   const [todos, setTodos] = useState<Todos>({});
//   const [todoText, setTodoText] = useState<string>('');
//   const [todoTime, setTodoTime] = useState<string>('');
//   const [showTodos, setShowTodos] = useState<boolean>(false);
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
//   const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
//   const [isTimePickerVisible, setTimePickerVisible] = useState<boolean>(false);
//   const [isTimeEnabled, setTimeEnabled] = useState<boolean>(false);
//   const [selectedHour, setSelectedHour] = useState<string>('12');
//   const [selectedMinute, setSelectedMinute] = useState<string>('00');
//   const [selectedPeriod, setSelectedPeriod] = useState<string>('AM');

//   useEffect(() => {
//     const exampleTodos: Todo[] = [
//       { id: 1, task: '미팅', time: '22:00', completed: false },
//       { id: 2, task: '영양제', time: '', completed: true },
//       { id: 3, task: '요가', time: '', completed: false },
//     ];
//     setTodos({ [today]: exampleTodos });
//   }, []);

//   const toggleTodo = (id: number) => {
//     setTodos((prevTodos) => {
//       const updatedTodos = { ...prevTodos };
//       updatedTodos[selectedDate] = updatedTodos[selectedDate].map((todo) =>
//         todo.id === id ? { ...todo, completed: !todo.completed } : todo
//       );
//       return updatedTodos;
//     });
//   };

//   const handleTodoChange = (action: 'add' | 'update' | 'delete') => {
//     if (todoText.trim() === '') return;
//     setTodos((prevTodos) => {
//       const updatedTodos = { ...prevTodos };
//       if (action === 'add') {
//         const newTodo: Todo = {
//           id: (todos[selectedDate]?.length || 0) + 1,
//           task: todoText,
//           time: todoTime,
//           completed: false,
//         };
//         updatedTodos[selectedDate] = updatedTodos[selectedDate] || [];
//         updatedTodos[selectedDate].push(newTodo);
//       } else if (selectedTodo) {
//         updatedTodos[selectedDate] = updatedTodos[selectedDate]
//           .map((todo) =>
//             todo.id === selectedTodo.id
//               ? action === 'update'
//                 ? { ...todo, task: todoText, time: todoTime }
//                 : null
//               : todo
//           )
//           .filter(Boolean) as Todo[];
//       }
//       return updatedTodos;
//     });
//     setTodoText('');
//     setTodoTime('');
//     setModalVisible(false);
//     setEditModalVisible(false);
//     setSelectedTodo(null);
//     setTimeEnabled(false);
//     setTimePickerVisible(false);
//     Keyboard.dismiss();
//   };

//   const getMarkedDates = () => {
//     const marked: { [date: string]: any } = {};
//     Object.keys(todos).forEach((date) => {
//       marked[date] = { marked: true, dotColor: 'blue' };
//     });
//     marked[selectedDate] = {
//       ...marked[selectedDate],
//       selected: true,
//       selectedColor: 'skyblue',
//       selectedTextColor: '#ffffff',
//     };
//     marked[today] = {
//       ...marked[today],
//       today: true,
//       marked: true,
//       dotColor: 'skyblue',
//       selected: selectedDate === today,
//       selectedColor: selectedDate === today ? 'skyblue' : 'pink',
//       selectedTextColor: '#ffffff',
//     };
//     return marked;
//   };

//   const renderDay = ({ date, state }: any) => {
//     const dayOfWeek = new Date(date.dateString).getDay();
//     let textColor = '#2d4150'; // 기본 색상

//     if (state === 'disabled') {
//       textColor = '#d9e1e8'; // 비활성화된 날짜 색상
//     } else if (date.dateString === today) {
//       textColor = 'purple'; // 오늘 날짜 색상
//     } else if (date.dateString === selectedDate) {
//       textColor = '#ffffff'; // 선택된 날짜 색상
//     } else if (dayOfWeek === 0) {
//       textColor = 'red'; // 일요일 색상
//     } else if (dayOfWeek === 6) {
//       textColor = 'blue'; // 토요일 색상
//     }

//     return (
//       <TouchableOpacity onPress={() => handleDayPress(date)}>
//         <View
//           style={[
//             styles.dayContainer,
//             date.dateString === selectedDate && styles.selectedDay,
//             date.dateString === today && styles.today,
//           ]}
//         >
//           <Text style={{ color: textColor }}>{date.day}</Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderItem = ({ item }: { item: Todo }) => (
//     <TouchableOpacity
//       onLongPress={() => {
//         setSelectedTodo(item);
//         setTodoText(item.task);
//         setTodoTime(item.time);
//         setEditModalVisible(true);
//         setTimeEnabled(item.time !== '');
//       }}
//       onPress={() => toggleTodo(item.id)}
//     >
//       <View style={styles.todoItem}>
//         <Ionicons
//           name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
//           size={24}
//           color={item.completed ? 'orange' : 'grey'}
//         />
//         <Text style={styles.todoText}>
//           {item.task} {item.time && `${item.time}`}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

//   const handleDayPress = (day: any) => {
//     setSelectedDate(day.dateString);
//     setShowTodos(true);
//   };

//   const handleConfirmTime = () => {
//     const formattedTime = `${selectedPeriod} ${selectedHour}:${selectedMinute}`;
//     setTodoTime(formattedTime);
//     setTimePickerVisible(false);
//   };

//   const renderTimePicker = () => (
//     <View style={styles.timePicker}>
//       <Picker
//         selectedValue={selectedHour}
//         style={styles.picker}
//         onValueChange={(itemValue) => setSelectedHour(itemValue)}
//       >
//         {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(
//           (hour) => (
//             <Picker.Item key={hour} label={hour} value={hour} />
//           )
//         )}
//       </Picker>
//       <Picker
//         selectedValue={selectedMinute}
//         style={styles.picker}
//         onValueChange={(itemValue) => setSelectedMinute(itemValue)}
//       >
//         {Array.from({ length: 60 }, (_, i) =>
//           i < 10 ? `0${i}` : i.toString()
//         ).map((minute) => (
//           <Picker.Item key={minute} label={minute} value={minute} />
//         ))}
//       </Picker>
//       <Picker
//         selectedValue={selectedPeriod}
//         style={styles.picker}
//         onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
//       >
//         <Picker.Item label="AM" value="AM" />
//         <Picker.Item label="PM" value="PM" />
//       </Picker>
//     </View>
//   );

//   const renderModal = (visible: boolean, isEdit: boolean = false) => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={visible}
//       onRequestClose={() =>
//         isEdit ? setEditModalVisible(false) : setModalVisible(false)
//       }
//     >
//       <View style={styles.modalContainer}>
//         <View style={styles.modalView}>
//           <Text style={styles.modalTitle}>
//             {isEdit ? '일정 수정' : '새 일정 추가'}
//           </Text>
//           <TextInput
//             style={styles.modalInput}
//             placeholder="할 일을 입력하세요"
//             value={todoText}
//             onChangeText={setTodoText}
//           />
//           <View style={styles.timeSwitchContainer}>
//             <Text style={styles.timeSwitchLabel}>시간 설정</Text>
//             <Switch
//               value={isTimeEnabled}
//               onValueChange={(value) => {
//                 setTimeEnabled(value);
//                 if (!value) setTodoTime('');
//               }}
//             />
//           </View>
//           {isTimeEnabled && renderTimePicker()}
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity
//               style={[styles.button, styles.buttonClose]}
//               onPress={() => handleTodoChange(isEdit ? 'update' : 'add')}
//             >
//               <Text style={styles.textStyle}>{isEdit ? '수정' : '추가'}</Text>
//             </TouchableOpacity>
//             {isEdit && (
//               <TouchableOpacity
//                 style={[styles.button, styles.buttonClose]}
//                 onPress={() => handleTodoChange('delete')}
//               >
//                 <Text style={styles.textStyle}>삭제</Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity
//               style={[styles.button, styles.buttonClose]}
//               onPress={() =>
//                 isEdit ? setEditModalVisible(false) : setModalVisible(false)
//               }
//             >
//               <Text style={styles.textStyle}>취소</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     >
//       <View style={styles.container}>
//         <View style={styles.calendarContainer}>
//           <Calendar
//             current={selectedDate}
//             markedDates={getMarkedDates()}
//             onDayPress={handleDayPress}
//             style={styles.calendar}
//             enableSwipeMonths={true}
//             theme={{
//               calendarBackground: '#f7f7f7',
//               textSectionTitleColor: '#444444',
//               selectedDayBackgroundColor: '#ff8c00',
//               selectedDayTextColor: '#ffffff',
//               todayTextColor: '#ff4500',
//               dayTextColor: '#2d4150',
//               textDisabledColor: '#d9e1e8',
//               dotColor: '#ff6347',
//               selectedDotColor: '#ffffff',
//               arrowColor: '#ff8c00',
//               monthTextColor: '#1e90ff',
//               indicatorColor: '#1e90ff',
//               textDayFontFamily: 'monospace',
//               textMonthFontFamily: 'monospace',
//               textDayHeaderFontFamily: 'monospace',
//               textDayFontWeight: '300',
//               textMonthFontWeight: 'bold',
//               textDayHeaderFontWeight: '300',
//               textDayFontSize: 16,
//               textMonthFontSize: 18,
//               textDayHeaderFontSize: 16,
//             }}
//             dayComponent={({ date, state }) => renderDay({ date, state })}
//           />
//         </View>
//         {showTodos && (
//           <View style={styles.todoContainer}>
//             <Text style={styles.todoTitle}>{selectedDate} 할 일 목록</Text>
//             <FlatList
//               data={todos[selectedDate] || []}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={renderItem}
//               style={styles.todoList}
//             />
//             <TouchableOpacity
//               style={styles.addButton}
//               onPress={() => setModalVisible(true)}
//             >
//               <Ionicons name="add-circle" size={48} color="#ff8c00" />
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//       {renderModal(modalVisible)}
//       {renderModal(editModalVisible, true)}
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     padding: 16,
//   },
//   calendarContainer: {
//     width: Dimensions.get('window').width,
//     height: 'auto',
//     marginTop: 20,
//   },
//   calendar: {
//     width: Dimensions.get('window').width,
//   },
//   dayContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 40,
//     height: 40,
//     marginVertical: 5,
//   },
//   today: {
//     backgroundColor: 'pink',
//     borderRadius: 20,
//   },
//   selectedDay: {
//     backgroundColor: 'skyblue',
//     borderRadius: 20,
//   },
//   todoContainer: {
//     flex: 1,
//     width: '100%',
//     paddingHorizontal: 16,
//   },
//   todoTitle: {
//     fontSize: 20,
//     marginBottom: 10,
//     color: '#1e90ff',
//     textAlign: 'center',
//   },
//   todoList: {
//     flex: 1,
//   },
//   todoItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 5,
//     backgroundColor: '#f0f0f0',
//     padding: 10,
//     borderRadius: 5,
//     width: '100%',
//   },
//   todoText: {
//     fontSize: 16,
//     marginLeft: 10,
//     color: '#000',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalView: {
//     width: '80%',
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   modalInput: {
//     width: '100%',
//     padding: 10,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     marginBottom: 10,
//     backgroundColor: '#fff',
//     color: 'black',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     width: '100%',
//   },
//   button: {
//     borderRadius: 20,
//     padding: 10,
//     elevation: 2,
//   },
//   buttonClose: {
//     backgroundColor: '#2196F3',
//   },
//   textStyle: {
//     color: 'white',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   addButton: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//   },
//   timeSwitchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginBottom: 10,
//   },
//   timeSwitchLabel: {
//     fontSize: 16,
//     color: 'black',
//   },
//   timePicker: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   timePickerButton: {
//     borderRadius: 20,
//     padding: 10,
//     backgroundColor: '#2196F3',
//   },
//   timePickerButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   picker: {
//     width: 100,
//   },
// });

// export default CalendarScreen;

import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// 한국어 설정
LocaleConfig.locales['kr'] = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'kr';

interface Todo {
  id: number;
  task: string;
  time: string;
  completed: boolean;
}

type Todos = {
  [date: string]: Todo[];
};

const CalendarScreen: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [todos, setTodos] = useState<Todos>({});
  const [todoText, setTodoText] = useState<string>('');
  const [todoTime, setTodoTime] = useState<string>('');
  const [showTodos, setShowTodos] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isTimePickerVisible, setTimePickerVisible] = useState<boolean>(false);
  const [isTimeEnabled, setTimeEnabled] = useState<boolean>(false);
  const [selectedHour, setSelectedHour] = useState<string>('12');
  const [selectedMinute, setSelectedMinute] = useState<string>('00');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('AM');

  useEffect(() => {
    const exampleTodos: Todo[] = [
      { id: 1, task: '미팅', time: '22:00', completed: false },
      { id: 2, task: '영양제', time: '', completed: true },
      { id: 3, task: '요가', time: '', completed: false },
    ];
    setTodos({ [today]: exampleTodos });
  }, []);

  const toggleTodo = (id: number) => {
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      updatedTodos[selectedDate] = updatedTodos[selectedDate].map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      return updatedTodos;
    });
  };

  const handleTodoChange = (action: 'add' | 'update' | 'delete') => {
    if (todoText.trim() === '') return;
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      if (action === 'add') {
        const newTodo: Todo = {
          id: (todos[selectedDate]?.length || 0) + 1,
          task: todoText,
          time: isTimeEnabled ? todoTime : '',
          completed: false,
        };
        updatedTodos[selectedDate] = updatedTodos[selectedDate] || [];
        updatedTodos[selectedDate].push(newTodo);
      } else if (selectedTodo) {
        updatedTodos[selectedDate] = updatedTodos[selectedDate]
          .map((todo) =>
            todo.id === selectedTodo.id
              ? action === 'update'
                ? {
                    ...todo,
                    task: todoText,
                    time: isTimeEnabled ? todoTime : '',
                  }
                : null
              : todo
          )
          .filter(Boolean) as Todo[];
      }
      return updatedTodos;
    });
    setTodoText('');
    setTodoTime('');
    setModalVisible(false);
    setEditModalVisible(false);
    setSelectedTodo(null);
    setTimeEnabled(false);
    setTimePickerVisible(false);
    Keyboard.dismiss();
  };

  const getMarkedDates = () => {
    const marked: { [date: string]: any } = {};
    Object.keys(todos).forEach((date) => {
      marked[date] = { marked: true, dotColor: 'blue' };
    });
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: 'skyblue',
      selectedTextColor: '#ffffff',
    };
    marked[today] = {
      ...marked[today],
      today: true,
      marked: true,
      dotColor: 'skyblue',
      selected: selectedDate === today,
      selectedColor: selectedDate === today ? 'skyblue' : 'pink',
      selectedTextColor: '#ffffff',
    };
    return marked;
  };

  const renderDay = ({ date, state }: any) => {
    const dayOfWeek = new Date(date.dateString).getDay();
    let textColor = '#2d4150'; // 기본 색상

    if (state === 'disabled') {
      textColor = '#d9e1e8'; // 비활성화된 날짜 색상
    } else if (date.dateString === today) {
      textColor = 'purple'; // 오늘 날짜 색상
    } else if (date.dateString === selectedDate) {
      textColor = '#ffffff'; // 선택된 날짜 색상
    } else if (dayOfWeek === 0) {
      textColor = 'red'; // 일요일 색상
    } else if (dayOfWeek === 6) {
      textColor = 'blue'; // 토요일 색상
    }

    return (
      <TouchableOpacity onPress={() => handleDayPress(date)}>
        <View
          style={[
            styles.dayContainer,
            date.dateString === selectedDate && styles.selectedDay,
            date.dateString === today && styles.today,
          ]}
        >
          <Text style={{ color: textColor }}>{date.day}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <TouchableOpacity
      onLongPress={() => {
        setSelectedTodo(item);
        setTodoText(item.task);
        setTodoTime(item.time);
        setEditModalVisible(true);
        setTimeEnabled(item.time !== '');
      }}
      onPress={() => toggleTodo(item.id)}
    >
      <View style={styles.todoItem}>
        <Ionicons
          name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={item.completed ? 'orange' : 'grey'}
        />
        <Text style={styles.todoText}>
          {item.task} {item.time && `${item.time}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setShowTodos(true);
  };

  const handleConfirmTime = () => {
    const formattedTime = `${selectedPeriod} ${selectedHour}:${selectedMinute}`;
    setTodoTime(formattedTime);
    setTimePickerVisible(false);
  };

  const renderTimePicker = () => (
    <View style={styles.timePicker}>
      <Picker
        selectedValue={selectedHour}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedHour(itemValue)}
      >
        {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(
          (hour) => (
            <Picker.Item key={hour} label={hour} value={hour} />
          )
        )}
      </Picker>
      <Picker
        selectedValue={selectedMinute}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedMinute(itemValue)}
      >
        {Array.from({ length: 60 }, (_, i) =>
          i < 10 ? `0${i}` : i.toString()
        ).map((minute) => (
          <Picker.Item key={minute} label={minute} value={minute} />
        ))}
      </Picker>
      <Picker
        selectedValue={selectedPeriod}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
      >
        <Picker.Item label="AM" value="AM" />
        <Picker.Item label="PM" value="PM" />
      </Picker>
    </View>
  );

  const renderModal = (visible: boolean, isEdit: boolean = false) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() =>
        isEdit ? setEditModalVisible(false) : setModalVisible(false)
      }
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {isEdit ? '일정 수정' : '새 일정 추가'}
          </Text>
          <TextInput
            style={styles.modalInput}
            placeholder="할 일을 입력하세요"
            value={todoText}
            onChangeText={setTodoText}
            placeholderTextColor="#666"
          />
          <View style={styles.timeSwitchContainer}>
            <Text style={styles.timeSwitchLabel}>시간 설정</Text>
            <Switch
              value={isTimeEnabled}
              onValueChange={(value) => {
                setTimeEnabled(value);
                if (!value) setTodoTime('');
              }}
            />
          </View>
          {isTimeEnabled && renderTimePicker()}
          <View style={styles.buttonContainer}>
            {isEdit ? (
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => handleTodoChange('update')}
              >
                <Text style={styles.textStyle}>수정</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => handleTodoChange('add')}
              >
                <Text style={styles.textStyle}>추가</Text>
              </TouchableOpacity>
            )}
            {isEdit && (
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => handleTodoChange('delete')}
              >
                <Text style={styles.textStyle}>삭제</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() =>
                isEdit ? setEditModalVisible(false) : setModalVisible(false)
              }
            >
              <Text style={styles.textStyle}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            markedDates={getMarkedDates()}
            onDayPress={handleDayPress}
            style={styles.calendar}
            enableSwipeMonths={true}
            theme={{
              calendarBackground: '#f7f7f7',
              textSectionTitleColor: '#444444',
              selectedDayBackgroundColor: '#ff8c00',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#ff4500',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#ff6347',
              selectedDotColor: '#ffffff',
              arrowColor: '#ff8c00',
              monthTextColor: '#1e90ff',
              indicatorColor: '#1e90ff',
              textDayFontFamily: 'monospace',
              textMonthFontFamily: 'monospace',
              textDayHeaderFontFamily: 'monospace',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 16,
            }}
            dayComponent={({ date, state }) => renderDay({ date, state })}
          />
        </View>
        {showTodos && (
          <View style={styles.todoContainer}>
            <Text style={styles.todoTitle}>{selectedDate} 할 일 목록</Text>
            <FlatList
              data={todos[selectedDate] || []}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              style={styles.todoList}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add-circle" size={48} color="#ff8c00" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {renderModal(modalVisible)}
      {renderModal(editModalVisible, true)}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 16,
  },
  calendarContainer: {
    width: Dimensions.get('window').width,
    height: 'auto',
    marginTop: 20,
  },
  calendar: {
    width: Dimensions.get('window').width,
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginVertical: 5,
  },
  today: {
    backgroundColor: 'pink',
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: 'skyblue',
    borderRadius: 20,
  },
  todoContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  todoTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: '#1e90ff',
    textAlign: 'center',
  },
  todoList: {
    flex: 1,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  todoText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  timeSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  timeSwitchLabel: {
    fontSize: 16,
    color: 'black',
  },
  timePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  picker: {
    width: 100,
  },
});

export default CalendarScreen;
