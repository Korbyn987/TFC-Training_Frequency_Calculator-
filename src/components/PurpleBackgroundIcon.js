import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * A component that wraps icons with a purple background
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The icon to wrap
 * @param {Object} [props.style] - Additional style for the container
 * @param {number} [props.size=24] - Size of the icon background (should be slightly larger than icon)
 * @returns {React.ReactElement} - The wrapped icon with purple background
 */
const PurpleBackgroundIcon = ({ children, style, size = 24 }) => {
  return (
    <View 
      style={[
        styles.container, 
        { 
          width: size + 10, 
          height: size + 10,
          borderRadius: (size + 10) / 2 
        }, 
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
});

export default PurpleBackgroundIcon;
