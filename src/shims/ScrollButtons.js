/**
 * Web-compatible scroll buttons for improved navigation
 * Especially useful for the Configure Workout screen
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native-web';
import { Ionicons } from '@expo/vector-icons';

const ScrollButtons = ({ onScrollUp, onScrollDown, position = 'right' }) => {
  // Web-specific styles to position the buttons fixed on the screen
  const containerStyle = {
    position: 'fixed',
    bottom: 30,
    ...(position === 'right' ? { right: 20 } : { left: 20 }),
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <View style={containerStyle}>
      <TouchableOpacity 
        style={styles.scrollButton} 
        onPress={onScrollUp}
        aria-label="Scroll to top"
      >
        <Ionicons name="chevron-up" size={24} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.scrollButton} 
        onPress={onScrollDown}
        aria-label="Scroll to bottom"
      >
        <Ionicons name="chevron-down" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollButton: {
    backgroundColor: 'rgba(107, 70, 193, 0.8)', // Purple with transparency
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  }
});

export default ScrollButtons;
