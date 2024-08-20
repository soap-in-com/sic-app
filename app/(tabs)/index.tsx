import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Todo 타입 정의
interface Todo {
  id: number;
  task: string;
  time: string;
  completed: boolean;
}

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');

  useEffect(() => {
    // 예제 데이터
    const exampleTodos: Todo[] = [
      { id: 1, task: '미팅', time: '22:00', completed: false },
      { id: 2, task: '영양제', time: '', completed: true },
      { id: 3, task: '요가', time: '', completed: false },
    ];
    setTodos(exampleTodos);
  }, []);

  const toggleTodo = (id: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const addTodo = () => {
    if (newTask.trim() === '') return;

    const newTodo: Todo = {
      id: todos.length + 1,
      task: newTask,
      time: newTime,
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setNewTask('');
    setNewTime('');
    Keyboard.dismiss();
  };

  const handleKeyPress = ({ nativeEvent }: { nativeEvent: any }) => {
    if (nativeEvent.key === 'Enter') {
      addTodo();
    }
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <TouchableOpacity onPress={() => toggleTodo(item.id)}>
      <View style={styles.todoItem}>
        <Ionicons
          name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={item.completed ? 'orange' : 'grey'}
        />
        <Text style={styles.todoText}>{item.task} {item.time && ` ${item.time}`}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle" style={styles.whiteText}>오늘의 todo</ThemedText>
        

        <FlatList
          data={todos}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  todoText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#000', // 글씨를 검은색으로 설정
  },
  whiteText: {
    color: '#000', // 글씨를 검은색으로 설정
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});
