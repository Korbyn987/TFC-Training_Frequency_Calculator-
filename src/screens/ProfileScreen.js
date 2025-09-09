import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import LoginRequiredModal from "../components/LoginRequiredModal";
import WorkoutHistory from "../components/WorkoutHistory";
import WorkoutPresets from "../components/WorkoutPresets";
import { getCurrentUser } from "../services/supabaseAuth";
import { styles } from "../styles/profileStyles";

const ProfileScreen = ({ route }) => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserData();
  }, []);

  // Re-check authentication when screen comes into focus (e.g., returning from login)
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  // Try to get user_id, username, and email from Supabase session
  const fetchUserData = async () => {
    try {
      setIsLoading(true);

      const user = await getCurrentUser();
      console.log("Profile: Current user from Supabase:", user);

      if (!user) {
        console.log(
          "Profile: No valid user session found, showing login modal"
        );
        setShowLoginModal(true);
        setIsLoading(false);
        return;
      }

      console.log(
        "Profile: Authentication successful for user:",
        user.username || user.name
      );
      setUserId(user.id);
      setUsername(user.username || user.name || "");
      setEmail(user.email || "");
      setShowLoginModal(false); // Hide modal if user is authenticated
      setIsLoading(false);
    } catch (error) {
      console.error("Profile: Error fetching user data:", error);
      setShowLoginModal(true);
      setIsLoading(false);
    }
  };

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
