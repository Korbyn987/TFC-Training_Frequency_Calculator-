import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.text}>Loading TFC...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1c2e',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: '#fff',
  },
});

export default SplashScreen;
