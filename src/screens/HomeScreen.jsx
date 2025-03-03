import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import HomeStyles from "../styles/HomeStyles"; //importing styles
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AboutScreen from "./AboutScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();
const MUSCLE_GROUP = [
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
        //initializing with 0 days for all muscles
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
      const newData = { ...muecleData, [selectedMuscle]: parseInt(editDays) };
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
        <Text style={HomeStyles.daysText}>{MuscleData[muscle] || 0} days</Text>
        <TouchableOpacity
          style={HomeStyles.editButton}
          onPress={() => handleEdit(muscle)}
        >
          {/* TODO: change the color whenever it is necessary */}
          <Ionicons name="pencil" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={HomeStyles.container}>
      {/* You will have to add more text tags such as the one below */}
      <Text style={HomeStyles.title}>
        Welcome to TFC your Training Frequency Calculator
      </Text>
      <Text style={HomeStyles.subtitle}>Tap a muscle to reset its counter</Text>
      <FlatList
        data={MUSCLE_GROUP}
        renderItem={RenderMuscleItem}
        keyExtraction={(item) => item}
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
              keyBoardType="numeric"
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
          style={Button.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={Button.text}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[Button.button, Button.secondaryButton]}
          onPress={() => navigation.navigate("CreateAccount")}
        >
          <Text style={Button.text}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[Button.button, Button.outlineButton]}
          onPress={() => navigation.navigate("About")}
        >
          <Text style={[ButtonStyles.text, ButtonStyles.outlineText]}>
            Learn More
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
//this is the home screen
