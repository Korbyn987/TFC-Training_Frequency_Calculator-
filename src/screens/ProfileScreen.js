import React, { useEffect, useState } from "react";
import { Text, View, ScrollView } from "react-native";
import { styles } from "../styles/profileStyles";
import WorkoutHistory from "../components/WorkoutHistory";
import WorkoutPresets from "../components/WorkoutPresets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import LoginRequiredModal from "../components/LoginRequiredModal";

const ProfileScreen = ({ route }) => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    // Try to get user_id, username, and email from AsyncStorage
    const fetchUserData = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        setShowLoginModal(true);
        return;
      }
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user.id);
        setUsername(user.username || user.name || "");
        setEmail(user.email || "");
      }
    };
    fetchUserData();
  }, []);

  // Increment refreshKey whenever refreshHistory param changes
  useEffect(() => {
    if (route?.params?.refreshHistory) {
      setRefreshKey((prev) => prev + 1);
      navigation.setParams({ refreshHistory: undefined });
    }
  }, [route?.params?.refreshHistory]);

  if (!userId) {
    return (
      <View style={styles.container}>
        <LoginRequiredModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={true}
      scrollEventThrottle={16}
    >
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
