import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      style={styles.muscleItem}
      onPress={() => updateMuscle(muscle)}
      onLongPress={() => handleEdit(muscle)}
    >
      <Text style={styles.muscleName}>{muscle}</Text>
      <View style={styles.daysContainer}>
        <Text style={styles.daysText}>{muscleData[muscle] || 0} days</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(muscle)}
        >
          <Ionicons name="pencil" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome to TFC your Training Frequency Calculator
      </Text>
      <Text style={styles.subtitle}>Tap a muscle to reset its counter</Text>
      
      <FlatList
        data={MUSCLE_GROUPS}
        renderItem={renderMuscleItem}
        keyExtractor={(item) => item}
        style={styles.list}
      />

      <Modal visible={editMode} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit Days for {selectedMuscle}
            </Text>
            <TextInput
              style={styles.input}
              value={editDays}
              onChangeText={setEditDays}
              keyboardType="numeric"
              placeholder="Enter number of days"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditMode(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEdit}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate("CreateAccount")}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={() => navigation.navigate("About")}
        >
          <Text style={[styles.buttonText, styles.outlineText]}>
            Learn More
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  list: {
    flex: 1,
  },
  muscleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  muscleName: {
    fontSize: 18,
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysText: {
    fontSize: 16,
    marginRight: 10,
  },
  editButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  saveButton: {
    backgroundColor: '#34c759',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#5856d6',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#007AFF',
  },
});

export default HomeScreen;
