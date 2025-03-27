import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import HomeStyles from "../styles/homeStyles";
import { MUSCLE_GROUPS } from "../constants/muscleGroups";

const HomeScreen = ({ navigation }) => {
  const [muscleData, setMuscleData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [editDays, setEditDays] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Animation for muscle buttons
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadMuscleData();
    loadStreak();
    loadAchievements();
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
  const loadStreak = async () => {
    try {
      const savedStreak = await AsyncStorage.getItem("streak");
      setStreak(savedStreak ? parseInt(savedStreak) : 0);
    } catch (error) {
      console.error("Failed to load streak", error);
    }
  };
  const loadAchievements = async () => {
    try {
      const savedAchievements = await AsyncStorage.getItem("achievements");
      setAchievements(savedAchievements ? JSON.parse(savedAchievements) : []);
    } catch (error) {
      console.error("Erorr loading achievements", error);
    }
  };

  const updateMuscle = async (muscle) => {
    try {
      const newData = { ...muscleData, [muscle]: 0 };
      setMuscleData(newData);
      await AsyncStorage.setItem("muscleData", JSON.stringify(newData));

      // update streak
      const now = new Date();
      const lastDate = await AsyncStorage.getItem("lastTrainedDate");
      if (!lastDate || now - new Date(lastDate) <= 24 * 60 * 60 * 1000) {
        setStreak((prev) => prev + 1);
        await AsyncStorage.setItem("streak", (streak + 1).toString());
      } else {
        setStreak(1);
        await AsyncStorage.setItem("streak", "1");
      }
      await AsyncStorage.setItem("lastTrainedDate", now.toString());

      // check for achievements
      checkAchievements();

      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });
    } catch (error) {
      Alert.alert("Error", "Failed to update muscle data");
    }
  };

  const handleEdit = (muscle) => {
    setSelectedMuscle(muscle);
    Animated.timing(scaleAnim, {
      toValue: 1.2,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });
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
      <View style={HomeStyles.header}>
        <Text style={HomeStyles.title}>
          Welcome to TFC your Training Frequency Calculator
        </Text>
        {isAuthenticated && user && (
          <Text style={HomeStyles.welcomeUser}>Welcome, {user.username}!</Text>
        )}
      </View>
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
        {!isAuthenticated ? (
          <>
            <TouchableOpacity
              style={HomeStyles.button}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={HomeStyles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[HomeStyles.button, HomeStyles.secondaryButton]}
              onPress={() => navigation.navigate("CreateAccount")}
            >
              <Text style={HomeStyles.buttonText}>Create Account</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[HomeStyles.button, HomeStyles.logoutButton]}
            onPress={() => {
              navigation.replace("Login");
              dispatch(logout());
              Alert.alert("Success", "You have been logged out successfully");
            }}
          >
            <Text style={HomeStyles.buttonText}>Logout</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[HomeStyles.button, HomeStyles.outlineButton]}
          onPress={() => navigation.navigate("About")}
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
