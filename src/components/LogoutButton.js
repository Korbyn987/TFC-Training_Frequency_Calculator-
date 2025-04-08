import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { authService } from '../services/authService';
import { logoutUser } from '../redux/userSlice';

const LogoutButton = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logoutUser());
      navigation.reset({
        index: 0,
        routes: [{ name: 'Logout' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleLogout}
    >
      <Text style={styles.text}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginRight: 15,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LogoutButton;
