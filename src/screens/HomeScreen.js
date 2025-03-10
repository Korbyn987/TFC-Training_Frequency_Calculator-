import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeStyles from "../styles/homeStyles";

const MUSCLE_GROUPS = [
  "Biceps",
  "Forearms",
  "Quads",
  "Hamstrings",
  "Triceps",
  "Abs",
  "Shoulders",
  "Traps",
  "Back",
  "Calves",
  "Glutes",
  "Chest",
];

const HomeScreen = ({ navigation }) => {
  const [muscleData, setMuscleData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [editDays, setEditDays] = useState("");

  useEffect(() => {
    loadMuscleData();
  }, []);

  const loadMuscleData = async () => {
    try {
      const savedData = await AsyncStorage.getItem("muscleData");
      if (savedData !== null) {
        setMuscleData(JSON.parse(savedData));
      } else {
        const initialData = MUSCLE_GROUPS.reduce((acc, muscle) => {
          acc[muscle] = 0;
          return acc;
        }, {});
        setMuscleData(initialData);
        await AsyncStorage.setItem("muscleData", JSON.stringify(initialData));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load muscle data");
    }
  };

  const updateMuscle = async (muscle) => {
    try {
      const newData = { ...muscleData, [muscle]: 0 };
      setMuscleData(newData);
      await AsyncStorage.setItem("muscleData", JSON.stringify(newData));
    } catch (error) {
      Alert.alert("Error", "Failed to update muscle data");
    }
  };

  const handleEdit = (muscle) => {
    setSelectedMuscle(muscle);
    setEditDays(muscleData[muscle].toString());
    setEditMode(true);
  };

  const saveEdit = async () => {
    if (isNaN(editDays) || editDays === "") {
      Alert.alert("Error", "Please enter a valid number");
      return;
    }
    try {
      const newData = { ...muscleData, [selectedMuscle]: parseInt(editDays) };
      setMuscleData(newData);
      await AsyncStorage.setItem("muscleData", JSON.stringify(newData));
      setEditMode(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save changes");
    }
  };

  const renderMuscleItem = ({ item: muscle }) => (
    <TouchableOpacity
      style={HomeStyles.muscleItem}
      onPress={() => updateMuscle(muscle)}
      onLongPress={() => handleEdit(muscle)}
    >
      <Text style={HomeStyles.muscleName}>{muscle}</Text>
      <View style={HomeStyles.daysContainer}>
        <Text style={HomeStyles.daysText}>{muscleData[muscle] || 0} days</Text>
        <TouchableOpacity
          style={HomeStyles.editButton}
          onPress={() => handleEdit(muscle)}
        >
          <Ionicons name="pencil" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={HomeStyles.container}>
      <Text style={HomeStyles.title}>
        Welcome to TFC your Training Frequency Calculator
      </Text>
      <Text style={HomeStyles.subtitle}>Tap a muscle to reset its counter</Text>

      <FlatList
        data={MUSCLE_GROUPS}
        renderItem={renderMuscleItem}
        keyExtractor={(item) => item}
        style={HomeStyles.list}
      />

      <Modal visible={editMode} transparent={true} animationType="slide">
        <View style={HomeStyles.modalContainer}>
          <View style={HomeStyles.modalContent}>
            <Text style={HomeStyles.modalTitle}>
              Edit Days for {selectedMuscle}
            </Text>
            <TextInput
              style={HomeStyles.input}
              value={editDays}
              onChangeText={setEditDays}
              keyboardType="numeric"
              placeholder="Enter number of days"
            />
            <View style={HomeStyles.modalButtons}>
              <TouchableOpacity
                style={[HomeStyles.modalButton, HomeStyles.cancelButton]}
                onPress={() => setEditMode(false)}
              >
                <Text style={HomeStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[HomeStyles.modalButton, HomeStyles.saveButton]}
                onPress={saveEdit}
              >
                <Text style={HomeStyles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={HomeStyles.buttonContainer}>
        <TouchableOpacity
          style={HomeStyles.button}
          onPress={() => {
            console.log('Attempting to navigate to Login');
            navigation.navigate('Login');
          }}
        >
          <Text style={HomeStyles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[HomeStyles.button, HomeStyles.secondaryButton]}
          onPress={() => {
            console.log('Attempting to navigate to CreateAccount');
            navigation.navigate('CreateAccount');
          }}
        >
          <Text style={HomeStyles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[HomeStyles.button, HomeStyles.outlineButton]}
          onPress={() => {
            console.log('Attempting to navigate to About');
            navigation.navigate('About');
          }}
        >
          <Text style={[HomeStyles.buttonText, HomeStyles.outlineText]}>
            Learn More
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default HomeScreen;
