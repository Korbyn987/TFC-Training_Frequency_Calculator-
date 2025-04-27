import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { styles } from "../styles/profileStyles";
import WorkoutHistory from "../components/WorkoutHistory";
import WorkoutPresets from "../components/WorkoutPresets";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Try to get user_id, username, and email from AsyncStorage
    const fetchUserData = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user.id);
        setUsername(user.username || user.name || "");
        setEmail(user.email || "");
      }
    };
    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar} />
        <Text style={styles.name}>{username || "Username"}</Text>
        <Text style={styles.email}>{email || "email@example.com"}</Text>
      </View>
      {/* Workout Presets Section */}
      <WorkoutPresets />
      {/* Workout History Section */}
      <WorkoutHistory userId={userId} />
    </View>
  );
};

export default ProfileScreen;
