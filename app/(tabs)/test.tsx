import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome! 👋</Text>
      <Text style={styles.step}>Step 1: Try itt</Text>
      <Text style={styles.description}>Edit app/(tabs)/index.tsx to see changes. Press cmd + d to open developer tools.</Text>
      <Text style={styles.step}>Step 2: Explore</Text>
      <Text style={styles.description}>Tap the Explore tab to learn more about what's included in this starter app.</Text>
      <Text style={styles.step}>Step 3: Get a fresh start</Text>
      <Text style={styles.description}>When you're ready, run npm run reset-project to get a fresh app directory. This will move the current app to app-example.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#282C34',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  step: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 10,
  },
});

export default HomeScreen;
