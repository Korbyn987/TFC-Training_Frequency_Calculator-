import React, { useEffect, useState } from "react";
import { Text, View, ScrollView } from "react-native";
import { styles } from "../styles/profileStyles";
import WorkoutHistory from "../components/WorkoutHistory";
import WorkoutPresets from "../components/WorkoutPresets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = ({ route }) => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const navigation = useNavigation();

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

  // Refresh workout history if requested
  useEffect(() => {
    if (route?.params?.refreshHistory) {
      setRefreshKey(prev => prev + 1);
      navigation.setParams({ refreshHistory: undefined });
    }
  }, [route?.params?.refreshHistory]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar} />
        <Text style={styles.name}>{username || "Username"}</Text>
        <Text style={styles.email}>{email || "email@example.com"}</Text>
      </View>
      {/* Workout History Section */}
      <WorkoutHistory userId={userId} key={refreshKey} />
      {/* Workout Presets Section */}
      <WorkoutPresets />
    </ScrollView>
  );
};

export default ProfileScreen;
