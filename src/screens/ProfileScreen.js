import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { styles } from "../styles/profileStyles";
import WorkoutHistory from "../components/WorkoutHistory";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Try to get user_id from AsyncStorage (or replace with your auth logic)
    const fetchUserId = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user.id);
      }
    };
    fetchUserId();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>
      {/* Workout History Section */}
      <Text style={styles.text}>Workout History</Text>
      <WorkoutHistory userId={userId} />
    </View>
  );
};

export default ProfileScreen;
